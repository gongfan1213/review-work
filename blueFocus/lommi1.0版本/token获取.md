Ran tool
Read file: blueproject/blueplan-research/utils/tools/search/auth_client.py
token 的获取流程如下：

---

## 1. 认证客户端 AuthClient

- `AuthClient` 是专门用于获取和管理 API 访问令牌（token）的类。
- 初始化时需要传入 `client_id`、`secret_key` 和 `base_url`。

---

## 2. 获取 token 的方法

### 2.1 get_token

- 方法：`get_token(self) -> str`
- 流程：
  1. 构造认证请求地址：`{base_url}/api/auth/token`
  2. 请求体为：`{"client_id": client_id, "secret_key": secret_key}`
  3. 发送 POST 请求到认证接口
  4. 检查返回状态码和返回内容
  5. 如果成功，从返回的 JSON 数据中提取 `token` 字段
  6. 保存到 `self.token` 并返回

### 2.2 get_headers

- 方法：`get_headers(self) -> Dict`
- 作用：自动检查当前是否有 token，没有则自动调用 `get_token()` 获取
- 返回：带有 `Authorization: Bearer <token>` 的请求头

### 2.3 refresh_token

- 方法：`refresh_token(self) -> str`
- 作用：强制刷新 token（先置空再重新获取）

---

## 3. 总结

- token 是通过向后端认证接口 `/api/auth/token` 发送 `client_id` 和 `secret_key` 获取的。
- 获取到的 token 会被缓存，后续所有 API 请求都自动带上 `Authorization` 头。
- 如果 token 失效或需要刷新，可以调用 `refresh_token()`。

---

**简言之：token 是通过 AuthClient 自动向后端认证接口申请获得的，整个过程对上层业务完全透明。**
