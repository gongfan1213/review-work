# segment.ts 模块技术文档

## 模块简介

`segment.ts` 提供了通用的文本分段（chunking）工具函数 `chunkText`，支持多种分段策略，广泛应用于文本处理、摘要、检索等场景。

---

## 导出接口

### chunkText

**定义：**
```ts
function chunkText(text: string, options?: ChunkOptions): {
    chunks: string[];
    chunk_positions: [number, number][];
}
```

**参数说明：**
- `text`：待分段的原始字符串。
- `options`：可选，分段配置对象 `ChunkOptions`：
  - `type`：分段类型，可选值：
    - `'newline'`（默认）：按换行符分段。
    - `'punctuation'`：按中英文常见标点分段。
    - `'characters'`：按固定字符数分段，需指定 `value`。
    - `'regex'`：按自定义正则表达式分段，需指定 `value`。
  - `value`：分段参数，类型为 `string | number`，用于 `characters`（指定长度）或 `regex`（正则表达式）。
  - `minChunkLength`：每段最小长度，默认 80，短于此长度的分段会被过滤。

**返回值：**
- `chunks`：分段后的字符串数组。
- `chunk_positions`：每个分段在原文中的起止位置（元组数组）。

---

## 典型用法

```ts
import { chunkText } from './segment';

const text = '第一段内容。\n第二段内容！\n第三段内容？';
const result = chunkText(text, { type: 'punctuation', minChunkLength: 5 });
console.log(result.chunks); // [ '第一段内容。', '第二段内容！', '第三段内容？' ]
console.log(result.chunk_positions); // [ [0, 6], [7, 13], [14, 20] ]
```

---

## 应用场景
- 长文本分段处理，便于后续摘要、检索、相似度计算等。
- 结合向量化、embedding、reference 构建等模块，提升文本处理效率。
- 可灵活适配不同分段需求（如按标点、定长、正则等）。

---

## 注意事项
- `minChunkLength` 过大可能导致部分内容被过滤，需根据实际场景调整。
- `regex` 类型需确保正则表达式合法，否则会抛出异常。
- 返回的 `chunk_positions` 便于后续定位原文片段。

---

## 相关引用
- 在 `build-ref.ts`、`url-tools.ts` 等模块中被调用，用于答案和网页内容的分段。 