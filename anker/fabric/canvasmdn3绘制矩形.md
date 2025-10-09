# 使用 Canvas 来绘制图形

在上一节中，我们已经设置了 Canvas 环境。本节将深入探讨如何在 Canvas 上绘图。在本文结束时，您将学会如何绘制矩形、三角形、直线、圆弧和曲线，并熟悉这些基本的形状。绘制图形到 Canvas 之前，需要掌握路径的概念，让我们来看一看如何操作。

## Canvas 的栅格和坐标系

在开始绘图之前，我们需要了解 Canvas 的栅格（grid）和坐标空间。

- **Canvas 的尺寸**：在之前的 HTML 模板中，我们使用了一个宽 150px、高 150px 的 Canvas 元素。
- **坐标系**：Canvas 元素默认被一个网格覆盖。通常来说，网格中的一个单元相当于 Canvas 元素中的一个像素。
- **原点**：栅格的起点位于左上角，坐标为 (0, 0)。
- **坐标定位**：所有元素的位置都相对于原点定位。也就是说，任何图形的绘制位置都是基于左上角的 (0, 0) 点。

例如，在下图中，蓝色方形的左上角位于坐标 (x, y)，表示距离左边 x 像素，距离顶部 y 像素。

![Canvas 坐标系示意图](#)

在后续课程中，我们将学习如何平移原点到不同的坐标，旋转网格以及缩放。但目前，我们先使用默认的设置。

## 绘制矩形

与 SVG 不同，`<canvas>` 只支持两种基本的图形绘制方法：**矩形**和**路径**（由一系列点连接成的线段）。所有其他类型的图形都是通过一条或多条路径组合而成的。不过，我们拥有丰富的路径生成方法，可以让复杂图形的绘制成为可能。

首先，我们从矩形的绘制开始。Canvas 提供了三种方法来绘制矩形：

1. **`fillRect(x, y, width, height)`**：绘制一个填充的矩形。

2. **`strokeRect(x, y, width, height)`**：绘制一个矩形的边框。

3. **`clearRect(x, y, width, height)`**：清除指定矩形区域，让清除部分变得完全透明。

以上每个方法都包含相同的参数：

- **`x` 和 `y`**：指定在 Canvas 画布上所绘制矩形的左上角（相对于原点）的坐标。
- **`width` 和 `height`**：设置矩形的宽度和高度。

### 示例代码

下面的 `draw()` 函数是从之前的模板中提取的，现在我们将使用上述三个函数来绘制矩形。

```javascript
function draw() {
  const canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');

    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
  }
}
```

### 解释

- **`ctx.fillRect(25, 25, 100, 100);`**
  - 在坐标 (25, 25) 处绘制一个宽 100 像素、高 100 像素的填充矩形（默认为黑色）。

- **`ctx.clearRect(45, 45, 60, 60);`**
  - 从坐标 (45, 45) 处开始，清除一个宽 60 像素、高 60 像素的矩形区域，使该区域变得完全透明。

- **`ctx.strokeRect(50, 50, 50, 50);`**
  - 在坐标 (50, 50) 处绘制一个宽 50 像素、高 50 像素的矩形边框（描边）。

### 运行效果

运行上述代码，您将看到如下图形：

![矩形示例](#)

- 首先绘制了一个边长为 100 像素的黑色正方形。
- 然后在正方形的中心清除一个 60 x 60 像素的区域，形成一个透明的正方形。
- 最后在清除的区域内绘制了一个 50 x 50 像素的矩形边框。

### 注意事项

- 与下一节将介绍的路径函数（path functions）不同，以上三个方法在调用时会立即在 Canvas 上绘制图形，不需要后续的 `stroke()` 或 `fill()` 方法。

## 总结

在本节中，我们学习了：

- Canvas 的栅格和坐标系。
- 如何使用 Canvas 提供的矩形绘制方法：
  - `fillRect()`：绘制填充矩形。
  - `strokeRect()`：绘制矩形边框。
  - `clearRect()`：清除指定矩形区域。

在接下来的章节中，我们将探索路径的绘制方法，并了解如何改变图形的填充颜色和描边颜色。

---

**提示**：为了更好地理解上述代码的运行效果，建议您在浏览器中亲自尝试运行代码，并根据参数的变化观察图形的变化。

---

## 参见

- [Canvas API - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [CanvasRenderingContext2D - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D)
- [HTML5 Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)
