### 背景：
后台需要调用 fabric 的 API，所以需要前端这边搭建 nodejs 服务，解决当前云端处理项目文件转打印文件的需求，之后 web 端的一些需求也可以部署到自己的 nodejs 服务中，并不需要对后台强关联，比如 cms 数据管理这些，2d，3d 在浏览器不能处理的图形渲染。

### 搭建环境

1. **初始化项目**
   在项目根目录中打开终端，运行 `npm init` 命令来初始化一个新的 Node.js 项目，生成 `package.json` 文件。

2. **安装 Express**
   运行 `npm install express --save` 来安装 Express 框架。 [Express 官网](https://www.expressjs.com.cn/)
   运行 `npm install body-parser --save` 安装 post 请求参数解析。

3. **创建服务器文件**
   在项目根目录中创建一个名为 `index.ts` 的文件。

4. **编写服务器代码**
   在 `index.ts` 文件中编写以下代码来创建一个基本的服务器：
   ```javascript
   const express = require('express');
   const bodyParser = require('body-parser');
   const app = express();
   const port = 3000;

   // 注册中间件
   app.use(bodyParser.json());

   app.get('/', (req, res) => {
     res.send('Hello World!');
   });

   app.post('/post', (req, res) => {
     res.send('post-Hello World!');
   });

   app.listen(port, () => {
     console.log(`Server listening at http://localhost:${port}`);
   });
   ```

5. **启动服务器**
   在终端中运行 `yarn start` 来启动服务器。

6. **测试服务器**
   打开浏览器并访问 [http://localhost:3000](http://localhost:3000)，你应该看到 "Hello World!" 的消息。

### Express 应用程序生成器

1. **使用应用生成器工具**
   也可以通过应用生成器工具 `express-generator` 可以快速创建一个应用的骨架。

2. **Koa**
   生成的应用程序具有以下目录结构：
   ```
   .
   ├── app.js
   ├── bin
   │   └── www
   ├── package.json
   ├── public
   │   ├── images
   │   ├── javascripts
   │   └── stylesheets
   │       └── style.css
   ├── routes
   │   ├── index.js
   │   └── users.js
   └── views
       ├── error.pug
       ├── index.pug
       └── layout.pug
   ```

### 部署

1. **阿里云部署**
   - [阿里云](https://www.aliyun.com/) 登录网站购买一个简单的服务器，一般都是 ECS 的。
  
### 终端连接登录服务器
- 终端连接登录服务器 `ssh root@***`（*代表服务器地址）-> 输入密码后 登录成功

```plaintext
Last login: Fri Jun 21 18:19:22 on ttys066
~ ssh root@***.***.***
root@***.***.***'s password:
Welcome to Alibaba Cloud Elastic Compute Service!

Updates Information Summary: available
37 Security notice(s)
9 Important Security notice(s)
21 Moderate Security notice(s)
7 Low Security notice(s)
Run "dnf upgrade-minimal --security" to apply all updates. More details please refer to:
https://help.aliyun.com/document_detail/416274.html
Last login: Fri Jun 21 17:41:27 2024
[root@iZ7xv5xvl2kcdz5aee9m22Z ~]#
```

### 查看文件目录
- `ls` 查看文件目录。`nvm` 选择 `node` 版本（建议 18 以上），克隆 `node` 服务代码到服务器中的文件夹

```plaintext
[root@iZ7xv5xvl2kcdz5aee9m22Z ~]# ls
[root@iZ7xv5xvl2kcdz5aee9m22Z ~]# cd /
[root@iZ7xv5xvl2kcdz5aee9m22Z /]# ls
bin  dev  home  lib64  media  opt  root  sbin  sys  usr
boot  etc  lib  lost+found  mnt  proc  run  srv  tmp  var
[root@iZ7xv5xvl2kcdz5aee9m22Z /]# cd home
[home]# git clone https://github.com/MRJHulk/node-koa-pm2.git
正克隆到 'node-koa-pm2'...
remote: Enumerating objects: 21, done.
remote: Counting objects: 100% (21/21), done.
remote: Compressing objects: 100% (12/12), done.
remote: Total 21 (delta 6), reused 19 (delta 4), pack-reused 0
接收对象中: 100% (21/21), 7.63 KiB | 1.50 MiB/s, done.
处理 delta 中: 100% (6/6), 完成.
[root@iZ7xv5xvl2kcdz5aee9m22Z home]#
```

### 安装 pm2
- 安装 pm2 [https://juejin.cn/post/6844903665107468296](https://juejin.cn/post/6844903665107468296)

```plaintext
1 npm install pm2
```

### 切换 node 文件夹并 install

```plaintext
[root@iZ7xv5xvl2kcdz5aee9m22Z home]# cd node-koa-pm2
[root@iZ7xv5xvl2kcdz5aee9m22Z node-koa-pm2]# npm install

added 47 packages, and audited 48 packages in 1s

4 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### pm2 start app.js 启动服务器 node

```plaintext
[root@iZ7xv5xvl2kcdz5aee9m22Z node-koa-pm2]# pm2 start app.js -n node-koa-pm2
[PM2] Applying action restartProcessId on app [node-koa-pm2](ids: [ 0, 1, 2, 3 ])
[PM2] [node-koa-pm2](0) ✓
[PM2] [node-koa-pm2](1) ✓
[PM2] [node-koa-pm2](2) ✓
[PM2] [node-koa-pm2](3) ✓
[PM2] Process successfully started
```

### 部署成功，可以根据服务器 IP 访问 node 服务

```plaintext
[root@iZ7xv5xvl2kcdz5aee9m22Z node-koa-pm2]# pm2 list
┌─────┬───────────────┬──────┬────────┬───┬──────┬───────────┐
│ id  │ name          │ mode │ status │ ↺ │ cpu  │ memory    │
├─────┼───────────────┼──────┼────────┼───┼──────┼───────────┤
│ 0   │ app           │ fork │ online │ 0 │ 0%   │ 75.9mb    │
│ 1   │ app           │ fork │ online │ 0 │ 0%   │ 85.1mb    │
│ 2   │ app           │ fork │ errored│ 0 │ 0%   │ 0b        │
│ 3   │ node-koa-pm2  │ cluster │ online │ 45 │ 0% │ 69.4mb │
│ 4   │ node-koa-pm2  │ cluster │ online │ 45 │ 0% │ 66.3mb │
│ 5   │ node-koa-pm2  │ cluster │ online │ 33 │ 0% │ 60.2mb │
│ 6   │ node-koa-pm2  │ cluster │ online │ 33 │ 0% │ 62.6mb │
└─────┴───────────────┴──────┴────────┴───┴──────┴───────────┘
[root@iZ7xv5xvl2kcdz5aee9m22Z node-koa-pm2]#
```

```plaintext
8.138.155.194:3000
Hello World
```

### docker 部署
- 在代码文件根目录中添加 docker 命令指令文件

#### build.sh 构建

```plaintext
1 docker build -t lumen-server . // lumen-server 镜像容器名
```

#### Dockerfile

```plaintext
# 使用官方 Node.js 镜像作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY . .

# 安装依赖
RUN npm install

# 复制应用代码
COPY . .

# 暴露应用端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### run.sh 启动

```plaintext
1 docker run -d \
2 --name lumen-server \
3 -p 20880:3000 \
4 lumen-server:latest
// 20880:3000 代表将 3000 端口映射到 20880 端口
```

#### stop.sh 停止

```plaintext
1 docker stop lumen-server
```

### 终端命令 - 本地搭建 docker 服务：
- `sudo su` -> 输入电脑开机密码
- `docker ps` 列出所有运行的容器信息
- `cd` 切换文件目录
- `./build.sh` 执行构建命令
### 如果存在需要修改代码，再继续启动
- `docker ps` 列出所有运行的容器信息
- `docker rm -f` 容器ID
- `cd` 切换文件目录
- `./build.sh` 执行构建命令
- `./run.sh` 执行启动命令

启动之后可以根据设定的端口本地访问

```plaintext
localhost:20880/api/data
{"message":"Hello World1111111"}
```

### 业务需求场景
- 项目文件转打印文件场景

```plaintext
前端调用后台转打印文件接口 -> 传入项目 id -> 后台调用 nodejs 服务接口 -> 得到项目 id，请求头 -> 下载项目文件 -> 填充完整项目数据 -> 生成流程 -> 得到 tar 包 -> 上传 tar 包 -> 返回结果
```

### 接口说明
- `/nodejs/api/getProjectTar`

| 参数        | 参数类型 | 参数说明 | 返回                          |
|-------------|----------|----------|-------------------------------|
| project_id  | string   | 项目 id  | { code: code, message: message }
