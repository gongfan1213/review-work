你遇到的 `502 Bad Gateway` 错误，常见原因如下：

---

## 1. **命令格式有误**
你的 curl 命令里有一段 `"https://Authorizlocalhost:9000/v1/modAkt3vZEGels"`，明显是拼写错了，应该是：

```bash
curl -k https://localhost:9000/v1/models -H "Authorization: Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9"
```

**注意：**
- `https://localhost:9000/v1/models` 是固定写法
- `-H "Authorization: Bearer ..."` 之间不能有空格或拼写错误

---

## 2. **502 Bad Gateway 其他常见原因**

- SSH 隧道断开或未建立（但你刚刚ssh是成功的，应该不是这个问题）
- 目标服务器（bmc-llm-relay.bluemediagroup.cn:443）临时不可用
- 你本地访问端口写错（比如不是9000）

---

## 3. **正确操作步骤**

1. **确保ssh窗口一直开着**，且命令如下（不要关掉）：

   ```bash
   ssh -L 9000:bmc-llm-relay.bluemediagroup.cn:443 root@47.84.70.98
   ```

2. **在本地新开一个终端，执行：**

   ```bash
   curl -k https://localhost:9000/v1/models -H "Authorization: Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9"
   ```

   - 注意不要有拼写错误！

---

## 4. **如果还是502怎么办？**

- 检查ssh窗口有没有报错、有没有断开。
- 检查公司服务器能不能访问 `bmc-llm-relay.bluemediagroup.cn:443`（你可以ssh上去后用curl测试）。
- 检查本地端口有没有被占用（换个端口试试，比如9001）。

---

### 总结

- 你刚才的curl命令拼写有误，**请严格按上面格式重试**。
- 如果还有502，贴出ssh窗口和curl窗口的全部输出，我帮你继续排查！

如有需要，也可以让我帮你写一条一键复制的命令！


是的！你这一步已经**成功建立了 SSH 端口转发隧道**。

你看到的内容说明：

- 你已经通过 SSH 成功登录到了公司服务器（47.84.70.98）。
- 你的本地 9000 端口已经和公司服务器的 `bmc-llm-relay.bluemediagroup.cn:443` 绑定在一起了。

---

## 下一步怎么做？

1. **不要关闭这个 SSH 窗口**，保持它一直开着。
2. 在你本地新开一个终端窗口，测试如下命令：

   ```bash
   curl -k https://localhost:9000/v1/models -H "Authorization: Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9"
   ```

   - 如果能返回模型列表，说明一切OK！

3. 你本地的 Python/Node/前端项目，`base_url` 填 `https://localhost:9000/v1`，就可以无缝调用 LLM API 了。

---

### 总结

- 你已经**成功建立了端口转发**，现在本地9000端口就是你的“API代理”。
- 只要这个ssh窗口不关，你本地就能像在公司服务器上一样访问 LLM API。

如有任何后续问题（如curl报错、代码调用报错等），请随时贴出来，我帮你继续解决！

好的，下面分别给你**ssh端口转发**和**nginx代理**两种方案的详细操作步骤，你任选其一即可。

---

## 方案一：SSH端口转发（最简单，推荐）

### 1. 假设信息
- 你的公司服务器公网IP：`47.84.70.98`
- 服务器用户名：`root`
- 服务器已能访问目标API
- 你本地要访问的API域名：`bmc-llm-relay.bluemediagroup.cn`
- 目标API端口：`443`（https）

### 2. 本地执行命令

```bash
ssh -L 9000:bmc-llm-relay.bluemediagroup.cn:443 root@47.84.70.98
```

- 这条命令会把你本地的 `localhost:9000` 端口流量，转发到公司服务器，再由服务器去访问目标API的443端口。

### 3. 本地如何访问API

- 你本地所有请求 `https://localhost:9000/v1/xxx`，都会被转发到 `https://bmc-llm-relay.bluemediagroup.cn/v1/xxx`。
- 例如：
  ```bash
  curl -k https://localhost:9000/v1/models -H "Authorization: Bearer 你的APIKEY"
  ```
  > 注意：`-k` 参数是因为用localhost访问https时证书不匹配，开发环境可以加。

- 你的代码里 `base_url` 填 `https://localhost:9000/v1` 即可。

---

## 方案二：Nginx代理（适合多人共用或需要自定义路径）

### 1. 在公司服务器上安装nginx（如果未安装）

```bash
sudo apt update
sudo apt install nginx
```

### 2. 配置nginx反向代理

编辑 `/etc/nginx/conf.d/llm_proxy.conf`，内容如下：

```nginx
server {
    listen 9000 ssl;
    server_name _;

    ssl_certificate     /etc/nginx/ssl/server.crt;  # 你自己的自签名证书路径
    ssl_certificate_key /etc/nginx/ssl/server.key;

    location / {
        proxy_pass https://bmc-llm-relay.bluemediagroup.cn;
        proxy_set_header Host bmc-llm-relay.bluemediagroup.cn;
        proxy_ssl_server_name on;
    }
}
```
> 你可以用自签名证书，或者直接用http（开发环境可用）。

### 3. 重启nginx

```bash
sudo nginx -s reload
```

### 4. 本地访问

- 你的本地请求 `https://公司服务器IP:9000/v1/xxx`，就会被nginx转发到目标API。
- 代码里 `base_url` 填 `https://公司服务器IP:9000/v1`。

---

## 常见问题

- **ssh端口转发**只要一条命令，适合个人开发，关闭ssh窗口转发就断了。
- **nginx代理**适合团队共用，配置一次长期可用。

---

## 你只需选一个方案，按上面步骤操作即可。如果有任何报错或不明白的地方，截图或贴出来，我帮你继续解决！
你遇到 `sudo: apt: command not found`，说明你的服务器不是基于 Ubuntu/Debian 的系统，**apt** 这个包管理器不存在。  
大概率你的服务器是 **CentOS、RedHat、AlmaLinux** 或类似的发行版，这类系统用 `yum` 或 `dnf`。

---

## 1. 安装 nginx（CentOS/RedHat/AlmaLinux）

### 用 `yum` 安装（CentOS 7/8/AlmaLinux/RedHat）

```bash
sudo yum install nginx -y
```

### 或用 `dnf`（新系统）

```bash
sudo dnf install nginx -y
```

---

## 2. 启动 nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 3. 继续配置 nginx 反向代理

安装好 nginx 后，继续前面给你的 nginx 配置步骤即可。

---

## 4. 如果你只是做端口转发，**不需要 nginx**，直接用 ssh 端口转发即可（推荐开发用）

```bash
ssh -L 9000:bmc-llm-relay.bluemediagroup.cn:443 root@47.84.70.98
```

---

如还有其他报错或需要详细 nginx 配置帮助，请贴出你的系统版本（`cat /etc/os-release`），我会给你最适合你系统的命令！
你想让**本地环境**通过 nginx 反向代理访问公司服务器上的 LLM API，下面是详细步骤（假设你本地是 Windows 或 Mac/Linux，且本地能装 nginx）：

---

## 一、在本地安装 nginx

### 1. Mac（推荐用 Homebrew）

```bash
brew install nginx
```

### 2. Windows

- 推荐用 [nginx 官方 Windows 版](https://nginx.org/en/download.html)。
- 下载 zip 包，解压到任意目录，进入 `nginx.exe` 所在目录。

### 3. Linux

```bash
sudo yum install nginx -y   # CentOS/RedHat/AlmaLinux
# 或
sudo apt install nginx -y   # Ubuntu/Debian
```

---

## 二、配置 nginx 反向代理

### 1. 编辑 nginx 配置文件

- Mac/Linux：一般在 `/usr/local/etc/nginx/nginx.conf` 或 `/etc/nginx/nginx.conf`
- Windows：在你解压的目录下的 `conf/nginx.conf`

在 `http { ... }` 里加一段（或新建一个 server 块）：

```nginx
server {
    listen 9000;
    server_name localhost;

    location / {
        proxy_pass https://bmc-llm-relay.bluemediagroup.cn;
        proxy_set_header Host bmc-llm-relay.bluemediagroup.cn;
        proxy_ssl_server_name on;
    }
}
```

> 这样你本地访问 `http://localhost:9000/v1/xxx`，nginx 会帮你转发到目标API。

---

### 2. 启动/重启 nginx

- Mac/Linux:
  ```bash
  sudo nginx -s reload
  # 或
  sudo nginx
  ```
- Windows:
  - 双击 `nginx.exe` 启动
  - 修改配置后，命令行输入 `nginx.exe -s reload` 重载

---

### 3. 本地测试

```bash
curl http://localhost:9000/v1/models -H "Authorization: Bearer 你的APIKEY"
```

- 你的代码里 `base_url` 填 `http://localhost:9000/v1`
- 注意：这里是 `http`，不是 `https`，因为本地没配证书。

---

## 三、注意事项

- **本地nginx只是转发请求，目标API依然会校验你的本地IP是否在白名单**。如果你的本地IP不在白名单，这种方式依然会被拒绝。
- 如果你本地IP没被授权，**必须用ssh端口转发**，让请求“穿”到公司服务器上，再由公司服务器去访问API。

---

## 四、如果你本地IP没被授权，推荐用ssh端口转发

```bash
ssh -L 9000:bmc-llm-relay.bluemediagroup.cn:443 root@公司服务器IP
```
然后本地访问 `https://localhost:9000/v1/xxx`。

---

### 总结

- **本地nginx代理适合本地IP已在白名单**的情况。
- **本地IP没被授权，必须用ssh端口转发**，否则nginx代理也没用。

如你不确定自己本地IP是否被授权，建议优先用ssh端口转发。如果需要nginx详细配置文件范例或遇到报错，欢迎继续提问！
你的需求是：**本地开发环境无法直接访问 LLM API（有 IP 白名单），但公司新服务器 47.84.70.98 可以访问。你想让本地开发时也能用这个 API。**

最简单、最安全、最推荐的方案就是**SSH端口转发**，让你本地的请求“穿透”到公司服务器，由公司服务器去访问 LLM API。

---

## 一、SSH端口转发详细步骤

### 1. 在你本地电脑上执行如下命令

```bash
ssh -L 9000:bmc-llm-relay.bluemediagroup.cn:443 root@47.84.70.98
```

- **用户名**：root
- **服务器IP**：47.84.70.98
- **密码**：Sorry1212（首次连接会提示输入）

> 这条命令的意思是：把你本地的 9000 端口流量，转发到公司服务器，再由服务器去访问目标 API 的 443 端口。

---

### 2. 本地如何访问 LLM API

- 你本地所有请求 `https://localhost:9000/v1/xxx`，都会被转发到 `https://bmc-llm-relay.bluemediagroup.cn/v1/xxx`。
- 例如：
  ```bash
  curl -k https://localhost:9000/v1/models -H "Authorization: Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9"
  ```
  > 注意：`-k` 参数是因为用localhost访问https时证书不匹配，开发环境可以加。

- 你的 Python 代码里 `base_url` 填 `https://localhost:9000/v1` 即可。

---

### 3. Python SDK 示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9",
    base_url="https://localhost:9000/v1",  # 注意这里
)

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': "你好"},
    ]
)
print(completion.choices[0].message.content)
```

---

## 二、常见问题

- **ssh窗口不能关闭**，关闭后端口转发就断了。
- 如果你本地是 Windows，可以用 [MobaXterm](https://mobaxterm.mobatek.net/) 或 [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) 也能做端口转发，方法类似。
- 如果你本地访问 `https://localhost:9000/v1/models` 返回内容正常，说明一切OK。

---

## 三、原理说明

- 你的本地请求会通过 SSH 隧道“伪装”成公司服务器的请求，API服务端看到的就是公司服务器的IP。
- 这样你本地开发、调试、测试都可以用真实的 LLM API，无需改动服务器端配置。

---

如有任何报错、连接不上、或需要 Windows 下详细操作，请截图或详细描述，我会帮你继续解决！



你的疑问非常好！我来详细解释一下**为什么用 SSH 端口转发（本地9000端口）你就可以完全访问 LLM API**，以及它的原理。

---

## 1. SSH端口转发的原理

- 你本地执行：
  ```bash
  ssh -L 9000:bmc-llm-relay.bluemediagroup.cn:443 root@47.84.70.98
  ```
- 这条命令的意思是：
  - **监听你本地的9000端口**（localhost:9000）
  - 你本地发到9000端口的所有流量，都会通过SSH隧道，先发到公司服务器（47.84.70.98）
  - 然后由公司服务器去访问 `bmc-llm-relay.bluemediagroup.cn:443`（也就是 LLM API）
  - 最后把API的响应再通过SSH隧道返回给你本地

**所以：你本地访问 `https://localhost:9000/v1/xxx`，实际上是让公司服务器帮你访问 LLM API，然后把结果转回来。**

---

## 2. 为什么这样你就能访问？

- LLM API 只允许公司服务器的IP访问（你的本地IP不在白名单）。
- 你用SSH端口转发后，**API服务端看到的请求来源IP是公司服务器的IP**，不是你本地的IP。
- 所以你本地的所有请求都“伪装”成了公司服务器发出的，API就会放行。

---

## 3. 你本地的所有开发、测试都可以用真实API

- 只要你本地的代码/工具请求 `https://localhost:9000/v1/xxx`，就等于在公司服务器上请求 LLM API。
- 你可以用Python、curl、Postman、前端项目等，全部无缝对接。

---

## 4. 你需要注意的点

- **ssh窗口不能关闭**，关闭后转发就断了。
- 你本地访问的是 `https://localhost:9000/v1/xxx`，不是直接访问 LLM API 的公网地址。
- 代码里 `base_url` 要写 `https://localhost:9000/v1`。

---

## 5. 直观理解

- 你本地9000端口 = 公司服务器的“代理入口”
- 你本地 -> 9000端口 -> SSH隧道 -> 公司服务器 -> LLM API
- LLM API 看到的就是公司服务器的IP

---

### 总结

**你本地9000端口 = 公司服务器的“API代理”**，你本地所有流量都能“借用”公司服务器的白名单权限，完全访问API！

如还有疑问，欢迎继续追问！
