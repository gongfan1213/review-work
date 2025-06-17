# 添加 conversation_id 字段到 threads 表

## 数据库迁移 SQL

请在 Supabase 数据库中执行以下 SQL 命令：

```sql
-- 为 threads 表添加 conversation_id 字段
ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- 为 conversation_id 字段创建索引（可选，但有助于查询性能）
CREATE INDEX IF NOT EXISTS idx_threads_conversation_id ON public.threads(conversation_id);
```

## 修改内容总结

### 1. 数据库表结构
- 在 `threads` 表中添加了 `conversation_id` 字段（TEXT 类型）
- 创建了索引以提升查询性能

### 2. TypeScript 类型定义更新
- 更新了 `apps/web/src/types/database.types.ts` 
- 在 `threads` 表的 `Row`、`Insert`、`Update` 类型中添加了 `conversation_id: string | null`

### 3. API 层面更新

#### Thread 查询 API (`/api/thread`)
- GET 请求中添加了 `conversation_id` 字段的查询
- POST 创建时支持在响应中返回 `conversation_id`
- 在 LangGraph 兼容格式的 `metadata` 中包含 `conversation_id`

#### 单个 Thread API (`/api/thread/[id]`)
- GET 请求查询时包含 `conversation_id` 字段
- PUT 更新时支持更新 `conversation_id` 字段
- 响应格式中包含 `conversation_id`

### 4. 应用层面集成

#### 状态管理 (`GraphContext.tsx`)
- 在 `saveThreadAfterConversation` 函数中添加了 `conversation_id` 的保存逻辑
- 当 `generatedData.conversationId` 存在时，会自动更新到数据库
- 添加了详细的日志记录便于调试

## 使用流程

1. **首次对话**：
   - 用户发起对话
   - `streamFirstTimeGeneration` 生成内容并获取 `conversation_id`
   - `saveThreadAfterConversation` 将 `conversation_id` 保存到数据库

2. **后续对话**：
   - 从数据库加载 Thread 时，`conversation_id` 会在 `metadata.conversation_id` 中返回
   - `streamRewriteArtifact` 等函数可以使用已保存的 `conversation_id` 继续对话

3. **数据查询**：
   - 通过 Thread API 查询时，`conversation_id` 会在响应的 `metadata` 中返回
   - 前端可以从 `thread.metadata.conversation_id` 获取这个值

## 验证方法

1. **执行迁移后验证**：
   ```sql
   -- 检查字段是否添加成功
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'threads' AND column_name = 'conversation_id';
   
   -- 检查索引是否创建成功
   SELECT indexname FROM pg_indexes WHERE tablename = 'threads' AND indexname = 'idx_threads_conversation_id';
   ```

2. **功能测试**：
   - 创建新的对话
   - 查看数据库中 `threads` 表的 `conversation_id` 字段是否被正确填充
   - 通过 API 查询 Thread，确认 `metadata.conversation_id` 有值

## 注意事项

- 现有的 Thread 记录的 `conversation_id` 字段将为 `NULL`
- 只有新创建的对话才会有 `conversation_id` 值
- 如果需要为现有对话补充 `conversation_id`，需要重新进行对话或手动设置 