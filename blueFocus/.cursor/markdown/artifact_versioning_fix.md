# Artifact 版本控制修复

## 问题描述
在 `/api/thread/[id]/state` PUT 端点中，artifact 更新逻辑有问题：
1. 直接删除所有现有的 artifact_contents 然后插入新的，导致历史版本丢失
2. currentIndex 没有正确递增
3. 不支持版本追加，而是完全替换

## 修复方案

### 1. 修改数据查询逻辑
现在查询 artifact 时同时获取所有现有的 contents：
```sql
SELECT id, current_index, 
       artifact_contents (index, type, title, language, code, full_markdown)
FROM artifacts 
WHERE thread_id = ? 
ORDER BY created_at DESC 
LIMIT 1
```

### 2. 版本追加逻辑
**对于已存在的 artifact：**
- 计算现有 contents 的最大 index
- 新 contents 从 `maxExistingIndex + 1` 开始递增
- 更新 `current_index` 为最新添加的 content 的 index

**对于新创建的 artifact：**
- Contents 从 index 1 开始编号
- `current_index` 设置为最后一个 content 的 index

### 3. 代码实现

```typescript
if (existingArtifact) {
  // 获取现有 contents 的最大 index
  const existingContents = existingArtifact.artifact_contents || []
  const maxExistingIndex = existingContents.length > 0 
    ? Math.max(...existingContents.map((c: any) => c.index)) 
    : 0

  if (artifact.contents && Array.isArray(artifact.contents) && artifact.contents.length > 0) {
    // 追加新内容，递增 index
    let nextIndex = maxExistingIndex + 1
    
    const contentsToInsert = artifact.contents.map((content: any) => ({
      artifact_id: artifactId,
      index: nextIndex++, // 使用递增的 index
      type: content.type,
      title: content.title,
      language: content.language || null,
      code: content.code || null,
      full_markdown: content.fullMarkdown || null,
    }))

    // 插入新 contents
    await supabase.from('artifact_contents').insert(contentsToInsert)

    // 更新 current_index 为最新添加的内容
    newCurrentIndex = nextIndex - 1
  } else {
    // 没有新内容，保持当前 index
    newCurrentIndex = artifact.currentIndex || existingArtifact.current_index
  }

  // 更新 artifact 的 current_index
  await supabase
    .from('artifacts')
    .update({
      current_index: newCurrentIndex,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existingArtifact.id)
}
```

### 4. 测试场景

**场景 1：新创建的 artifact**
- Input: `contents = [content1, content2]`
- Expected: 
  - content1.index = 1
  - content2.index = 2
  - current_index = 2

**场景 2：已有 artifact 追加版本**
- Existing: `contents = [content1(index=1), content2(index=2)]`, `current_index = 2`
- Input: `contents = [content3]`
- Expected:
  - content3.index = 3
  - current_index = 3
  - 原有 content1, content2 保持不变

**场景 3：多个版本追加**
- Existing: `contents = [content1(index=1)]`, `current_index = 1`
- Input: `contents = [content2, content3]`
- Expected:
  - content2.index = 2
  - content3.index = 3
  - current_index = 3

### 5. 日志和调试
添加了详细的控制台日志：
- 现有 contents 数量和最大 index
- 新插入的 contents 数量和 index 范围
- 更新后的 current_index

### 6. 影响范围
这个修复确保：
- ✅ 历史版本不会丢失
- ✅ 版本 index 正确递增
- ✅ current_index 指向最新版本
- ✅ 支持一次性追加多个版本
- ✅ 向后兼容现有数据

修复已应用到 `apps/web/src/app/api/thread/[id]/state/route.ts` 文件。 