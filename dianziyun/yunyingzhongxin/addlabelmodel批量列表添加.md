让我为您详细讲解这个 <mcsymbol name="AddLabelModal" filename="addLabelModal.tsx" path="d:\code\console-plugin-resource-center\src\pages\resourceList\components\addLabelModal.tsx" startline="19" type="function"></mcsymbol> 组件的逻辑：

### 1. 状态管理
组件维护了多个状态：
- `labelValueList`: 标签值列表
- `addableResouceData`: 可添加标签的资源列表
- `notAddableResouceData`: 不可添加标签的资源列表
- `labelKey`: 选中的标签键
- `labelKeyValue`: 标签键选择器的值
- `labelValue`: 选中的标签值
- `labelFull`: 是否存在标签已满的资源
- `loading`: 加载状态
- `expand`: 是否展开不可添加标签的资源列表
- `labelKeyList`: 标签键列表

### 2. 主要功能函数

#### 2.1 数据获取
1. `getTagKey()`: 
   - 获取可编辑的标签列表
   - 根据部门ID路径筛选
   - 处理返回数据并更新 `labelKeyList`

2. `getLabelValue()`:
   - 根据选中的标签键获取对应的标签值列表
   - 更新 `labelValueList`

3. `getResourceList()`:
   - 处理传入的资源列表
   - 将资源分为两类：
     - 可添加标签的资源（标签数量≤9）
     - 不可添加标签的资源（标签数量>9）
   - 更新相应的状态

#### 2.2 操作处理
1. `BindResource()`:
   - 执行批量绑定标签操作
   - 成功后：
     - 显示成功提示
     - 清空相关状态
     - 调用刷新回调
   - 失败则显示错误信息

2. `onCancel()`:
   - 关闭弹窗
   - 重置所有相关状态

### 3. 生命周期处理
- `useEffect`: 当 props.item 变化时重新获取资源列表
- `useUpdateEffect`: 当标签键变化时获取对应的标签值列表
- `afterOpen`: 弹窗打开时获取标签键列表

### 4. UI 结构
1. 弹窗头部：标题为"批量添加标签"
2. 弹窗内容：
   - 提示信息（Alert组件）
   - 标签选择区域
     - 标签键选择器（LabelKeySelector）
     - 标签值选择器（Select）
   - 可添加标签的资源列表（Table）
   - 不可添加标签的资源列表（可展开/收起）
3. 弹窗底部：
   - 取消按钮
   - 确认按钮（在以下情况禁用：
     - 存在标签已满的资源
     - 未选择标签键
     - 未选择标签值）

### 5. 数据展示
表格列包含：
- 资源名称/ID（超长时显示省略号和悬浮提示）
- 租户
- 部门
- 所属云产品
- 资源类型

这个组件主要用于批量为资源添加标签，同时考虑了资源标签数量的限制（最多10个），并提供了友好的用户交互界面。
