# ConversationId 状态管理修复

## 问题描述
用户发现在 `streamRewriteArtifact` 函数中，无法获取到正确的 `conversationId`，导致 API 调用失败。

## 问题根因

### React 状态更新异步性
```typescript
// 在 streamFirstTimeGeneration 中
setConversationId(receivedConversationId);
finalConversationId = receivedConversationId;

// 在 streamRewriteArtifact 中  
body: JSON.stringify({
  query: userQuery,
  conversation_id: conversationId, // 这里拿到的可能是旧值！
})
```

### 问题分析
1. `setConversationId` 是异步的，不会立即更新 `conversationId` 状态
2. 在第一次对话完成后立即进行第二次对话时，`conversationId` 状态可能还没更新
3. 导致第二次 API 调用时传入了 `undefined` 或旧的 `conversationId`

## 修复方案

### 1. 函数参数传递方式
修改 `streamRewriteArtifact` 函数签名，支持传入 `conversationId`：

```typescript
// 修复前
const streamRewriteArtifact = async (params: GraphInput) => {
  if (!conversationId) { // 可能为空
    // 错误处理
  }
}

// 修复后  
const streamRewriteArtifact = async (params: GraphInput, providedConversationId?: string) => {
  const activeConversationId = providedConversationId || conversationId;
  
  if (!activeConversationId) {
    // 错误处理
  }
}
```

### 2. 调用时传递正确的值
在 `streamMessageV2` 中调用时传入当前的 `conversationId`：

```typescript
// 重写artifact的交互模式
await streamRewriteArtifact(params, conversationId);
```

### 3. 状态同步优化
在第一次对话完成后立即更新状态：

```typescript
// 立即更新 conversationId，确保后续调用能使用
if (generatedThreadData.conversationId) {
  setConversationId(generatedThreadData.conversationId);
}
```

## 验证方法

1. **检查 API 请求**：在浏览器开发者工具中查看网络请求，确保 `conversation_id` 不为空
2. **控制台日志**：观察 `conversationId` 的变化过程
3. **功能测试**：进行完整的对话流程测试

## 修复前后对比

### 修复前
- 第一次对话：✅ 正常（生成新的 conversationId）
- 第二次对话：❌ 失败（conversationId 为空或旧值）

### 修复后  
- 第一次对话：✅ 正常（生成新的 conversationId）
- 第二次对话：✅ 正常（使用正确的 conversationId）

## 相关文件

- `apps/web/src/contexts/GraphContext.tsx` - 主要修复文件
  - `streamRewriteArtifact` 函数签名修改
  - `streamMessageV2` 调用参数修改

## 适用场景

这个修复适用于所有依赖状态值进行后续 API 调用的场景，特别是：
- 多步骤异步操作
- 状态依赖的连续 API 调用
- React 状态异步更新的场景

## 最佳实践

1. **函数参数传递**：重要的状态值通过函数参数传递，而不是完全依赖组件状态
2. **状态备份**：在函数内部保存状态的备份值
3. **异步状态处理**：考虑状态更新的异步性，避免立即依赖刚刚设置的状态值 