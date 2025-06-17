# Conversation ID 条件判断修复

## 问题描述

在 `apps/web/src/contexts/GraphContext.tsx` 的第984行，有一个错误的条件判断：

```typescript
// 错误的代码
if (
  !params.highlightedText &&
  artifact &&
  params.messages &&
  params.messages.length > 0 &&
  Metadata.conversation_id  // ❌ 这个变量未定义
) {
```

## 问题原因

- `Metadata.conversation_id` 是一个未定义的变量
- 这导致了 TypeScript 编译错误和运行时错误
- 该条件的意图是判断当前 Thread 是否有 `conversation_id`（表示已有对话）

## 修复方案

### 修复后的代码：

```typescript
// 修复后的代码
// 检查当前 Thread 是否有 conversation_id（表示已有对话）
let hasConversationId = false;
if (currentThreadId) {
  try {
    const currentThread = await threadData.getThread(currentThreadId);
    hasConversationId = !!(currentThread?.metadata?.conversation_id);
  } catch (error) {
    console.warn('Failed to get current thread metadata:', error);
  }
}

if (
  !params.highlightedText &&
  artifact &&
  params.messages &&
  params.messages.length > 0 &&
  hasConversationId  // ✅ 正确的条件判断
) {
```

### 修复逻辑：

1. **异步获取 Thread 信息**：使用 `threadData.getThread(currentThreadId)` 获取当前 Thread 的完整信息
2. **安全的条件检查**：通过 `currentThread?.metadata?.conversation_id` 安全地检查是否有 `conversation_id`
3. **错误处理**：添加 try-catch 块处理获取 Thread 信息时的潜在错误
4. **双重否定判断**：使用 `!!` 确保返回布尔值

## 业务逻辑说明

这个条件判断的目的是区分两种对话场景：

### 场景一：新对话（第一次生成 artifact）
- 条件：`!artifact && params.messages && params.messages.length > 0`
- 行为：调用 `streamFirstTimeGeneration()` 生成新的 artifact

### 场景二：已有对话（重写 artifact）
- 条件：`artifact && hasConversationId && params.messages && params.messages.length > 0`
- 行为：调用 `streamRewriteArtifact()` 重写现有的 artifact

### 场景三：高亮文本编辑
- 条件：`params.highlightedText`
- 行为：调用 `streamRewriteHighlightedText()` 编辑高亮部分

## 验证方法

1. **新对话测试**：
   - 创建新 Thread
   - 发送消息生成 artifact
   - 验证调用了 `streamFirstTimeGeneration()`

2. **重写测试**：
   - 在已有 `conversation_id` 的 Thread 中
   - 发送新消息重写 artifact
   - 验证调用了 `streamRewriteArtifact()`

3. **错误处理测试**：
   - 模拟 `getThread()` 失败的情况
   - 验证错误被正确捕获和处理

## 注意事项

- 这个修复引入了异步操作，可能稍微影响性能
- 但这是必要的，因为需要从数据库获取最新的 Thread metadata
- 错误处理确保了在网络问题或数据库问题时不会中断整个流程 