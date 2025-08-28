

# BluePlan Research 系统详细分析文档

## 📋 项目概述

**BluePlan Research** 是一款面向社交媒体内容创作者与营销运营人员的一站式生成式智能解决方案，采用 `Supervisor + Researcher Agents` 架构，为创作与增长赋能。

### 🎯 核心定位
- **目标用户**: 社交媒体内容创作者、营销运营人员
- **应用场景**: 小红书、抖音、公众号内容创作与优化
- **核心价值**: 智能内容策略、爆款推荐、视觉优化与文案生成一体化

## 🏗️ 系统架构总览

### 整体架构模式
```
┌─────────────────────────────────────────────────────────────┐
│                    BluePlan Research                        │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Web服务层 (apis/)                                  │
├─────────────────────────────────────────────────────────────┤
│  多Agent智能架构层 (agents/)                                │
│  ├── Nova3模式: 智能任务编排                                │
│  └── Loomi模式: 内容创作专家                                │
├─────────────────────────────────────────────────────────────┤
│  核心服务层 (core/, utils/)                                │
│  ├── LLM客户端管理                                          │
│  ├── 配置管理                                              │
│  ├── 数据库连接                                            │
│  └── 工具函数                                              │
├─────────────────────────────────────────────────────────────┤
│  配置管理层 (config/)                                       │
│  ├── 应用配置                                              │
│  ├── LLM配置                                               │
│  └── 环境变量                                              │
└─────────────────────────────────────────────────────────────┘
```

## �� 多Agent智能架构详解

### 1. Nova3模式 - 智能任务编排

**架构特点**: 采用分层队列管理，支持复杂任务的智能分解和执行

```
Nova3Supervisor (智能编排/任务队列管理)
├── InsightAgent (洞察分析)
├── ProfileAgent (受众画像)  
├── HitpointAgent (内容打点)
├── FactsAgent (事实收集)
├── XHSWritingAgent (小红书创作)
├── TiktokScriptAgent (抖音口播稿)
└── WechatArticleAgent (公众号文章)
```

**核心组件**:
- **`supervisor.py`**: 主控制器，负责任务分解和结果整合
- **`layered_queue_manager.py`**: 分层队列管理器，处理任务依赖关系
- **`base_nova3_agent.py`**: Nova3模式Agent基类，提供统一接口

**工作流程**:
1. 用户输入 → Supervisor分析任务复杂度
2. 任务分解 → 生成执行计划
3. 队列管理 → 按依赖关系排序执行
4. 结果整合 → 汇总各Agent输出
5. 流式返回 → 实时展示执行过程

### 2. Loomi模式 - 内容创作专家

**架构特点**: 基于ReAct模式的智能接待员系统，专注内容创作

```
LoomiConcierge (智能接待员/Notes管理)
├── Orchestrator (ReAct任务编排)
├── InsightAgent (洞察分析)
├── ProfileAgent (受众画像)
├── HitpointAgent (内容打点)
├── XHSPostAgent (小红书创作)
├── TiktokScriptAgent (抖音口播稿)
└── WechatArticleAgent (公众号文章)
```

**核心组件**:
- **`concierge.py`**: 智能接待员，理解用户意图并生成执行计划
- **`orchestrator.py`**: 任务编排器，执行ReAct循环
- **`base_loomi_agent.py`**: Loomi模式Agent基类

**工作流程**:
1. 意图理解 → Concierge分析用户需求
2. 计划生成 → 输出XML格式的执行计划
3. 任务执行 → Orchestrator按计划执行
4. 结果优化 → Revision Agent优化输出内容
5. 流式返回 → 实时展示创作过程

## 🔧 技术栈详解

### 后端框架
- **FastAPI**: 现代Python Web框架，支持异步和流式响应
- **Uvicorn**: ASGI服务器，高性能异步支持
- **Pydantic**: 数据验证和序列化

### LLM集成
- **多模型支持**: OpenAI兼容API、Claude、通义千问、Gemini
- **统一接口**: 通过`utils/llm_client.py`提供统一调用接口
- **配置解耦**: 支持热切换不同LLM提供商

### 数据库与存储
- **Redis**: 主要存储后端，支持会话管理和Token统计
- **连接池管理**: 通过`utils/connection_pool_manager.py`优化连接性能
- **状态持久化**: 支持多轮对话和会话管理

### 异步处理
- **asyncio**: 原生Python异步支持
- **流式响应**: Server-Sent Events (SSE) 实时数据流
- **并发控制**: 支持高并发用户和Agent执行

### 监控与可观测性
- **LangSmith**: LLM调用链路追踪
- **Langfuse**: 开源LLM可观测性平台
- **健康检查**: 完整的系统健康监控端点

## 📡 API接口设计

### 核心接口架构

#### 1. `/novachat` - Nova3智能编排模式
```http
POST /novachat
Content-Type: application/json

{
  "user_id": "user_123",
  "session_id": "session_456",
  "request_data": {
    "query": "我的小红书账号流量上不去，帮我分析下原因",
    "background": {
      "account_name": "我的手工烘焙坊",
      "platform": "小红书",
      "target_audience": "20-30岁女性"
    }
  }
}
```

**响应格式**: Server-Sent Events流式数据
```json
{
  "event_type": "llm_chunk",
  "agent_source": "SupervisorAgent",
  "timestamp": "2025-01-23T10:30:00.123Z",
  "payload": {
    "content_type": "plan_step",
    "data": "1. 分析账号当前内容和人设定位..."
  }
}
```

#### 2. `/loomichat` - Loomi内容创作模式
```http
POST /loomichat
Content-Type: application/json

{
  "user_id": "user_123",
  "session_id": "session_456",
  "request_data": {
    "query": "帮我写一篇小红书烘焙笔记",
    "background": {
      "platform": "小红书",
      "industry": "美食"
    }
  }
}
```

### 内容类型标签系统

| content_type | 说明 | 来源Agent |
|-------------|------|-----------|
| `plan_step` | 执行计划步骤 | SupervisorAgent |
| `insight` | 市场/用户洞察 | ContentStrategy, UserInsight |
| `persona` | 受众画像分析 | UserInsight |
| `case_study` | 爆款案例分析 | FactCollection |
| `suggestion` | 优化建议 | DiagnoseAvatar |
| `copywriting` | 文案内容 | XHSWriter, MPWriter |
| `final_answer` | 最终报告 | SupervisorAgent |

## �� 提示词管理系统

### 架构升级
**从txt文件升级为Python模块化管理**

**升级原因**:
1. **解决空文件问题**: 原来很多txt文件只有1字节，缺少实际内容
2. **统一管理**: Python模块提供更好的组织和维护性
3. **类型安全**: IDE支持、自动补全、语法检查
4. **动态变量**: 灵活的变量替换和模板渲染

**核心文件**: `prompts/prompts.py`
- 7个Agent的完整系统提示词
- 灵活的用户提示词模板
- 专业的内容策略和创作指导
- 支持动态变量替换

### 提示词结构
```python
# 系统提示词示例
general_prompt = """
你是Loomi，一个小红书研究Agent。你的核心任务是理解用户意图并智能编排任务执行计划。

## 核心原则
1. **优先生成执行计划**：除非用户明确只要求单一简单操作，否则都应生成执行计划
2. **智能任务编排**：根据任务间的逻辑关系设计
3. **避免提前指导**：never在action的input中提前指导应该怎么做

## 任务类型说明
- `insight`: 洞察分析 - 理解现象背后的原因、趋势、心理动机
- `profile`: 用户画像 - 刻画目标人群特征、需求、行为模式
- `hitpoint`: 内容打点 - 制定内容策略、创作方向、爆款要素
- `xhs_writing`: 小红书帖子创作 - 撰写具体的小红书内容
"""
```

## 🔍 搜索能力集成

### Jina AI搜索集成
- **API Key**: `jina_b17bde3cc6d749ae93c5bfae2d212236Jj0FH7SW_jMA3r5_grSai73BJZEO`
- **Base URL**: `https://r.jina.ai/`
- **搜索深度**: 每次查询最多10个结果

### 搜索策略
1. **小红书洞察搜索**: 专注平台特定内容和趋势
2. **趋势搜索**: 行业最新发展和热点话题
3. **案例搜索**: 成功案例和最佳实践

### 技术特点
- **异步处理**: 非阻塞的搜索请求
- **智能解析**: 自动提取关键信息
- **频率控制**: 防止API调用过频
- **错误处理**: 完善的异常处理机制

### 抖音搜索工具
- **`utils/douyin_search.py`**: 抖音平台内容搜索和分析
- **热门趋势**: 实时获取抖音热门内容
- **达人分析**: 分析抖音达人的内容策略
- **内容策略**: 基于搜索结果的创作建议

## 💾 数据管理与持久化

### Token统计系统
**核心组件**: `utils/token_accumulator.py`

**功能特性**:
- **实时统计**: 每次LLM调用都会更新Token统计
- **多维度分析**: 支持日统计、月统计、用户排行榜
- **积分计算**: 1000 tokens = 10 积分
- **Redis存储**: 高性能的统计数据存储

**API端点**:
```http
GET /api/token-stats/daily?days=7          # 每日Token统计
GET /api/token-stats/monthly?months=3      # 月度Token统计
GET /api/token-stats/user-ranking?top_n=10 # 用户Token排行榜
GET /api/token-stats/dashboard             # Token统计仪表盘数据
```

### 会话管理
- **多用户支持**: 独立的用户会话管理
- **状态持久化**: 对话历史和状态自动保存
- **上下文保持**: 记住最近10轮对话内容
- **Redis存储**: 高性能的会话数据存储

### 数据库连接管理
**核心组件**: `utils/connection_pool_manager.py`

**特性**:
- **连接池优化**: 不同类型的操作使用不同的连接池
- **优先级管理**: 高优先级操作优先获取连接
- **自动重连**: 连接失败时自动重试
- **性能监控**: 连接池使用情况监控

## 🚀 性能优化策略

### 配置优化
**`config/app_config.yaml`**:
```yaml
performance:
  max_concurrent_users: 200
  max_concurrent_agents: 1000  # 大幅提高并发agent数量
  response_timeout: 300  # 增加响应超时时间
  llm_timeout: 240  # 增加LLM超时时间到4分钟

performance_optimization:
  # 核心开关：控制思考过程流式输出
  enable_thought_streaming: false  # 默认关闭，大幅提升性能
  
  # 细粒度控制
  thought_min_length: 5  # 思考内容最小长度阈值
  thought_batch_size: 10  # 思考内容批量处理大小
  
  # 传输优化
  enable_chunk_compression: true  # 启用内容压缩
  max_chunk_size: 1024  # 最大块大小（字节）
```

### 思考模式控制
**`utils/toggle_thought_mode.py`**:
- **性能模式**: 关闭思考过程流式输出，提升响应速度
- **调试模式**: 启用思考过程输出，便于问题诊断
- **动态切换**: 支持运行时切换思考模式

### 流式恢复机制
**`apis/recovery_routes_simple.py`**:
- **断线重连**: 支持客户端断线重连
- **状态恢复**: 自动恢复之前的执行状态
- **进度保持**: 不会丢失已完成的步骤

## �� 安全与认证

### 认证系统
**`utils/auth/supabase_auth_.py`**:
- **JWT认证**: 基于JWT的用户认证
- **Supabase集成**: 与Supabase用户系统集成
- **权限控制**: 基于角色的访问控制

### 速率限制
**`utils/rate_limiter.py`**:
- **智能限流**: 基于用户和IP的速率限制
- **动态调整**: 根据系统负载动态调整限制
- **白名单**: 支持特定接口的白名单配置

### 配置安全
**`utils/secure_config.py`**:
- **敏感信息加密**: 支持配置文件的加密存储
- **环境变量**: 敏感配置通过环境变量传递
- **访问控制**: 配置文件访问权限控制

## �� 监控与日志

### 健康检查系统
**`apis/health.py`**:
```http
GET /health              # 基础健康检查
GET /health/ready        # 就绪状态检查
GET /health/metrics      # 性能指标
GET /health/detailed     # 详细系统状态
```

### 日志系统
**`core/log_config.py`**:
- **结构化日志**: JSON格式的结构化日志
- **多级别**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **文件轮转**: 自动日志文件轮转
- **性能监控**: 关键操作的性能日志

### 端口监控
**`utils/port_monitor_service.py`**:
- **实时监控**: 监控系统端口使用情况
- **异常告警**: 端口异常时自动告警
- **性能统计**: 端口使用性能统计

## 🐳 部署与运维

### Docker部署
**`Dockerfile`**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "apis.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`docker-compose.yml`**:
```yaml
version: '3.8'
services:
  blueplan:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_HOST=redis
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 环境配置
**环境文件结构**:
- **`env`**: 环境指示器文件
- **`env.dev`**: 开发环境配置
- **`env.prod`**: 生产环境配置
- **`env.example`**: 配置示例文件

**配置加载优先级**:
1. 环境变量
2. 环境配置文件 (env.dev/env.prod)
3. 默认配置文件 (env)
4. 代码默认值

### 启动脚本
**`start.sh`**:
```bash
#!/bin/bash
case "$1" in
  api)
    source planvenv/bin/activate && python -m uvicorn apis.app:app --host 0.0.0.0 --port 8001 --reload
    ;;
  debug)
    source planvenv/bin/activate && python main.py debug
    ;;
  test)
    source planvenv/bin/activate && python -m pytest
    ;;
  *)
    echo "Usage: $0 {api|debug|test|help}"
    ;;
esac
```

## �� 开发指南

### 添加新Agent

1. **继承基类**: 继承`BaseAgent`或`BaseNova3Agent`/`BaseLoomiAgent`
2. **实现接口**: 实现`process_request`方法
3. **创建提示词**: 在`prompts/prompts.py`中添加提示词
4. **注册Agent**: 在对应的Supervisor中注册新Agent

**示例**:
```python
from agents.base_agent import BaseAgent

class NewContentAgent(BaseAgent):
    def __init__(self):
        super().__init__("NewContentAgent")
    
    async def process_request(self, request_data: Dict[str, Any], context: Optional[Dict[str, Any]] = None):
        # 实现具体的处理逻辑
        pass
```

### 配置管理

**添加新配置**:
1. 在`config/settings.py`中定义配置类
2. 在`config/app_config.yaml`中添加配置项
3. 在环境文件中设置对应的环境变量

**使用配置**:
```python
from config.settings import get_settings

settings = get_settings()
api_config = settings.api
```

### 测试框架

**`pytest.ini`**:
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

**测试示例**:
```python
import pytest
from agents.nova3.supervisor import Nova3Supervisor

@pytest.mark.asyncio
async def test_supervisor_initialization():
    supervisor = Nova3Supervisor()
    assert supervisor is not None
    assert supervisor.agent_name == "Nova3Supervisor"
```

## �� 业务逻辑详解

### 内容创作流程

#### 1. 需求分析阶段
- **用户输入解析**: 理解用户的创作需求
- **背景信息收集**: 分析账号定位、目标受众
- **任务复杂度评估**: 判断是否需要多步骤处理

#### 2. 策略制定阶段
- **市场洞察**: 分析行业趋势和竞品策略
- **受众画像**: 刻画目标用户特征和需求
- **内容策略**: 制定内容方向和创作要点

#### 3. 内容生成阶段
- **文案创作**: 根据策略生成具体内容
- **视觉建议**: 提供封面、配图等视觉元素建议
- **优化建议**: 基于平台特点的内容优化建议

#### 4. 结果整合阶段
- **内容汇总**: 整合各环节的输出结果
- **质量检查**: 确保内容的完整性和一致性
- **交付优化**: 优化最终交付格式

### 智能决策逻辑

#### 任务分解策略
- **单一任务**: 直接执行，无需分解
- **复合任务**: 按逻辑关系分解为多个子任务
- **依赖任务**: 识别任务间的依赖关系，按顺序执行

#### 资源分配策略
- **优先级管理**: 根据任务重要性分配资源
- **并发控制**: 控制同时执行的Agent数量
- **负载均衡**: 平衡各Agent的工作负载

#### 质量控制策略
- **内容审核**: 检查生成内容的质量和合规性
- **用户反馈**: 收集用户反馈，持续优化
- **A/B测试**: 支持不同策略的效果对比

## �� 核心功能模块

### 1. 小红书内容创作
**`agents/nova3/xhs_writing_agent.py`**:
- **爆款文案生成**: 基于热点和趋势的文案创作
- **封面设计建议**: 提供封面设计方向和元素建议
- **标签优化**: 推荐热门标签和关键词
- **发布时间建议**: 基于用户活跃时间的发布建议

### 2. 抖音口播稿创作
**`agents/nova3/tiktok_script_agent.py`**:
- **口播脚本**: 适合抖音平台的口播稿创作
- **节奏控制**: 控制口播的节奏和重点
- **互动设计**: 设计用户互动和引导
- **音乐建议**: 推荐适合的背景音乐

### 3. 公众号文章创作
**`agents/nova3/wechat_article_agent.py`**:
- **长文创作**: 适合公众号的长文章创作
- **结构优化**: 优化文章结构和可读性
- **SEO优化**: 关键词优化和标题建议
- **配图建议**: 提供配图和视觉元素建议

### 4. 用户洞察分析
**`agents/nova3/insight_agent.py`**:
- **行为分析**: 分析用户行为和偏好
- **趋势预测**: 预测行业发展趋势
- **竞品分析**: 分析竞争对手的策略
- **机会识别**: 识别市场机会和空白点

### 5. 内容策略制定
**`agents/nova3/hitpoint_agent.py`**:
- **策略规划**: 制定内容创作策略
- **爆点设计**: 设计内容的爆点和亮点
- **传播路径**: 规划内容的传播路径
- **效果预测**: 预测内容的效果和影响

## �� 系统集成能力

### 第三方API集成
- **Jina AI**: 实时网络搜索
- **抖音开放平台**: 抖音内容分析
- **小红书开放平台**: 小红书数据分析
- **微信公众号**: 公众号内容管理

### 数据导入导出
- **文件上传**: 支持多种格式的文件上传
- **数据导出**: 支持多种格式的数据导出
- **批量处理**: 支持批量内容处理
- **API接口**: 提供标准化的API接口

### 工作流集成
- **Zapier**: 支持Zapier工作流集成
- **IFTTT**: 支持IFTTT自动化集成
- **Webhook**: 支持Webhook回调
- **定时任务**: 支持定时内容发布

## 📊 性能指标与监控

### 系统性能指标
- **响应时间**: API响应时间监控
- **并发用户数**: 同时在线用户数量
- **Agent执行时间**: 各Agent的执行效率
- **Token消耗**: LLM调用的Token消耗统计

### 业务性能指标
- **内容生成质量**: 用户满意度评分
- **创作效率**: 单位时间内容产出量
- **策略准确性**: 内容策略的成功率
- **用户留存**: 用户的使用频率和时长

### 监控告警
- **系统告警**: 系统异常自动告警
- **性能告警**: 性能指标异常告警
- **业务告警**: 业务指标异常告警
- **用户反馈**: 用户问题反馈收集

## �� 未来发展规划

### 短期目标 (1-3个月)
- **性能优化**: 进一步提升系统响应速度
- **功能完善**: 完善各平台的内容创作功能
- **用户体验**: 优化用户界面和交互体验
- **稳定性提升**: 提高系统的稳定性和可靠性

### 中期目标 (3-6个月)
- **多语言支持**: 支持英文等其他语言
- **移动端适配**: 开发移动端应用
- **AI模型升级**: 集成更先进的AI模型
- **数据分析**: 增强数据分析和洞察能力

### 长期目标 (6-12个月)
- **平台扩展**: 支持更多社交媒体平台
- **生态建设**: 构建内容创作者生态
- **商业化**: 探索商业化运营模式
- **国际化**: 拓展国际市场

## 📝 总结

BluePlan Research是一个功能完整、架构先进的AI内容创作系统，具有以下核心优势：

### �� 技术优势
1. **多Agent架构**: 支持复杂任务的智能分解和执行
2. **流式响应**: 实时展示AI思考过程，提升用户体验
3. **多模型支持**: 支持多种LLM提供商，灵活切换
4. **高性能**: 异步处理、连接池优化、性能监控

### �� 业务优势
1. **全流程覆盖**: 从需求分析到内容生成的完整流程
2. **多平台支持**: 小红书、抖音、公众号全覆盖
3. **智能决策**: 基于数据和AI的智能内容策略
4. **可扩展性**: 模块化设计，易于扩展新功能

### �� 运维优势
1. **容器化部署**: 支持Docker和Kubernetes部署
2. **环境管理**: 完善的环境配置和切换机制
3. **监控告警**: 完整的系统监控和告警体系
4. **文档完善**: 详细的技术文档和部署指南

这个系统为社交媒体内容创作提供了一个完整的AI解决方案，具有很强的实用性和扩展性。
