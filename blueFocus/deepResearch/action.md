当然，下面将对本项目 `getResponse` 主流程中涉及的各个 action（answer、reflect、search、visit、coding）进行详细总结，涵盖**触发条件、核心流程、关键变量、与其他 action 的协作、典型场景、异常与兜底机制**等，帮助你全面理解多步推理 agent 的智能决策体系。

---

# 各 action 详细总结

---

## 1. answer（直接回答）

### 触发条件
- allowAnswer = true
- LLM 判断当前知识和上下文足以直接作答

### 核心流程
1. LLM 生成答案内容（answer 字段）。
2. 系统调用 `evaluateAnswer` 对答案进行多维度自动评估（如完整性、权威性、时效性等）。
3. 若评估通过，标记 isFinal，流程终止，输出答案。
4. 若评估失败，自动生成改进建议（finalAnswerPIP），并驱动下一步反思（reflect）或细化问题。

### 关键变量
- `thisStep.action === 'answer'`
- `thisStep.answer`
- `evaluationMetrics`
- `finalAnswerPIP`

### 协作与场景
- 评估失败后，通常会触发 reflect 或 search。
- 适用于知识充足、问题明确的场景。

### 异常与兜底
- 连续评估失败，尝试次数耗尽后，进入 beast mode 强制输出。

---

## 2. reflect（反思/子问题生成）

### 触发条件
- allowReflect = true
- 评估失败或知识有缺口
- LLM 判断需要进一步拆解问题

### 核心流程
1. LLM 自动生成与主问题相关的子问题（questionsToAnswer）。
2. 系统对新子问题去重、限量，补充到 gaps 和 allQuestions。
3. 若无新子问题，则提示需换角度思考。

### 关键变量
- `thisStep.action === 'reflect'`
- `thisStep.questionsToAnswer`
- `gaps`
- `allQuestions`

### 协作与场景
- 反思生成的子问题会驱动后续多步推理（answer/search/visit）。
- 适用于复杂、开放性问题，或当前知识不足时。

### 异常与兜底
- 若新子问题已存在，系统会提示“需换角度思考”，防止死循环。

---

## 3. search（外部检索）

### 触发条件
- allowSearch = true
- 当前 gaps 未解决，或知识不足
- LLM 判断需要外部信息

### 核心流程
1. LLM 生成搜索请求（searchRequests）。
2. 系统对搜索请求去重、限量。
3. 调用 `executeSearchQueries` 检索外部信息（支持多种搜索引擎）。
4. 新知识补充到 allKnowledge，关键词加入 allKeywords。
5. 若 teamSize > 1，自动并行递归子问题。

### 关键变量
- `thisStep.action === 'search'`
- `thisStep.searchRequests`
- `allKnowledge`
- `allKeywords`

### 协作与场景
- 检索结果为后续 answer/reflect/visit 提供知识基础。
- 适用于事实性、需要最新信息或知识库外内容的问题。

### 异常与兜底
- 若无新结果，系统提示需换角度思考，并禁止连续 search。

---

## 4. visit（网页内容抓取）

### 触发条件
- allowRead = true
- weightedURLs 有高相关 URL 可访问
- LLM 判断需要深入阅读网页内容

### 核心流程
1. LLM 选择目标 URL（URLTargets）。
2. 系统归一化、去重 URL，调用 `processURLs` 抓取内容。
3. 抓取成功则补充 allKnowledge，失败则提示需换角度思考。

### 关键变量
- `thisStep.action === 'visit'`
- `thisStep.URLTargets`
- `allKnowledge`
- `visitedURLs`

### 协作与场景
- 适用于需要详细网页内容、原始数据、长文档分析等场景。
- 抓取内容可为 answer/reflect/search 提供补充。

### 异常与兜底
- 若 URL 已全部访问或抓取失败，系统提示需换角度思考。

---

## 5. coding（代码求解）

### 触发条件
- allowCoding = true
- 问题为代码相关
- LLM 判断需要自动代码生成/执行

### 核心流程
1. LLM 生成 codingIssue。
2. 系统调用 CodeSandbox 自动求解，结果加入 allKnowledge。
3. 求解失败则提示需换角度思考。

### 关键变量
- `thisStep.action === 'coding'`
- `thisStep.codingIssue`
- `allKnowledge`

### 协作与场景
- 适用于编程、数据处理、正则、脚本等自动化问题。
- 代码结果可为 answer/reflect/search 提供支撑。

### 异常与兜底
- 求解失败后禁止连续 coding，防止死循环。

---

# 总结与设计亮点

- **多 action 动态切换**：每轮决策都基于当前知识、评估、上下文动态选择最优 action，保证推理灵活性和鲁棒性。
- **反思与自适应**：评估失败自动反思、细化问题，驱动多步推理，避免“一问到底”。
- **外部知识融合**：search/visit 动作让系统能实时获取和融合外部信息，突破 LLM 固有知识边界。
- **代码自动求解**：coding 动作让系统具备自动化编程和数据处理能力，适配更多场景。
- **兜底机制**：beast mode 保证极端情况下也能输出答案，避免死循环或无响应。

如需某一 action 的源码级详细解读、伪代码流程或典型应用案例，请随时告知！
