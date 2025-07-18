Ran tool
Ran tool
下面详细讲解 dify 项目中**重排序算法（Rerank）**和**Embedding**的实现细节：

---

## 一、重排序算法（Rerank）

### 1. 支持的重排序模式

- **模型重排序（RERANKING_MODEL）**：调用专门的重排序模型（如 cross-encoder、bge-reranker、cohere-rerank 等）对检索到的文档重新打分排序。
- **加权融合重排序（WEIGHTED_SCORE）**：将向量相似度分数和关键词（BM25/TF-IDF）分数加权融合，得到最终分数排序。

### 2. 主要实现结构

- 入口类：`DataPostProcessor`（`api/core/rag/data_post_processor/data_post_processor.py`）
- 工厂类：`RerankRunnerFactory`（`api/core/rag/rerank/rerank_factory.py`）
- 具体实现：
  - `RerankModelRunner`（模型重排序，`api/core/rag/rerank/rerank_model.py`）
  - `WeightRerankRunner`（加权融合，`api/core/rag/rerank/weight_rerank.py`）

### 3. 典型流程

1. 检索到初步文档列表后，进入 `DataPostProcessor.invoke`。
2. 根据配置选择重排序模式，调用对应的 Runner。
3. **模型重排序**：将 query 和文档内容传给重排序模型，模型返回每个文档的新分数，按分数降序排序。
4. **加权融合**：分别计算 query 与文档的关键词分数（BM25/TF-IDF）和向量分数（余弦相似度），按权重加权融合，得到最终分数排序。

### 4. 关键代码片段

#### 4.1 模型重排序

```python
# api/core/rag/rerank/rerank_model.py
class RerankModelRunner(BaseRerankRunner):
    def run(self, query, documents, score_threshold=None, top_n=None, user=None):
        # 调用模型实例的 rerank 方法
        rerank_result = self.rerank_model_instance.invoke_rerank(
            query=query, docs=[d.page_content for d in documents], score_threshold=score_threshold, top_n=top_n, user=user
        )
        # 按分数排序并返回
        rerank_documents = []
        for result in rerank_result.docs:
            if score_threshold is None or result.score >= score_threshold:
                rerank_document = Document(
                    page_content=result.text,
                    metadata=documents[result.index].metadata,
                    provider=documents[result.index].provider,
                )
                rerank_document.metadata["score"] = result.score
                rerank_documents.append(rerank_document)
        rerank_documents.sort(key=lambda x: x.metadata.get("score", 0.0), reverse=True)
        return rerank_documents[:top_n] if top_n else rerank_documents
```

#### 4.2 加权融合重排序

```python
# api/core/rag/rerank/weight_rerank.py
class WeightRerankRunner(BaseRerankRunner):
    def run(self, query, documents, score_threshold=None, top_n=None, user=None):
        # 计算关键词分数（BM25/TF-IDF）
        query_scores = self._calculate_keyword_score(query, documents)
        # 计算向量分数（余弦相似度）
        query_vector_scores = self._calculate_cosine(self.tenant_id, query, documents, self.weights.vector_setting)
        # 加权融合
        for document, query_score, query_vector_score in zip(documents, query_scores, query_vector_scores):
            score = (
                self.weights.vector_setting.vector_weight * query_vector_score
                + self.weights.keyword_setting.keyword_weight * query_score
            )
            document.metadata["score"] = score
        # 按分数排序
        rerank_documents.sort(key=lambda x: x.metadata["score"], reverse=True)
        return rerank_documents[:top_n] if top_n else rerank_documents
```

---

## 二、Embedding 细节

### 1. 支持的模型与调用方式

- 支持多种 embedding 模型（如 OpenAI、BGE、Cohere、百度、讯飞等），通过 `ModelManager` 动态获取。
- 支持文档 embedding 和 query embedding，均有缓存机制（数据库和 Redis）。

### 2. 主要实现结构

- 入口类：`Vector`（`api/core/rag/datasource/vdb/vector_factory.py`）
- Embedding 抽象基类：`Embeddings`（`api/core/rag/embedding/embedding_base.py`）
- 缓存实现：`CacheEmbedding`（`api/core/rag/embedding/cached_embedding.py`）

### 3. 典型流程

1. 文档入库时，调用 `Vector.create` 或 `add_texts`，对每个文档片段生成 embedding。
2. embedding 先查缓存（数据库），没有则调用模型生成，并写入缓存。
3. 检索时，query 也会生成 embedding（查 Redis 缓存，未命中则生成并写入）。
4. embedding 结果用于向量数据库检索（如 Milvus、PGVector、OpenSearch、ElasticSearch、Couchbase 等）。

### 4. 关键代码片段

#### 4.1 文档 embedding

```python
# api/core/rag/datasource/vdb/vector_factory.py
def create(self, texts: Optional[list] = None, **kwargs):
    if texts:
        batch_embeddings = self._embeddings.embed_documents([document.page_content for document in batch])
        self._vector_processor.create(texts=batch, embeddings=batch_embeddings, **kwargs)
```

#### 4.2 Query embedding

```python
# api/core/rag/embedding/cached_embedding.py
def embed_query(self, text: str) -> list[float]:
    # 先查 Redis 缓存
    embedding = redis_client.get(embedding_cache_key)
    if embedding:
        ...
        return [float(x) for x in decoded_embedding]
    # 未命中则调用模型生成
    embedding_result = self._model_instance.invoke_text_embedding(
        texts=[text], user=self._user, input_type=EmbeddingInputType.QUERY
    )
    embedding_results = (embedding_results / np.linalg.norm(embedding_results)).tolist()
    # 写入 Redis 缓存
    ...
    return embedding_results
```

#### 4.3 支持的向量数据库

- 通过 `BaseVector` 抽象，支持 Milvus、PGVector、OpenSearch、ElasticSearch、Couchbase、AnalyticDB、Relyt、OpenGauss 等多种后端，自动适配。

---

## 总结

- **重排序**：支持模型重排序和加权融合两种主流方式，模型可灵活配置，融合可自定义权重。
- **Embedding**：支持多种主流 embedding 模型，具备高效缓存和批量处理能力，向量可存多种数据库。
- **代码结构清晰，易于扩展**，可根据业务需求灵活切换和组合。

如需进一步了解某一具体模型或算法的实现细节，请告知！
