# agent 智能决策机制深度分析

---

## 一、整体架构与核心思想

agent.ts 作为智能研究代理的"大脑"，其决策流程以 `getResponse` 为主线，结合多步推理、动态 action 切换、评估与反思机制，实现了高度自适应的智能决策。其目标是：在有限 token 预算内，自动选择最优推理路径，最大化答案质量。

---

## 二、决策主循环与核心变量

### 1. 决策主循环
核心逻辑如下：

```typescript
while (context.tokenTracker.getTotalUsage().totalTokens < regularBudget) {
    // 1. 动态生成 prompt，明确本轮可选 action
    // 2. 调用大模型生成 action 及参数
    // 3. 根据 action 类型分支处理
    // 4. 动态调整 allow* 变量，驱动下一轮决策
}
```

### 2. 关键变量说明
- `allowSearch/allowRead/allowAnswer/allowReflect/allowCoding`：每轮动态控制 action 选择，防止死循环和无效尝试。
- `gaps`：待解决的主问题和子问题列表，动态增删，驱动多步推理。
- `evaluationMetrics`：为每个问题分配评估类型，失败自动生成改进计划，驱动反思和问题细化。
- `diaryContext`：记录每一步的决策和结果，便于后续分析和反思。
- `allKnowledge`/`allQuestions`/`allKeywords`：动态积累知识、问题和关键词，提升后续推理质量。
- `beast mode`：兜底机制，连续失败后放宽约束，优先输出任何可用答案。

---

## 三、action 触发条件与执行流程

### 1. answer（直接回答）
- **触发条件**：
  - allowAnswer = true
  - 当前知识和上下文足以直接作答
- **执行流程**：
  - 生成答案，调用评估器（evaluateAnswer）进行多维度评估
  - 若评估通过，标记 isFinal，流程终止
  - 若评估失败，自动生成改进计划，驱动反思/细化问题
- **退出机制**：
  - 评估通过或达到最大尝试次数

### 2. search（外部检索）
- **触发条件**：
  - allowSearch = true
  - 当前 gaps 未解决，或知识不足
- **执行流程**：
  - 生成搜索请求，调用 executeSearchQueries 检索外部信息
  - 新知识加入 allKnowledge，关键词加入 allKeywords
  - 若 teamSize > 1，自动并行子问题递归
- **退出机制**：
  - 搜索无新结果，allowSearch 置为 false

### 3. reflect（反思/子问题生成）
- **触发条件**：
  - allowReflect = true
  - 评估失败或知识有缺口
- **执行流程**：
  - 自动生成子问题，补充 gaps
  - 若新子问题已存在，则提示"需换角度思考"
- **退出机制**：
  - gaps 无新增，allowReflect 置为 false

### 4. visit（网页内容抓取）
- **触发条件**：
  - allowRead = true
  - weightedURLs 有高相关 URL 可访问
- **执行流程**：
  - 选择目标 URL，调用 processURLs 抓取内容，丰富 allKnowledge
- **退出机制**：
  - URL 已全部访问，allowRead 置为 false

### 5. coding（代码求解）
- **触发条件**：
  - allowCoding = true
  - 问题为代码相关
- **执行流程**：
  - 调用 CodeSandbox 自动求解，结果加入 allKnowledge
- **退出机制**：
  - 求解成功或失败，allowCoding 置为 false

---

## 四、动态调度与自适应机制

### 1. allow* 变量动态调整
每轮 action 执行后，根据结果动态调整 allow* 变量。例如：
- search 后立即禁止 answer，防止过早输出
- 评估失败后禁止 answer，优先反思/细化
- URL 访问完毕后禁止 visit

### 2. gaps 机制驱动多步推理
- gaps 记录所有待解决问题，reflect 动作可自动补充新子问题
- 每解决一个子问题，gaps 自动剔除，直至主问题被攻克

### 3. evaluationMetrics 评估与改进
- 每个问题分配多种评估类型（如完整性、时效性、权威性等）
- 评估失败自动生成改进计划，驱动下一步反思或细化
- 达到最大失败次数后，自动进入 beast mode

### 4. beast mode 兜底机制
- 连续多轮评估失败后，系统自动放宽约束，优先输出任何可用答案，保证鲁棒性
- beast mode 下 prompt 明确要求"任何答案都比沉默好"

---

## 五、伪代码与流程图辅助说明

### 1. 决策主循环伪代码
```typescript
while (token 未超预算) {
    动态生成 prompt（基于 allow*、gaps、知识等）
    action = LLM 决策（answer/search/reflect/visit/coding）
    switch(action) {
        case answer:
            评估答案，成功则终止，否则反思
        case search:
            检索外部信息，更新知识
        case reflect:
            生成子问题，补充 gaps
        case visit:
            抓取网页内容，丰富知识
        case coding:
            自动代码求解
    }
    动态调整 allow*，更新 gaps、知识、评估等
    若多轮失败，进入 beast mode
}
```

### 2. action 切换流程图（Mermaid 伪代码）
```mermaid
graph TD
    Start[开始]
    --> |生成prompt| LLM决策
    LLM决策 --> |answer| 答案评估
    LLM决策 --> |search| 外部检索
    LLM决策 --> |reflect| 反思/子问题
    LLM决策 --> |visit| 网页抓取
    LLM决策 --> |coding| 代码求解
    答案评估 --> |通过| 终止
    答案评估 --> |失败| 反思/细化
    外部检索 --> |有新知识| 继续决策
    外部检索 --> |无新知识| 反思/细化
    反思/子问题 --> |有新gap| 继续决策
    反思/子问题 --> |无新gap| beast mode
    网页抓取 --> |有新内容| 继续决策
    网页抓取 --> |无新内容| 反思/细化
    代码求解 --> |成功| 继续决策
    代码求解 --> |失败| 反思/细化
    beast mode --> 终止
```

---

## 六、典型决策流举例

1. 用户提问后，系统先尝试 answer，若评估不通过则 search。
2. search 后若信息不足，自动 reflect 生成子问题，补充 gaps。
3. visit 动作抓取外部内容，丰富 allKnowledge。
4. 多轮循环后，若依然无法通过评估，自动进入 beast mode，输出最优可用答案。

---

## 七、二次开发建议

- 可自定义 action 类型，扩展更多智能行为（如多模态推理、主动学习等）
- allow* 变量和 gaps 机制高度灵活，适合多种推理场景
- 评估与反思机制可根据业务需求自定义
- 推荐关注 getPrompt、evaluateAnswer、executeSearchQueries、processURLs 等关键节点

--- 