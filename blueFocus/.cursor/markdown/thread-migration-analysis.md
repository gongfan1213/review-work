# Thread 功能迁移分析

## 概述

Thread 功能是 Nova 项目的核心组件之一，负责管理对话线程、消息历史和会话状态。当前使用 LangGraph SDK 进行数据存储，需要迁移到 Supabase。

## 当前架构分析

### LangGraph Thread 接口使用

**ThreadProvider.tsx 中的接口：**
1. `client.threads.create()` - 创建新 Thread
2. `client.threads.search()` - 搜索用户的 Threads
3. `client.threads.delete()` - 删除 Thread
4. `client.threads.get()` - 获取单个 Thread

**GraphContext.tsx 中的接口：**
1. `client.threads.updateState()` - 更新 Thread 状态（Artifact）

### Thread 数据结构

```typescript
interface Thread {
  thread_id: string
  created_at: string
  updated_at: string
  metadata: {
    supabase_user_id: string
    customModelName: ALL_MODEL_NAMES
    modelConfig: CustomModelConfig
    thread_title?: string  // 由 agents 自动生成
  }
  values: {
    artifact?: ArtifactV3
    messages?: BaseMessage[]
  }
}
```

### 业务功能需求

1. **Thread 生命周期管理**：
   - 创建 Thread（关联 Assistant 和 Model 配置）
   - 搜索用户的 Threads
   - 获取单个 Thread 及其数据
   - 删除 Thread 及关联数据
   - 更新 Thread 状态

2. **数据关联**：
   - Thread ↔ Assistant（多对一）
   - Thread ↔ Messages（一对多）
   - Thread ↔ Artifacts（一对多）

3. **元数据管理**：
   - 用户权限控制
   - Model 配置存储
   - Thread 标题生成
   - 创建/更新时间

## Supabase 数据库设计

### 核心表结构

**threads 表**（已创建）：
```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  assistant_id UUID REFERENCES assistants(id),
  title TEXT,
  model_name TEXT,
  model_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**相关表结构**：
- `messages` - 存储会话消息
- `artifacts` - 存储生成的代码/文档
- `artifact_contents` - 存储 artifact 版本内容

### 数据映射

**LangGraph → Supabase 字段映射：**
- `thread_id` → `id`
- `metadata.supabase_user_id` → `user_id`
- `metadata.customModelName` → `model_name`
- `metadata.modelConfig` → `model_config`
- `metadata.thread_title` → `title`
- `values.artifact` → `artifacts` 表
- `values.messages` → `messages` 表

## API 设计方案

### Thread API 路由

1. **`/api/thread`**
   - GET: 搜索用户的 Threads
   - POST: 创建新 Thread

2. **`/api/thread/[id]`**
   - GET: 获取单个 Thread
   - PUT: 更新 Thread
   - DELETE: 删除 Thread

3. **`/api/thread/[id]/state`**
   - PUT: 更新 Thread 状态（Artifact）

### 客户端适配器

创建 `supabase-thread-client.ts`，提供与 LangGraph SDK 兼容的接口：

```typescript
interface ThreadClient {
  create(args: CreateThreadArgs): Promise<Thread>
  search(args: SearchThreadsArgs): Promise<Thread[]>
  get(threadId: string): Promise<Thread>
  update(threadId: string, args: UpdateThreadArgs): Promise<Thread>
  delete(threadId: string): Promise<void>
  updateState(threadId: string, state: ThreadState): Promise<void>
}
```

## 迁移实施计划

### 阶段 1：数据层迁移 ✅
- ✅ 数据库表结构已创建
- ✅ RLS 策略已配置
- ✅ 索引优化已完成

### 阶段 2：API 层实现
- 🔲 创建 Thread API 路由
- 🔲 实现 CRUD 操作
- 🔲 处理数据格式转换
- 🔲 错误处理和验证

### 阶段 3：客户端适配器
- 🔲 创建 Thread 客户端
- 🔲 保持接口兼容性
- 🔲 处理数据映射

### 阶段 4：业务逻辑迁移
- 🔲 更新 ThreadProvider.tsx
- 🔲 更新 GraphContext.tsx
- 🔲 修复类型定义

### 阶段 5：测试验证
- 🔲 单元测试
- 🔲 集成测试
- 🔲 端到端测试

## 技术挑战

### 1. 复杂数据结构处理
**挑战**：LangGraph 的 `values` 字段包含复杂的嵌套数据
**解决方案**：
- 将 `messages` 拆分到独立表
- 将 `artifact` 拆分到独立表
- 使用 JOIN 查询重构数据

### 2. 状态更新机制
**挑战**：`updateState` 需要更新多个关联表
**解决方案**：
- 使用数据库事务保证一致性
- 实现增量更新逻辑
- 缓存优化频繁更新

### 3. 数据格式兼容性
**挑战**：保持与现有代码的接口兼容
**解决方案**：
- 适配器模式转换数据格式
- 保留原有 TypeScript 接口
- 渐进式迁移策略

## 优先级评估

### 高优先级功能
1. **基础 CRUD** - Thread 创建、查询、删除
2. **用户权限** - 确保数据隔离安全
3. **状态更新** - Artifact 和 Messages 同步

### 中优先级功能
1. **搜索优化** - Thread 列表性能
2. **元数据管理** - Model 配置存储
3. **错误处理** - 优雅的错误恢复

### 低优先级功能
1. **标题生成** - 自动 Thread 标题
2. **高级查询** - 复杂搜索条件
3. **性能优化** - 缓存和分页

## 风险评估

### 高风险项
- **数据一致性**：多表操作的事务性
- **性能影响**：复杂 JOIN 查询的性能
- **状态同步**：实时数据更新的准确性

### 缓解措施
- 使用数据库事务确保一致性
- 索引优化提升查询性能
- 实现乐观锁防止并发冲突
- 完整的测试覆盖关键路径

## 成功指标

- ✅ 所有 Thread 功能正常工作
- ✅ 用户体验无明显变化
- ✅ API 响应时间 < 300ms
- ✅ 零数据丢失
- ✅ 代码复杂度可控

## 下一步行动

1. **立即开始**：创建 Thread API 路由
2. **本周内**：完成客户端适配器
3. **下周内**：更新业务逻辑代码
4. **下下周**：完成测试和验证 