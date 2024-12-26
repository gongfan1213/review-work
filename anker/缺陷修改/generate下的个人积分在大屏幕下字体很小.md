问题发现时间：】 
2024-12-6
【前置条件：】 
上传图片
【操作步骤：】 
点击next，查看生成按钮
【实际结果：】 
generate下的个人积分，在大屏幕下字体很小
【预期结果：】 
大小可以匹配不同屏幕
【手机型号&系统版本：】 
【测试环境CI/QA/PR：】
QA
【其他:如账户信息、testflight/蒲公英版本等：】 
提示：UI问题：附截图，交互问题：附视频，Crash问题：附日志&账号，设备状态问题：附固件日志 


为了使字体大小在不同屏幕上都能适配，你可以使用相对单位（如`vw`、`vh`、`em`、`rem`）或者媒体查询来调整字体大小。以下是几种常见的方法：

### 方法1：使用`vw`单位
`vw`单位表示视口宽度的百分比，可以根据视口宽度动态调整字体大小。

```css
.credits_info {
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: 1vw; /* 使用视口宽度的百分比 */
  padding: 10px 0;
  background: #fff;
  margin-bottom: calc(24 / 1920 * 100vw);
}
```

### 方法2：使用`rem`单位和媒体查询
`rem`单位基于根元素的字体大小，可以通过媒体查询在不同屏幕尺寸下调整根元素的字体大小。

```css
html {
  font-size: 16px; /* 默认字体大小 */
}

@media (min-width: 768px) {
  html {
    font-size: 18px; /* 中等屏幕 */
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 20px; /* 大屏幕 */
  }
}

.credits_info {
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: 0.625rem; /* 使用rem单位 */
  padding: 10px 0;
  background: #fff;
  margin-bottom: 24px;
}
```

### 方法3：使用CSS变量和媒体查询
使用CSS变量可以更灵活地调整字体大小。

```css
:root {
  --font-size-small: 10px;
  --font-size-medium: 12px;
  --font-size-large: 14px;
}

@media (min-width: 768px) {
  :root {
    --font-size-small: 12px;
  }
}

@media (min-width: 1024px) {
  :root {
    --font-size-small: 14px;
  }
}

.credits_info {
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: var(--font-size-small); /* 使用CSS变量 */
  padding: 10px 0;
  background: #fff;
  margin-bottom: 24px;
}
```

### 方法4：使用`clamp`函数
`clamp`函数可以设置一个动态范围的字体大小，确保字体大小在不同屏幕上都能适配。

```css
.credits_info {
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: clamp(10px, 1.5vw, 14px); /* 使用clamp函数 */
  padding: 10px 0;
  background: #fff;
  margin-bottom: 24px;
}
```

### 解释：
- `clamp(10px, 1.5vw, 14px)`：字体大小在10px到14px之间，根据视口宽度动态调整。

通过这些方法，你可以确保字体大小在不同屏幕上都能适配，提供更好的用户体验。选择哪种方法取决于你的具体需求和项目要求。
