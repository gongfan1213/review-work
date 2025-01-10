## 获取渲染上下文

Canvas 初始是空白的。要在上面绘制内容，首先需要获取其渲染上下文，然后才能进行绘图。`<canvas>` 元素提供了一个名为 `getContext()` 的方法，用于获取渲染上下文及其绘图功能。

`getContext()` 方法接受一个参数，指定要获取的上下文类型。对于 2D 图形，使用 `"2d"` 参数，它会返回一个 `CanvasRenderingContext2D` 对象，提供了用于绘制 2D 图形的方法和属性。

```javascript
var canvas = document.getElementById("tutorial");
var ctx = canvas.getContext("2d");
```

在上述代码中：

- **第一步**：通过 `document.getElementById()` 方法获取 `<canvas>` 元素的 DOM 对象。
- **第二步**：调用 `getContext("2d")` 方法获取 2D 渲染上下文。

## 检查浏览器支持

为了确保代码在所有浏览器中正常运行，我们需要检查浏览器是否支持 Canvas 和所需的渲染上下文。可以通过检测 `getContext` 方法的存在来实现。

```javascript
var canvas = document.getElementById("tutorial");
if (canvas.getContext) {
  var ctx = canvas.getContext("2d");
  // 在此处编写绘图代码
} else {
  // 浏览器不支持 Canvas，提供替代内容或提示信息
}
```

如果浏览器支持 Canvas 和 2D 渲染上下文，那么可以继续编写绘图代码；否则，需要提供替代方案或提示信息，告知用户浏览器不支持 Canvas。

## 模板结构

下面是一个基础的模板，可以作为后续示例的起点。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Canvas 教程</title>
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
  <script>
    function draw() {
      var canvas = document.getElementById('tutorial');
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        // 在此处编写绘图代码
      } else {
        // 浏览器不支持 Canvas，提供替代内容或提示信息
      }
    }
  </script>
</head>
<body onload="draw();">
  <canvas id="tutorial" width="150" height="150">
    您的浏览器不支持 Canvas 元素。
  </canvas>
</body>
</html>
```

**说明**：

- `<canvas>` 元素具有 `id="tutorial"`，以便在脚本中引用。
- 在 `<head>` 部分，定义了 `draw()` 函数，在页面加载完成时调用。
- 在 `<body>` 标签中，使用 `onload="draw();"` 触发 `draw()` 函数。
- 为 Canvas 添加了边框样式，方便观察其位置和大小。

**注意**：在示例中，我们将 `<script>` 标签放在 `<head>` 中，这在实际开发中不推荐。更好的做法是将脚本放在 `</body>` 之前，或将事件处理程序绑定到 DOMContentLoaded 事件，以确保在 DOM 加载完成后再执行脚本。

## 一个简单的绘图示例

下面，我们通过一个简单的例子来演示如何在 Canvas 上绘制矩形。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Canvas 简单示例</title>
  <script>
    function draw() {
      var canvas = document.getElementById('canvas');
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // 绘制红色矩形
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(10, 10, 55, 50);

        // 绘制半透明的蓝色矩形
        ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        ctx.fillRect(30, 30, 55, 50);
      } else {
        // 浏览器不支持 Canvas
        alert('您的浏览器不支持 Canvas！');
      }
    }
  </script>
</head>
<body onload="draw();">
  <canvas id="canvas" width="150" height="150">
    您的浏览器不支持 Canvas 元素。
  </canvas>
</body>
</html>
```

**效果预览**：

[在新窗口打开示例并运行](#)

**解释**：

- **绘制第一个矩形**：
  - 设置填充颜色为红色：`ctx.fillStyle = 'rgb(200, 0, 0)';`
  - 绘制矩形：`ctx.fillRect(10, 10, 55, 50);`
    - 参数分别为：矩形左上角的 x 和 y 坐标，以及矩形的宽度和高度。
- **绘制第二个矩形**：
  - 设置填充颜色为半透明蓝色：`ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';`
    - 这里的 `0.5` 表示透明度为 50%。
  - 绘制矩形：`ctx.fillRect(30, 30, 55, 50);`

由于第二个矩形的起始坐标在 `(30, 30)`，并且是半透明的，所以它与第一个矩形部分重叠，重叠区域会呈现颜色混合效果。

## 完整的示例代码

为了方便查看，以下是完整的示例代码：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Canvas 简单示例</title>
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
  <script>
    function draw() {
      var canvas = document.getElementById('canvas');
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        // 绘制红色矩形
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(10, 10, 55, 50);

        // 绘制半透明的蓝色矩形
        ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        ctx.fillRect(30, 30, 55, 50);
      } else {
        alert('您的浏览器不支持 Canvas！');
      }
    }
  </script>
</head>
<body onload="draw();">
  <canvas id="canvas" width="150" height="150">
    您的浏览器不支持 Canvas 元素。
  </canvas>
</body>
</html>
```

**运行结果**：

- 您将看到两个矩形：
  - 一个红色矩形，位于坐标 `(10, 10)`。
  - 一个半透明的蓝色矩形，位于坐标 `(30, 30)`，部分覆盖红色矩形。

## 代码解析

- **`ctx.fillStyle`**：设置绘图填充颜色。
  - 使用 `rgb()` 定义不透明颜色。
  - 使用 `rgba()` 定义带透明度的颜色，其中最后一个参数指定透明度（范围从 0.0 到 1.0）。
- **`ctx.fillRect(x, y, width, height)`**：绘制填充的矩形。
  - `(x, y)` 为矩形左上角的坐标。
  - `width` 和 `height` 为矩形的宽度和高度。

## 总结

通过上述示例，您已经学会了如何：

- 获取 Canvas 的 2D 渲染上下文。
- 检查浏览器对 Canvas 的支持。
- 使用基本的 Canvas API 绘制简单的形状。
- 设置颜色和透明度。

在接下来的章节中，我们将深入探索 Canvas 提供的更多绘图功能，包括绘制路径、文本、图像和创建动画等。

---

## 参见

- [Canvas API - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [CanvasRenderingContext2D - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D)
- [HTML5 Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)
