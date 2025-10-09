### 缺陷描述

- **问题发现时间**：11-21
- **前置条件**：打开templates页
- **操作步骤**：
  1. 点击筛选按钮
- **实际结果**：Confirm按钮高亮
- **预期结果**：Confirm按钮默认置灰
- **手机型号&系统版本**：未提供
- **测试环境**：QA
- **其他信息**：无

### 缺陷分析

在测试过程中发现，当用户点击筛选按钮时，Confirm按钮默认是高亮的。根据预期结果，Confirm按钮应该在没有选择任何筛选条件时默认置灰。

### 修改方案

为了修复这个问题，我们需要确保在没有选择任何筛选条件时，Confirm按钮是置灰的。具体修改如下：

1. **确保Confirm按钮的`disabled`属性根据筛选条件的状态动态更新**。

### 修改后的代码

#### 原始代码

```jsx
<ButtonPublic
  variant='greenWhite'
  style={{ width: '49%' }}
  disabled={activeForm?.product?.length === 0 && activeForm?.tags?.length === 0}
  onClick={() => { ConfirmClick(activeForm) }}
>
  Confirm
</ButtonPublic>
```

#### 修改后的代码

```jsx
<ButtonPublic
  variant='greenWhite'
  style={{ width: '49%' }}
  disabled={!activeForm?.product?.length && !activeForm?.tags?.length}
  onClick={() => { ConfirmClick(activeForm) }}
>
  Confirm
</ButtonPublic>
```

### 解释

1. **`disabled`属性**：
   - 修改前：`disabled={activeForm?.product?.length === 0 && activeForm?.tags?.length === 0}`
     - 这个条件在某些情况下可能会导致按钮高亮，因为它要求`product`和`tags`都为空时才置灰。
   - 修改后：`disabled={!activeForm?.product?.length && !activeForm?.tags?.length}`
     - 这个条件更明确地表示，当`product`和`tags`都为空时，按钮才置灰。

### 整理的工作内容

1. **问题发现时间**：11-21
2. **前置条件**：打开templates页
3. **操作步骤**：
   - 点击筛选按钮
4. **实际结果**：Confirm按钮高亮
5. **预期结果**：Confirm按钮默认置灰
6. **手机型号&系统版本**：未提供
7. **测试环境**：QA
8. **其他信息**：无

### 代码修改

#### 修改后的代码

```jsx
<ButtonPublic
  variant='greenWhite'
  style={{ width: '49%' }}
  disabled={!activeForm?.product?.length && !activeForm?.tags?.length}
  onClick={() => { ConfirmClick(activeForm) }}
>
  Confirm
</ButtonPublic>
```

通过这些修改，可以确保在没有选择任何筛选条件时，Confirm按钮是置灰的，从而符合预期的用户体验。
