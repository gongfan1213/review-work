# 绘制路径（续）

在上一节中，我们学习了如何绘制基本的路径。本节将深入探讨 **`moveTo()`** 和 **`lineTo()`** 方法，了解如何控制绘图的起点和路径，以及如何绘制复杂的形状。

## 移动画笔（`moveTo()`）

**`moveTo(x, y)`** 方法用于将画笔移动到指定的坐标 `(x, y)`，但不绘制任何内容。可以将其想象为在纸上提起笔，然后移动到新的位置，准备开始绘制。

```javascript
ctx.moveTo(x, y);
```

- **作用**：将画笔移动到指定坐标，开始一个新的子路径。
- **参数**：
  - `x`：目标位置的 x 坐标。
  - `y`：目标位置的 y 坐标。

### 何时使用 `moveTo()`

- **设置起始点**：在调用 `beginPath()` 开始新路径后，通常使用 `moveTo()` 设置起始点。
- **绘制不连续的路径**：在绘图过程中，如果需要断开当前路径，从新位置开始绘制，可以使用 `moveTo()`。

### 示例：绘制笑脸

以下示例演示了如何使用 `moveTo()` 方法绘制一个简单的笑脸。

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // 开始新的路径
    ctx.beginPath();

    // 绘制脸部（圆形）
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // 外圈

    // 绘制嘴巴
    ctx.moveTo(110, 75);
    ctx.arc(75, 75, 35, 0, Math.PI, false); // 顺时针绘制

    // 绘制左眼
    ctx.moveTo(65, 65);
    ctx.arc(60, 65, 5, 0, Math.PI * 2, true);

    // 绘制右眼
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI * 2, true);

    // 描边路径
    ctx.stroke();
  }
}
```

#### 代码解析

- **`ctx.beginPath()`**：开始新的路径。
- **绘制外圈（脸部）**：
  - `ctx.arc(75, 75, 50, 0, Math.PI * 2, true);`
    - 在坐标 (75, 75) 绘制一个半径为 50 的圆（脸部）。
- **绘制嘴巴**：
  - `ctx.moveTo(110, 75);`
    - 将画笔移动到坐标 (110, 75)。
  - `ctx.arc(75, 75, 35, 0, Math.PI, false);`
    - 绘制一个半径为 35 的半圆（嘴巴），从 0 到 π（180 度），逆时针方向。
- **绘制左眼**：
  - `ctx.moveTo(65, 65);`
    - 将画笔移动到左眼的位置 (65, 65)。
  - `ctx.arc(60, 65, 5, 0, Math.PI * 2, true);`
    - 绘制一个半径为 5 的完整圆（左眼）。
- **绘制右眼**：
  - `ctx.moveTo(95, 65);`
    - 将画笔移动到右眼的位置 (95, 65)。
  - `ctx.arc(90, 65, 5, 0, Math.PI * 2, true);`
    - 绘制一个半径为 5 的完整圆（右眼）。
- **`ctx.stroke()`**：描边路径，呈现笑脸。

#### 运行效果

![笑脸示例](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/smiley.png)

**注意**：在绘制每个独立的部分（嘴巴、左眼、右眼）前，我们使用 `moveTo()` 将画笔移动到新的起始位置，以避免绘制不必要的连线。

### 如果移除 `moveTo()`

如果在上述代码中移除 `moveTo()` 方法，绘制时画笔会从上一个结束点直接连接到下一个开始点，导致笑脸的各部分被不必要的线条连接，如下图所示：

![移除 moveTo() 的效果](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/smiley_lines.png)

## 绘制直线（`lineTo()`）

**`lineTo(x, y)`** 方法用于从当前绘图位置绘制一条直线到指定的坐标 `(x, y)`。

```javascript
ctx.lineTo(x, y);
```

- **作用**：从当前点绘制一条直线到指定坐标。
- **参数**：
  - `x`：直线结束点的 x 坐标。
  - `y`：直线结束点的 y 坐标。

### 使用 `lineTo()` 绘制形状

- **开始点**：默认情况下，`lineTo()` 方法的起点是当前路径的结束点。
- **改变起点**：可以使用 `moveTo()` 方法改变起点。

### 示例：绘制两个三角形

以下示例演示了如何使用 `lineTo()` 方法绘制一个填充三角形和一个描边三角形。

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // 绘制填充三角形
    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.lineTo(105, 25);
    ctx.lineTo(25, 105);
    ctx.fill();

    // 绘制描边三角形
    ctx.beginPath();
    ctx.moveTo(125, 125);
    ctx.lineTo(125, 45);
    ctx.lineTo(45, 125);
    ctx.closePath();
    ctx.stroke();
  }
}
```

#### 代码解析

- **填充三角形**：
  - 使用 `beginPath()` 开始新的路径。
  - 使用 `moveTo(25, 25)` 将画笔移动到起始点 (25, 25)。
  - 使用 `lineTo()` 方法绘制两条边：
    - 从 (25, 25) 到 (105, 25)。
    - 从 (105, 25) 到 (25, 105)。
  - 使用 `fill()` 方法填充三角形。由于填充操作会自动闭合路径，因此不需要调用 `closePath()`。
- **描边三角形**：
  - 使用 `beginPath()` 开始新的路径。
  - 使用 `moveTo(125, 125)` 将画笔移动到起始点 (125, 125)。
  - 使用 `lineTo()` 方法绘制两条边：
    - 从 (125, 125) 到 (125, 45)。
    - 从 (125, 45) 到 (45, 125)。
  - 使用 `closePath()` 手动闭合路径，以绘制第三条边。
  - 使用 `stroke()` 方法描边三角形。

#### 运行效果

![绘制三角形示例](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/triangles.png)

### 为什么填充三角形不需要 `closePath()`

- **填充操作自动闭合路径**：在使用 `fill()` 方法时，如果路径未闭合，会自动从当前点绘制一条线回到起始点，闭合路径。
- **描边操作不自动闭合路径**：使用 `stroke()` 方法时，路径不会自动闭合，因此需要手动调用 `closePath()`。

## 总结

- **`moveTo(x, y)`**：
  - 用于移动画笔到指定位置，不绘制任何内容。
  - 常用于设置路径的起始点或创建不连续的路径。
- **`lineTo(x, y)`**：
  - 从当前点绘制一条直线到指定坐标。
  - 可以连续调用，绘制多条连接的线段。
- **路径的闭合**：
  - `fill()` 方法会自动闭合路径。
  - `stroke()` 方法不会自动闭合路径，需要手动调用 `closePath()`。
- **绘制复杂图形**：
  - 通过组合使用 `moveTo()`、`lineTo()`，以及其他路径方法，可以绘制复杂的形状和图案。

---

**提示**：在绘制复杂图形时，合理使用 `moveTo()` 可以避免不必要的连线，保持绘图的整洁和准确。

---

## 练习

- 尝试绘制一个包含多个不连续部分的图形，例如一个房屋的轮廓，包括屋顶、墙壁和门窗。
- 结合使用 `moveTo()` 和 `lineTo()`，以及其他路径方法，绘制更复杂的图形，如星形、多边形等。

## 参考资料

- [Canvas API - 绘制形状](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
- [CanvasRenderingContext2D.moveTo() - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/moveTo)
- [CanvasRenderingContext2D.lineTo() - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineTo)
- [HTML5 Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)
