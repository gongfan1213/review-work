我先在代码里检索是否有直接提到 ReWOO 或类似实现的线索，然后结合 Loomi 的 Concierge/Orchestrator 流程判断其范式。随后我会给出结论与差异点。
Ran tool

我先全局检索是否有直接提到 ReWOO 或 ReAct 的实现痕迹，然后结合 Loomi 的 Concierge/Orchestrator 流水线判断范式。
Ran tool

我先在代码中全局检索是否存在“ReWOO”相关实现以及 Loomi 是否采用计划-执行解耦的范式，然后给出结论。
Ran tool

不是，Loomi 走的是 ReAct 范式，不是 ReWOO。

- 证据
```893:898:apis/routes.py
    Loomi系统特点：
    1. 使用Concierge接待员理解用户需求并创建Notes
    2. 通过Orchestrator进行ReAct模式的任务编排
    3. 具备洞察、画像、打点、写作等专业能力
```

- 核心差异
  - ReAct: 思考-行动-观察 逐步交替，串行决策与工具调用。
  - ReWOO: 先全局“规划-生成计划”，再并行执行工具收集证据，最后“求解-整合答案”。强调 Planner/Worker/Solver 解耦与并行证据收集。

- 结论
  - Loomi 的 `Concierge → Orchestrator` 更像“需求澄清 + ReAct 编排”的流水线，没有独立 Planner 产出可执行计划并行跑证据的 ReWOO 流程。

如果需要改造成 ReWOO，需要新增：
- Planner（生成可执行计划+依赖图）
- Evidence Runner（并行工具调用与证据缓存）
- Solver（基于证据生成最终答复与引用）
- 流式协议与 `schemas` 补充 plan/evidence/citation 事件类型
