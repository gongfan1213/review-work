# 数据库初始化功能

## 概述

数据库初始化功能是一个管理工具，用于检查、初始化和维护应用程序数据库表结构。它提供了一个可视化界面来验证数据库状态并执行必要的初始化操作。

## 功能特性

### ✅ 已实现

1. **数据库结构检查**
   - 检查所有预期表是否存在
   - 验证表字段结构（类型、可空性、默认值）
   - 提供详细的差异报告

2. **可视化状态展示**
   - 表级别状态指示器（存在/缺失）
   - 字段级别详细状态（类型匹配、可空性、默认值）
   - 颜色编码的状态徽章

3. **SQL 脚本管理**
   - 每个表的 CREATE TABLE 语句
   - 一键复制 SQL 脚本到剪贴板
   - 展开/折叠查看建表语句

4. **用户交互**
   - 检查数据库按钮
   - 初始化数据库按钮（创建缺失的表）
   - 更新表结构按钮（添加缺失的字段）
   - Toast 通知反馈

5. **导航集成**
   - 在主导航栏中添加了"数据库初始化"链接
   - 响应式页面布局

## 表结构定义

系统定义了以下 11 个核心表：

1. **projects** - 项目表
2. **tags** - 标签表
3. **assistants** - 助手表
4. **threads** - 对话线程表
5. **messages** - 消息表
6. **artifacts** - 工件表
7. **artifact_contents** - 工件内容表
8. **context_documents** - 上下文文档表
9. **reflections** - 反思表
10. **quick_actions** - 快速操作表

每个表都包含详细的字段定义和约束。

## 文件结构

```
apps/web/src/
├── app/
│   ├── database-init/
│   │   └── page.tsx                    # 主页面组件
│   └── api/
│       └── database/
│           └── check/
│               └── route.ts            # 模拟数据库检查API
├── components/ui/
│   ├── header.tsx                      # 添加了导航链接
│   └── separator.tsx                   # 分隔符组件
└── hooks/
    └── use-toast.ts                    # Toast 通知 hook
```

## API 接口

### 已实现
- `GET /api/database/check` - 真实数据库检查，支持多层级回退机制
- `POST /api/database/initialize` - 执行数据库初始化，创建缺失的表
- `POST /api/database/update` - 更新表结构，添加缺失的字段

## TODO 待完成功能

### ✅ 后端集成（已完成）
1. **实际数据库连接**
   - ✅ 连接真实的 Supabase 数据库
   - ✅ 实现 `POST /api/database/initialize` 接口
   - ✅ 实现 `POST /api/database/update` 接口

2. **SQL 执行**
   - ✅ 执行 CREATE TABLE 语句
   - ✅ 执行 ALTER TABLE 添加字段
   - ✅ 基础错误处理机制

### 🔲 功能增强
1. **权限控制**
   - 添加管理员权限检查
   - 危险操作确认对话框

2. **备份和恢复**
   - 数据库备份功能
   - 表结构导出
   - 数据迁移工具

3. **日志记录**
   - 操作日志记录
   - 错误日志详情
   - 操作历史查看

4. **高级检查**
   - 索引检查和创建
   - 外键约束验证
   - 数据一致性检查

### 🔲 用户体验
1. **批量操作**
   - 批量选择表进行操作
   - 进度条显示
   - 操作队列管理

2. **配置管理**
   - 保存常用配置
   - 环境切换（开发/测试/生产）
   - 自定义表结构定义

## 使用说明

1. **访问页面**
   - 在浏览器中访问 `/database-init`
   - 或通过主导航栏点击"数据库初始化"

2. **检查数据库**
   - 点击"检查数据库"按钮
   - 系统会显示当前数据库状态

3. **初始化数据库**
   - 如果有缺失的表，"初始化数据库"按钮会激活
   - 点击执行创建缺失的表

4. **更新表结构**
   - 如果有缺失的字段，"更新表结构"按钮会激活
   - 点击执行添加缺失的字段

5. **复制 SQL**
   - 点击任意表卡片右上角的"复制 SQL"按钮
   - SQL 语句会复制到剪贴板

## 技术实现

### 数据库查询机制
- **真实数据库查询**：通过 Supabase 客户端查询 `information_schema` 获取实际表结构
- **多层级回退机制**：
  1. 优先使用 RPC 函数 `get_table_info()` 
  2. 回退到直接查询 `information_schema.tables` 和 `information_schema.columns`
  3. 最终回退到模拟数据以确保页面正常显示
- 支持表级别和字段级别的差异检测

### 数据库操作
- **初始化数据库**：`POST /api/database/initialize` 
  - 使用预定义的 CREATE TABLE 语句
  - 按依赖顺序创建表避免外键错误
  - 通过 RPC 函数 `execute_sql()` 执行 SQL
- **更新表结构**：`POST /api/database/update`
  - 支持添加缺失字段的 ALTER TABLE 操作
  - 字段类型修改提示手动处理
- **权限要求**：需要数据库执行 DDL 语句的权限

### 状态管理
使用 React state 管理数据库检查结果和操作状态：
- `DatabaseStatus` 接口定义整体状态
- `TableStatus` 接口定义单表状态
- 支持成功/警告/错误/检查中四种状态

### UI 组件
- 使用 shadcn/ui 组件库
- Card 布局展示表信息
- Badge 组件显示状态
- Toast 通知用户操作结果

### 错误处理
- Try-catch 包装所有异步操作
- Toast 通知显示错误信息
- 状态指示器区分不同错误类型

## 注意事项

1. **安全性**
   - 当前版本仅用于开发环境
   - 生产环境需要添加权限控制

2. **数据安全**
   - 初始化操作不会影响现有数据
   - 建议在操作前备份数据库

3. **性能考虑**
   - 大型数据库检查可能需要较长时间
   - 考虑添加分页或异步处理

## 更新日志

### v1.1.0 (当前版本)
- ✅ 真实数据库连接和检查
- ✅ 数据库初始化 API
- ✅ 表结构更新 API
- ✅ 多层级回退机制
- ✅ 错误处理和通知

### v1.0.0
- ✅ 基础数据库检查功能
- ✅ 可视化状态展示
- ✅ SQL 脚本复制功能
- ✅ 导航集成
- ✅ Toast 通知系统 

# 数据库初始化页面功能

## 功能概述

数据库初始化页面 (`/database-init`) 提供了一个可视化界面，用于检查、初始化和更新 Nova 项目的数据库结构。该页面能够：

- **真实数据库检查**：连接到 Supabase 数据库，读取实际的表结构信息
- **表结构对比**：将实际数据库结构与预期结构进行详细对比
- **自动初始化**：创建缺失的数据库表
- **增量更新**：为现有表添加缺失的字段
- **SQL脚本生成**：提供完整的CREATE TABLE语句供手动执行

## v1.2.0 更新内容 (真实功能实现)

### 🎯 主要改进
1. **移除模拟数据**：所有API现在都连接真实的Supabase数据库
2. **多层级查询机制**：确保在不同权限级别下都能获取数据库信息
3. **错误处理增强**：提供详细的错误信息和失败原因
4. **权限要求明确**：文档化了所需的数据库权限

### 🔄 API 变更

#### GET /api/database/check
- ❌ 移除：模拟数据回退机制
- ✅ 新增：三层级查询策略
  1. RPC函数 `execute_sql()` 查询 information_schema
  2. 直接查询 information_schema.tables 和 columns
  3. 逐表检查存在性（最小权限模式）
- ✅ 新增：详细错误信息返回

#### POST /api/database/initialize
- ✅ 改进：更智能的错误处理
- ✅ 新增：RPC不存在时的权限检查模式
- ✅ 新增：详细的执行结果报告

#### POST /api/database/update
- ✅ 保持：真实的ALTER TABLE执行
- ✅ 改进：更好的错误反馈

### 🗄️ 数据库权限要求

为了让数据库初始化功能完全工作，需要以下权限：

#### 基础权限（查看功能）
```sql
-- 读取表结构信息
GRANT SELECT ON information_schema.tables TO anon, authenticated;
GRANT SELECT ON information_schema.columns TO anon, authenticated;
```

#### DDL权限（创建/修改表）
```sql
-- 创建和修改表的权限
GRANT CREATE ON SCHEMA public TO anon, authenticated;
GRANT ALTER ON ALL TABLES IN SCHEMA public TO anon, authenticated;
```

#### 可选的RPC函数（推荐，提高性能）
```sql
-- 创建SQL执行函数
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 创建表信息查询函数
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE(
  table_name text,
  column_name text,
  data_type text,
  is_nullable text,
  column_default text,
  ordinal_position integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.table_name::text,
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text,
    c.ordinal_position
  FROM information_schema.tables t
  LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
  WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name, c.ordinal_position;
$$;

-- 授权
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_table_info() TO anon, authenticated;
```

### 🔧 前端功能增强

#### 真实API调用
- ✅ `checkDatabase()`: 连接真实数据库，不再使用模拟数据
- ✅ `initializeDatabase()`: 调用真实的创建表API
- ✅ `updateTables()`: 调用真实的表更新API

#### 错误处理改进
- ✅ 显示具体的API错误信息
- ✅ 区分权限错误和连接错误
- ✅ 提供详细的操作结果反馈

## 数据库表结构定义

### 核心表

1. **projects** - 项目表
   - 存储用户项目信息
   - 包含项目内容、状态、标签等

2. **tags** - 标签表
   - 用户自定义标签
   - 支持项目分类

3. **assistants** - 助手表
   - AI助手配置信息
   - 包含系统提示、工具配置等

4. **threads** - 对话线程表
   - 用户与助手的对话会话
   - 关联项目和助手

5. **messages** - 消息表
   - 对话中的具体消息
   - 支持不同类型：human、ai、system

6. **artifacts** - 工件表
   - 对话生成的工件（代码、文档等）
   - 版本控制支持

7. **artifact_contents** - 工件内容表
   - 工件的具体内容版本
   - 支持多种类型：text、code

8. **context_documents** - 上下文文档表
   - 助手使用的上下文文档
   - 文件类型和大小信息

9. **reflections** - 反思表
   - 助手的反思记录
   - 包含样式规则配置

10. **quick_actions** - 快速操作表
    - 用户自定义的快速操作
    - 配置化的操作类型

## 功能特性

### 1. 数据库检查
- **实时状态监控**：表级别和字段级别的状态指示
- **差异对比**：类型、可空性、默认值的详细对比
- **可视化展示**：使用颜色编码显示不同状态

### 2. 数据库初始化
- **依赖顺序**：按照表依赖关系正确创建表
- **权限检查**：智能检测用户权限并提供相应建议
- **批量创建**：一次性创建所有缺失的表

### 3. 表结构更新
- **增量更新**：只添加缺失的字段，不影响现有数据
- **类型安全**：确保字段类型和约束正确
- **事务安全**：每个表的更新独立进行

### 4. SQL脚本管理
- **一键复制**：快速复制CREATE TABLE语句
- **格式化显示**：美观的SQL语法高亮
- **完整脚本**：包含所有约束和默认值

## 状态指示系统

### 表状态
- 🟢 **成功**：所有表和字段都存在且匹配
- 🟡 **警告**：表存在但部分字段类型或约束不匹配
- 🔴 **错误**：表不存在或关键字段缺失
- ⚪ **检查中**：正在查询数据库状态

### 字段状态
- ✅ **存在且匹配**：字段存在且类型、可空性、默认值都正确
- ⚠️ **存在但不匹配**：字段存在但属性不完全匹配
- ❌ **不存在**：字段缺失

## 使用说明

### 第一次使用
1. 访问 `/database-init` 页面
2. 点击"检查数据库"按钮查看当前状态
3. 如果有缺失的表，点击"初始化数据库"
4. 如果需要添加字段，点击"更新表结构"

### 权限配置
1. 确保数据库用户有查询 information_schema 的权限
2. 对于初始化功能，需要 CREATE TABLE 权限
3. 对于更新功能，需要 ALTER TABLE 权限
4. 推荐创建 RPC 函数以提高性能和可靠性

### 故障排除
- **连接失败**：检查环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **权限错误**：按照权限要求部分配置数据库权限
- **RPC不存在**：可选功能，系统会自动回退到其他查询方式

## 技术实现

### 查询策略
1. **优先级1**：使用RPC函数批量查询（最高效）
2. **优先级2**：直接查询information_schema（需要读权限）
3. **优先级3**：逐表存在性检查（最小权限）

### 错误处理
- 多层级回退机制
- 详细错误信息记录
- 用户友好的错误提示

### 性能优化
- 批量查询减少数据库请求
- 客户端状态缓存
- 异步操作避免界面阻塞

## TODO清单

- [x] ~~移除模拟数据，实现真实数据库查询~~
- [x] ~~改进错误处理和用户反馈~~
- [x] ~~添加权限检查和配置说明~~
- [ ] 添加表结构备份功能
- [ ] 支持数据库迁移脚本生成
- [ ] 添加表数据预览功能
- [ ] 支持自定义表结构验证规则

## 更新日志

### v1.2.0 (2024-01-XX) - 真实功能实现
- 移除所有模拟数据，连接真实Supabase数据库
- 实现多层级数据库查询机制
- 增强错误处理和用户反馈
- 添加数据库权限配置文档
- 改进API错误信息传递

### v1.1.0 (2024-01-XX) - 功能完善
- 实现真实的数据库操作API
- 添加详细的表结构定义
- 完善状态管理和错误处理
- 集成到主导航系统

### v1.0.0 (2024-01-XX) - 初始版本
- 基础页面结构和组件
- 数据库检查功能
- SQL脚本复制功能 