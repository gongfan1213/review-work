# 三套 Agent 系统的记忆实现详细分析

## 🎯 概述

这三套 Agent 系统采用了不同的记忆实现策略，每种都有独特的设计理念和技术优势。通过深入分析代码，可以看出它们在记忆管理方面的创新之处。

## 🏗️ 记忆系统架构对比

### **1. Graph 系统：双层记忆架构**

#### **核心设计理念**
- **双层记忆**：短期记忆（消息存储）+ 中期记忆（向量存储）
- **智能压缩**：每6条中期记忆压缩成1条永久保留
- **语义检索**：基于向量相似度的知识发现
- **上下文增强**：记忆系统提升 Agent 理解能力

#### **技术实现**

**统一记忆管理器：**
```python
# agents/graph/memory/managers/unified_memory_manager.py
class UnifiedMemoryManager:
    """统一记忆管理器 - 基于消息的双层记忆系统"""
    
    def __init__(self):
        # 初始化存储组件
        self.message_store = MessageStore()  # 短期记忆：消息存储
        self.middle_memory_store = MilvusMiddleMemoryStore()  # 中期记忆：向量存储
        self.middle_memory_processor = MiddleMemoryProcessor()  # 中期记忆处理器
```

**双层记忆构建：**
```python
async def build_agent_context(self, user_id: str, session_id: str, current_query: str, agent_type: str):
    """
    构建Agent上下文 - 基于消息的双层记忆
    
    功能：每个agent处理前调用上下文工具：
    - 短期记忆：从数据库取最近10条消息（user、assistant、tool）
    - 中期记忆：根据instruction或query检索相关的中期记忆
    - 短期记忆 + 中期记忆 + system prompt = Agent调用的上下文
    """
    
    # 1. 获取短期记忆（最近10条消息）
    short_term_context = await self.message_store.get_recent_messages(
        user_id=user_id, session_id=session_id, limit=10
    )
    
    # 2. 获取中期记忆（根据query检索相关记忆）
    middle_term_memories = await self.middle_memory_store.search_relevant_memories(
        user_id=user_id, session_id=session_id, query=current_query, limit=5
    )
```

#### **记忆存储实现**

**短期记忆（消息存储）：**
```python
# agents/graph/memory/stores/message_store.py
class MessageStore:
    """统一消息存储器 - 管理chat_agent_message表"""
    
    async def get_recent_messages(self, user_id: str, session_id: str, limit: int = 10):
        """获取最近的消息记录 - 符合PRD要求的短期记忆"""
        
        # 按时间倒序获取最近的消息
        result = await self.client.table("chat_agent_message")
            .select("*")
            .eq("user_id", user_id)
            .eq("session_id", session_id)
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
```

**中期记忆（向量存储）：**
```python
# agents/graph/memory/stores/milvus_store.py
class MilvusMiddleMemoryStore:
    """Milvus中期记忆存储"""
    
    async def store_compressed_memory(self, user_id: str, session_id: str, agent_type: str, 
                                    compressed_summary: str, execution_context: Dict[str, Any], 
                                    relevance_keywords: List[str]):
        """存储压缩后的中期记忆"""
        
        # 生成embedding向量
        embedding_vector = await self.embedding_service.get_text_embedding(compressed_summary)
        
        # 存储到Milvus向量数据库
        memory_record = MiddleMemoryRecord(
            user_id=user_id, session_id=session_id, agent_type=agent_type,
            compressed_summary=compressed_summary, embedding_vector=embedding_vector,
            compression_level=1, is_permanent=False, source_memory_ids=[]
        )
```

### **2. Loomi 系统：Notes 知识管理**

#### **核心设计理念**
- **结构化知识**：Notes 系统结构化存储知识
- **智能引用**：支持 @Note 引用解析
- **自动选择**：根据 action 类型自动确定选择状态
- **Redis 优化**：使用 Redis INCR 原子操作生成 ID

#### **技术实现**

**Notes 系统管理：**
```python
# agents/loomi/base_loomi_agent.py
async def create_note(self, user_id: str, session_id: str, action: str, name: str, 
                     context: str, select: int = 0):
    """创建结构化知识点"""
    
    # 构建note数据
    note_data = {
        "action": action,
        "name": name,
        "context": context,
        "select": select,
        "created_at": datetime.now().isoformat()
    }
    
    # 存储到上下文管理器
    result = await self.context_manager.add_created_note(
        user_id=user_id, session_id=session_id, note=note_data
    )
```

**智能引用解析：**
```python
# agents/loomi/base_loomi_agent.py
async def resolve_note_references(self, text: str, user_id: str, session_id: str) -> str:
    """解析@Note引用，自动补充上下文信息"""
    
    # 查找所有@Note引用
    note_refs = re.findall(r'@(\w+)', text)
    
    for ref in note_refs:
        # 获取对应的note内容
        note = await self.get_note_by_name(user_id, session_id, ref)
        if note:
            # 替换引用为实际内容
            text = text.replace(f"@{ref}", f"[{note['context']}]")
    
    return text
```

**Redis 原子 ID 生成：**
```python
async def get_next_action_id(self, user_id: str, session_id: str, action: str) -> int:
    """获取会话内某个action类型的下一个可用ID（按action类型递增）"""
    
    # 构建Redis key，按action类型区分
    redis_key = f"action_id:{user_id}:{session_id}:{action}"
    
    # 使用Redis INCR操作获取下一个ID（原子操作，并发安全）
    redis_client = await self._get_redis_client()
    next_id = await redis_client.incr(redis_key)
    
    # 设置过期时间（24小时），避免Redis内存无限累积
    await redis_client.expire(redis_key, 86400)
    
    return next_id
```

#### **上下文管理器：**
```python
# utils/loomi_context_manager.py
class LoomiContextManager:
    """Loomi多智能体上下文管理器"""
    
    def __init__(self):
        self.logger = BluePlanLogger("loomi_context_manager")
        self.connection_pool_manager = None
        self.persistence_enabled = True
        
    async def _get_redis_client(self):
        """获取Redis客户端（使用连接池管理器）"""
        if self.connection_pool_manager is None:
            self.connection_pool_manager = await get_connection_pool_manager()
        
        # Loomi核心上下文管理属于高优先级操作
        return await self.connection_pool_manager.get_redis_client('high_priority')
```

### **3. Nova3 系统：三层存储架构**

#### **核心设计理念**
- **三层存储**：内存 → Redis → 本地文件
- **状态持久化**：确保任务永不丢失
- **性能优化**：内存优先，Redis 共享，文件兜底
- **容错机制**：任意层级故障都有备用方案

#### **技术实现**

**三层存储管理器：**
```python
# agents/nova3/layered_queue_manager.py
class LayeredQueueManager:
    """
    三层队列管理器
    
    存储层级：
    L1: 内存缓存 (最快访问，容量有限)
    L2: Redis缓存 (分布式共享，中等速度)  
    L3: 本地文件 (持久化存储，容量大)
    
    工作流程：
    - 读取：内存 -> Redis -> 文件
    - 写入：同时写入所有层级
    - 清理：定期清理过期数据
    """
    
    def __init__(self, persist_dir: str = "data/nova3_queues"):
        # L1: 内存缓存
        self.memory_cache: Dict[str, Any] = {}
        self.cache_lock = threading.RLock()
        
        # L2: Redis缓存
        self.redis_client: Optional[aioredis.Redis] = None
        self.redis_available = False
        
        # L3: 文件存储
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
```

**读取策略（内存优先）：**
```python
async def get_queue(self, user_id: str, session_id: str) -> Optional[TaskQueue]:
    """获取队列 - 三层读取策略"""
    
    queue_key = self._generate_queue_key(user_id, session_id)
    
    # L1: 尝试从内存获取
    queue = self._get_from_memory(queue_key)
    if queue:
        self.stats["memory_hits"] += 1
        return queue
    
    # L2: 尝试从Redis获取
    queue = await self._get_from_redis(queue_key)
    if queue:
        self.stats["redis_hits"] += 1
        # 回写到内存缓存
        self._store_to_memory(queue_key, queue)
        return queue
    
    # L3: 尝试从文件获取
    queue = await self._get_from_file(queue_key)
    if queue:
        self.stats["file_hits"] += 1
        # 回写到Redis和内存
        await self._store_to_redis(queue_key, queue)
        self._store_to_memory(queue_key, queue)
        return queue
    
    return None
```

**写入策略（同时写入）：**
```python
async def store_queue(self, queue: TaskQueue) -> bool:
    """存储队列 - 同时写入所有层级"""
    
    queue_key = self._generate_queue_key(queue.user_id, queue.session_id)
    success_count = 0
    
    try:
        # L1: 写入内存
        if self._store_to_memory(queue_key, queue):
            success_count += 1
        
        # L2: 写入Redis
        if await self._store_to_redis(queue_key, queue):
            success_count += 1
        
        # L3: 写入文件
        if await self._store_to_file(queue_key, queue):
            success_count += 1
        
        # 至少写入一层成功才算成功
        return success_count > 0
        
    except Exception as e:
        self.logger.error(f"存储队列失败: {e}")
        self.stats["write_errors"] += 1
        return False
```

## 🚀 记忆系统创新点

### **1. Graph 系统创新**

#### **双层记忆架构**
- **短期记忆**：最近10条消息，提供即时上下文
- **中期记忆**：向量存储的任务总结，支持语义检索
- **智能压缩**：每6条中期记忆压缩成1条永久保留

#### **语义检索能力**
```python
async def search_relevant_memories(self, user_id: str, session_id: str, query: str, limit: int = 20):
    """搜索相关的中期记忆"""
    
    # 生成查询向量
    query_vector = await self.embedding_service.get_text_embedding(query)
    
    # 执行向量搜索
    results = await self.client.search(
        collection_name=self.collection_name,
        data=[query_vector],
        limit=limit,
        search_params=search_params,
        filter=f'user_id == "{user_id}" && session_id == "{session_id}"'
    )
```

### **2. Loomi 系统创新**

#### **结构化知识管理**
- **Notes 系统**：结构化存储知识点
- **智能引用**：支持 @Note 引用解析
- **自动选择**：根据 action 类型自动确定选择状态

#### **Redis 原子操作**
```python
async def get_next_action_id(self, user_id: str, session_id: str, action: str) -> int:
    """使用Redis INCR原子操作生成唯一ID"""
    
    redis_key = f"action_id:{user_id}:{session_id}:{action}"
    redis_client = await self._get_redis_client()
    next_id = await redis_client.incr(redis_key)  # 原子操作，并发安全
    await redis_client.expire(redis_key, 86400)   # 24小时后自动清理
    
    return next_id
```

### **3. Nova3 系统创新**

#### **三层存储架构**
- **L1 内存**：最快访问，容量有限
- **L2 Redis**：分布式共享，中等速度
- **L3 文件**：持久化存储，容量大

#### **智能缓存策略**
```python
def _get_from_memory(self, queue_key: str) -> Optional[Any]:
    """从内存获取队列"""
    with self.cache_lock:
        if queue_key in self.memory_cache:
            cache_item = self.memory_cache[queue_key]
            
            # 检查TTL
            if time.time() - cache_item["timestamp"] < self.memory_cache_ttl_hours * 3600:
                self.stats["memory_hits"] += 1
                return cache_item["data"]
            else:
                # TTL过期，从内存中移除
                del self.memory_cache[queue_key]
        
        self.stats["memory_misses"] += 1
        return None
```

## 🎯 记忆系统对比分析

### **1. 存储策略对比**

| 系统 | 存储层级 | 主要特点 | 优势 | 劣势 |
|------|----------|----------|------|------|
| **Graph** | 双层存储 | 短期消息 + 中期向量 | 语义检索能力强 | 复杂度较高 |
| **Loomi** | 单层存储 | Notes 结构化存储 | 知识管理清晰 | 缺乏语义检索 |
| **Nova3** | 三层存储 | 内存 + Redis + 文件 | 容错性强 | 实现复杂 |

### **2. 检索能力对比**

#### **Graph 系统**
- ✅ **语义检索**：基于向量相似度
- ✅ **上下文增强**：双层记忆提供丰富上下文
- ✅ **智能压缩**：自动压缩和永久保留

#### **Loomi 系统**
- ✅ **结构化检索**：基于 action 和 name 的精确检索
- ✅ **引用解析**：支持 @Note 智能引用
- ✅ **自动选择**：根据类型自动确定选择状态

#### **Nova3 系统**
- ✅ **快速检索**：内存优先的读取策略
- ✅ **容错检索**：多层备份确保数据不丢失
- ✅ **分布式检索**：Redis 支持分布式访问

### **3. 性能优化对比**

#### **Graph 系统**
```python
# 智能压缩策略
async def process_agent_completion(self, user_id: str, session_id: str, agent_type: str, 
                                 task_summary: str, task_context: Dict[str, Any]):
    """每新增6条中期记忆，压缩成1条永久保留"""
    
    # 检查是否需要压缩
    if len(memories) >= 6:
        # 执行压缩操作
        compressed_memory = await self.compress_memories(memories)
        # 删除原始记忆，保留压缩版本
        await self.delete_memories(original_ids)
```

#### **Loomi 系统**
```python
# Redis 原子操作优化
async def get_next_action_id(self, user_id: str, session_id: str, action: str) -> int:
    """使用Redis INCR原子操作，避免分布式锁"""
    
    redis_key = f"action_id:{user_id}:{session_id}:{action}"
    next_id = await redis_client.incr(redis_key)  # 原子操作，并发安全
    await redis_client.expire(redis_key, 86400)   # 自动清理
    
    return next_id
```

#### **Nova3 系统**
```python
# 三层缓存优化
async def get_queue(self, user_id: str, session_id: str) -> Optional[TaskQueue]:
    """内存 -> Redis -> 文件的读取策略"""
    
    # L1: 内存缓存（最快）
    queue = self._get_from_memory(queue_key)
    if queue: return queue
    
    # L2: Redis缓存（中等）
    queue = await self._get_from_redis(queue_key)
    if queue:
        self._store_to_memory(queue_key, queue)  # 回写内存
        return queue
    
    # L3: 文件存储（兜底）
    queue = await self._get_from_file(queue_key)
    if queue:
        await self._store_to_redis(queue_key, queue)  # 回写Redis
        self._store_to_memory(queue_key, queue)       # 回写内存
        return queue
```

## 🏆 技术创新总结

### **1. 架构创新**
- **Graph**：双层记忆 + 语义检索 + 智能压缩
- **Loomi**：结构化知识 + 智能引用 + Redis 原子操作
- **Nova3**：三层存储 + 容错机制 + 性能优化

### **2. 技术突破**
- **语义检索**：基于向量相似度的知识发现
- **智能压缩**：自动压缩和永久保留机制
- **原子操作**：Redis INCR 避免分布式锁
- **多层缓存**：内存优先的读取策略

### **3. 工程化优势**
- **可扩展性**：支持大规模数据存储和检索
- **容错性**：多层备份确保数据不丢失
- **性能优化**：智能缓存和原子操作
- **维护性**：清晰的架构和模块化设计

## 🎯 结论

这三套系统的记忆实现各有特色：

1. **Graph 系统**专注于**语义检索和上下文增强**，通过双层记忆和向量搜索提供强大的知识发现能力
2. **Loomi 系统**专注于**结构化知识管理**，通过 Notes 系统和智能引用提供清晰的知识组织
3. **Nova3 系统**专注于**状态持久化和容错**，通过三层存储确保任务永不丢失

每种实现都针对不同的应用场景和需求，共同构成了完整的 AI Agent 记忆生态系统。这些创新为 AI Agent 系统的记忆管理提供了重要的技术参考和实践经验。
