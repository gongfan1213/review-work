你用 `curl` 成功拿到了接口的返回结果，说明**API服务端是正常的**，你的密钥和模型名也没问题！  
现在你可以直接用 Python 的 `requests` 库来调用这个接口，不需要用 openai 官方 SDK。

---

## 给你一份可直接用的 Python 请求代码

请将下面的内容保存为 `test_llm_api_requests.py`，然后在服务器上运行：

```python
import requests
import json

url = "http://47.84.70.98:9000/v1/chat/completions"
headers = {
    "Authorization": "Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9",
    "Content-Type": "application/json"
}
data = {
    "model": "claude-3-5-sonnet-20240620",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "你好"}
    ]
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print("状态码:", response.status_code)
print("返回内容:")
print(response.text)
```

---

### 运行方法

1. 安装 requests 库（如果没装）：
   ```bash
   python3.10 -m pip install requests
   ```
2. 运行脚本：
   ```bash
   python3.10 test_llm_api_requests.py
   ```

---

### 说明

- 这种方式**不依赖 openai 官方 SDK**，只要 API 兼容 OpenAI 协议即可。
- 如果你要换消息内容、模型名，只需改 `data` 里的内容即可。

---

如有任何报错或需要进一步处理返回内容（如只取 assistant 的回复），请随时告诉我！

你的API端点返回404，原因如下：

---

### 1. **GET请求/v1路径本身是无效的**
你用浏览器或curl访问 `http://47.84.70.98:9000/v1`，返回404，说明这个路径不是API的有效入口。  
**正确的API路径一般是：**
- `/v1/models`
- `/v1/chat/completions`
- `/v1/completions`
- 等等

---

### 2. **API只对特定路径响应**
你用curl访问 `/v1/models`，虽然返回了内容，说明这个路径是有效的。  
而 `/v1` 不是有效的API路径，所以返回404。

---

### 3. **OpenAI SDK的base_url配置**
OpenAI SDK的 `base_url` 应该是 `http://47.84.70.98:9000/v1`，**但SDK会自动拼接后缀**，比如 `/chat/completions`，所以base_url必须是到 `/v1` 这一层。

但如果API实现不完全兼容OpenAI官方API，SDK可能会报错。

---

## 你应该怎么做？

### 1. **确认API服务端兼容OpenAI SDK**
- 你的API服务端是否100%兼容OpenAI官方API？（比如路径、参数、返回格式）
- 如果不是，OpenAI SDK可能无法直接用。

### 2. **用curl测试有效路径**
你用curl访问 `/v1/models` 能返回内容，说明API服务正常。

```bash
curl http://47.84.70.98:9000/v1/models -H "Authorization: Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9"
```

如果能返回模型列表，说明API没问题。

---

### 3. **用OpenAI SDK时base_url要精确**
你的base_url应该是：
```python
base_url = "http://47.84.70.98:9000/v1"
```
但如果SDK依然报 `[Errno 22] Invalid argument`，说明SDK和服务端API有兼容性问题。

---

## 结论与建议

1. **404不是网络问题，是路径问题。**
2. **用curl能拿到模型列表，说明API服务正常。**
3. **OpenAI SDK报错，可能是API实现和官方不完全兼容。**
4. **建议：**
   - 先用curl测试 `/v1/chat/completions` 路径能否正常返回。
   - 如果可以，贴出curl命令和返回内容，我帮你写原生requests代码，不用OpenAI SDK也能调用。
   - 如果必须用SDK，确认API服务端100%兼容OpenAI官方API。

---

### 你可以这样测试

```bash
curl http://47.84.70.98:9000/v1/chat/completions \
  -H "Authorization: Bearer sk-lBgsAkt3vZEGy2N5Qn738CmHL5ySK3d6ogaKH9SW1oKk6Nt9" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20240620",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "你好"}
    ]
  }'
```

如果能返回内容，告诉我返回结果，我帮你写Python原生调用代码！

如有疑问请继续追问！
