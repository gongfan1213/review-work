# evaluator.ts 模块技术文档

## 模块简介

`evaluator.ts` 提供了多种自动化问答评测工具，支持对答案的完整性、权威性、时效性、多样性等维度进行评估，广泛应用于智能问答系统、知识库问答质量控制等场景。

---

## 主要导出接口

- `evaluateQuestion(question, trackers, schemaGen): Promise<EvaluationType[]>`
  - 对问题进行多维度评估，返回评测类型数组。
- `evaluateAnswer(question, action, evaluationTypes, trackers, allKnowledge, schemaGen): Promise<EvaluationResponse>`
  - 对答案进行指定类型的评测，返回评测结果。

---

## 主要参数说明
- `question`：待评测的问题文本。
- `action`：答案对象，包含 answer 字段。
- `evaluationTypes`：评测类型数组，如完整性、权威性、时效性等。
- `trackers`：追踪上下文对象。
- `allKnowledge`：知识项数组。
- `schemaGen`：Schema 生成器。

---

## 典型用法
```ts
import { evaluateAnswer } from './evaluator';
const result = await evaluateAnswer(
  '什么是量子计算？',
  { answer: '量子计算是一种利用量子力学原理进行信息处理的计算方式。' },
  ['completeness', 'definitiveness'],
  trackers,
  knowledgeList,
  schemaGen
);
console.log(result);
```

---

## 应用场景
- 智能问答系统自动化评测
- 知识库问答质量控制
- 多维度答案质量分析

---

## 注意事项
- 评测依赖于 prompt 设计和外部大模型能力，结果仅供参考。
- 支持多种评测类型，可根据实际需求灵活组合。 