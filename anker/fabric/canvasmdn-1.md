# Canvas 教程

Canvas 是一个 HTML 元素，可以使用脚本（通常为 JavaScript）来绘制图形。例如，它可以用于绘制图表、制作图片构图或创建简单的动画。在本教程中，我们将深入了解如何使用 Canvas 元素来绘制 2D 图形，并提供一些示例代码，帮助您开始构建自己的内容。

Canvas 最早由 Apple 在 WebKit 中引入，用于 Mac OS X 的 Dashboard，随后被各大浏览器实现。如今，所有主流浏览器都支持它。

## 开始之前

使用 Canvas 元素并不困难，但您需要具备基本的 HTML 和 JavaScript 知识。除了某些过时的浏览器（特别是 IE9 之前的版本）不支持 Canvas 元素外，所有最新版本的主流浏览器都支持它。

- **默认大小**：Canvas 的默认尺寸为宽 300 像素、高 150 像素。
- **自定义尺寸**：可以使用 HTML 的 `width` 和 `height` 属性来自定义 Canvas 的尺寸。
- **绘制图形**：要在 Canvas 上绘制图形，我们使用 JavaScript 的绘图上下文对象（通常是 `getContext('2d')`），它能动态创建图形。

## 教程内容

1. **基本用法**
2. **绘制图形**
3. **使用样式与颜色**
4. **绘制文本**
5. **使用图像**
6. **变形**
7. **合成和剪辑**
8. **基本动画**
9. **高级动画**
10. **像素处理**
11. **优化 Canvas**
12. **总结**

## 参见

- [Canvas 专题页](#)
- [Adobe Illustrator to Canvas 插件](#)
- [HTML5 Canvas 教程](#)

---

# Canvas 的基本用法

让我们从了解 `<canvas>` HTML 元素本身开始。在本节结束时，您将知道如何设置 Canvas 2D 上下文，以及如何在浏览器上创建您的第一个示例。

## `<canvas>` 元素

```html
<canvas id="tutorial" width="150" height="150"></canvas>
```

- `<canvas>` 标签与 `<img>` 元素类似，但没有 `src` 和 `alt` 属性。
- **属性**：仅有两个属性——`width` 和 `height`，都是可选的，可以通过 DOM 属性进行设置。
  - **默认值**：如果未设置宽度和高度，Canvas 会初始化为宽 300 像素、高 150 像素。
  - **注意**：使用 CSS 可以定义 Canvas 的大小，但绘制的图像会被拉伸以适应尺寸；如果 CSS 尺寸与初始 Canvas 比例不一致，图像会出现变形。
  - **建议**：如果绘制的图像变形，尝试使用 `width` 和 `height` 属性明确规定 Canvas 的宽高，而不是通过 CSS。

- **`id` 属性**：建议为每个 Canvas 标签添加 `id` 属性，以便在脚本中轻松引用。

### 样式设计

- Canvas 元素可以像普通图像一样使用 CSS 进行样式设计（例如 `margin`、`border`、`background` 等）。
- **注意**：这些样式不会影响 Canvas 内的实际图形。在后续章节中，我们将讨论如何解决这个问题。
- **默认状态**：如果未为 Canvas 指定样式规则，它将完全透明。

## 替代内容

与 `<img>` 标签不同，`<canvas>` 元素可以包含替代内容，类似于 `<video>`、`<audio>` 或 `<picture>` 元素。这对于不支持 Canvas 的旧浏览器（尤其是 IE9 之前的版本）或文本浏览器尤为重要。您应该始终提供替代内容。

### 示例

提供对 Canvas 内容的文字描述或对应的静态图片：

```html
<canvas id="stockGraph" width="150" height="150">
  当前股票价格：$3.15 +0.15
</canvas>

<canvas id="clock" width="150" height="150">
  <img src="images/clock.png" width="150" height="150" alt="时钟图片" />
</canvas>
```

- **工作原理**：
  - **不支持 Canvas 的浏览器**：会忽略 `<canvas>` 容器并渲染其中的替代内容。
  - **支持 Canvas 的浏览器**：会忽略容器中的替代内容，只渲染 Canvas。

### 结束标签不可省略

- **重要提示**：与 `<img>` 元素不同，`<canvas>` 元素需要结束标签 `</canvas>`。
  - **如果省略结束标签**：文档的其余部分会被认为是替代内容，可能导致内容不显示。
- **正确用法**：如果不需要替代内容，可以简单地使用 `<canvas id="foo" ...></canvas>`，这在所有支持 Canvas 的浏览器中都是兼容的。

## 渲染上下文

`<canvas>` 元素创建了一个固定大小的绘图表面，并公开了一个或多个渲染上下文，用于绘制和处理要展示的内容。

- **2D 渲染上下文**：我们主要关注 2D 渲染上下文，即 `getContext('2d')`。
- **其他上下文**：例如，WebGL 提供了基于 OpenGL ES 的 3D 上下文（`getContext('webgl')` 或 `getContext('experimental-webgl')`）。

---

通过以上内容，您已经了解了 Canvas 元素的基本结构和用法。在接下来的章节中，我们将深入探讨如何使用 JavaScript 在 Canvas 上绘制各种图形和效果。
