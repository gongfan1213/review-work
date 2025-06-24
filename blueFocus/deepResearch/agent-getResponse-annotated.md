# getResponse 函数逐行详解

---

## 1. 函数签名与参数说明

`getResponse` 是 agent.ts 的核心主流程，负责驱动整个智能推理、检索、决策与答案生成。其签名参数极为丰富，支持高度定制化：
- `question`：用户输入的问题。
- `tokenBudget`：本轮推理的 token 预算，防止超限。
- `maxBadAttempts`：最大评估失败次数，防止死循环。
- `existingContext`：可选的历史上下文，支持多轮对话。
- `messages`：对话消息流，包含用户与系统历史。
- `numReturnedURLs`：最多返回多少个 URL。
- `noDirectAnswer`：是否允许直接输出答案。
- `boostHostnames`/`badHostnames`/`onlyHostnames`：URL 过滤与优先级控制。
- `maxRef`/`minRelScore`：引用数量与相关性阈值。
- `languageCode`/`searchLanguageCode`：多语言支持。
- `searchProvider`：指定搜索引擎。
- `withImages`：是否处理图片。
- `teamSize`：并行子问题处理能力。

设计意图：让 getResponse 能适配各种复杂问答、研究、检索、代码等场景。

---

## 2. 变量初始化与上下文准备

- `step`/`totalStep`：记录推理步数，便于流程追踪。
- `allContext`：存储每一步的 StepAction，便于回溯与分析。
- `updateContext`：辅助函数，将当前 step 结果加入 allContext。
- `question` 预处理：去除多余空格，确保输入规范。
- `messages` 预处理：去除 system 消息，提取用户真实问题。
- `SchemaGen`：Schema 工厂，负责多语言、结构化约束。
- `context`：TrackerContext，包含 tokenTracker（token 预算追踪）、actionTracker（action 记录）。
- `generator`：ObjectGeneratorSafe，负责与大模型交互。
- `schema`：当前 action 的结构化 schema。
- `gaps`：待解决的主问题和子问题列表。
- `allQuestions`/`allKeywords`/`allKnowledge`：动态积累问题、关键词、知识。
- `diaryContext`：记录每一步的决策与反思。
- `weightedURLs`/`allURLs`/`allWebContents`/`visitedURLs`/`badURLs`/`imageObjects`：URL 相关的各种缓存与追踪。
- `evaluationMetrics`：每个问题的评估类型与剩余尝试次数。
- `regularBudget`：token 预算的 85%，预留 15% 给 beast mode。
- `finalAnswerPIP`：评估失败时的改进建议。
- `trivialQuestion`：标记是否为简单问题。

---

## 3. 消息与知识初始化

- 处理 messages，提取用户问题，初始化 gaps、allQuestions。
- 自动提取消息中的 URL，补充 allURLs，便于后续 visit。
- 设计意图：保证每轮推理都能基于最新的用户输入和历史知识。

---

## 4. 决策主循环（详细分步）

主循环条件：token 未超预算（regularBudget）。每轮流程如下：

1. `step++`、`totalStep++`：推进步数。
2. 记录当前 token 使用百分比，便于日志与调试。
3. `allowReflect` 动态调整，防止子问题过多。
4. `currentQuestion`：本轮主攻问题，从 gaps 轮询。
5. 初始化/更新 evaluationMetrics：
   - 第一步对主问题分配评估类型（如完整性、时效性、权威性等），并强制加入 strict 评估。
   - 子问题则不强制评估。
6. freshness 检查：如需时效性评估，首轮禁止直接 answer。
7. URL 处理：
   - 若 allURLs 非空，先过滤、排序、分组，提升多样性。
   - allowRead 仅在有高相关 URL 时为 true。
   - allowSearch 仅在 URL 不超过 50 时为 true。
8. 动态生成 prompt，明确本轮可选 action。
9. 生成 schema，组织消息上下文。
10. 调用 generator.generateObject，驱动大模型决策。
11. 解析大模型输出，得到本轮 thisStep（action、think、参数等）。
12. 日志记录本轮 action 选择。
13. actionTracker 记录本轮 action。
14. allow* 变量重置为 true，便于下轮动态调整。

---

## 5. 各 action 分支详细注释

### 5.1 answer 分支
- 触发条件：thisStep.action === 'answer' 且有 answer 内容。
- 首轮且允许直接 answer 时，若 LLM 自信直接作答，则跳过评估，直接终止。
- 否则：
  - updateContext 记录本轮结果。
  - 调用 evaluateAnswer 进行多维度评估。
  - 若评估通过，终止流程，输出答案。
  - 若评估失败：
    - 减少对应评估类型的剩余尝试次数。
    - 若 strict 评估失败，记录改进建议。
    - 若所有评估类型尝试次数耗尽，进入 beast mode。
    - 否则，分析失败原因，自动生成反思知识，下一步禁止 answer，重置 diaryContext。
  - 若为子问题且评估通过，补充知识，移除 gaps 中该问题。

### 5.2 reflect 分支
- 触发条件：thisStep.action === 'reflect' 且有 questionsToAnswer。
- 对新生成的子问题去重、限量，补充 gaps 和 allQuestions。
- 若无新子问题，则提示需换角度思考。
- 执行后禁止 reflect。

### 5.3 search 分支
- 触发条件：thisStep.action === 'search' 且有 searchRequests。
- 对搜索请求去重、限量。
- 调用 executeSearchQueries 检索外部信息，补充 allKnowledge、allKeywords。
- 若 teamSize > 1，自动并行递归子问题。
- 若无新结果，提示需换角度思考。
- 执行后禁止 search 和 answer。

### 5.4 visit 分支
- 触发条件：thisStep.action === 'visit' 且有 URLTargets。
- 归一化、去重 URL，调用 processURLs 抓取内容。
- 若抓取成功，补充知识；否则提示需换角度思考。
- 执行后禁止 read。

### 5.5 coding 分支
- 触发条件：thisStep.action === 'coding' 且有 codingIssue。
- 调用 CodeSandbox 自动求解，补充 allKnowledge。
- 求解失败则提示需换角度思考。
- 执行后禁止 coding。

---

## 6. beast mode 兜底机制

- 若所有评估类型尝试次数耗尽，或主循环未能输出最终答案，则自动进入 beast mode。
- beast mode 下 prompt 明确要求"任何答案都比沉默好"，放宽约束，优先输出可用答案。
- 设计意图：保证系统鲁棒性，避免死循环或无输出。

---

## 7. 答案后处理与返回

- 对最终答案进行 markdown 格式修复、引用补全、图片处理等。
- 若为聚合答案，合并 candidateAnswers。
- 返回结构化结果，包括：
  - result：最终 StepAction
  - context：推理上下文
  - visitedURLs/readURLs/allURLs：URL 追踪
  - imageReferences：图片引用（如有）

---

## 8. 维护建议与扩展要点

- 维护时重点关注 allow* 变量与 action 切换的逻辑正确性。
- gaps、allKnowledge、evaluationMetrics 的动态管理是多步推理的核心。
- 各 action 分支的异常处理与兜底机制需保证系统鲁棒性。
- 外部依赖（如搜索引擎、评估器、代码沙盒等）接口变更需及时适配。
- 如需扩展新 action、优化决策策略或适配新场景，可参考 getPrompt、executeSearchQueries、evaluateAnswer 等关键节点进行二次开发。 