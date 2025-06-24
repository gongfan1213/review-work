# build-ref.ts 模块技术文档

## 模块简介

`build-ref.ts` 提供了答案与网页内容的自动化引用构建工具，支持文本分段、向量化、相似度计算、引用筛选等流程，广泛应用于问答系统的自动溯源、内容引用等场景。

---

## 主要导出接口

- `buildReferences(answer, webContents, context, schema, minChunkLength, maxRef, minRelScore, onlyHostnames): Promise<{ answer, references }>`
  - 根据答案和网页内容，自动生成高相关性的引用列表。
- `buildImageReferences(answer, imageObjects, context, schema, minChunkLength, maxRef, minRelScore): Promise<Array<ImageReference>>`
  - 针对图片内容生成引用。

---

## 主要参数说明
- `answer`：待引用的答案文本。
- `webContents`：网页内容对象集合。
- `context`：追踪上下文。
- `schema`：Schema 生成器。
- `minChunkLength`：分段最小长度，默认 80。
- `maxRef`：最大引用数，默认 10。
- `minRelScore`：最小相关性分数，默认 0.7。
- `onlyHostnames`：仅包含指定主机名的内容。

---

## 典型用法
```ts
import { buildReferences } from './build-ref';
const result = await buildReferences(
  '量子计算的核心原理是什么？',
  webContents,
  context,
  schemaGen,
  80,
  10,
  0.7
);
console.log(result.references);
```

---

## 应用场景
- 问答系统自动溯源与引用生成
- 内容相似度分析与引用筛选
- 多模态内容（文本、图片）引用

---

## 注意事项
- 依赖分段、向量化、相似度计算等工具模块。
- 参数需根据实际场景调整，避免无效引用。 