# Dify教程
## 一、Dify的介绍
[https://dify.ai/](https://dify.ai/)

Dify是一款创新的智能生活助手应用，旨在为您提供便捷、高效的服务。通过人工智能技术，Dify可以实现语音助手、智能家居控制、日程管理等功能，助您轻松应对生活琐事，享受智慧生活。简约的界面设计，让操作更加便捷；丰富的应用场景，满足您多样化的需求。Dify，让生活更简单！

## 二、Dify的安装方式
### 1. 在线体验
速度比较慢。不推荐

### 2. 本地部署
#### 2.1 Docker安装
安装Docker环境
```bash
bash <(curl -ssl https://cdn.jsdelivr.net/gh/SuperManito/LinuxMirrors@main/DockerInstallation.sh)
```

安装Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
```

![image](https://github.com/user-attachments/assets/c3dbd334-7e59-482c-8c19-e48077037214)

dify源代码目录下面执行

![image](https://github.com/user-attachments/assets/8f46b34f-fec0-4be5-aac1-f47a4feb2f86)

docker/docker-compose up -d

运行相关的组件

登录的界面


dify部署到本地的

# Ollama 大模型拉到本地当中

# Dify 安装部署教程

## 一、前期准备
安装 Dify 前，需确保机器满足以下最低系统要求：  
- CPU：≥ 2 核  
- 内存：≥ 4 GiB  


## 二、安装方式
### 1. 在线体验  
速度较慢，不推荐。  


### 2. 本地部署  
#### 2.1 Docker 安装  
**步骤 1：安装 Docker 环境**  
执行脚本快速安装：  
```bash  
bash <(curl -ssl https://cdn.jsdelivr.net/gh/SuperManito/LinuxMirrors@main/DockerInstallation.sh)  
```  

**步骤 2：安装 Docker Compose**  
通过 GitHub 下载最新版：  
```bash  
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose  
```  

**步骤 3：验证安装**  
检查 Docker Compose 版本，确认安装成功：  
```bash  
docker-compose --version  
```  
（示例输出：`Docker Compose version v2.33.1` 即表示成功）  


#### 2.2 加速 Docker 镜像拉取（可选）  
若拉取镜像缓慢，可配置 Docker 镜像加速器：  

1. 创建/修改 Docker 守护进程配置文件：  
```bash  
sudo tee /etc/docker/daemon.json <<EOF  
{  
    "registry-mirrors": [  
        "https://do.nark.eu.org",  
        "https://dc.j8.work",  
        "https://docker.m.daocloud.io",  
        "https://dockerproxy.com",  
        "https://docker.mirrors.ustc.edu.cn",  
        "https://docker.nju.edu.cn"  
    ]  
}  
EOF  
```  

2. 重启 Docker 服务使配置生效：  
```bash  
sudo systemctl daemon-reload  # 重新加载 systemd 配置  
sudo systemctl restart docker  # 重启 Docker 服务  
```  


#### 2.3 部署 Dify  
1. **获取代码**：从 GitHub 拉取 Dify 代码，解压后进入 `docker` 目录。  

2. **启动服务**：  
```bash  
docker-compose up -d  
```  


#### 2.4 Docker Desktop 安装（Windows 环境）  
1. **下载安装**：前往 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载对应 Windows 版本并安装。  

2. **部署 Dify**：  
   - 拉取 Dify 的 GitHub 代码，进入 `Docker` 目录。  
   - 启动服务：  
     ```bash  
     docker-compose up  
     ```  


## 三、访问与初始化  
服务启动后，浏览器访问 `http://localhost/install`，即可进入 Dify 仪表盘，开始初始化流程。  


## 四、问题求助  
若部署遇到问题，可参考：  
- **官方文档**：访问 [Dify 文档](https://dify.ai/docs) 或 FAQ。  
- **社区支持**：通过 [Dify 社区](https://dify.ai/community) 或 GitHub Issues 寻求帮助。  


## 五、核心功能  
Dify 支持在可视化画布中构建、测试强大的 AI 工作流，涵盖：  
- 工作流编排  
- 智能助手功能扩展  
- 多场景适配与部署  

（可结合官方演示视频 `optimized_workflow_intro.mp4` 了解更多细节 ）

![image](https://github.com/user-attachments/assets/808c7943-19e4-4c9f-ad00-948c3b50da63)

### 实体信息整理
- **工具名称**：Ollama  
- **官网**：https://ollama.com/  
- **简介**：本地运行大语言模型的工具，支持多模型（如 Llama 2、Mistral 等 ），可在 macOS、Linux、Windows 部署，能本地运行模型，保障数据安全隐私、降低延迟。  
- **安装指引**：访问 https://ollama.com/download ，选对应系统（macOS、Linux、Windows ）安装包，如 Windows 需 10 及以上版本 。 
- **关联内容**：可结合 Dify 本地部署，搭配部署如 deepseek - r1 - 1.5b 等小模型 ，涉及多模型支持、本地运行交互等特点 。


![image](https://github.com/user-attachments/assets/0c733fcd-74c9-42b8-9173-1fa40031d174)



ollama run deepseek-r1:1.5b

拉大模型到本地当中


![image](https://github.com/user-attachments/assets/00aec575-40c2-4bcd-9c36-c910e2268810)


![image](https://github.com/user-attachments/assets/e3f6321e-8498-479e-8da6-21086de4d666)




