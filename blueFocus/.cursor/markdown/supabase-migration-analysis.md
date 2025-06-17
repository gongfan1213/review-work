# Nova项目 Supabase 数据迁移分析

## 概述

当前 Nova 项目使用 LangGraph SDK 进行数据存储，需要迁移到 Supabase 数据库。本文档分析了需要迁移的接口、数据结构设计和具体实施步骤。

## 当前架构分析

### 1. 使用 LangGraph 接口的模块

#### 1.1 核心接口文件

- `apps/web/src/hooks/utils.ts` - createClient() 创建 LangGraph 客户端
- `apps/web/src/contexts/GraphContext.tsx` - 使用 createClient 进行状态更新
- `apps/web/src/contexts/ThreadProvider.tsx` - Thread CRUD 操作
- `apps/web/src/contexts/AssistantContext.tsx` - Assistant CRUD 操作

#### 1.2 存储相关接口

- `apps/web/src/hooks/useStore.tsx` - 通用存储钩子
- `apps/web/src/app/api/store/` 目录下的路由：
  - `get/route.ts` - 获取存储项
  - `put/route.ts` - 存储项
  - `delete/route.ts` - 删除存储项
  - `delete/id/route.ts` - 按ID删除存储项

#### 1.3 代理接口

- `apps/web/src/app/api/[..._path]/route.ts` - LangGraph API 代理

## 数据维度分析

### 1. 用户体系

- 基于 Supabase Auth Schema
- 用户已有 `auth.users` 表

### 2. 数据层级结构

```
用户 (auth.users)
├── Projects (项目) - 新增概念
│   ├── Threads (对话线程)
│   │   ├── Messages (消息列表)
│   │   └── Artifacts (对话产物)
│   └── Assistants (助手)
│       ├── 配置信息 (system_prompt, icon等)
│       └── Context Documents (上下文文档)
└── 全局设置
    ├── Reflections (反思记录)
    ├── Quick Actions (快捷操作)
    └── Context Documents (全局上下文文档)
```

## Supabase 数据表设计

### 1. Projects 表

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### 2. Assistants 表

```sql
CREATE TABLE assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  icon_name TEXT DEFAULT 'User',
  icon_color TEXT DEFAULT '#000000',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  config JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_assistants_user_id ON assistants(user_id);
CREATE INDEX idx_assistants_project_id ON assistants(project_id);
CREATE INDEX idx_assistants_is_default ON assistants(is_default);
```

### 3. Threads 表

```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES assistants(id) ON DELETE SET NULL,
  title TEXT,
  model_name TEXT,
  model_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_project_id ON threads(project_id);
CREATE INDEX idx_threads_assistant_id ON threads(assistant_id);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
```

### 4. Messages 表

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('human', 'ai', 'system')),
  content TEXT NOT NULL,
  run_id TEXT,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  additional_kwargs JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sequence ON messages(thread_id, sequence_number);
CREATE INDEX idx_messages_run_id ON messages(run_id);
```

### 5. Artifacts 表

```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_artifacts_thread_id ON artifacts(thread_id);
CREATE INDEX idx_artifacts_user_id ON artifacts(user_id);
```

### 6. Artifact Contents 表

```sql
CREATE TABLE artifact_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'code')),
  title TEXT NOT NULL,
  language TEXT, -- 仅用于 code 类型
  code TEXT, -- 仅用于 code 类型
  full_markdown TEXT, -- 仅用于 text 类型
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(artifact_id, index)
);

-- 索引
CREATE INDEX idx_artifact_contents_artifact_id ON artifact_contents(artifact_id);
```

### 7. Context Documents 表

```sql
CREATE TABLE context_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_context_documents_user_id ON context_documents(user_id);
CREATE INDEX idx_context_documents_assistant_id ON context_documents(assistant_id);
```

### 8. Reflections 表

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  style_rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_assistant_id ON reflections(assistant_id);
```

### 9. Quick Actions 表

```sql
CREATE TABLE quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_quick_actions_user_id ON quick_actions(user_id);
```

## 需要迁移的接口清单

### 1. Thread 相关接口

- ✅ `createThread()` - 创建新线程
- ✅ `getThread(id)` - 获取单个线程
- ✅ `getUserThreads()` - 获取用户所有线程
- ✅ `deleteThread(id)` - 删除线程
- ✅ `updateState(threadId, values)` - 更新线程状态

### 2. Assistant 相关接口

- ✅ `assistants.create()` - 创建助手
- ✅ `assistants.search()` - 搜索助手
- ✅ `assistants.update()` - 更新助手
- ✅ `assistants.delete()` - 删除助手

### 3. Store 相关接口

- ✅ `store.putItem()` - 存储项目
- ✅ `store.getItem()` - 获取项目
- ✅ `store.deleteItem()` - 删除项目

### 4. 特殊数据类型

- ✅ Context Documents - 上下文文档
- ✅ Reflections - 反思记录
- ✅ Quick Actions - 快捷操作
- ✅ Artifacts - 对话产物

## 迁移实施步骤

### 阶段1：准备工作

1. ✅ 分析现有数据结构和接口
2. ✅ 设计 Supabase 表结构
3. 🔄 创建 Supabase 迁移文件
4. 🔄 设置 Row Level Security (RLS) 策略

### 阶段2：数据库建设

1. 🔄 创建所有必要的表
2. 🔄 设置外键约束和索引
3. 🔄 配置 RLS 安全策略
4. 🔄 创建必要的数据库函数

### 阶段3：接口迁移

1. 🔄 创建新的 Supabase 客户端工具函数
2. 🔄 迁移 Thread 相关接口
3. 🔄 迁移 Assistant 相关接口
4. 🔄 迁移 Store 相关接口

### 阶段4：数据迁移

1. 🔄 编写数据迁移脚本
2. 🔄 从 LangGraph 导出现有数据
3. 🔄 转换数据格式适配新表结构
4. 🔄 导入数据到 Supabase

### 阶段5：测试验证

1. 🔄 单元测试各个接口
2. 🔄 集成测试完整流程
3. 🔄 性能测试
4. 🔄 用户接受测试

### 阶段6：部署上线

1. 🔄 渐进式切换到新系统
2. 🔄 监控系统运行状态
3. 🔄 清理旧的 LangGraph 相关代码

## 注意事项

### 1. 数据一致性

- 确保迁移过程中数据不丢失
- 保持现有API接口的兼容性
- 实现平滑过渡，避免服务中断

### 2. 安全考虑

- 使用 RLS 确保用户只能访问自己的数据
- 正确配置表的权限策略
- 对敏感数据进行加密存储

### 3. 性能优化

- 合理设计数据库索引
- 考虑分页查询大量数据
- 实现适当的缓存策略

### 4. 兼容性

- 保持现有组件接口不变
- 渐进式迁移，支持回滚
- 充分测试边界情况

## TODO 清单

- [ ] 创建 Supabase 迁移文件
- [ ] 实现新的数据访问层
- [ ] 编写数据迁移脚本
- [ ] 更新相关组件和钩子
- [ ] 编写测试用例
- [ ] 性能测试和优化
- [ ] 文档更新

## 风险评估

### 高风险

- 数据迁移过程中的数据丢失
- 新系统性能不如预期
- 用户体验中断

### 中等风险

- 迁移时间超出预期
- 部分功能暂时不可用
- 需要额外的数据清理工作

### 低风险

- 代码重构工作量
- 新系统学习成本
- 文档更新工作
