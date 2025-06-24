# embeddings.ts 模块技术文档

## 模块简介

`embeddings.ts` 提供了文本向量化（embedding）工具，支持批量文本向量化、重试机制、API 调用等，广泛应用于文本检索、相似度计算、内容聚类等场景。

---

## 主要导出接口

- `getEmbeddings(texts, tokenTracker?, options?): Promise<{ embeddings: number[][], tokens: number }>`
  - 批量获取文本的向量表示，支持多种 embedding 任务和参数配置。

---

## 主要参数说明
- `texts`：待向量化的文本数组或对象数组。
- `tokenTracker`：可选，token 使用追踪器。
- `options`：可选，embedding 任务类型、维度、模型等参数。
  - `task`：embedding 任务类型，如 'text-matching'、'retrieval.passage' 等。
  - `dimensions`：向量维度。
  - `late_chunking`：是否延迟分段。
  - `embedding_type`：embedding 类型。
  - `model`：指定模型。

---

## 典型用法
```ts
import { getEmbeddings } from './embeddings';
const result = await getEmbeddings([
  '量子计算是什么？',
  '人工智能的应用有哪些？'
]);
console.log(result.embeddings);
```

---

## 应用场景
- 文本检索与相似度计算
- 问答系统内容向量化
- 聚类与推荐系统

---

## 注意事项
- 依赖外部 API（如 Jina Embeddings），需配置 API KEY。
- 支持批量处理和重试机制，适合大规模文本处理。 