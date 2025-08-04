我来帮你分析这个项目的结构并详细说明如何运行它。首先让我查看一下项目的关键配置文件。

Read file: README.md
Read file: docker-compose.yml
Read file: Dockerfile
Read file: conf/default/app/runtime/model_config.yaml
Read file: dev_reload.sh
Ran tool
Read file: frontend/README.md
基于我对项目结构的分析，这是一个名为 **Coze Loop** 的AI代理开发平台项目。让我详细说明如何运行这个项目：

## �� Coze Loop 项目运行指南

### �� 项目概述
Coze Loop 是一个面向开发者的AI代理开发平台，提供从开发、调试、评估到监控的全生命周期管理能力。项目采用前后端分离架构：
- **后端**: Go语言 + CloudWeGo框架
- **前端**: React + TypeScript + Rush.js Monorepo
- **数据库**: MySQL + Redis + ClickHouse
- **消息队列**: RocketMQ
- **对象存储**: MinIO

### ��️ 环境要求

1. **Docker 和 Docker Compose**
   ```bash
   # 确保已安装 Docker 和 Docker Compose
   docker --version
   docker-compose --version
   ```

2. **Node.js 环境**（仅前端开发需要）
   ```bash
   # 安装 Node.js 18+
   nvm install lts/iron
   nvm use lts/iron
   
   # 安装 pnpm 和 Rush
   npm i -g pnpm@8.15.8 @microsoft/rush@5.147.1
   ```

### �� 快速启动（推荐方式）

#### 1. 获取源码
```bash
git clone https://github.com/coze-dev/coze-loop.git
cd coze-loop
```

#### 2. 配置模型
编辑 `conf/default/app/runtime/model_config.yaml` 文件，配置你的AI模型API密钥：

```yaml
models:
  - id: 1
    name: "doubao"
    frame: "eino"
    protocol: "ark"
    protocol_config:
      api_key: "你的API密钥"  # 替换为你的API密钥
      model: "你的模型端点"   # 替换为你的模型端点
```

**支持的模型**：
- **火山引擎 Ark**: 需要API Key和Endpoint ID
- **OpenAI**: 需要API Key
- 其他支持的LLM模型

#### 3. 启动服务
```bash
# 开发模式启动（默认）
docker compose up --build

# 或者后台运行
docker compose up --build -d
```

#### 4. 访问应用
- **主应用**: http://localhost:8082
- **MinIO管理后台**: http://localhost:19001/browser

### �� 开发模式

#### 后端开发
项目支持热重载，修改后端代码后会自动重启：

```bash
# 监控后端日志
docker logs -fn100 cozeloop-app

# 进入后端容器
docker exec -it cozeloop-app bash
```

#### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
rush update

# 启动前端开发服务器
cd apps/cozeloop
rushx dev
```

前端开发服务器运行在 http://localhost:8090

### �� 服务组件

启动后会自动创建以下服务：

| 服务 | 端口 | 说明 |
|------|------|------|
| nginx | 8082 | 前端代理服务器 |
| app | 8080 | 后端API服务 |
| redis | 6379 | 缓存数据库 |
| mysql | 3306 | 主数据库 |
| clickhouse | 8123/9008 | 分析数据库 |
| minio | 19000/19001 | 对象存储 |
| rocketmq | 9876/10911 | 消息队列 |

### �� 调试和监控

#### 查看服务状态
```bash
# 查看所有容器状态
docker ps

# 查看特定服务日志
docker logs -fn100 cozeloop-app
docker logs -fn100 cozeloop-nginx
```

#### 数据库访问
```bash
# MySQL
docker exec -it cozeloop-mysql mysql -u root -p cozeloop-mysql

# Redis
docker exec -it cozeloop-redis redis-cli -a cozeloop-redis

# ClickHouse
docker exec -it cozeloop-clickhouse clickhouse-client --host cozeloop-clickhouse --port 9008 --password=cozeloop-clickhouse --database=cozeloop-clickhouse
```

### 🛠️ 常用命令

```bash
# 停止所有服务
docker compose down

# 重新构建并启动
docker compose up --build

# 清理所有数据（慎用）
docker compose down -v
docker volume rm $(docker volume ls -q)

# 热重载脚本
./dev_reload.sh
```

### �� 故障排除

1. **端口冲突**: 确保8082、8080、6379、3306等端口未被占用
2. **内存不足**: 确保Docker有足够内存（建议4GB+）
3. **模型配置错误**: 检查`model_config.yaml`中的API密钥配置
4. **容器启动失败**: 查看具体容器日志定位问题

### 📚 开发文档

- [系统架构](https://github.com/coze-dev/coze-loop/wiki/3.-Architecture)
- [模型配置](https://github.com/coze-dev/coze-loop/wiki/5.-Model-configuration)
- [故障排除](https://github.com/coze-dev/coze-loop/wiki/7.-Troubleshooting)

这个项目设计得相当完善，通过Docker Compose可以一键启动完整的开发环境，非常适合AI代理开发的学习和实践！
