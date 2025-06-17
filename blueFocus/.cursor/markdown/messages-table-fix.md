# Messages 表字段修复

## 问题描述

在测试 Thread 状态更新功能时，遇到以下错误：

```
Transaction failed: Error: Failed to insert messages: Could not find the 'response_metadata' column of 'messages' in the schema cache
```

## 根本原因

`messages` 表缺少几个在 LangGraph SDK 中的 Message 对象所需的字段：

- `response_metadata`: AI 消息的响应元数据
- `tool_calls`: 工具调用信息
- `usage_metadata`: 使用统计信息

## 解决方案

通过数据库迁移添加缺失的列：

```sql
-- 添加缺失的 messages 表列
ALTER TABLE public.messages 
ADD COLUMN response_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN tool_calls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN usage_metadata JSONB DEFAULT NULL;
```

## 修复后的表结构

更新后的 `messages` 表包含以下字段：

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|---------|------|
| id | uuid | 是 | gen_random_uuid() | 主键 |
| thread_id | uuid | 否 | null | 关联的 Thread ID |
| user_id | uuid | 否 | null | 用户 ID |
| type | text | 是 | - | 消息类型 (human/ai/system/tool) |
| content | text | 是 | - | 消息内容 |
| run_id | text | 否 | null | 运行 ID |
| sequence_number | integer | 是 | - | 消息序号 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| metadata | jsonb | 否 | '{}' | 元数据 |
| additional_kwargs | jsonb | 否 | '{}' | 额外参数 |
| **response_metadata** | **jsonb** | **否** | **'{}'** | **响应元数据** |
| **tool_calls** | **jsonb** | **否** | **'[]'** | **工具调用** |
| **usage_metadata** | **jsonb** | **否** | **null** | **使用统计** |

## 字段用途说明

### response_metadata

存储 AI 响应的元数据，如：

```json
{
  "finish_reason": "stop",
  "model": "gpt-4",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

### tool_calls

存储工具调用信息，如：

```json
[
  {
    "id": "call_123",
    "type": "function",
    "function": {
      "name": "search_web",
      "arguments": "{\"query\": \"weather\"}"
    }
  }
]
```

### usage_metadata

存储使用统计信息，如：

```json
{
  "input_tokens": 100,
  "output_tokens": 50,
  "total_tokens": 150
}
```

## 相关文件更新

1. **数据库类型文件**: `apps/web/src/types/database.types.ts`
   - 更新了 TypeScript 类型定义以包含新字段

2. **API 路由**: `apps/web/src/app/api/thread/[id]/state/route.ts`
   - 现在可以正确插入包含这些字段的消息

## 测试验证

修复后，可以在 `/test-thread` 页面测试：

1. 创建 Thread
2. 更新 Thread 状态（添加消息和 artifacts）
3. 验证所有字段正确保存

## 影响范围

此修复确保了：

- LangGraph Message 对象的完整兼容性
- Thread 状态更新功能正常工作
- 未来扩展时的数据完整性

## 注意事项

- 新添加的字段都有合理的默认值，不会影响现有数据
- `tool_calls` 默认为空数组 `[]`
- `response_metadata` 默认为空对象 `{}`
- `usage_metadata` 默认为 `null`，表示可选信息
