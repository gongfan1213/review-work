好的，下面我将以**源码行级**的方式，详细解读 `src/agent.ts` 中 prompt 自我进化的实现。重点关注 prompt 如何动态吸收评估反馈、反思内容、知识库等，实现“自我进化”。  
（为便于理解，解读将以 getResponse 主流程为主线，穿插关键函数和变量说明。）

---

## 1. 变量与上下文初始化

```ts
const finalAnswerPIP: string[] = [];
```
- 该数组用于**收集每轮评估器给出的改进建议**，后续会注入 prompt，驱动 LLM 自我修正。

---

## 2. 评估失败时，收集改进建议

```ts
if (evaluation.type === 'strict' && evaluation.improvement_plan) {
  finalAnswerPIP.push(evaluation.improvement_plan);
}
```
- 每当答案被评为“不合格”且有改进建议时，**将建议追加到 finalAnswerPIP**，为 prompt 进化做准备。

---

## 3. prompt 生成与注入评审反馈

### 3.1 组装用户问题内容

```ts
const userContent = `
${question}

${finalAnswerPIP?.length ? `
<answer-requirements>
- You provide deep, unexpected insights, ...
${finalAnswerPIP.map((p, idx) => `
<reviewer-${idx + 1}>
${p}
</reviewer-${idx + 1}>
`).join('\n')}
</answer-requirements>` : ''}
`.trim();
```
- 这里会**把所有评审建议以 reviewer 标签注入 prompt**，LLM 必须参考这些建议改进答案。

### 3.2 组装完整对话上下文

```ts
msgs.push({ role: 'user', content: removeExtraLineBreaks(userContent) });
```
- 将带有 `<answer-requirements>` 的内容作为最新 user 消息，**强制 LLM 参考评审反馈**。

---

## 4. 反思与知识补全

### 4.1 评估失败时自动反思

```ts
const errorAnalysis = await analyzeSteps(diaryContext, context, SchemaGen);

allKnowledge.push({
  question: `
Why is the following answer bad for the question? Please reflect
<question>
${currentQuestion}
</question>
<answer>
${thisStep.answer}
</answer>
`,
  answer: `
${evaluation.think}
${errorAnalysis.recap}
${errorAnalysis.blame}
${errorAnalysis.improvement}
`,
  type: 'qa',
})
```
- 失败时自动调用 error-analyzer，**生成反思内容并补充到知识库**，后续 prompt 会自动带入这些反思。

---

## 5. prompt 每轮动态进化

### 5.1 每轮循环都重新生成 prompt

```ts
const { system, urlList } = getPrompt(
  diaryContext,
  allQuestions,
  allKeywords,
  allowReflect,
  allowAnswer,
  allowRead,
  allowSearch,
  allowCoding,
  allKnowledge,
  weightedURLs,
  false,
);
```
- **每一轮都会根据最新的 diaryContext、知识、评审反馈等动态生成 prompt**，实现自我进化。

### 5.2 getPrompt 内部动态拼接

- 会根据 allow* 变量、知识库、URL、评审建议等，**动态拼接 action 指令、知识、反思内容**，让 LLM 每轮都吸收新经验。

---

## 6. beast mode 兜底

```ts
if (!(thisStep as AnswerAction).isFinal) {
  // ...
  const { system } = getPrompt(
    diaryContext,
    allQuestions,
    allKeywords,
    false,
    false,
    false,
    false,
    false,
    allKnowledge,
    weightedURLs,
    true, // beastMode
  );
  // ...
}
```
- 多次失败后，prompt 切换到 beast mode，**极大强化输出指令**，确保最终有答案。

---

## 7. 反思内容和知识库如何影响 prompt

- `allKnowledge` 会被 `BuildMsgsFromKnowledge` 转为对话消息，**每轮 prompt 都会带入所有反思和知识**，让 LLM 不断吸收自我经验。

---

## 8. 伪代码流程总结

```plaintext
1. 初始化上下文、finalAnswerPIP、allKnowledge等
2. while (未达到预算/未答对) {
    3. 生成 prompt（带入知识、评审建议、反思内容等）
    4. LLM 选择 action 并执行
    5. if (answer) {
        6. 评估答案
        7. if (失败) {
            8. 收集改进建议到 finalAnswerPIP
            9. 反思并补充到 allKnowledge
        }
    }
}
10. 多次失败后，beast mode 强制输出
```

---

## 9. 总结

- **每一轮 prompt 都会吸收上轮的评审建议、反思内容、知识库，动态进化**。
- 评审建议通过 `<answer-requirements>` 强制注入，反思内容通过知识库自动带入，prompt 结构和 action 允许范围也会随上下文动态调整。
- 这种机制让 LLM 能“自我学习、自我修正”，不断提升答案质量，极大增强了智能推理的深度和鲁棒性。

如需对某一段代码逐行详细注释，请指定具体行号或片段！
