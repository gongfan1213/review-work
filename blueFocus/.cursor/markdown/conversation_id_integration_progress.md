# Nova 项目 Thread 功能迁移和 conversation_id 集成完整总结

## 项目背景
Nova 项目正在进行从 LangGraph 到 Supabase 的迁移，Assistant 功能已完成，现在需要完成 Thread 功能迁移并添加 conversation_id 支持。

## 主要问题和解决过程

### 1. 初始问题：conversation_id 字段缺失
用户遇到 `/api/thread?limit=10` 报错 `column threads.conversation_id does not exist`，需要在 Thread 表中添加此字段。

### 2. 数据库迁移
**执行的操作：**
- 成功执行 SQL：`ALTER TABLE public.threads ADD COLUMN conversation_id TEXT;`
- 创建索引：`CREATE INDEX IF NOT EXISTS idx_threads_conversation_id ON public.threads(conversation_id);`
- 验证字段添加成功

### 3. TypeScript 类型更新
更新了 `apps/web/src/types/database.types.ts`，在 threads 表的 Row、Insert、Update 类型中添加：
```typescript
conversation_id: string | null
```

### 4. API 层面更新
**Thread 查询 API (`/api/thread`)**：
- GET 请求中添加 `conversation_id` 字段查询
- POST 创建时支持返回 `conversation_id`
- 在 LangGraph 兼容格式的 metadata 中包含 `conversation_id`

**单个 Thread API (`/api/thread/[id]`)**：
- GET 请求查询时包含 `conversation_id` 字段
- PUT 更新时支持更新 `conversation_id` 字段
- 所有响应格式中都包含 `conversation_id`

### 5. 应用层集成需求
用户需要 `streamRewriteHighlightedText` 和 `streamRewriteArtifact` 两个函数也像 `streamFirstTimeGeneration` 一样：
- 返回 `ThreadData` 对象（包含 messages、artifact、conversationId）
- 支持数据存储到 Supabase
- 在对话结束后调用 `saveThreadAfterConversation` 保存状态

### 6. ThreadData 接口定义
```typescript
interface ThreadData {
  messages: BaseMessage[];
  artifact?: ArtifactV3;
  conversationId?: string;
}
```

### 7. 函数修改过程
**streamFirstTimeGeneration**：已完善，正确返回 ThreadData

**streamRewriteArtifact**：
- 修改函数签名：不再返回 ThreadData，改为 void
- 移除数据收集变量
- 在 GraphContext.tsx 中的 saveThreadAfterConversation 函数中添加 conversation_id 保存逻辑

**streamRewriteHighlightedText**：
- 修改函数签名：不再返回 ThreadData，改为 void  
- 移除数据收集变量

### 8. 数据流更新 - 关键问题修复

**问题：** 在 `streamMessageV2` 中，调用流处理函数后立即使用 `messages` 和 `artifact` 状态，但这些状态还没有更新到最新值，因为 React 状态更新是异步的。

**解决方案：** 使用 React 状态更新的回调函数来获取最新状态：

```typescript
// 修改前（问题代码）
await streamRewriteArtifact(params, conversationId);
await saveThreadAfterConversation(currentThreadId, params, {
  messages: messages as BaseMessage[], // 这是旧状态
  artifact: artifact as ArtifactV3,   // 这是旧状态
});

// 修改后（正确代码）
await streamRewriteArtifact(params, conversationId);
// 使用状态获取函数来获取最新状态
setMessages(currentMessages => {
  setArtifact(currentArtifact => {
    // 在这里，我们有最新的状态，可以保存
    saveThreadAfterConversation(currentThreadId, params, {
      messages: currentMessages as BaseMessage[], // 这是最新状态
      artifact: currentArtifact as ArtifactV3,   // 这是最新状态
      conversationId: conversationId,
    });
    return currentArtifact;
  });
  return currentMessages;
});
```

这个修复应用到了三个场景：
1. artifact 重写模式
2. 划线编辑模式
3. 自动划线编辑模式

### 9. saveThreadAfterConversation 增强
添加了 conversation_id 的保存逻辑：
```typescript
if (conversationIdToSave) {
  await client.threads.update(threadId, {
    metadata: { conversation_id: conversationIdToSave }
  });
}
```

### 10. 测试页面更新
在 `/test-thread` 页面中添加了 conversation_id 的显示，用户可以在 Thread 列表和详情中看到 conversation_id 信息。

### 11. 新线程处理逻辑优化
在 `streamMessageV2` 中添加了 `isNewThread` 标志：
- 只有在新线程时才调用 `saveThreadAfterConversation`
- 避免在已有线程上重复保存

### 12. 错误处理和调试
移除了调试代码（如 `debugger` 语句），完善了错误处理机制。

## 技术实现要点
- **数据库层**：threads 表新增 conversation_id 字段和索引
- **API 层**：完整支持 conversation_id 的 CRUD 操作
- **类型系统**：TypeScript 类型完全更新
- **状态管理**：使用 React 状态回调函数获取最新状态
- **错误处理**：完善的错误处理和用户反馈

### 13. Artifact 版本控制修复 (重要!)
发现并修复了 PUT `/api/thread/[id]/state` 中的严重问题：

**问题：**
- 直接删除所有现有 artifact_contents 然后插入新的，导致历史版本丢失
- currentIndex 没有正确递增
- 不支持版本追加，而是完全替换

**修复：**
- 查询时同时获取现有的 artifact_contents
- 新 contents 从 `maxExistingIndex + 1` 开始递增编号
- 保留历史版本，只追加新版本
- 正确更新 `current_index` 指向最新版本

**核心逻辑：**
```typescript
// 计算现有 contents 的最大 index
const maxExistingIndex = existingContents.length > 0 
  ? Math.max(...existingContents.map(c => c.index)) 
  : 0

// 新 contents 从下一个 index 开始
let nextIndex = maxExistingIndex + 1
const contentsToInsert = artifact.contents.map(content => ({
  artifact_id: artifactId,
  index: nextIndex++, // 递增编号
  // ... 其他字段
}))

// 更新 current_index 为最新版本
newCurrentIndex = nextIndex - 1
```

## 当前状态
- ✅ 数据库迁移：完成
- ✅ API 更新：完成  
- ✅ 函数签名更新：完成
- ✅ 最新状态获取问题：已修复
- ✅ 新线程逻辑：已优化
- ✅ Artifact 版本控制：已修复
- ✅ 测试验证：测试页面已更新

## 待测试功能
1. artifact 重写功能是否正确保存最新的 messages 和 artifact
2. 划线编辑功能是否正确保存最新的 messages 和 artifact  
3. conversation_id 是否正确保存到数据库
4. 新线程和已有线程的处理逻辑是否正确
5. **Artifact 版本控制是否正确工作（历史版本保留、index 递增）**

核心修复已完成。现在系统应该能够：
- 获取最新的 messages 和 artifact 状态
- 正确追加 artifact 版本而不丢失历史
- 正确管理 conversation_id 