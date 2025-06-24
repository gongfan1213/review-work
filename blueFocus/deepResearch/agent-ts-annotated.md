# agent.ts 逐行详解

---

## 文件概览

`agent.ts` 是本项目的智能研究代理核心模块，负责多步推理、外部信息检索、答案生成、流程调度与自适应决策。其主入口为 `getResponse`，通过动态 action 切换、知识积累、评估与反思机制，驱动整个智能问答与研究流程。

---

## 1. 依赖与类型导入

本节导入了大量依赖和类型，涵盖：
- 各类外部搜索工具（如 duck-duck-scrape、brave、serper 等）
- 评估、反思、去重、URL 处理、日志、token 追踪等工具模块
- 类型定义（如 StepAction、KnowledgeItem、EvaluationType、Reference 等）
- 配置、Schema、辅助工具等

这些导入为后续的多步推理、外部检索、评估与决策提供了丰富的工具和类型支持。

---

## 2. 核心工具函数

### 2.1 wait
- 实现：异步 sleep，主要用于流程节奏控制和防止 API 限流。
- 用法：在外部检索、循环等场景下，适当延迟，避免触发外部服务的速率限制。

### 2.2 BuildMsgsFromKnowledge
- 作用：将知识库（KnowledgeItem[]）转为对话消息流（CoreMessage[]），便于大模型理解上下文。
- 细节：每条知识转为 user/assistant 对，包含时间、URL、答案等信息，格式化为 markdown。
- 设计意图：让 LLM 能够"看到"历史知识，提升推理与回答质量。

### 2.3 composeMsgs
- 作用：将知识消息与真实用户消息合并，构建完整的对话上下文。
- 细节：支持附加 reviewer 的改进建议，便于多轮优化。
- 设计意图：保证 LLM 输入的上下文既有历史知识，又有当前问题和改进要求。

### 2.4 getPrompt
- 作用：动态生成系统 prompt，明确本轮允许的 action 及其规则。
- 细节：根据 allow* 变量、上下文、知识、URL 等，拼接多段指令，支持 beast mode。
- 设计意图：通过 prompt engineering 精细引导 LLM 行为，提升决策灵活性和可控性。

---

## 3. getResponse 主流程

### 3.1 函数签名与参数
- `getResponse` 是整个 agent 的主入口，参数极为丰富，支持 token 预算、评估次数、上下文、hostnames、语言、图片等多种配置。
- 设计意图：高度通用，适配多种问答、研究、检索、代码等复杂场景。

### 3.2 初始化与变量说明
- 初始化 step、totalStep、allContext、gaps、allQuestions、allKnowledge、allow* 系列变量等。
- 关键变量：
  - `gaps`：待解决的主问题和子问题列表，动态增删，驱动多步推理。
  - `allowSearch/allowRead/allowAnswer/allowReflect/allowCoding`：每轮动态控制 action 选择，防止死循环和无效尝试。
  - `evaluationMetrics`：为每个问题分配评估类型，失败自动生成改进计划，驱动反思和问题细化。
  - `diaryContext`：记录每一步的决策和结果，便于后续分析和反思。
  - `allKnowledge`/`allQuestions`/`allKeywords`：动态积累知识、问题和关键词，提升后续推理质量。
  - `beast mode`：兜底机制，连续失败后放宽约束，优先输出任何可用答案。

### 3.3 消息与知识初始化
- 处理输入消息，提取用户问题，初始化 gaps、allQuestions。
- 自动提取消息中的 URL，补充 allURLs。

### 3.4 决策主循环
- 主循环条件：token 未超预算（regularBudget）。
- 每轮流程：
  1. 动态生成 prompt，明确本轮可选 action。
  2. 调用大模型生成 action 及参数（generator.generateObject）。
  3. 根据 action 类型分支处理：
     - answer：尝试直接回答，评估通过则终止，否则反思/细化。
     - reflect：自动生成子问题，补充 gaps。
     - search：生成搜索请求，检索外部信息。
     - visit：选择高相关 URL，抓取网页内容。
     - coding：调用代码沙盒求解。
  4. 每个 action 执行后，动态调整 allow* 变量，防止无效重复。
  5. 评估失败自动生成改进计划，驱动下一步反思或细化。
  6. 多轮失败后自动进入 beast mode，放宽约束，优先输出任何可用答案。

#### 3.4.1 answer 分支
- 触发条件：allowAnswer = true，当前知识和上下文足以直接作答。
- 评估：调用 evaluateAnswer 进行多维度评估。
- 通过则终止，否则生成改进计划，驱动反思。
- 评估失败次数超限后，进入 beast mode。

#### 3.4.2 reflect 分支
- 触发条件：allowReflect = true，评估失败或知识有缺口。
- 自动生成子问题，补充 gaps。
- 若新子问题已存在，则提示需换角度思考。

#### 3.4.3 search 分支
- 触发条件：allowSearch = true，当前 gaps 未解决或知识不足。
- 生成搜索请求，调用 executeSearchQueries 检索外部信息。
- 新知识加入 allKnowledge，关键词加入 allKeywords。
- 支持 teamSize > 1 时的并行子问题递归。

#### 3.4.4 visit 分支
- 触发条件：allowRead = true，weightedURLs 有高相关 URL 可访问。
- 选择目标 URL，调用 processURLs 抓取内容，丰富 allKnowledge。

#### 3.4.5 coding 分支
- 触发条件：allowCoding = true，问题为代码相关。
- 调用 CodeSandbox 自动求解，结果加入 allKnowledge。

#### 3.4.6 beast mode
- 连续多轮评估失败后，系统自动放宽约束，优先输出任何可用答案。
- beast mode 下 prompt 明确要求"任何答案都比沉默好"。

### 3.5 结果后处理
- 对最终答案进行 markdown 格式修复、引用补全、图片处理等。
- 返回结构化结果，包括答案、上下文、已访问 URL、图片引用等。

---

## 4. 其他辅助函数

### 4.1 updateReferences
- 作用：对答案中的引用进行归一化、补全 title、补全时间等。
- 细节：并发处理引用的时间补全，提升效率。
- 设计意图：保证引用的准确性和可追溯性。

### 4.2 executeSearchQueries
- 作用：根据关键词批量执行外部检索，聚合结果。
- 细节：支持多种搜索引擎，自动去重、聚类、知识生成。
- 设计意图：高效获取外部信息，丰富知识库。

### 4.3 includesEval
- 作用：判断某问题的评估类型中是否包含指定类型。
- 用于动态调整 allow* 变量和评估流程。

### 4.4 storeContext
- 作用：将当前推理上下文、prompt、schema、知识等持久化到本地文件。
- 设计意图：便于调试、回溯和分析 agent 的推理过程。

---

## 5. 模块导出与入口

### 5.1 getResponse 导出
- 作为 agent 的主入口，供外部调用。

### 5.2 main 函数
- 支持命令行直接运行，读取参数问题，输出最终答案和已访问 URL。
- 便于本地调试和批量测试。

---

## 总结与维护建议

本文件结构清晰、模块化程度高，核心在于 getResponse 的多步推理与动态决策。建议维护时重点关注：
- allow* 变量与 action 切换的逻辑正确性
- gaps、allKnowledge、evaluationMetrics 的动态管理
- 各 action 分支的异常处理与兜底机制
- 外部依赖（如搜索引擎、评估器、代码沙盒等）的接口变更

如需扩展新 action、优化决策策略或适配新场景，可参考 getPrompt、executeSearchQueries、evaluateAnswer 等关键节点进行二次开发。 