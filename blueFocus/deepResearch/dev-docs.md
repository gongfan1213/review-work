# 技术开发文档

## 1. 项目结构总览

```
node-DeepResearch/
├── src/                # 核心源代码目录
│   ├── app.ts          # 应用主入口
│   ├── server.ts       # 服务启动与配置
│   ├── agent.ts        # 智能体相关逻辑
│   ├── cli.ts          # 命令行工具主入口
│   ├── cli/            # 命令行子模块
│   ├── tools/          # 工具模块（搜索、评估、分段等）
│   ├── utils/          # 通用工具函数
│   ├── evals/          # 评测脚本与数据
│   └── __tests__/      # 测试用例
├── jina-ai/            # 子模块，独立配置与服务
├── package.json        # 依赖管理
├── tsconfig.json       # TypeScript 配置
├── config.json         # 全局参数配置
├── Dockerfile          # Docker 支持
├── docker-compose.yml  # Docker Compose 支持
└── README.md           # 项目说明
```

## 2. 主要模块说明

- **src/app.ts**：应用主入口，负责初始化和主流程控制。
- **src/server.ts**：服务启动与配置，负责 HTTP 服务等。
- **src/agent.ts**：智能体相关核心逻辑。
- **src/cli.ts**、**src/cli/ngram.ts**：命令行工具及子命令实现。
- **src/tools/**：包含如搜索、评估、分段、去重、重排序等功能模块。
- **src/utils/**：通用工具函数，如日期、文本、图片等处理。
- **src/evals/**：评测脚本与数据集。
- **jina-ai/**：子模块，包含独立的配置、服务实现及依赖。

## 3. 功能分层

- **入口层**：如 app.ts、cli.ts，负责接收请求或命令。
- **服务层**：如 server.ts，负责服务配置与生命周期管理。
- **工具层**：如 tools/ 下各模块，提供具体功能实现。
- **工具函数层**：如 utils/，为各模块提供通用支持。

## 4. 依赖与配置

- 依赖通过 `package.json` 管理，TypeScript 配置见 `tsconfig.json`。
- 子模块如 `jina-ai/` 也有独立依赖和配置。

## 5. 启动与运行

- 通过 `npm start` 或 `node src/app.ts` 启动主应用。
- 服务可通过 `node src/server.ts` 启动。
- 命令行工具通过 `node src/cli.ts` 或指定子命令运行。

## 6. 测试方法

- 测试文件位于 `src/__tests__/` 及 `src/tools/__tests__/`。
- 使用 `npm test` 或 `jest` 运行测试。

## 7. 其他说明

- 配置文件如 `config.json` 用于全局参数管理。
- Docker 支持见 `Dockerfile` 和 `docker-compose.yml`。 