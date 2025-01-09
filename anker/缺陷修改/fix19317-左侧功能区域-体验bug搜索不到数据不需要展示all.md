### 缺陷描述

- **问题发现时间**：11-21
- **前置条件**：选择没有数据的模版标签
- **操作步骤**：点击搜索
- **实际结果**：搜索不到数据，显示`All`加空布局图片
- **预期结果**：不需要显示`All`
- **手机型号&系统版本**：未提供
- **测试环境**：QA
- **其他信息**：无

### 缺陷分析

在测试过程中发现，当用户选择没有数据的模版标签并点击搜索时，结果显示`All`加空布局图片。根据预期结果，不需要显示`All`。

### 修改方案

为了修复这个问题，我们需要确保在没有数据时，不显示`All`。具体修改如下：

1. **检查数据总数是否为0**。
2. **在数据总数为0时，不添加`All`标签**。

### 修改后的代码

#### 原始代码

```javascript
return [
  {
    label: initial ? initial : 'All',
    total: data?.data?.total?.toString(),
    label: data?.data?.total === 0 ? '' : initial ? initial : 'All',
    total: data?.data?.total === 0 ? '' : data?.data?.total?.toString(),
    id: 9999,
    list: transformedData,
  },
];
```

#### 修改后的代码

```javascript
const result = [];

if (data?.data?.total !== 0) {
  result.push({
    label: initial ? initial : 'All',
    total: data?.data?.total?.toString(),
    id: 9999,
    list: transformedData,
  });
}

return result;
```

### 解释

1. **检查数据总数**：
   - 使用`if (data?.data?.total !== 0)`检查数据总数是否为0。
   - 如果数据总数不为0，则添加`All`标签。

2. **返回结果**：
   - 创建一个空数组`result`。
   - 如果数据总数不为0，则将标签信息添加到`result`数组中。
   - 返回`result`数组。

### 整理的工作内容

1. **问题发现时间**：11-21
2. **前置条件**：选择没有数据的模版标签
3. **操作步骤**：点击搜索
4. **实际结果**：搜索不到数据，显示`All`加空布局图片
5. **预期结果**：不需要显示`All`
6. **手机型号&系统版本**：未提供
7. **测试环境**：QA
8. **其他信息**：无

### 代码修改

#### 修改后的代码

```javascript
const result = [];

if (data?.data?.total !== 0) {
  result.push({
    label: initial ? initial : 'All',
    total: data?.data?.total?.toString(),
    id: 9999,
    list: transformedData,
  });
}

return result;
```

通过这些修改，可以确保在没有数据时，不显示`All`，从而符合预期期的用户体验。
