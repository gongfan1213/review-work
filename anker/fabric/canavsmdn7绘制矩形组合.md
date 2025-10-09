# 绘制矩形

在前面的章节中，我们已经学习了如何使用 `fillRect()`、`strokeRect()` 和 `clearRect()` 等方法直接在 Canvas 上绘制矩形。除此之外，还有一个方法 `rect()`，它可以将矩形路径添加到当前路径上，然后通过 `fill()` 或 `stroke()` 方法进行绘制。

## `rect()` 方法

```javascript
ctx.rect(x, y, width, height);
```

- **参数说明**：
  - `x`：矩形左上角的 x 坐标。
  - `y`：矩形左上角的 y 坐标。
  - `width`：矩形的宽度。
  - `height`：矩形的高度。

当调用 `rect()` 方法时，会自动将起始点移动到矩形的起点 `(x, y)`，相当于调用了 `moveTo(x, y)`。这意味着当前的绘图位置（笔触）会被重置到新的位置。

## 组合使用路径方法

到目前为止，每个示例中的每个图形都只使用了一种类型的路径。然而，在绘制图形时，并不限制使用的路径数量和类型。下面的示例将组合使用所有的路径函数，重现一款著名的游戏图形。

### 示例代码

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Canvas 综合示例</title>
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

        // 绘制多个圆角矩形
        roundedRect(ctx, 12, 12, 150, 150, 15);
        roundedRect(ctx, 19, 19, 150, 150, 9);
        roundedRect(ctx, 53, 53, 49, 33, 10);
        roundedRect(ctx, 53, 119, 49, 16, 6);
        roundedRect(ctx, 135, 53, 49, 33, 10);
        roundedRect(ctx, 135, 119, 25, 49, 10);

        // 绘制复杂形状
        ctx.beginPath();
        ctx.arc(37, 37, 13, Math.PI / 7, -Math.PI / 7, false);
        ctx.lineTo(31, 37);
        ctx.fill();

        for (var i = 0; i < 8; i++) {
          ctx.fillRect(51 + i * 16, 35, 4, 4);
        }

        for (var i = 0; i < 6; i++) {
          ctx.fillRect(115, 51 + i * 16, 4, 4);
        }

        for (var i = 0; i < 8; i++) {
          ctx.fillRect(51 + i * 16, 99, 4, 4);
        }

        ctx.beginPath();
        ctx.moveTo(83, 116);
        ctx.lineTo(83, 102);
        ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
        ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
        ctx.lineTo(111, 116);
        ctx.lineTo(106.333, 111.333);
        ctx.lineTo(101.666, 116);
        ctx.lineTo(97, 111.333);
        ctx.lineTo(92.333, 116);
        ctx.lineTo(87.666, 111.333);
        ctx.lineTo(83, 116);
        ctx.fill();

        // 设置填充颜色为白色
        ctx.fillStyle = "white";

        // 绘制左眼
        ctx.beginPath();
        ctx.moveTo(91, 96);
        ctx.bezierCurveTo(88, 96, 87, 99, 87, 101);
        ctx.bezierCurveTo(87, 103, 88, 106, 91, 106);
        ctx.bezierCurveTo(94, 106, 95, 103, 95, 101);
        ctx.bezierCurveTo(95, 99, 94, 96, 91, 96);
        ctx.fill();

        // 绘制右眼
        ctx.beginPath();
        ctx.moveTo(103, 96);
        ctx.bezierCurveTo(100, 96, 99, 99, 99, 101);
        ctx.bezierCurveTo(99, 103, 100, 106, 103, 106);
        ctx.bezierCurveTo(106, 106, 107, 103, 107, 101);
        ctx.bezierCurveTo(107, 99, 106, 96, 103, 96);
        ctx.fill();

        // 设置填充颜色为黑色
        ctx.fillStyle = "black";

        // 绘制左眼瞳孔
        ctx.beginPath();
        ctx.arc(89, 102, 2, 0, Math.PI * 2, true);
        ctx.fill();

        // 绘制右眼瞳孔
        ctx.beginPath();
        ctx.arc(101, 102, 2, 0, Math.PI * 2, true);
        ctx.fill();
      }
    }

    // 绘制圆角矩形的封装函数
    function roundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y + height - radius);
      ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
      ctx.lineTo(x + width - radius, y + height);
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      ctx.lineTo(x + width, y + radius);
      ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.quadraticCurveTo(x, y, x, y + radius);
      ctx.stroke();
    }
  </script>
</head>
<body onload="draw();">
  <canvas id="canvas" width="200" height="200">
    您的浏览器不支持 Canvas。
  </canvas>
</body>
</html>
```

### 代码说明

- **绘制圆角矩形**：使用自定义的 `roundedRect()` 函数绘制了多个不同位置和大小的圆角矩形。
- **绘制复杂形状**：通过组合使用 `arc()`、`lineTo()`、`fillRect()`、`bezierCurveTo()` 等方法，绘制了一个复杂的图形。
- **封装函数 `roundedRect()`**：封装绘制圆角矩形的步骤，简化了代码，提高了可读性和复用性。
- **填充颜色的改变**：通过设置 `ctx.fillStyle`，在绘制不同部分时改变填充颜色，从默认的黑色变为白色，再切换回黑色。

### 运行效果

运行上述代码后，Canvas 上会呈现一个经典游戏角色的图形，类似于经典的卡通人物。

![Canvas 绘制综合示例](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/pacman.png)

## 重点说明

- **使用 `rect()` 方法**：可以将矩形路径添加到当前路径，然后通过 `fill()` 或 `stroke()` 方法进行填充或描边。
- **组合使用路径方法**：在绘制图形时，可以同时使用多种路径方法，例如 `moveTo()`、`lineTo()`、`arc()`、`bezierCurveTo()` 等，没有数量和类型的限制。
- **封装函数的优势**：将常用的绘图过程封装到函数中，可以减少代码量，降低复杂度，提高代码的可读性和可维护性。
- **设置填充样式**：通过 `ctx.fillStyle` 可以改变填充颜色，使得同一个图形的不同部分具有不同的颜色。

## 总结

在本节中，我们进一步深入了解了 Canvas 的绘图功能，学习了：

- 如何使用 `rect()` 方法将矩形添加到路径中。
- 如何组合使用各种路径方法，绘制复杂的图形。
- 封装绘图函数的重要性和方法。
- 使用 `fillStyle` 属性改变填充颜色，为图形增添色彩。

在后续的章节中，我们将详细探讨 **样式与颜色**，了解如何使用更多的样式属性来控制 Canvas 上绘制的图形效果。

---

**练习**：

- 尝试修改示例代码，调整图形的位置、大小或颜色，观察变化效果。
- 为图形添加更多的细节，例如添加背景、调整线条粗细等。
- 尝试封装更多的绘图函数，例如绘制星形、多边形等，提高代码的复用性。

---

## 参考资料

- [Canvas API - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [CanvasRenderingContext2D.rect() - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/rect)
- [CanvasRenderingContext2D.fillStyle - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/fillStyle)
- [HTML5 Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)

---

通过本节的学习，您应该可以熟练地在 Canvas 上绘制各种形状，并了解如何组合使用不同的绘图方法来创建复杂的图形。继续探索，您将能够使用 Canvas 创作出更加丰富多彩的图像和动画。
