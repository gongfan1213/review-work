好的，下面详细讲解**BM25**和**TF-IDF**两种文本相关性算法的原理、公式和在检索中的作用。

---

## 一、TF-IDF 算法

### 1. 基本思想

TF-IDF（Term Frequency-Inverse Document Frequency，词频-逆文档频率）是一种用于衡量一个词对一个文档的重要性的统计方法。它由两部分组成：

- **TF（词频）**：某个词在文档中出现的频率，反映词在该文档中的重要性。
- **IDF（逆文档频率）**：某个词在所有文档中出现的稀有程度，反映词的区分能力。

### 2. 公式

- **TF**  
  \( TF(t, d) = \frac{\text{词}t\text{在文档}d\text{中出现的次数}}{\text{文档}d\text{的总词数}} \)

- **IDF**  
  \( IDF(t, D) = \log\left(\frac{N}{n_t + 1}\right) + 1 \)  
  其中，\( N \) 是文档总数，\( n_t \) 是包含词 \( t \) 的文档数。

- **TF-IDF**  
  \( TF\text{-}IDF(t, d, D) = TF(t, d) \times IDF(t, D) \)

### 3. 应用

- 计算每个词对文档的权重，形成向量。
- 用于文档检索、文本分类、关键词提取等。

---

## 二、BM25 算法

### 1. 基本思想

BM25（Best Matching 25）是信息检索领域最常用的相关性排序算法之一，是对 TF-IDF 的改进。它考虑了词频饱和、文档长度归一化等因素，效果更好。

### 2. 公式

BM25 的核心公式如下：

\[
\text{BM25}(q, d) = \sum_{t \in q} IDF(t) \cdot \frac{f(t, d) \cdot (k_1 + 1)}{f(t, d) + k_1 \cdot (1 - b + b \cdot \frac{|d|}{\text{avgdl}})}
\]

- \( q \)：查询（query）
- \( d \)：文档
- \( t \)：查询中的词
- \( f(t, d) \)：词 \( t \) 在文档 \( d \) 中出现的次数
- \( |d| \)：文档 \( d \) 的长度（词数）
- \( \text{avgdl} \)：所有文档的平均长度
- \( k_1 \)、\( b \)：调节参数，常用 \( k_1=1.2 \sim 2.0 \)，\( b=0.75 \)
- \( IDF(t) \)：词 \( t \) 的逆文档频率，常用公式：
  \[
  IDF(t) = \log\left(\frac{N - n_t + 0.5}{n_t + 0.5} + 1\right)
  \]

### 3. 特点

- **词频饱和**：词频增加对分数的提升是递减的（不像 TF-IDF 线性增长）。
- **文档长度归一化**：长文档不会因为词多而分数异常高。
- **参数可调**：可根据实际场景调整 \( k_1 \) 和 \( b \)。

### 4. 应用

- 现代搜索引擎、问答系统的主流文本相关性排序算法。
- 适合大规模文本检索场景。

---

## 三、在 dify 项目中的应用

- **TF-IDF**：在加权融合精排（`WeightRerankRunner`）中用于计算 query 和文档的关键词相似度（见 `_calculate_keyword_score` 方法）。
- **BM25**：dify 也支持 BM25 作为关键词检索的底层算法（如倒排索引、全文检索等）。

---

## 四、代码片段举例（dify）

```python
# TF-IDF 余弦相似度
def cosine_similarity(vec1, vec2):
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum(vec1[x] * vec2[x] for x in intersection)
    sum1 = sum(vec1[x] ** 2 for x in vec1)
    sum2 = sum(vec2[x] ** 2 for x in vec2)
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    if not denominator:
        return 0.0
    else:
        return float(numerator) / denominator
```

---

## 五、总结

- **TF-IDF**：简单高效，适合小规模文本、关键词提取。
- **BM25**：更适合大规模检索，相关性排序效果更好，是现代搜索引擎的主流算法。

如需 BM25 或 TF-IDF 的具体实现代码或调优建议，可以进一步说明！
