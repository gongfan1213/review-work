### 问题描述

在上传图片并点击 `Generate` 按钮时，Toast 提示语是中文，而预期应该是英文。代码中存在重复的 `tips` 属性设置，导致提示语不一致。

### 代码问题

```jsx
} else if (data?.code === 220100) {
  setShowOverlay(false);
  editorToastShow({
    tips: '积分不足',
    tips: 'Insufficient points, please recharge',
    type: EditorToastType.error,
  });
} else {
```

### 解决方案

1. **删除重复的属性设置**：确保 `tips` 属性只设置一次，并且值为英文提示语。

### 修改后的代码

```jsx
} else if (data?.code === 220100) {
  setShowOverlay(false);
  editorToastShow({
    tips: 'Insufficient points, please recharge',
    type: EditorToastType.error,
  });
} else {
```

