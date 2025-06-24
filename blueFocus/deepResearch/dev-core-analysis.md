# 核心模块分析文档

---

## 1. agent.ts

**模块定位**：
agent.ts 是系统的智能研究代理核心，负责多步推理、外部信息检索、答案生成与流程调度。

**主要功能**：
- 组织和管理多轮对话与推理步骤。
- 调用多种搜索引擎（如 Jina、DuckDuckGo、Brave、Serper 等）进行信息检索。
- 结合外部知识、上下文和历史消息，生成高质量答案。
- 支持答案评估、反思、引用管理、URL 处理等。

**核心函数/类**：
- `getResponse`：主入口，驱动整个推理与回答流程。
- `executeSearchQueries`：根据关键词和上下文执行多种搜索。
- `getPrompt`/`composeMsgs`：动态构建系统提示词和消息流。
- `updateReferences`/`buildReferences`：答案与引用的自动关联。
- `wait`：流程节奏控制。

**关键实现思路**：
- 采用多策略（搜索、阅读、反思、直接回答、代码生成）动态决策。
- 通过 Schema 约束和多轮消息组织，保证输出结构化和高质量。
- 支持"beast mode"等特殊模式，提升应对复杂问题的能力。
- 与工具、评估、URL 处理等模块深度集成。

**典型应用场景**：
- 智能问答、自动化研究、复杂信息聚合。
- 需要多步推理和外部知识融合的场景。

**与其他模块关系**：
- 依赖 text-tools、url-tools、evaluator、finalizer、reducer 等工具。
- 作为顶层 orchestrator，调度各类底层工具和外部 API。

### agent.ts 动态决策机制详解

**1. 整体决策流程架构**

agent.ts 的核心是 `getResponse` 函数，它通过循环和多步推理，动态选择最合适的 action（如 search、visit、answer、reflect、coding），以逐步逼近高质量答案。每一步都基于当前上下文、知识、评估结果和外部环境，实时调整决策路径。

**2. 动态 action 切换机制**

每一轮决策，系统会根据当前状态设置一组 allow* 变量（如 allowSearch、allowRead、allowAnswer、allowReflect、allowCoding），这些变量决定本轮允许哪些 action。决策流程大致如下：

- 先根据 gaps（待解决的问题列表）和 evaluationMetrics（评估需求）判断当前主攻方向。
- 通过 getPrompt 动态生成系统提示词，明确本轮可选 action。
- 调用大模型（generator.generateObject）生成本轮 action 及其参数。
- 根据 action 类型进入不同分支：
  - **answer**：尝试直接回答，若评估通过则终止，否则反思或细化问题。
  - **reflect**：自动生成子问题，补充 gaps，驱动多步推理。
  - **search**：根据当前问题和知识，生成搜索请求，检索外部信息。
  - **visit**：选择高相关 URL，抓取网页内容，丰富知识库。
  - **coding**：遇到代码相关问题时，自动调用代码沙盒求解。
- 每个 action 执行后，都会根据结果调整 allow* 变量，防止无效重复。

**3. 关键变量驱动决策**

- `allowSearch/allowRead/allowAnswer/allowReflect/allowCoding`：每轮动态控制 action 选择，防止死循环和无效尝试。
- `gaps`：记录所有待解决的主问题和子问题，动态增删，驱动多步推理。
- `evaluationMetrics`：为每个问题分配评估类型（如完整性、时效性、权威性等），评估失败会自动生成改进计划，驱动反思和问题细化。
- `diaryContext`：记录每一步的决策和结果，便于后续分析和反思。
- `allKnowledge`/`allQuestions`/`allKeywords`：动态积累知识、问题和关键词，提升后续推理质量。

**4. 多步推理与自适应失败处理**

- 每轮 action 执行后，系统会根据评估结果决定是否终止、反思、细化问题或切换 action。
- 若连续多轮评估失败，系统会自动进入"beast mode"，放宽约束，优先输出任何可用答案，保证鲁棒性。
- 反思（reflect）和子问题生成机制，确保复杂问题能被拆解并逐步攻克。
- 通过 processURLs、executeSearchQueries 等工具函数，动态扩展知识库和外部信息。

**5. 代码片段举例说明**

```typescript
while (context.tokenTracker.getTotalUsage().totalTokens < regularBudget) {
  // ...
  const { system, urlList } = getPrompt(...allow*...);
  schema = SchemaGen.getAgentSchema(...allow*...);
  msgWithKnowledge = composeMsgs(...);
  const result = await generator.generateObject({ ... });
  thisStep = { action: result.object.action, ... };
  // 动态分支
  if (thisStep.action === 'answer') { ... }
  else if (thisStep.action === 'reflect') { ... }
  else if (thisStep.action === 'search') { ... }
  else if (thisStep.action === 'visit') { ... }
  else if (thisStep.action === 'coding') { ... }
  // ...
}
```

**6. 典型决策流示意**

1. 用户提问后，系统先评估是否能直接 answer，若不能则 search。
2. search 后若信息不足，自动 reflect 生成子问题，补充 gaps。
3. visit 动作抓取外部内容，丰富 allKnowledge。
4. 多轮循环后，若依然无法通过评估，自动进入 beast mode，输出最优可用答案。

**7. 技术要点与二次开发建议**

- 动态决策流程高度模块化，便于插拔新 action 或自定义决策策略。
- allow* 变量和 gaps 机制可灵活扩展，适合多种推理场景。
- 评估与反思机制保证答案质量，支持自适应优化。
- 推荐二次开发时关注 getPrompt、evaluateAnswer、executeSearchQueries、processURLs 等关键节点。

---

## 2. app.ts

**模块定位**：
app.ts 是系统的 Web 服务入口，基于 Express 框架，负责 HTTP API 的暴露和请求处理。

**主要功能**：
- 提供健康检查、主业务接口（如 /health、/chat 等）。
- 处理前端/客户端的对话请求，调用 agent.ts 获取智能回复。
- 支持流式输出，模拟"自然打字"效果。
- 请求参数校验、CORS、JSON 解析等中间件管理。

**核心函数/类**：
- `streamTextNaturally`：将长文本分块流式输出，提升用户体验。
- `splitTextIntoChunks`/`calculateDelay`：智能分块与动态延迟。
- Express 路由与中间件。

**关键实现思路**：
- 通过异步生成器和分块机制，实现高并发下的流式响应。
- 针对 CJK 字符、URL、标点等特殊内容做细致处理。
- 与 agent.ts 紧密集成，作为对外唯一入口。

**典型应用场景**：
- 智能问答 Web 服务、API 网关。
- 需要流式输出和高并发处理的对话系统。

**与其他模块关系**：
- 直接调用 agent.ts，间接依赖 text-tools、url-tools 等。
- 作为系统对外 API 层，承上启下。

---

## 3. utils/text-tools.ts

**模块定位**：
text-tools.ts 提供丰富的文本处理工具，是答案生成、格式修复、引用管理等环节的基础。

**主要功能**：
- Markdown 脚注、表格、代码块等格式修复。
- 多语言 i18n 支持。
- Ngram 提取、PMI 计算、文本分块等 NLP 工具。
- HTML 转 Markdown、去除冗余换行、合并字符串等。

**核心函数/类**：
- `buildMdFromAnswer`/`repairMarkdownFootnotes`：答案与引用的 Markdown 格式化。
- `getI18nText`：多语言文本获取。
- `extractNgrams`：Ngram 及 PMI 统计。
- `convertHtmlTablesToMd`/`fixCodeBlockIndentation`：格式修复。

**关键实现思路**：
- 通过正则和分块算法，自动修复常见 Markdown 问题。
- 支持 CJK 与非 CJK 文本的差异化处理。
- 与 types.ts、url-tools、agent 等模块深度耦合。

**典型应用场景**：
- 智能问答的答案后处理。
- 多语言支持、文本聚合与分析。

**与其他模块关系**：
- 被 agent、evaluator、url-tools 等广泛调用。
- 作为底层工具库，支撑格式化与文本分析。

---

## 4. tools/evaluator.ts

**模块定位**：
evaluator.ts 负责答案和问题的自动化评估，是智能问答质量控制的核心。

**主要功能**：
- 针对答案的多维度评估（完整性、时效性、权威性、确定性等）。
- 生成评估提示词，自动调用大模型进行评价。
- 评估结果结构化输出，辅助后续优化。

**核心函数/类**：
- `evaluateAnswer`/`evaluateQuestion`：主评估入口。
- `getRejectAllAnswersPrompt`/`getDefinitivePrompt` 等：多种评估场景的提示词生成。
- `performEvaluation`：统一的评估执行流程。

**关键实现思路**：
- 通过 Prompt Engineering 设计多种评估规则，自动化调用大模型。
- 支持多语言、多场景、多维度的灵活扩展。
- 评估与知识库、上下文、Schema 深度结合。

**典型应用场景**：
- 智能问答系统的自动化质量把控。
- 复杂多轮对话的答案优化。

**与其他模块关系**：
- 被 agent.ts 调用，评估结果影响后续推理。
- 依赖 text-tools、schemas、types 等。

---

## 5. utils/url-tools.ts

**模块定位**：
url-tools.ts 提供 URL 归一化、过滤、排序、内容处理等工具，是外部信息检索与引用管理的基础。

**主要功能**：
- URL 规范化、去重、参数清洗、锚点处理。
- URL 过滤、排序、分组、采样等。
- 结合外部内容抓取、图片处理、内容分块等。
- 支持多种搜索结果的聚合与优化。

**核心函数/类**：
- `normalizeUrl`/`normalizeHostName`：URL 归一化。
- `filterURLs`/`rankURLs`/`addToAllURLs`：URL 过滤与排序。
- `processURLs`：批量处理与内容抓取。
- `extractUrlParts`/`extractUrlsWithDescription`：URL 解析与描述提取。

**关键实现思路**：
- 通过正则和 URL API，自动处理各种常见和特殊 URL 问题。
- 支持多种参数过滤、锚点处理、主机名归一化。
- 与搜索、内容抓取、图片处理等模块协同。

**典型应用场景**：
- 搜索结果聚合、引用管理、内容去重。
- 智能问答系统的外部知识融合。

**与其他模块关系**：
- 被 agent、app、text-tools、tools 等广泛调用。
- 作为外部信息流的关键中枢。 