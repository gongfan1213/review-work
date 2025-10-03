我先在代码中定位异步多 Agent 调度的关键实现位置（编排器中的并发执行、信号量限流、任务分组与合并，以及事件流转发），然后给出带行号的代码引用与简要说明。

[1 tool called]

下面结合代码，按“并发调度链路 → 限流策略 → 任务分组与合并 → 事件流转发”的顺序，详细解析该项目如何实现异步多 Agent 调度。

### 1) 并发调度的入口与整体流程
- 由编排器 `LoomiOrchestrator` 在 ReAct 决策后，进入并发执行阶段，核心方法为 `_execute_parallel_actions(...)`。
- 关键职责：
  - 解析每条指令的引用
  - 预热连接池
  - 构建每个 Agent 的执行协程
  - 并发启动、先完成先处理
  - 同类合并、分阶段转发结果

代码引用（并发入口与前置准备）:
```1093:1481:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
async def _execute_parallel_actions(...):
  # 连接池预热
  await self._prewarm_connection_pools(user_id, session_id)

  # 解析每个指令的引用
  resolved_instructions = []
  for action_type, original_instruction in execute_matches:
      resolved_instruction = await self.reference_resolver.resolve_references(...)
      resolved_instructions.append((action_type, original_instruction, resolved_instruction))

  # 统计、打印与并发限制提示
  total_agents = len(optimized_instructions)
  if total_agents > self.max_concurrent_agents:
      self.logger.warning("将分批执行")

  # 发送初始 plan 事件
  async for plan_event in self._send_initial_plan_events(...):
      yield plan_event
```

### 2) 限流策略：信号量控制单协程的并发进入
- 为每个待执行的 action 构建协程 `execute_single_agent_stream(...)`。
- 用 `async with self.agent_semaphore` 实现“同时最多 N 个 Agent 进入执行”的限流，避免资源耗尽。
- 协程内部：构造 Agent → 传入请求 → 迭代其 `process_request(...)` 的事件流 → 收集并返回执行结果。

代码引用（单任务协程 + 信号量）:
```1159:1255:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
async def execute_single_agent_stream(action_type, resolved_instruction, original_instruction):
  async with self.agent_semaphore:
      agent = self._create_agent_by_type(action_type)
      request_data = {...}
      collected_events, nova3_events, nova3_ready = [], [], False

      async for event in agent.process_request(request_data):
          collected_events.append(event)
          # 特殊类型（nova3_*）事件就绪即提前返回
          if content_type_str.startswith('nova3_'):
              nova3_events.append(event)
              nova3_ready = True
              break

      return {'action_type': action_type, 'events': collected_events, 'nova3_events': nova3_events,
              'has_nova3_ready': nova3_ready, 'early_return': nova3_ready, ...}
```

要点：
- 信号量用于“入口限流”，每个任务内部仍是完整的流式消费。
- 针对 `nova3_*` 事件做了“就绪即提前返回”的快速路径，确保用户感知到首屏速度。

### 3) 任务并发启动与“先完成先处理”
- 将每个 `execute_single_agent_stream(...)` 作为协程任务放入 `tasks`。
- 项目采用 gather 执行，但通过结构化分两类处理：
  - 独立任务：先并行 gather 完成，再按顺序输出（首个直接输出，后续有“plan+延时+结果”的节奏控制）
  - 合并任务：按 action_type 分组后，并发 gather 同类，全部结束再进行合并输出

代码引用（任务构建与分组）:
```1260:1330:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
tasks = [execute_single_agent_stream(...), ...]
task_groups = {action_type: [{ 'task': tasks[i], ... } ...]}

# 分类：独立任务 vs 需要合并的任务
if action_type not in self.mergeable_actions or len(group_tasks) == 1:
    individual_task_futures.append(task_future)
else:
    mergeable_groups[action_type] = group_tasks
```

并发执行与有序输出（独立任务）:
```1331:1413:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
# 并行执行所有独立任务
individual_results = await asyncio.gather(*individual_task_futures, return_exceptions=True)

# 有序输出：第一个直接，后续（plan → 10s 间隔 → 结果）
for i, action_type in enumerate(individual_task_action_types):
    if not first_task_output:
        plan_event = await self._create_plan_event(...)
        yield plan_event
        if action_type not in self.no_interval_agent_types:
            await asyncio.sleep(self.output_interval)
    # 输出结果（优先转发 nova3 事件）
    if has_nova3_ready and nova3_events:
        for e in nova3_events: yield e
    for e in other_events: yield e
    first_task_output = False
```

并发执行与合并输出（同类任务）:
```1416:1459:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
# 同类任务并发等待
results = await asyncio.gather(*tasks_to_await, return_exceptions=True)

# 合并相同类型的结果
merged_events = await self._merge_same_type_results(action_type, group_results)
for event in merged_events:
    yield event
```

### 4) 合并规则与事件转发
- 同类合并逻辑在 `_merge_same_type_results(...)`：将每个 Agent 的事件按类别（思考、结果、其他）分类，做聚合/拼接，最终产出合并后的事件列表，逐一转发给前端。
- 独立任务则直接将其 `process_request` 收到的事件按优先级（nova3 → 其他）转发。

代码引用（合并实现骨架）:
```1484:1519:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
async def _merge_same_type_results(action_type, results):
  all_thought_events, all_result_events, other_events = [], [], []
  for result in results:
      for event in result['events']:
          if not event.payload or not event.payload.content_type:
              other_events.append(event); continue
          content_type_value = event.payload.content_type.value
          if content_type_value in ['thought', 'nova3_observe_think']:
              all_thought_events.append(event)
          elif ...:
              all_result_events.append(event)
  # 组装 merged_events 并返回
```

### 5) 资源层面的“并发前预热”
- 在并发启动前，调用 `_prewarm_connection_pools(...)` 对 Redis 等连接进行“高优先级/普通”池的预热，减少首次连接抖动，提升并发稳定性。

代码引用（连接池预热）:
```1100:1103:/Users/gongfan/Desktop/未命名文件夹/blueplan-research-dev-langgraph22/agents/loomi/orchestrator.py
await self._prewarm_connection_pools(user_id, session_id)
```

### 6) 设计取舍与效果
- 信号量保证并发上限，避免 IO/外部服务资源打爆。
- 通过“就绪即转发”的快速路径让关键内容（nova3）更快首屏。
- 分类为“独立任务”和“可合并任务”，分别优化用户节奏感（plan+间隔）与结果汇总质量（同类合并）。
- 前置 plan 事件与阶段性输出，兼顾可见度和交互体验。

---

结论与建议：
- 该实现采用“协程 + 信号量 + gather + 类型分治”的标准异步并发范式，工程化细节较完善（连接池预热、统计监控、异常兜底）。
- 若要进一步优化：
  - individual 分支可考虑 `asyncio.as_completed` 做真正“先完成先输出”，提升实时性。
  - 为合并任务设置“最早首帧”策略：先转发第一份结果，再在其后插入“合并版”的最终总结。
  - 将 nova3 快路径抽象为策略钩子，便于扩展其它高优先级事件类型。
