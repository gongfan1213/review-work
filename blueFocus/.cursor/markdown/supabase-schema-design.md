# Supabase Schema 设计决策

## Schema 选择分析

### 🏗️ **Supabase 默认 Schema 结构**

Supabase 提供以下预定义 Schema：

1. **`auth` Schema** - 用户认证相关
   - `auth.users` - 用户表
   - `auth.sessions` - 会话表
   - `auth.refresh_tokens` - 刷新令牌
   - 等等...

2. **`public` Schema** - 应用数据
   - 默认的应用数据存储位置
   - 大多数应用表都创建在这里

3. **`storage` Schema** - 文件存储
   - `storage.buckets` - 存储桶
   - `storage.objects` - 文件对象

## 🎯 **推荐方案：使用 `public` Schema**

### ✅ **为什么选择 `public` Schema？**

1. **标准实践**
   - Supabase 官方推荐应用数据存储在 `public` Schema
   - 绝大多数 Supabase 项目都使用这种方式
   - 文档和示例都基于 `public` Schema

2. **权限管理简单**
   - `public` Schema 已经预配置了基本权限
   - RLS (Row Level Security) 策略直接应用
   - 无需额外的 Schema 级别权限配置

3. **工具支持**
   - Supabase Dashboard 默认显示 `public` Schema
   - 自动生成的 TypeScript 类型基于 `public` Schema
   - CLI 工具和迁移脚本默认操作 `public` Schema

4. **与 `auth` Schema 集成**
   - 外键引用 `auth.users(id)` 非常直接
   - RLS 策略可以直接使用 `auth.uid()`

### 📋 **完整的表创建 SQL**

```sql
-- 确保在 public schema 中创建表
SET search_path TO public;

-- 1. Projects 表 (可选的项目概念，如果不需要可以先跳过)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Assistants 表 (简化版本，去掉project_id依赖)
CREATE TABLE IF NOT EXISTS public.assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 3. Threads 表 (简化版本，去掉project_id依赖)
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES public.assistants(id) ON DELETE SET NULL,
  title TEXT,
  model_name TEXT,
  model_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Messages 表
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('human', 'ai', 'system')),
  content TEXT NOT NULL,
  run_id TEXT,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  additional_kwargs JSONB DEFAULT '{}'::jsonb
);

-- 5. Artifacts 表
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Artifact Contents 表
CREATE TABLE IF NOT EXISTS public.artifact_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID REFERENCES public.artifacts(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'code')),
  title TEXT NOT NULL,
  language TEXT, -- 仅用于 code 类型
  code TEXT, -- 仅用于 code 类型
  full_markdown TEXT, -- 仅用于 text 类型
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(artifact_id, index)
);

-- 7. Context Documents 表
CREATE TABLE IF NOT EXISTS public.context_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. Reflections 表
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES public.assistants(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  style_rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Quick Actions 表
CREATE TABLE IF NOT EXISTS public.quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 为后续扩展预留的表更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要 updated_at 自动更新的表添加触发器
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistants_updated_at 
  BEFORE UPDATE ON public.assistants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at 
  BEFORE UPDATE ON public.threads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at 
  BEFORE UPDATE ON public.artifacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at 
  BEFORE UPDATE ON public.reflections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_actions_updated_at 
  BEFORE UPDATE ON public.quick_actions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 🔒 **Row Level Security (RLS) 策略**

```sql
-- 启用 RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;

-- Projects 策略
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Assistants 策略
CREATE POLICY "Users can view own assistants" ON public.assistants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistants" ON public.assistants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assistants" ON public.assistants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assistants" ON public.assistants
  FOR DELETE USING (auth.uid() = user_id);

-- Threads 策略
CREATE POLICY "Users can view own threads" ON public.threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads" ON public.threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads" ON public.threads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads" ON public.threads
  FOR DELETE USING (auth.uid() = user_id);

-- Messages 策略
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

-- Artifacts 策略
CREATE POLICY "Users can view own artifacts" ON public.artifacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own artifacts" ON public.artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artifacts" ON public.artifacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own artifacts" ON public.artifacts
  FOR DELETE USING (auth.uid() = user_id);

-- Artifact Contents 策略（通过 artifacts 表关联）
CREATE POLICY "Users can view own artifact contents" ON public.artifact_contents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.artifacts 
      WHERE artifacts.id = artifact_contents.artifact_id 
      AND artifacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own artifact contents" ON public.artifact_contents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artifacts 
      WHERE artifacts.id = artifact_contents.artifact_id 
      AND artifacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own artifact contents" ON public.artifact_contents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.artifacts 
      WHERE artifacts.id = artifact_contents.artifact_id 
      AND artifacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own artifact contents" ON public.artifact_contents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.artifacts 
      WHERE artifacts.id = artifact_contents.artifact_id 
      AND artifacts.user_id = auth.uid()
    )
  );

-- Context Documents 策略
CREATE POLICY "Users can view own context documents" ON public.context_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context documents" ON public.context_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context documents" ON public.context_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context documents" ON public.context_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Reflections 策略
CREATE POLICY "Users can view own reflections" ON public.reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON public.reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON public.reflections
  FOR DELETE USING (auth.uid() = user_id);

-- Quick Actions 策略
CREATE POLICY "Users can view own quick actions" ON public.quick_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick actions" ON public.quick_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick actions" ON public.quick_actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick actions" ON public.quick_actions
  FOR DELETE USING (auth.uid() = user_id);

-- 授予认证用户必要权限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### 📊 **索引创建**

```sql
-- Projects 索引 (可选)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Assistants 索引
CREATE INDEX IF NOT EXISTS idx_assistants_user_id ON public.assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_assistants_is_default ON public.assistants(is_default);
CREATE INDEX IF NOT EXISTS idx_assistants_user_default ON public.assistants(user_id, is_default) WHERE is_default = true;

-- Threads 索引
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON public.threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_assistant_id ON public.threads(assistant_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON public.threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_user_created ON public.threads(user_id, created_at DESC);

-- Messages 索引
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sequence ON public.messages(thread_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_messages_run_id ON public.messages(run_id) WHERE run_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(type);

-- Artifacts 索引
CREATE INDEX IF NOT EXISTS idx_artifacts_thread_id ON public.artifacts(thread_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON public.artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON public.artifacts(created_at DESC);

-- Artifact Contents 索引
CREATE INDEX IF NOT EXISTS idx_artifact_contents_artifact_id ON public.artifact_contents(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_contents_type ON public.artifact_contents(type);

-- Context Documents 索引
CREATE INDEX IF NOT EXISTS idx_context_documents_user_id ON public.context_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_context_documents_assistant_id ON public.context_documents(assistant_id);
CREATE INDEX IF NOT EXISTS idx_context_documents_file_type ON public.context_documents(file_type) WHERE file_type IS NOT NULL;

-- Reflections 索引
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_assistant_id ON public.reflections(assistant_id);
CREATE INDEX IF NOT EXISTS idx_reflections_updated_at ON public.reflections(updated_at DESC);

-- Quick Actions 索引
CREATE INDEX IF NOT EXISTS idx_quick_actions_user_id ON public.quick_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_actions_action_type ON public.quick_actions(action_type);
```

## 🚫 **为什么不选择自定义 Schema？**

### ❌ **创建 `nova` Schema 的缺点**

1. **额外复杂性**
   - 需要配置 Schema 级别权限
   - 修改默认的 `search_path`
   - 工具集成可能出现问题

2. **维护成本**
   - 迁移脚本需要指定 Schema
   - TypeScript 类型生成可能需要额外配置
   - 备份和恢复流程更复杂

3. **生态系统兼容性**
   - 第三方库可能假设使用 `public` Schema
   - Supabase 社区资源主要针对 `public` Schema

## 📝 **最佳实践建议**

1. **使用 `public` Schema** ✅
2. **通过 RLS 确保数据安全** ✅
3. **合理设计表前缀**（如果需要）
4. **使用清晰的命名约定**
5. **定期备份和监控**

## 🔗 **与现有代码的集成**

使用 `public` Schema 意味着：

```typescript
// 在 TypeScript 中的引用方式
import { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type Projects = Tables['projects']['Row']
type Assistants = Tables['assistants']['Row']
// ...
```

这与 Supabase 的标准实践完全一致。

---

## 📝 **SQL 更新总结**

### ✅ **本次更新的优化内容：**

1. **简化表结构**
   - ✅ 去掉了 `assistants` 和 `threads` 表中的 `project_id` 依赖
   - ✅ 使 Projects 表变为可选，支持渐进式迁移
   - ✅ 减少了表间强依赖关系

2. **增强数据完整性**
   - ✅ 添加了 `updated_at` 自动更新触发器函数
   - ✅ 为所有需要的表添加了 `updated_at` 触发器
   - ✅ 优化了索引设计，增加了复合索引

3. **完善权限控制**
   - ✅ 细化了 RLS 策略，分别处理 SELECT、INSERT、UPDATE、DELETE
   - ✅ 添加了完整的数据库权限 GRANT 语句
   - ✅ 确保 `artifact_contents` 表通过关联验证权限

4. **性能优化**
   - ✅ 为常用查询模式添加复合索引 (如 `user_id, created_at`)
   - ✅ 为可选字段添加条件索引 (如 `WHERE is_default = true`)
   - ✅ 为 NULL 值字段添加条件索引 (如 `WHERE run_id IS NOT NULL`)

### 🎯 **迁移建议：**

1. **第一阶段** - 创建核心表：`assistants`, `threads`, `messages`
2. **第二阶段** - 添加扩展表：`artifacts`, `context_documents`
3. **第三阶段** - 可选功能：`projects`, `reflections`, `quick_actions`

这样的设计确保了数据安全性、查询性能和未来扩展的灵活性。
