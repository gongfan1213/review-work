我来详细分析这两个项目的所有 Agent，并总结它们的功能、作用、名称以及协作方式。


### 🏗️ Agent 架构总览
1. **整体 Agent 协作架构** - 展示了两个项目的所有 Agent 及其关系
2. **四个主要架构** - BlueLab OpenGraph、Nova3、Nova2、Loomi

### 🔍 BlueLab OpenGraph 项目 Agents
1. **ChatNode** - 通用对话节点
2. **Stage1Node** - 关键词和卡片生成
3. **Stage2Node** - 详细文本生成
4. **Stage3Node** - 小红书内容生成
5. **ExampleNode** - 示例和测试节点

### 🎯 BluePlan Research 项目 Agents

#### Nova3 架构 (12个 Agents)
1. **Nova3Supervisor** - 主控智能体
2. **InsightAgent** - 洞察分析智能体
3. **ProfileAgent** - 受众画像智能体
4. **HitpointAgent** - 内容打点智能体
5. **FactsAgent** - 事实收集智能体
6. **XHSWritingAgent** - 小红书创作智能体
7. **TiktokScriptAgent** - 抖音口播稿智能体
8. **WechatArticleAgent** - 公众号文章智能体
9. **FakeThinkAgent** - 假思考智能体
10. **FileProcessingAgent** - 文件处理智能体
11. **ResolverAgent** - 解析智能体
12. **XHSSearchAgent** - 小红书搜索智能体

#### Nova2 架构 (7个 Agents)
1. **SupervisorAgent** - 监督者智能体
2. **UserInsightAgent** - 用户洞察智能体
3. **ContentStrategyAgent** - 内容策略智能体
4. **FactCollectionAgent** - 事实收集智能体
5. **DiagnoseAvatarAgent** - 视觉诊断智能体
6. **XHSWriterAgent** - 小红书写作智能体
7. **MPWriterAgent** - 公众号写作智能体

#### Loomi 架构 (2个 Agents)
1. **LoomiConcierge** - 智能接待员
2. **Orchestrator** - 任务编排器

### 🔄 Agent 协作流程图
1. **BlueLab OpenGraph 协作流程** - 三阶段内容生成流程
2. **BluePlan Research Nova3 协作流程** - 主从模式协作
3. **BluePlan Research Nova2 协作流程** - 分层模式协作
4. **BluePlan Research Loomi 协作流程** - 编排模式协作

### 📊 Agent 功能对比表
详细对比了所有 Agent 的功能类别、主要作用和协作方式

### 🎯 核心协作模式
1. **流水线模式** - BlueLab OpenGraph
2. **主从模式** - BluePlan Research Nova3
3. **分层模式** - BluePlan Research Nova2
4. **编排模式** - BluePlan Research Loomi

## 🚀 关键发现

### BlueLab OpenGraph 项目特点
- **简单高效**: 基于 LangGraph 的节点化设计
- **阶段明确**: 三阶段内容生成流程
- **易于扩展**: 模块化的节点架构
- **流式处理**: 支持实时流式响应

### BluePlan Research 项目特点
- **架构丰富**: 支持多种 Agent 架构模式
- **功能全面**: 覆盖内容创作的各个环节
- **协作复杂**: 多 Agent 协作完成任务
- **扩展性强**: 支持新的 Agent 类型添加

### 协作方式总结
1. **BlueLab OpenGraph**: 采用流水线模式，阶段化处理
2. **BluePlan Research Nova3**: 采用主从模式，主控制器协调子Agent
3. **BluePlan Research Nova2**: 采用分层模式，分析-策略-创作三层架构
4. **BluePlan Research Loomi**: 采用编排模式，基于ReAct模式的动态编排

这份文档全面分析了两个项目的所有 Agent，展示了不同的 AI Agent 设计理念和实现方式，为智能内容生成提供了丰富的技术方案。
