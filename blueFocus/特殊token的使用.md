我来搜索项目中是否有使用特殊token（协议token、基础词汇表之外的token）的情况。


[7 tools called]

基于对项目代码的深入分析，我可以明确回答你的问题：

## �� 项目中的特殊Token使用情况

**是的，这个项目大量使用了协议token（特殊token），但不是在基础词汇表层面，而是在提示词工程和结构化输出层面。**

### 📋 特殊Token分类

#### 1. **XML结构化标签Token**
项目广泛使用XML标签作为结构化输出的协议token：

**核心Agent输出格式Token：**
- `<observation>` - 观察过程
- `<thinking>` - 思考过程  
- `<response>` - 回复内容
- `<planning>` - 规划过程

**任务编排Token：**
- `<plan>` - 任务计划
- `<step>` - 执行步骤
- `<action>` - 具体动作
- `<input>` - 输入描述

**内容创作Token：**
- `<xhs_post>` - 小红书帖子
- `<insight1>`, `<insight2>` - 洞察分析
- `<hitpoint1>`, `<hitpoint2>` - 内容打点
- `<fact1>`, `<fact2>` - 事实信息
- `<websearch1>`, `<websearch2>` - 搜索结果

#### 2. **引用系统Token**
- `@profile1`, `@insight1`, `@hitpoint1` - 跨轮次引用
- `@requirement_alignment_agent1` - Agent结果引用

#### 3. **状态标记Token**
- `##SEARCH_COMPLETED##` - 搜索完成标记
- `##WORKFLOW_COMPLETED##` - 工作流完成标记

### 🔧 具体实现方式

#### 1. **在提示词中定义协议**
```python
# 在 agents/graph/agent/requirement_alignment_agent.py 中
prompt = """
**统一输出xml格式**：

```xml
<observation>观察到的用户需求和当前情况</observation>

<thinking>分析用户需求，思考后续行动</thinking>

<response>给用户的回复（开场问候+分析结果+结尾询问）</response>
```
"""
```

#### 2. **在内容创作工具中解析**
```python
# 在 agents/graph/tool/content_post_tool.py 中
def _extract_hashtags(content: str) -> List[str]:
    """从内容中提取话题标签"""
    import re
    # 查找 #话题# 格式的标签
    hashtags = re.findall(r'#([^#\s]+)#', content)
    return list(set(hashtags))
```

#### 3. **在脚本工具中解析XML**
```python
# 在 agents/graph/tool/script_tool.py 中
# 尝试找到XML格式的脚本
pattern = r'<video_script(\d+)>\s*<title>(.*?)</title>\s*<hook>(.*?)</hook>\s*<content>(.*?)</content>\s*</video_script\1>'
```

### �� 设计特点

#### 1. **分层式Token系统**
- **元认知层**: `<observation>`, `<thinking>`, `<planning>`
- **任务编排层**: `<plan>`, `<step>`, `<action>`
- **内容产出层**: `<xhs_post>`, `<insight>`, `<hitpoint>`
- **引用传递层**: `@note_id` 系统

#### 2. **结构化输出要求**
每个Agent都有明确的XML输出格式要求，确保：
- 可解析性
- 可追溯性
- 可组合性

#### 3. **引用系统设计**
通过 `@note_id` 实现跨轮次、跨Agent的信息传递：
```python
@profile1: 用户画像内容
@insight1: 洞察分析内容  
@hitpoint1: 内容策略
@xhs_post1: 小红书内容
```

### 💡 优势与作用

1. **结构化输出**: 确保每个Agent的输出都是可解析的结构化格式
2. **跨轮次引用**: 通过 `@note_id` 实现复杂的信息传递
3. **可追溯性**: 每个标签都有明确的语义和用途
4. **可组合性**: 不同Agent的输出可以组合成更复杂的工作流
5. **人类可读**: XML标签既机器可解析，又人类可读

### 🚀 总结

这个项目**没有使用基础词汇表层面的特殊token**，而是大量使用了**提示词工程层面的协议token**，通过XML标签系统实现了：

- 结构化的Agent输出
- 跨轮次的信息传递
- 可解析的内容格式
- 可组合的工作流

这种设计使得整个多Agent系统能够高效协作，每个Agent的输出都能被其他Agent正确理解和引用。
