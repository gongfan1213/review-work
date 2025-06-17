# LangChain 消息格式处理调试

## 问题描述
用户反馈发送了2条消息但只存储了1条。通过分析发现输入的消息格式包含复杂的 LangChain 结构。

## 输入消息格式分析

### 用户消息（格式1）
```json
{
    "role": "user",
    "content": "写篇小红书 星期一",
    "additional_kwargs": {
        "documents": []
    }
}
```

### AI消息（格式2 - LangChain 格式）
```json
{
    "lc": 1,
    "type": "constructor",
    "id": [
        "langchain_core",
        "messages",
        "AIMessage"
    ],
    "kwargs": {
        "id": "followup-8ba1ab00-a8ef-4b25-8d99-771fe1c73578",
        "content": "✨小确幸已送达✨\n\n你的周一治愈系笔记已完成！...",
        "tool_calls": [],
        "invalid_tool_calls": [],
        "additional_kwargs": {},
        "response_metadata": {}
    }
}
```

## 问题分析

### 1. 消息类型推导问题
原始代码：
```typescript
type: message.type || 'human',
```

但 LangChain 格式的消息没有直接的 `type` 字段，需要从 `id` 数组中解析消息类型。

### 2. 内容提取问题
LangChain 格式的消息内容在 `kwargs.content` 而不是 `content`，原有的过滤逻辑可能错误过滤掉有效消息。

## 修复方案

### 1. 增强消息类型解析
```typescript
// 检查是否是 LangChain 格式的消息
if (message.lc && message.type === 'constructor' && message.id && message.kwargs) {
  const msgClass = message.id[message.id.length - 1]; // 获取最后一个元素，例如 "AIMessage"
  if (msgClass === 'AIMessage') {
    messageType = 'ai';
  } else if (msgClass === 'HumanMessage') {
    messageType = 'human';
  }
  
  // 从 kwargs 中提取字段
  content = message.kwargs.content || content;
  additionalKwargs = message.kwargs.additional_kwargs || additionalKwargs;
  // ... 其他字段
}
```

### 2. 增强内容过滤逻辑
```typescript
// 处理 LangChain 格式的消息内容
let content = message.content;
if (message.lc && message.kwargs && message.kwargs.content) {
  content = message.kwargs.content;
}
```

### 3. 添加详细调试日志
- 打印原始消息数据
- 显示过滤前后的消息数量
- 记录插入结果和最终的消息ID

## 验证方法

1. **检查控制台输出**：
   - `Raw messages received:` - 原始消息数据
   - `Filtered X valid messages from Y total messages` - 过滤结果
   - `Successfully inserted X messages:` - 插入结果

2. **预期行为**：
   - 应该显示接收到2条消息
   - 过滤后应该保留2条有效消息
   - 成功插入2条消息到数据库

## 相关文件

- `apps/web/src/app/api/thread/[id]/state/route.ts` - 主要修复文件
- `apps/web/src/contexts/GraphContext.tsx` - 消息生成逻辑

## 预期结果

修复后应该能够：
1. 正确解析 LangChain 格式的消息
2. 准确提取消息类型（human/ai）
3. 正确提取消息内容和元数据
4. 成功保存所有有效消息到数据库 