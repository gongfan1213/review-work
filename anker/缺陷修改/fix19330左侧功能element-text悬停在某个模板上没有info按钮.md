- 问题发现时间：】 
11-21
【前置条件：】 
打开elements、text菜单栏
【操作步骤：】 
悬停在模板上
【实际结果：】 
没有info按钮的icon
【预期结果：】 
有info按钮icon
【手机型号&系统版本：】 
【测试环境CI/QA/PR：】
QA
【其他:如账户信息、testflight/蒲公英版本等：】 
提示：UI问题：附截图，交互问题：附视频，Crash问题：附日志&账号，设备状态问题：附固件日志 

### 问题描述

在 `ElementMenus` 组件中，发现了重复的属性设置和不一致的 `isDetailsIcon` 属性值。具体问题如下：

1. `isDetailsIcon` 属性被设置了两次，且值不一致。
2. 组件 `SideTable` 被重复渲染。

### 代码问题

```jsx
<SideTable
  data={sideData}
  CardClick={CardClick}
  isLoading={isLoading}
  hasLoading={hasLoading}
  hasMore={hasMore}
  type={'ElementMenus'}
  active={active}
  fetchDataMore={fetchDataMore}
  IsSeeAll={IsSeeAll}
  refdata={refdata}
  item_refresh={item_refresh}
  RefreshLoading={RefreshLoading}
  fetchListMore={fetchListMore}
  ListLoading={ListLoading}
  ListMore={ListMore}
  RightMoreData={RightMoreData}
  isDetailsIcon={false}
  isDetailsIcon={true}
/>
```

### 解决方案

1. **删除重复的属性设置**：确保每个属性只设置一次。
2. **确保属性值一致**：根据需求设置 `isDetailsIcon` 的正确值。

### 修改后的代码

```jsx
<SideTable
  data={sideData}
  CardClick={CardClick}
  isLoading={isLoading}
  hasLoading={hasLoading}
  hasMore={hasMore}
  type={'ElementMenus'}
  active={active}
  fetchDataMore={fetchDataMore}
  IsSeeAll={IsSeeAll}
  refdata={refdata}
  item_refresh={item_refresh}
  RefreshLoading={RefreshLoading}
  fetchListMore={fetchListMore}
  ListLoading={ListLoading}
  ListMore={ListMore}
  RightMoreData={RightMoreData}
  isDetailsIcon={true}  // 根据需求设置正确的值
/>
```

### 其他改进

1. **删除重复的组件渲染**：确保组件 `SideTable` 只被渲染一次。


 
