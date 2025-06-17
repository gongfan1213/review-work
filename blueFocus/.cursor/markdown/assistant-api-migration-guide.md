# Assistant API 迁移指南

## 概述

本文档描述了如何将 Nova 项目中的 Assistant 功能从 LangGraph 数据存储迁移到 Supabase。迁移包括创建新的 API 路由、适配器客户端以及更新现有的业务逻辑。

## 已完成的迁移工作

### 1. 数据库结构

- ✅ 创建了 `assistants` 表
- ✅ 创建了 `context_documents` 表
- ✅ 设置了适当的 RLS 策略
- ✅ 建立了表之间的关系

### 2. API 接口

#### 主 Assistant 接口 (`/api/assistant`)

- **GET** - 获取用户的所有 assistants
- **POST** - 创建新的 assistant

#### 单个 Assistant 接口 (`/api/assistant/[id]`)

- **GET** - 获取单个 assistant
- **PUT** - 更新 assistant
- **DELETE** - 删除 assistant

#### 搜索接口 (`/api/assistant/search`)

- **POST** - 搜索 assistants (兼容 LangGraph SDK)

#### Context Documents 接口 (`/api/assistant/[id]/documents`)

- **GET** - 获取 assistant 的文档
- **PUT** - 更新 assistant 的文档

### 3. 客户端适配器

创建了 `apps/web/src/lib/supabase-assistant-client.ts`，提供与 LangGraph SDK 兼容的接口：

```typescript
// 使用方式与原 LangGraph 客户端相同
import { createSupabaseClient } from '@/lib/supabase-assistant-client'

const client = createSupabaseClient()

// 创建 assistant
await client.assistants.create({
  graphId: 'agent',
  name: 'My Assistant',
  metadata: { user_id: userId, is_default: true },
  config: { configurable: { systemPrompt: 'You are...' } }
})

// 搜索 assistants
await client.assistants.search({
  metadata: { user_id: userId }
})

// 更新 assistant
await client.assistants.update(assistantId, {
  name: 'Updated Name',
  metadata: { description: 'New description' }
})

// 删除 assistant
await client.assistants.delete(assistantId)
```

### 4. 已更新的文件

#### `apps/web/src/hooks/useStore.tsx`

- ✅ 更新了 `putContextDocuments` 和 `getContextDocuments` 函数
- ✅ 现在使用新的 Supabase API 接口

## 下一步迁移计划

### 1. 更新 AssistantContext

需要修改 `apps/web/src/contexts/AssistantContext.tsx`：

```typescript
// 替换这一行
import { createClient } from "@/hooks/utils";

// 为
import { createSupabaseClient } from "@/lib/supabase-assistant-client";

// 然后在函数中替换
const client = createClient();
// 为
const client = createSupabaseClient();
```

### 2. 需要迁移的主要函数

#### `getAssistants` 函数

```typescript
// 当前 LangGraph 版本
const response = await client.assistants.search({
  metadata: { user_id: userId },
});

// 迁移后 (API 保持相同)
const response = await client.assistants.search({
  metadata: { user_id: userId },
});
```

#### `createCustomAssistant` 函数

```typescript
// 当前版本
const createdAssistant = await client.assistants.create({
  graphId: "agent",
  name,
  metadata: { user_id: userId, ...metadata },
  config: { configurable: { tools, systemPrompt, documents } },
  ifExists: "do_nothing",
});

// 迁移后 (API 保持相同)
const createdAssistant = await client.assistants.create({
  graphId: "agent", 
  name,
  metadata: { user_id: userId, ...metadata },
  config: { configurable: { tools, systemPrompt, documents } },
  ifExists: "do_nothing",
});
```

#### `editCustomAssistant` 函数

```typescript
// 当前版本
const response = await client.assistants.update(assistantId, {
  name,
  graphId: "agent",
  metadata: { user_id: userId, ...metadata },
  config: { configurable: { tools, systemPrompt, documents } },
});

// 迁移后 (API 保持相同)
const response = await client.assistants.update(assistantId, {
  name,
  graphId: "agent",
  metadata: { user_id: userId, ...metadata },
  config: { configurable: { tools, systemPrompt, documents } },
});
```

#### `deleteAssistant` 函数

```typescript
// 当前版本
await client.assistants.delete(assistantId);

// 迁移后 (API 保持相同)
await client.assistants.delete(assistantId);
```

### 3. 数据格式兼容性

新的 Supabase API 返回的数据格式与 LangGraph SDK 完全兼容：

```typescript
interface Assistant {
  assistant_id: string
  name: string
  metadata: {
    user_id: string
    description?: string
    is_default?: boolean
    iconData?: {
      iconName: string
      iconColor: string
    }
  }
  config: {
    configurable: {
      systemPrompt?: string
      tools?: AssistantTool[]
      documents?: any[]
    }
  }
  created_at: string
  updated_at: string
}
```

## 迁移步骤

### 第一阶段：替换客户端

1. 在 `AssistantContext.tsx` 中替换导入
2. 测试基本的 CRUD 操作
3. 验证数据格式兼容性

### 第二阶段：功能验证

1. 测试创建默认 assistant
2. 测试 assistant 列表显示
3. 测试编辑和删除功能
4. 测试 context documents 功能

### 第三阶段：清理

1. 移除对 LangGraph store API 的依赖
2. 清理不再使用的常量和类型
3. 更新相关的测试文件

## 性能和安全优势

### 性能优势

- 🚀 直接数据库查询，减少网络延迟
- 🔍 支持复杂的查询和索引优化
- 📊 实时数据同步支持

### 安全优势

- 🔒 Row Level Security (RLS) 确保数据隔离
- 🛡️ 服务端认证验证
- 🔐 细粒度权限控制

## 注意事项

1. **向后兼容性**：新的 API 完全兼容现有的业务逻辑
2. **错误处理**：保持与原有相同的错误处理机制
3. **性能**：新的实现提供更好的性能和扩展性
4. **维护性**：代码更简洁，维护成本更低

## 测试策略

1. **单元测试**：测试每个 API 端点
2. **集成测试**：测试完整的 assistant 生命周期
3. **UI 测试**：验证前端功能正常
4. **性能测试**：对比迁移前后的性能

## 回滚计划

如果遇到问题，可以通过以下步骤回滚：

1. 恢复 `AssistantContext.tsx` 中的导入
2. 恢复 `useStore.tsx` 中的函数实现
3. 重新启用 LangGraph API 调用

迁移是渐进式的，可以逐步替换各个组件，确保系统稳定性。
