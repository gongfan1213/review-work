好的，下面将对 `src/agent.ts` 中的 `getResponse` 函数进行**源码级别的详细解读**，涵盖每一段代码的设计意图、参数、流程、异常处理、与其他模块的协作等。内容适合开发者深入理解和维护。

---

# getResponse 源码级别详细解读

---

## 1. 函数签名与参数

```ts
export async function getResponse(
  question?: string,
  tokenBudget: number = 1_000_000,
  maxBadAttempts: number = 2,
  existingContext?: Partial<TrackerContext>,
  messages?: Array<CoreMessage>,
  numReturnedURLs: number = 100,
  noDirectAnswer: boolean = false,
  boostHostnames: string[] = [],
  badHostnames: string[] = [],
  onlyHostnames: string[] = [],
  maxRef: number = 10,
  minRelScore: number = 0.80,
  languageCode: string | undefined = undefined,
  searchLanguageCode?: string,
  searchProvider?: string,
  withImages: boolean = false,
  teamSize: number = 1
)
```
- **设计意图**：支持高度灵活的推理、检索、评估、上下文管理、语言适配、图片处理等。
- **参数说明**：
  - `question`：用户输入的问题。
  - `tokenBudget`：本次推理的 token 上限，防止超限。
  - `maxBadAttempts`：每种评估类型最大失败次数，防止死循环。
  - `existingContext`：历史上下文，支持多轮对话。
  - `messages`：对话消息流。
  - `numReturnedURLs`：最多返回多少个 URL。
  - `noDirectAnswer`：是否允许直接输出答案。
  - `boostHostnames`/`badHostnames`/`onlyHostnames`：URL 过滤与优先级控制。
  - `maxRef`/`minRelScore`：引用数量与相关性阈值。
  - `languageCode`/`searchLanguageCode`：多语言支持。
  - `searchProvider`：指定搜索引擎。
  - `withImages`：是否处理图片。
  - `teamSize`：并行子问题处理能力。

---

## 2. 变量初始化与上下文准备

```ts
let step = 0;
let totalStep = 0;
const allContext: StepAction[] = [];
const updateContext = function (step: any) { allContext.push(step); }
```
- **step/totalStep**：记录推理步数，便于流程追踪和日志。
- **allContext**：存储每一步的 StepAction，便于回溯与分析。
- **updateContext**：辅助函数，将当前 step 结果加入 allContext。

```ts
question = question?.trim() as string;
messages = messages?.filter(m => m.role !== 'system');
```
- **标准化输入**，去除多余空格，过滤掉 system 消息，确保只处理用户和助手的内容。

```ts
if (messages && messages.length > 0) {
  // 取最后一条消息作为当前问题
  const lastContent = messages[messages.length - 1].content;
  if (typeof lastContent === 'string') {
    question = lastContent.trim();
  } else if (typeof lastContent === 'object' && Array.isArray(lastContent)) {
    question = lastContent.filter(c => c.type === 'text').pop()?.text || '';
  }
} else {
  messages = [{ role: 'user', content: question.trim() }]
}
```
- **多轮对话支持**：自动提取最新一轮的用户问题。

```ts
const SchemaGen = new Schemas();
await SchemaGen.setLanguage(languageCode || question)
if (searchLanguageCode) {
  SchemaGen.searchLanguageCode = searchLanguageCode;
}
```
- **Schema 工厂**：根据问题内容和语言，动态生成用于约束 LLM 输出结构的 schema。

```ts
const context: TrackerContext = {
  tokenTracker: existingContext?.tokenTracker || new TokenTracker(tokenBudget),
  actionTracker: existingContext?.actionTracker || new ActionTracker()
};
```
- **上下文对象**：包含 token 预算追踪（tokenTracker）、action 追踪（actionTracker）。

```ts
const generator = new ObjectGeneratorSafe(context.tokenTracker);
let schema: ZodObject<any> = SchemaGen.getAgentSchema(true, true, true, true, true)
const gaps: string[] = [question];
const allQuestions = [question];
const allKeywords: string[] = [];
let candidateAnswers: string[] = [];
const allKnowledge: KnowledgeItem[] = [];
let diaryContext = [];
let weightedURLs: BoostedSearchSnippet[] = [];
let allowAnswer = true;
let allowSearch = true;
let allowRead = true;
let allowReflect = true;
let allowCoding = false;
let msgWithKnowledge: CoreMessage[] = [];
let thisStep: StepAction = { action: 'answer', answer: '', references: [], think: '', isFinal: false };
const allURLs: Record<string, SearchSnippet> = {};
const allWebContents: Record<string, WebContent> = {};
const visitedURLs: string[] = [];
const badURLs: string[] = [];
const imageObjects: ImageObject[] = [];
const evaluationMetrics: Record<string, RepeatEvaluationType[]> = {};
const regularBudget = tokenBudget * 0.85;
const finalAnswerPIP: string[] = [];
let trivialQuestion = false;
```
- **变量说明**：
  - `gaps`：待解决的主问题和子问题列表。
  - `allQuestions`/`allKeywords`/`allKnowledge`：动态积累问题、关键词、知识。
  - `allow*` 系列变量：每轮动态控制 action 选择。
  - `allURLs`/`allWebContents`/`visitedURLs`/`badURLs`/`imageObjects`：URL 相关的各种缓存与追踪。
  - `evaluationMetrics`：每个问题的评估类型与剩余尝试次数。
  - `regularBudget`：token 预算的 85%，预留 15% 给 beast mode。
  - `finalAnswerPIP`：评估失败时的改进建议。
  - `trivialQuestion`：标记是否为简单问题。

---

## 3. 消息与知识初始化

```ts
messages.forEach(m => {
  let strMsg = '';
  if (typeof m.content === 'string') {
    strMsg = m.content.trim();
  } else if (typeof m.content === 'object' && Array.isArray(m.content)) {
    strMsg = m.content.filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
  }
  extractUrlsWithDescription(strMsg).forEach(u => {
    addToAllURLs(u, allURLs);
  });
})
```
- **自动提取消息中的 URL**，补充 allURLs，便于后续 visit。

---

## 4. 决策主循环

```ts
while (context.tokenTracker.getTotalUsage().totalTokens < regularBudget) {
  step++;
  totalStep++;
  const budgetPercentage = (context.tokenTracker.getTotalUsage().totalTokens / tokenBudget * 100).toFixed(2);
  logDebug(`Step ${totalStep} / Budget used ${budgetPercentage}%`, { gaps });
  allowReflect = allowReflect && (gaps.length <= MAX_REFLECT_PER_STEP);
  const currentQuestion: string = gaps[totalStep % gaps.length];
  // 评估类型初始化
  if (currentQuestion.trim() === question && totalStep === 1) {
    evaluationMetrics[currentQuestion] =
      (await evaluateQuestion(currentQuestion, context, SchemaGen)).map(e => ({
        type: e,
        numEvalsRequired: maxBadAttempts
      }))
    evaluationMetrics[currentQuestion].push({ type: 'strict', numEvalsRequired: maxBadAttempts });
  } else if (currentQuestion.trim() !== question) {
    evaluationMetrics[currentQuestion] = []
  }
  if (totalStep === 1 && includesEval(evaluationMetrics[currentQuestion], 'freshness')) {
    allowAnswer = false;
    allowReflect = false;
  }
  // URL 处理
  if (allURLs && Object.keys(allURLs).length > 0) {
    weightedURLs = rankURLs(
      filterURLs(allURLs, visitedURLs, badHostnames, onlyHostnames),
      { question: currentQuestion, boostHostnames },
      context
    );
    weightedURLs = keepKPerHostname(weightedURLs, 2);
    logDebug('Weighted URLs:', { count: weightedURLs.length });
  }
  allowRead = allowRead && (weightedURLs.length > 0);
  allowSearch = allowSearch && (weightedURLs.length < 50);
  // prompt/schema/消息组织
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
  schema = SchemaGen.getAgentSchema(allowReflect, allowRead, allowAnswer, allowSearch, allowCoding, currentQuestion)
  msgWithKnowledge = composeMsgs(messages, allKnowledge, currentQuestion, currentQuestion === question ? finalAnswerPIP : undefined);
  const result = await generator.generateObject({
    model: 'agent',
    schema,
    system,
    messages: msgWithKnowledge,
    numRetries: 2,
  });
  thisStep = {
    action: result.object.action,
    think: result.object.think,
    ...result.object[result.object.action]
  } as StepAction;
  // 日志与 action 记录
  const actionsStr = [allowSearch, allowRead, allowAnswer, allowReflect, allowCoding].map((a, i) => a ? ['search', 'read', 'answer', 'reflect'][i] : null).filter(a => a).join(', ');
  logDebug(`Step decision: ${thisStep.action} <- [${actionsStr}]`, { thisStep, currentQuestion });
  context.actionTracker.trackAction({ totalStep, thisStep, gaps });
  // allow* 变量重置
  allowAnswer = true;
  allowReflect = true;
  allowRead = true;
  allowSearch = true;
  allowCoding = true;
```
- **主循环流程**：
  - 动态生成 prompt，明确本轮可选 action。
  - 调用大模型决策 action 及参数。
  - 解析输出，得到本轮 thisStep。
  - 日志记录 action 选择。
  - actionTracker 记录本轮 action。
  - allow* 变量重置，便于下轮动态调整。

---

## 5. 各 action 分支

### answer 分支
- 直接作答，评估通过则终止，否则生成改进建议，驱动反思。
- 评估失败次数超限后，进入 beast mode。

### reflect 分支
- 自动生成子问题，补充 gaps。
- 若无新子问题，则提示需换角度思考。
- 执行后禁止 reflect。

### search 分支
- 生成搜索请求，调用外部搜索引擎检索信息，补充知识库。
- 若 teamSize > 1，自动并行递归子问题。
- 若无新结果，提示需换角度思考。
- 执行后禁止 search 和 answer。

### visit 分支
- 选择高相关 URL，抓取网页内容，丰富知识库。
- 若抓取成功，补充知识；否则提示需换角度思考。
- 执行后禁止 read。

### coding 分支
- 调用代码沙盒自动求解，补充 allKnowledge。
- 求解失败则提示需换角度思考。
- 执行后禁止 coding。

---

## 6. beast mode 兜底机制

```ts
if (!(thisStep as AnswerAction).isFinal) {
  logInfo(`Beast mode!!! budget ${(context.tokenTracker.getTotalUsage().totalTokens / tokenBudget * 100).toFixed(2)}%`, {
    usage: context.tokenTracker.getTotalUsageSnakeCase(),
    evaluationMetrics,
    maxBadAttempts,
  });
  // beast mode 下 prompt 明确要求“任何答案都比沉默好”
  // 放宽约束，优先输出可用答案
  // ...
}
```
- 若所有评估类型尝试次数耗尽，或主循环未能输出最终答案，则自动进入 beast mode，强制输出答案，保证系统鲁棒性。

---

## 7. 答案后处理与返回

```ts
const answerStep = thisStep as AnswerAction;
if (trivialQuestion) {
  answerStep.mdAnswer = buildMdFromAnswer(answerStep);
} else if (!answerStep.isAggregated) {
  // markdown 格式修复、引用补全、图片处理等
  // ...
} else if (answerStep.isAggregated) {
  // 聚合 candidateAnswers
  // ...
}
const returnedURLs = weightedURLs.slice(0, numReturnedURLs).filter(r => r?.url).map(r => r.url);
return {
  result: thisStep,
  context,
  visitedURLs: returnedURLs,
  readURLs: visitedURLs.filter(url => !badURLs.includes(url)),
  allURLs: weightedURLs.map(r => r.url),
  imageReferences: withImages ? (thisStep as AnswerAction).imageReferences : undefined,
};
```
- 对最终答案进行 markdown 格式修复、引用补全、图片处理等。
- 返回结构化结果，包括：最终 StepAction、推理上下文、已访问 URL、图片引用等。

---

## 8. 维护建议与扩展要点

- 维护时重点关注 allow* 变量与 action 切换的逻辑正确性。
- gaps、allKnowledge、evaluationMetrics 的动态管理是多步推理的核心。
- 各 action 分支的异常处理与兜底机制需保证系统鲁棒性。
- 外部依赖（如搜索引擎、评估器、代码沙盒等）接口变更需及时适配。
- 如需扩展新 action、优化决策策略或适配新场景，可参考 getPrompt、executeSearchQueries、evaluateAnswer 等关键节点进行二次开发。

---

如需对某一 action 分支、流程细节或具体代码行进一步展开，请随时告知！
