我来详细分析这个BluePlan Research系统中三套Agent系统是如何支持多轮对话的。让我先探索相关的多轮对话机制。


[6 tools called]

基于我对代码的深入分析，我来详细解释这个BluePlan Research系统中三套Agent系统是如何支持多轮对话的：

## 🗣️ **多轮对话支持架构**

这个系统采用了**分层、多维度**的多轮对话管理架构，确保每套Agent系统都能维护完整的对话上下文和状态。

## 🏗️ **1. 会话级Agent管理**

### **SessionAgentManager - 会话隔离**
```python
class SessionAgentManager:
    """会话级Agent管理器"""
    
    def __init__(self):
        self._nova3_agents: Dict[str, Nova3Supervisor] = {}  # session_id -> agent
        self._loomi_agents: Dict[str, LoomiConcierge] = {}   # session_id -> agent
        self._lock = asyncio.Lock()
    
    async def get_nova3_supervisor(self, user_id: str, session_id: str) -> Nova3Supervisor:
        """获取会话专用的Nova3Supervisor实例"""
        async with self._lock:
            session_key = f"{user_id}:{session_id}"
            
            if session_key not in self._nova3_agents:
                # 为这个会话创建新的agent实例
                self._nova3_agents[session_key] = Nova3Supervisor()
                self.logger.info(f"🆕 创建Nova3Supervisor实例: {session_key}")
            else:
                self.logger.debug(f"🔄 复用Nova3Supervisor实例: {session_key}")
            
            return self._nova3_agents[session_key]
```

**核心特性**：
- **会话隔离**：每个`user_id:session_id`组合都有独立的Agent实例
- **状态保持**：Agent实例在会话期间保持状态，支持多轮对话
- **线程安全**：使用`asyncio.Lock`确保并发安全

## 📊 **2. 上下文状态管理**

### **ContextState - 多维度状态存储**
```python
@dataclass
class ContextState:
    """上下文状态数据结构"""
    session_id: str
    user_id: str
    thread_id: str
    current_step: int
    total_steps: int
    global_context: Dict[str, Any]        # 全局上下文
    agent_contexts: Dict[str, Any]        # 各agent的上下文
    shared_memory: Dict[str, Any]         # 共享内存
    conversation_history: List[Dict[str, Any]]  # 对话历史
    research_findings: Dict[str, Any]     # 研究发现
    created_at: str
    updated_at: str
```

### **LoomiContextState - 专业化状态管理**
```python
@dataclass
class LoomiContextState:
    """Loomi上下文状态数据结构"""
    session_id: str
    user_id: str
    thread_id: str
    
    # Loomi特有的上下文结构
    user_message_queue: List[Dict[str, Any]]    # 用户消息队列
    orchestrator_calls: List[Dict[str, Any]]    # orchestrator调用记录
    created_notes: List[Dict[str, Any]]         # 创建的notes
    
    # 通用上下文
    global_context: Dict[str, Any]
    agent_contexts: Dict[str, Any]
    shared_memory: Dict[str, Any]
    conversation_history: List[Dict[str, Any]]  # 对话历史
```

## 🔄 **3. 对话历史追踪**

### **对话消息记录**
```python
async def add_conversation_message(
    self, 
    user_id: str, 
    session_id: str, 
    role: str, 
    content: str,
    agent_source: Optional[str] = None
) -> bool:
    """添加对话消息到历史记录"""
    context_state = await self.get_context(user_id, session_id)
    if not context_state:
        return False
    
    message = {
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat(),
        "agent_source": agent_source,
        "step": context_state.current_step
    }
    
    context_state.conversation_history.append(message)
    
    await self._save_context(context_state)
    self._context_cache[f"{user_id}:{session_id}"] = context_state
    
    return True
```

### **上下文格式化用于提示词**
```python
async def format_context_for_prompt(
    self,
    user_id: str,
    session_id: str,
    agent_name: str,
    include_conversation: bool = True,
    include_research_findings: bool = True,
    include_shared_memory: bool = True,
    max_context_length: int = 2000
) -> str:
    """格式化上下文用于提示词"""
    
    # 2. 对话历史（最近几轮）
    if include_conversation and context_state.conversation_history:
        recent_msgs = context_state.conversation_history[-5:]  # 最近5轮对话
        if recent_msgs:
            context_parts.append("最近对话:")
            for i, msg in enumerate(recent_msgs):
                role = "用户" if msg.get("role") == "user" else "AI"
                content = msg.get("content", "")
                if len(content) > 100:
                    content = content[:100] + "..."
                context_parts.append(f"  {role}: {content}")
```

## 💾 **4. 多层持久化策略**

### **Redis + PostgreSQL双重存储**
```python
async def get_context(self, user_id: str, session_id: str) -> Optional[LoomiContextState]:
    """获取上下文状态（Redis优先，数据库fallback）"""
    
    # 1. 尝试从Redis获取
    redis_key = self._get_context_key(user_id, session_id)
    try:
        redis_client = await self._get_redis_client()
        context_data = await redis_client.get(redis_key)
        
        if context_data:
            context_dict = json.loads(context_data)
            context_state = LoomiContextState(**context_dict)
            self.logger.debug(f"📡 Redis命中: {user_id}:{session_id}")
            return context_state
    except Exception as e:
        self.logger.warning(f"⚠️ Redis访问失败: {e}")
    
    # 2. 从数据库恢复
    context_from_db = await self._load_context_from_db(user_id, session_id)
    if context_from_db:
        # 监控告警：Redis失效
        self.logger.error(f"🚨 Redis失效，数据库恢复: {user_id}:{session_id}")
        
        # 立即同步到Redis缓存
        try:
            context_json = json.dumps(asdict(context_from_db), ensure_ascii=False)
            await redis_client.set(redis_key, context_json, expire=3600 * 24 * 3)
            self.logger.info(f"💾 已同步到Redis缓存")
        except Exception as e:
            self.logger.error(f"❌ Redis缓存同步失败: {e}")
        
        return context_from_db
```

## 🎯 **5. 三套系统的多轮对话实现**

### **Nova3系统 - 研究导向对话**
```python
async def process_request(
    self, 
    request_data: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None
) -> AsyncGenerator[StreamEvent, None]:
    """处理用户请求的主入口"""
    
    # 🔧 初始化或获取上下文管理
    context_state = await context_manager.get_context(user_id, session_id)
    if not context_state:
        # 创建新的上下文
        context_state = await context_manager.create_context(
            user_id=user_id,
            session_id=session_id,
            initial_query=query,
            total_steps=1
        )
        self.logger.info(f"✅ 创建新上下文: thread_id={context_state.thread_id}")
    else:
        # 添加新的对话消息
        await context_manager.add_conversation_message(
            user_id=user_id,
            session_id=session_id,
            role="user",
            content=query
        )
        self.logger.info(f"🔄 恢复现有上下文: thread_id={context_state.thread_id}")
```

### **Loomi系统 - 任务编排对话**
```python
async def process_request(
    self,
    request_data: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None
) -> AsyncGenerator[Union[StreamEvent, str], None]:
    """处理用户请求"""
    
    # 🔄 【上下文与对话管理】获取或创建会话上下文
    context_state = await self.get_context(user_id, session_id)
    if not context_state:
        # 创建新的上下文
        context_state = await self.create_context(
            user_id=user_id,
            session_id=session_id,
            initial_query=query
        )
        self.logger.info(f"🔄 创建新的会话上下文: user_id={user_id}, session_id={session_id}")
    else:
        # 添加新的用户消息到对话历史
        add_message_result = await self.add_user_message(user_id, session_id, query)
        self.logger.info(f"🔄 更新对话历史，添加用户消息，结果: {add_message_result}")
```

### **LangGraph Studio系统 - 状态驱动对话**
```python
class ContentWritingState(TypedDict, total=False):
    """文案撰写工作流状态 - 新增专属上下文结构"""
    user_id: str
    session_id: str
    
    # 工作流控制
    current_stage: WorkflowStage
    workflow_plan: Optional[List[Dict[str, Any]]]
    round_count: int  # 当前轮次计数
    
    # 分层上下文管理
    global_context: List[GlobalContextItem]
    supervisor_context: List[Dict[str, Any]]
    requirement_alignment_context: List[AgentContextItem]
    content_search_context: List[AgentContextItem]
    content_writing_context: List[AgentContextItem]
    
    # 各Agent历次输出存储
    requirement_alignment_outputs: List[Dict[str, Any]]
    content_search_outputs: List[Dict[str, Any]]
    content_writing_outputs: List[Dict[str, Any]]
```

## 🔄 **6. 异步会话管理**

### **AsyncSessionManager - 高性能会话管理**
```python
class AsyncSessionManager:
    """异步会话管理器 - 基于AsyncIO的高性能版本"""
    
    def __init__(self):
        self._sessions: Dict[str, AsyncSessionInfo] = {}
        self._lock = asyncio.Lock()
        
    async def create_session(self, session_id: str, user_id: str, request: "GraphChatRequest") -> AsyncSessionInfo:
        """创建新的异步会话"""
        async with self._lock:
            # 如果session已存在，先停止它
            if session_id in self._sessions:
                logger.warning(f"⚠️ Session {session_id} 已存在，将停止现有会话")
                await self._stop_session_internal(session_id)
            
            # 创建会话信息
            session_info = AsyncSessionInfo(session_id, user_id)
            
            # 创建异步任务执行图
            session_info.task = asyncio.create_task(
                self._execute_graph_async(session_info, request),
                name=f"session-{session_id}-{int(time.time())}"
            )
            
            self._sessions[session_id] = session_info
            logger.info(f"✅ 创建异步会话: {session_id}, task: {session_info.task.get_name()}")
            
            return session_info
```

## 🧠 **7. 智能引用系统**

### **@引用解析与上下文关联**
```python
def _resolve_at_references_sync(self, at_references: List[str], user_id: str, session_id: str) -> List[Dict[str, Any]]:
    """同步解析@引用"""
    resolved_references = []
    
    for ref in at_references:
        # 从Redis获取引用内容
        ref_content = redis_client.get(f"session:{session_id}:ref:{ref}")
        if ref_content:
            try:
                parsed_content = json.loads(ref_content)
                resolved_references.append({
                    "ref_id": ref,
                    "content": parsed_content.get("content", ""),
                    "title": parsed_content.get("title", ""),
                    "type": parsed_content.get("type", "")
                })
            except json.JSONDecodeError:
                resolved_references.append({
                    "ref_id": ref,
                    "content": ref_content,
                    "title": f"Reference {ref}",
                    "type": "unknown"
                })
    
    return resolved_references
```


[1 tool called]

## 🚀 **多轮对话系统的核心优势**

### **1. 会话隔离与状态保持**
- **独立Agent实例**：每个会话都有专用的Agent实例，避免状态污染
- **完整上下文保持**：从对话历史到研究发现，所有状态都被完整保存
- **跨轮次引用**：支持`@insight1`、`@profile2`等跨轮次的内容引用

### **2. 多层存储与高可用性**
- **Redis缓存**：毫秒级响应，支持高频访问
- **PostgreSQL持久化**：数据安全，支持复杂查询
- **自动故障恢复**：Redis失效时自动从数据库恢复

### **3. 智能上下文管理**
- **分层上下文**：全局上下文、Agent上下文、共享内存分层管理
- **动态上下文注入**：根据Agent类型和任务需求动态构建上下文
- **上下文压缩**：智能截断和摘要，避免token溢出

### **4. 异步高性能**
- **AsyncSessionManager**：基于AsyncIO的高性能会话管理
- **并发安全**：使用锁机制确保多用户并发安全
- **资源管理**：自动清理过期会话，防止内存泄漏

### **5. 专业化对话模式**
- **Nova3**：研究导向，支持复杂的多步骤研究流程
- **Loomi**：任务编排，支持ReAct模式的动态任务执行
- **LangGraph Studio**：状态驱动，支持可视化的工作流调试

这套多轮对话系统实现了**会话隔离**、**状态保持**、**智能引用**、**高性能并发**的完美结合，为用户提供了连贯、智能、高效的对话体验。
