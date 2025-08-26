根据代码分析，PMHub 项目中 Nacos 的使用方式如下：<cite/>

## Nacos 配置方式

### 1. Docker 部署配置

PMHub 通过 Docker Compose 部署 Nacos 服务： [1](#2-0) 

Nacos 服务运行在 8848 端口，采用单机模式（standalone），并依赖 MySQL 数据库存储配置信息。<cite/>

### 2. Nacos 服务器配置

Nacos 的核心配置文件定义了数据库连接、安全认证等关键参数： [2](#2-1) 

启用了鉴权功能和安全配置： [3](#2-2) 

## 微服务集成 Nacos

### 1. 服务注册与发现配置

每个微服务都通过 `bootstrap.yml` 配置连接 Nacos，以网关服务为例： [4](#2-3) 

### 2. 其他服务的配置模式

所有微服务都遵循相同的配置模式：
- **认证服务**： [5](#2-4) 
- **系统服务**： [6](#2-5) 
- **项目服务**： [7](#2-6) 

## Nacos 配置中心使用

### 1. 共享配置管理

PMHub 在 Nacos 中存储了各个服务的配置文件，包括：
- `application-dev.yml`：通用配置
- `pmhub-gateway-dev.yml`：网关配置
- `pmhub-system-dev.yml`：系统服务配置
- `pmhub-project-dev.yml`：项目服务配置 [8](#2-7) 

### 2. 动态配置刷新

通过 `shared-configs` 配置实现配置的动态加载和刷新： [9](#2-8) 

## Maven 依赖配置

各个服务都引入了 Nacos 相关依赖：
- **服务发现**： [10](#2-9) 
- **配置管理**： [11](#2-10) 

## Docker 环境变量配置

在 Docker 部署时，通过环境变量覆盖配置： [12](#2-11) 

## Notes

PMHub 使用 Nacos 实现了完整的微服务治理，包括服务注册发现、配置管理和动态配置刷新。所有服务都统一连接到 Nacos 8848 端口，通过统一的配置模式实现服务间的协调和管理。Nacos 的配置中心功能使得系统可以在不重启服务的情况下动态更新配置，大大提高了系统的运维效率。

Wiki pages you might want to explore:
- [System Architecture (laigeoffer/pmhub)](/wiki/laigeoffer/pmhub#2)
- [Core Modules (laigeoffer/pmhub)](/wiki/laigeoffer/pmhub#3)

我来通俗易懂地为您详细讲解 PMHub 项目中 Nacos 的配置和使用方式。<cite/>

## 什么是 Nacos？

Nacos 是阿里巴巴开源的一个服务发现和配置管理平台，简单理解就是：
- **服务注册中心**：各个微服务启动时会向 Nacos 报告自己的地址，其他服务可以通过 Nacos 找到它们
- **配置中心**：统一管理所有服务的配置文件，修改配置后可以动态生效，不需要重启服务

## PMHub 中 Nacos 的部署

### 1. Docker 部署方式

PMHub 使用 Docker Compose 来部署 Nacos： [1](#3-0) 

这里的关键配置：
- `MODE=standalone`：单机模式运行
- 端口 `8848`：Nacos 的默认端口
- 依赖 MySQL 数据库存储配置信息

### 2. Nacos 服务器配置

Nacos 的核心配置文件定义了数据库连接和安全设置： [2](#3-1) 

重要的安全配置： [3](#3-2) 

## 微服务如何连接 Nacos

### 1. 基础配置模式

每个微服务都有一个 `bootstrap.yml` 文件来配置 Nacos 连接，以网关服务为例： [4](#3-3) 

这个配置的含义：
- `discovery.server-addr`：告诉服务 Nacos 在哪里（用于服务注册）
- `config.server-addr`：告诉服务去哪里获取配置文件
- `username/password`：连接 Nacos 的认证信息
- `shared-configs`：引用共享的配置文件

### 2. 其他服务的配置

所有微服务都遵循相同的配置模式：

**认证服务**： [5](#3-4) 

**系统服务**： [6](#3-5) 

**项目服务**： [7](#3-6) 

## Nacos 配置中心的使用

### 1. 配置文件管理

PMHub 在 Nacos 中存储了各种配置文件，从数据库可以看到： [8](#3-7) 

主要配置文件包括：
- `application-dev.yml`：所有服务共享的通用配置
- `pmhub-gateway-dev.yml`：网关服务专用配置
- `pmhub-system-dev.yml`：系统服务专用配置
- `pmhub-project-dev.yml`：项目服务专用配置

### 2. 配置的动态加载

通过 `shared-configs` 配置，服务启动时会自动加载共享配置：
```yaml
shared-configs:
  - application-${spring.profiles.active}.${spring.cloud.nacos.config.file-extension}
```

这意味着当 `spring.profiles.active=dev` 时，会自动加载 `application-dev.yml` 配置。

## Maven 依赖配置

要使用 Nacos，需要在 `pom.xml` 中添加依赖：

**服务发现依赖**： [9](#3-8) 

**配置管理依赖**： [10](#3-9) 

## Docker 环境变量覆盖

在 Docker 部署时，可以通过环境变量覆盖配置： [11](#3-10) 

这样做的好处是不需要修改代码，只需要修改 Docker 配置就能适应不同环境。

## 实际工作流程

1. **启动 Nacos**：Docker 启动 Nacos 服务器
2. **服务注册**：各个微服务启动时向 Nacos 注册自己的地址
3. **配置获取**：服务从 Nacos 获取配置文件
4. **服务发现**：服务间调用时通过 Nacos 找到目标服务地址
5. **配置更新**：在 Nacos 控制台修改配置，服务自动感知并更新

## Notes

Nacos 在 PMHub 中扮演着微服务架构的"大脑"角色，负责服务间的协调和配置管理。通过统一的配置模式，所有服务都能方便地接入 Nacos，实现服务的自动发现和配置的动态管理。这种设计大大简化了微服务的运维复杂度，是现代微服务架构的标准做法。

Wiki pages you might want to explore:
- [System Architecture (laigeoffer/pmhub)](/wiki/laigeoffer/pmhub#2)
- [Core Modules (laigeoffer/pmhub)](/wiki/laigeoffer/pmhub#3)

