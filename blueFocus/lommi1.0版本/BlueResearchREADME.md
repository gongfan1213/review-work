# BluePlan Research

> 🤖 面向社交媒体内容创作的Gen-AI Agent系统

BluePlan Research 是一款**面向社交媒体内容创作者与营销运营人员**的一站式生成式智能解决方案，采用 `Supervisor + Researcher Agents` 架构，为创作与增长赋能。

## ✨ 核心特性

- **🎯 多平台支持**: 小红书 / 抖音 / 公众号内容创作
- **🧠 双架构模式**: BluePlan多Agent协作 + BlueChat单体全能
- **🔍 Jina AI搜索**: 集成实时网络搜索，提供最新市场洞察
- **⚡ 流式响应**: 基于Server-Sent Events的实时内容生成
- **🔄 多模型支持**: OpenAI兼容API、Claude、通义千问等
- **📊 配置解耦**: LLM客户端、提示词、系统配置完全分离
- **💾 状态持久化**: 支持多轮对话和会话管理
- **🚀 生产就绪**: Docker部署、健康检查、性能监控

## 🏗️ 系统架构

### 双Agent架构模式

BluePlan Research 支持**两种Agent架构模式**，满足不同场景需求：

#### 1. 🎯 BluePlan模式 - 多Agent协作架构
```
SupervisorAgent (任务规划/意图识别)
├── UserInsightAgent (用户洞察分析)
├── ContentStrategyAgent (内容策略研究)  
├── FactCollectionAgent (事实搜集)
├── DiagnoseAvatarAgent (视觉诊断)
├── XHSWriterAgent (小红书文案创作)
└── MPWriterAgent (公众号/抖音文案创作)
```

#### 2. 🚀 BlueChat模式 - 单体全能Agent
```
XHSMasterAgent (小红书爆款搭档)
├── 🧠 智能需求诊断 (XML标签系统)
├── 💡 策略提案生成 (结构化提案)
├── ✍️ 内容创作输出 (爆款文案)
├── 🔍 Jina AI搜索 (实时信息)
└── 💾 状态持久化 (多轮对话)
```

### 🔥 全新BlueChat - 小红书爆款搭档

**基于supervisor_system_new.txt设计的单一全能Agent**

#### ✨ 核心特性
- **🎯 单一且全能**: 一个Agent解决所有小红书内容需求
- **🔄 XML标签系统**: 智能的内部状态管理
- **📊 三阶段工作流**: 需求诊断 → 策略提案 → 内容生成
- **🔍 Jina AI搜索**: 集成实时网络搜索能力
- **💬 自然对话**: 流畅的一问一答交互体验

#### 🎛️ XML标签系统
```xml
<planning>         <!-- Agent内部思考过程 -->
<message_ask_user> <!-- 向用户提问收集信息 -->
<present_ideas>    <!-- 生成结构化策略提案 -->
<output_to_canvas> <!-- 输出最终内容创作 -->
<quick_search>     <!-- 触发Jina AI实时搜索 -->
```

## 🚀 快速开始

### 环境要求

- Python 3.8+ （推荐 3.11+）
- Redis (已配置云端实例)
- 虚拟环境 `planvenv/` （项目已包含）

### 环境准备

```bash
# 1. 克隆项目
git clone <repository-url>
cd blueplan_research

# 2. 激活虚拟环境（推荐）
source planvenv/bin/activate

# 3. 安装/更新依赖（如需要）
pip install -r requirements.txt

# 4. 验证环境
python --version
python main.py help

本地交互 python interactive_chat.py
```

### 环境变量

**✅ 项目已包含完整的环境配置文件 `env`**

项目根目录下的 `env` 文件包含了所有必需的配置：
- OpenAI API配置（支持Claude模型）
- LangSmith配置
- Redis配置
- 系统配置

**配置说明:**
```bash
# 查看当前环境配置
cat env

# 配置文件会在启动时自动加载，无需手动设置环境变量
```

**如需自定义配置，修改 `env` 文件即可：**
```bash
# 编辑环境配置文件
nano env
```

### 配置信息

项目已预配置开发环境所需的API和数据库连接：

- **OpenAI兼容API**: `https://bmc-llm-relay.bluemediagroup.cn/v1`
- **模型**: `claude-sonnet-4-20250514`
- **Redis**: `r-2zeodfdqjw1knkrto0pd.redis.rds.aliyuncs.com:6379`
- **LangSmith项目**: `bluelab-opengraph-dev`

### 启动服务

#### 方式1: 虚拟环境启动（推荐生产环境）

```bash
# 🚀 直接启动（环境配置会自动加载）

# 激活虚拟环境
# 启动Nova3交互式聊天
source planvenv/bin/activate &&  python interactive_nova3.py



# 激活虚拟环境并启动API服务器
source planvenv/bin/activate && python main.py server

# 激活虚拟环境并启动调试模式
source planvenv/bin/activate && python main.py debug

# 激活虚拟环境并启动调试模式（自定义查询）
source planvenv/bin/activate && python main.py debug "小红书封面转化率低怎么办？"

# 使用uvicorn直接启动（开发模式）
source planvenv/bin/activate && python -m uvicorn apis.app:app --host 0.0.0.0 --port 8001 --reload


# 方式3：远程部署模型
#### 部署普通
nohup bash -c "source planvenv/bin/activate && exec uvicorn apis.app:app --host 0.0.0.0 --port 8099" > uvicorn.log 2>&1 &
### 部署https ssl的方式
nohup bash -c "source planvenv/bin/activate && exec uvicorn apis.app:app --host 0.0.0.0 --port 8443 
 --ssl-keyfile app/zhengshu/airobotix.cn.key --ssl-certfile app/zhengshu/airobotix.cn.pem" > uvicorn.log 2>&1 &

### 重启
sudo lsof -i :8099 -t | xargs kill -9
sudo lsof -i :8443 -t | xargs kill -9

### 方式四 本地交互

#### BluePlan模式（多Agent协作）
```bash
source planvenv/bin/activate && python interactive_chat.py
```

#### BlueChat模式（小红书爆款搭档）
```bash
# 🚀 启动BlueChat交互式界面
source planvenv/bin/activate && python interactive_bluechat.py

# 或者使用bluechat_interactive.py
source planvenv/bin/activate && python bluechat_interactive.py
```

```



#### 方式2: 使用启动脚本

```bash
./start.sh api      # 启动API服务
./start.sh debug    # 调试模式
./start.sh test     # 运行测试
./start.sh help     # 查看帮助
```

#### 方式3: 直接运行（需确保依赖已安装）

```bash
python main.py           # 默认启动API服务器
python main.py server    # 启动API服务器
python main.py debug     # 调试模式
python main.py help      # 查看帮助信息
```

### 访问服务

- **API服务**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

### 快速测试

#### 测试调试模式

```bash
# 1. 激活虚拟环境并测试默认查询
source planvenv/bin/activate && python main.py debug

# 2. 激活虚拟环境并测试自定义查询
source planvenv/bin/activate && python main.py debug "我的小红书账号流量上不去，帮我分析下原因"

# 3. 测试其他查询类型
source planvenv/bin/activate && python main.py debug "小红书封面转化率低怎么办？"
source planvenv/bin/activate && python main.py debug "帮我写一篇抖音烘焙文案"
```

**预期输出示例：**
```
🧠 BluePlan Research - 调试模式
📅 查询时间: 2025-01-14 10:30:00
💬 用户查询: 我的小红书账号流量上不去，帮我分析下原因
📝 背景信息:
   - account_name: 我的手工烘焙坊
   - platform: 小红书
   - target_audience: 20-30岁，喜欢DIY和甜品的女性

🔔 [系统] [BluePlanAPI]: 连接建立，开始处理请求...
📋 [计划] [SupervisorAgent]: 1. 分析账号当前内容和人设定位...
💡 [洞察] [UserInsightAgent]: 根据账号背景分析...
🎯 [总结] [SupervisorAgent]: 综合分析完成...
```

#### 测试API服务

```bash
# 1. 启动API服务器
source planvenv/bin/activate && python main.py server

# 2. 在另一个终端测试API（需要安装curl）
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user", 
    "session_id": "test_session",
    "request_data": {
      "query": "帮我分析小红书账号优化策略",
      "background": {
        "account_name": "测试账号",
        "platform": "小红书"
      }
    }
  }'
```

### 故障排除

#### 虚拟环境问题

```bash
# 如果虚拟环境不存在或损坏，重新创建
python -m venv planvenv
source planvenv/bin/activate
pip install -r requirements.txt

# 检查虚拟环境状态
source planvenv/bin/activate && which python
source planvenv/bin/activate && pip list
```

#### 常见启动错误

**1. 依赖缺失：**
```bash
# 重新安装依赖
source planvenv/bin/activate && pip install -r requirements.txt --upgrade
```

**2. 端口被占用：**
```bash
# 检查端口占用
lsof -i :8000

# 使用其他端口启动
source planvenv/bin/activate && python -c "
import sys; sys.path.append('.');
from apis.app import app;
import uvicorn;
uvicorn.run(app, host='0.0.0.0', port=8001)
"
```

**3. 配置文件问题：**
```bash
# 检查配置文件
source planvenv/bin/activate && python -c "
from config.settings import Settings;
print('配置加载:', Settings())
"
```

## 📡 API使用

### 核心接口

#### 1. `/chat` - BluePlan多Agent协作模式

**POST** `/chat` - 流式聊天接口（多Agent协作）

#### 2. `/bluechat` - BlueChat小红书爆款搭档模式

**POST** `/bluechat` - 小红书专业内容创作接口

```json
{
  "user_id": "user_123",
  "session_id": "session_456", 
  "request_data": {
    "query": "我的小红书账号流量上不去，帮我分析下原因",
    "background": {
      "account_name": "我的手工烘焙坊",
      "platform": "小红书",
      "target_audience": "20-30岁，喜欢DIY和甜品的女性"
    },
    "interaction_type": "full_analysis"
  }
}
```

**响应**: Server-Sent Events 流式数据

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

#### BlueChat API 示例

```json
{
  "user_id": "xhs_user_123",
  "session_id": "session_456", 
  "request_data": {
    "query": "我想做美食博主，给我一些建议",
    "background": {
      "platform": "小红书",
      "industry": "美食",
      "target_audience": "年轻人群"
    }
  }
}
```

**BlueChat响应特色**:

```json
{
  "event_type": "llm_chunk",
  "agent_source": "xhs_master_agent",
  "payload": {
    "content_type": "structured_proposals",
    "data": [
      {
        "title": "家常菜变身记",
        "core_selling_point": "普通食材的高级做法",
        "expected_effect": "新手也能做出大师级美食",
        "content_format": "图文教程",
        "difficulty_level": "⭐⭐⭐"
      }
    ]
  }
}
```

### 内容类型标签

| content_type | 说明 | 来源Agent |
|-------------|------|----------|
| `plan_step` | 执行计划步骤 | SupervisorAgent |
| `insight` | 市场/用户洞察 | ContentStrategy, UserInsight |
| `persona` | 用户画像分析 | UserInsight |
| `case_study` | 爆款案例分析 | FactCollection |
| `suggestion` | 优化建议 | DiagnoseAvatar |
| `copywriting` | 文案内容 | XHSWriter, MPWriter |
| `final_answer` | 最终报告 | SupervisorAgent |

## 🧪 测试示例

```python
# test_example.py
import asyncio
from main import BluePlanApp

async def test_chat():
    app = BluePlanApp()
    
    query = "帮我写一篇小红书烘焙笔记"
    background = {
        "account_name": "甜品小厨房",
        "platform": "小红书",
        "target_audience": "年轻女性烘焙爱好者"
    }
    
    await app.chat_debug(query, background)

if __name__ == "__main__":
    asyncio.run(test_chat())
```

## 📁 项目结构

```
blueplan_research/
├── main.py                    # 主启动类
├── interactive_bluechat.py    # BlueChat交互式入口 🔥
├── bluechat_interactive.py    # BlueChat备用交互入口
├── start.sh                   # 启动脚本（已配置环境变量）
├── requirements.txt           # Python依赖
├── JINA_AI_INTEGRATION.md     # Jina AI集成指南 🔥
├── agents/                    # Agent模块
│   ├── base_agent.py          # Agent基类
│   ├── supervisor.py          # 监督者Agent (BluePlan模式)
│   ├── xhs_master_agent.py    # 小红书爆款搭档 (BlueChat模式) 🔥
│   ├── user_insight.py        # 用户洞察Agent
│   ├── content_strategy.py    # 内容策略Agent
│   ├── fact_collection.py     # 事实搜集Agent
│   ├── diagnose_avatar.py     # 视觉诊断Agent
│   ├── writer_xhs.py          # 小红书文案Agent
│   └── writer_mp_dy.py        # 公众号/抖音文案Agent
├── apis/                      # API服务模块
│   ├── app.py                 # FastAPI应用
│   ├── routes.py              # API路由
│   ├── schemas.py             # 数据模型
│   ├── middleware.py          # 中间件
│   └── health.py              # 健康检查
├── config/                    # 配置管理
│   ├── settings.py            # 配置类
│   ├── app_config.yaml        # 应用配置
│   └── llm_config.yaml        # LLM配置
├── prompts/                   # 提示词库
│   ├── supervisor_system_new.txt # BlueChat核心提示词 🔥
│   ├── supervisor_*.txt       # 监督者提示词
│   ├── user_insight_*.txt     # 用户洞察提示词
│   ├── prompt_manager.py      # 提示词管理器
│   └── ...                    # 其他Agent提示词
├── utils/                     # 工具模块
│   ├── llm_client.py          # LLM客户端
│   ├── web_search.py          # Jina AI搜索工具 🔥
│   ├── logger.py              # 日志工具
│   └── error_handler.py       # 错误处理
└── logs/                      # 日志目录
```

## 🔧 配置说明

### LLM配置 (config/llm_config.yaml)

```yaml
llm:
  default_provider: "openai"
  providers:
    openai:
      api_key: "${OPENAI_API_KEY}"
      model: "${OPENAI_MODEL:-claude-sonnet-4-20250514}"
      base_url: "${OPENAI_API_BASE:-https://bmc-llm-relay.bluemediagroup.cn/v1}"
      temperature: 0.7
      max_tokens: 4096
```

### 应用配置 (config/app_config.yaml)

```yaml
app:
  name: "BluePlan Research"
  debug: true
  log_level: "INFO"

memory:
  store_type: "redis"
  redis_host: "${REDIS_HOST}"
  redis_port: "${REDIS_PORT}"
  redis_password: "${REDIS_PASSWORD}"
```

## 🐳 Docker部署

```bash
# 构建镜像
docker build -t blueplan-research .

# 运行容器
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your_key \
  -e REDIS_PASSWORD=your_password \
  blueplan-research
```

## 📊 监控和日志

- **健康检查**: `/health`, `/health/ready`, `/health/metrics`
- **日志文件**: `logs/blueplan.log`
- **性能指标**: Agent执行时间、成功率、内容生成统计

## 🛠️ 开发指南

### 添加新Agent

1. 继承 `BaseAgent` 类
2. 实现 `process_request` 方法
3. 创建对应的提示词文件
4. 在 `SupervisorAgent` 中注册

### 📝 提示词管理系统

**🔄 已升级为Python模块化管理**

**为什么不再使用txt文件？**
1. **解决空文件问题** - 原来很多txt文件只有1字节，缺少实际内容
2. **统一管理** - Python模块提供更好的组织和维护性
3. **类型安全** - IDE支持、自动补全、语法检查
4. **动态变量** - 灵活的变量替换和模板渲染

**新的结构：**
```python
# prompts/prompt_manager.py - 统一管理所有提示词
class PromptManager:
    def get_system_prompt(self, agent_name: str) -> str
    def get_user_prompt(self, agent_name: str, **kwargs) -> str
```

**特点：**
- ✅ 7个Agent的完整系统提示词
- ✅ 灵活的用户提示词模板
- ✅ 专业的内容策略和创作指导
- ✅ 支持动态变量替换

详情查看：[prompts/README.md](prompts/README.md)

## 🤖 Agent详细说明

### 🚀 BlueChat - 小红书爆款搭档 (推荐)

**单一全能Agent，专为小红书内容创作打造**

#### 🎯 工作流程
1. **需求诊断阶段** - 通过提问深入了解用户背景和需求
2. **策略提案阶段** - 生成结构化的内容策略提案
3. **内容生成阶段** - 输出爆款文案和创作建议

#### 🔍 搜索能力
- **Jina AI集成**: 实时搜索最新市场趋势
- **三种搜索策略**: 小红书洞察、趋势分析、案例研究
- **上下文感知**: 基于用户背景优化搜索结果

#### 💾 会话管理
- **多用户支持**: 独立的用户会话管理
- **状态持久化**: 对话历史和状态自动保存
- **上下文保持**: 记住最近10轮对话内容

#### 📁 关键文件
- `agents/xhs_master_agent.py` - 核心Agent实现
- `prompts/supervisor_system_new.txt` - 专业提示词
- `utils/web_search.py` - Jina AI搜索工具
- `interactive_bluechat.py` - 交互式界面

#### 🚀 快速体验
```bash
# 启动BlueChat交互式界面
source planvenv/bin/activate && python interactive_bluechat.py

# 或通过API访问
curl -X POST "http://localhost:8000/bluechat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "session_id": "session456", "request_data": {"query": "我想做美食博主，给我一些建议"}}'
```

### 🎯 BluePlan - 多Agent协作架构

**传统多Agent协作模式，适合复杂内容策略分析**

#### Agent组成
- **SupervisorAgent**: 任务调度和流程控制
- **UserInsightAgent**: 用户画像和市场洞察
- **ContentStrategyAgent**: 内容策略制定
- **FactCollectionAgent**: 数据搜集和验证
- **DiagnoseAvatarAgent**: 视觉内容分析
- **XHSWriterAgent**: 小红书文案创作
- **MPWriterAgent**: 公众号/抖音文案创作

#### 适用场景
- 复杂的多平台内容策略分析
- 需要详细的市场调研报告
- 多维度的用户画像分析

## 🔍 Jina AI搜索集成

### 配置信息
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

详细集成指南请参考: [JINA_AI_INTEGRATION.md](JINA_AI_INTEGRATION.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 发起 Pull Request

## 📄 许可证

MIT License

---

**🧠 BluePlan Research - 让每一次内容创作都更智能、更精准**
