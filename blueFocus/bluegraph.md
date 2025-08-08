我来详细分析 `bluelab-opengraph` 项目的架构和逻辑流程。让我先查看项目的关键文件。

Read file: bluelab-opengraph/README.md
Read file: bluelab-opengraph/app/main.py
Read file: bluelab-opengraph/app/api/base.py
Read file: bluelab-opengraph/app/graphs/graph.py
Read file: bluelab-opengraph/app/graphs/state.py
Read file: bluelab-opengraph/app/graphs/nodes/chat_node.py
Read file: bluelab-opengraph/app/graphs/nodes/stage1_node.py
Read file: bluelab-opengraph/app/config.py
Read file: bluelab-opengraph/app/schemas.py
Ran tool
Ran tool
Ran tool
现在我来创建一个详细的 BlueLab OpenGraph 项目架构分析文档：

我已经为你创建了一份详细的 BlueLab OpenGraph 项目架构分析文档。这份文档包含了：

## 📋 文档内容概览

### 🏗️ 系统架构图
1. **整体系统架构** - 展示了从前端到后端的完整架构
2. **LangGraph 工作流架构** - 详细的工作流和节点执行流程
3. **三阶段内容生成流程** - 内容生成的不同阶段和流程

### 🔄 数据流程图
1. **用户请求处理流程** - 完整的请求处理时序图
2. **状态管理流程** - 状态在系统中的流转过程

### 🏛️ 核心组件分析
1. **FastAPI 应用架构** - 应用结构和路由管理
2. **LangGraph 节点架构** - 节点类型和继承关系
3. **配置管理架构** - 配置系统的组织方式

### 📊 数据存储架构
1. **存储层次结构** - 从内存到外部服务的存储层次
2. **Redis 缓存架构** - 缓存系统的设计和使用

### 🔧 配置管理架构
1. **配置层次结构** - 配置文件的组织方式
2. **环境配置管理** - 多环境配置管理流程

### 🚀 性能优化架构
1. **异步处理模型** - 高并发处理架构
2. **流式响应架构** - 实时流式响应机制

### 🔒 安全架构
1. **认证授权流程** - 安全认证流程
2. **安全防护层** - 多层安全防护

### 📈 部署架构
1. **Docker部署架构** - 容器化部署方案
2. **生产环境架构** - 生产环境架构设计

### 🔄 错误处理和恢复
1. **错误处理流程** - 错误处理机制
2. **恢复机制** - 故障恢复策略

### 📊 监控和日志
1. **监控架构** - 监控系统设计
2. **日志架构** - 日志收集和处理

### 🎯 核心功能分析
1. **三阶段内容生成** - 详细的内容生成流程
2. **通用AI对话** - 对话功能的实现

### 🔧 开发工具和流程
1. **开发环境设置** - 开发环境配置
2. **测试流程** - 测试策略和方法

### 📈 性能指标
1. **性能监控指标** - 关键性能指标
2. **容量规划** - 系统容量规划

## 🎯 文档特点

1. **可视化丰富** - 使用 Mermaid 图表展示复杂的架构关系
2. **层次清晰** - 从整体到细节的层次化分析
3. **技术深入** - 详细的技术实现分析
4. **实用性强** - 包含部署、监控、安全等实际应用场景

## 🚀 核心功能亮点

### 三阶段内容生成
- **第一阶段**: 关键词生成 + 内容卡片生成
- **第二阶段**: 基于ID的详细文本生成
- **第三阶段**: 小红书风格内容生成

### 通用AI对话
- 支持任意输入的AI对话
- 流式输出，实时响应
- 会话管理和历史记录

### 技术特性
- **LangGraph架构**: 模块化的节点和图结构
- **SSE流式推送**: Server-Sent Events实时数据推送
- **异步处理**: 高性能异步API设计
- **Redis缓存**: 智能缓存和历史管理

这份文档可以帮助你：
- 理解项目的整体架构设计
- 掌握各个组件的职责和关系
- 了解系统的数据流向和处理逻辑
- 学习现代化的微服务架构设计模式
- 为后续的开发和维护提供参考

文档已保存为 `BLUELAB_OPENGRAPH_ARCHITECTURE_ANALYSIS.md`，你可以在项目中查看和使用。
