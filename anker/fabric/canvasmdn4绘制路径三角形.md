# 绘制路径

图形的基本元素是**路径**。路径由不同宽度和颜色的线段或曲线连接形成，构成各种形状的点的集合。一个路径，甚至每个子路径，都可以是闭合的。使用路径绘制图形需要遵循一些步骤。

## 绘制路径的步骤

1. **创建路径起始点**：使用 `beginPath()` 方法开始新的路径。
2. **绘制路径**：使用绘图命令（如 `lineTo()`、`arc()` 等）绘制路径。
3. **闭合路径**（可选）：使用 `closePath()` 方法闭合路径。
4. **渲染路径**：通过描边（`stroke()`）或填充（`fill()`）路径来呈现图形。

## 常用的路径方法

- **`beginPath()`**
  - **作用**：新建一条路径。调用该方法后，后续的绘图命令会被添加到路径上生成路径。
  
- **`closePath()`**
  - **作用**：闭合路径。通过绘制一条从当前点到起始点的直线来闭合图形。如果当前路径已闭合，则该方法不执行任何操作。
  
- **`stroke()`**
  - **作用**：按照当前的画线样式，绘制路径的轮廓。
  
- **`fill()`**
  - **作用**：按照当前的填充样式，填充路径内部区域，生成实心的图形。

## 绘制路径的过程

1. **开始新的路径**

   调用 `beginPath()` 方法，会重置当前路径列表，开始记录新的路径指令。

   ```javascript
   ctx.beginPath();
   ```

2. **指定起始位置**

   通常在开始绘制路径后，使用 `moveTo(x, y)` 方法指定起始位置。

   ```javascript
   ctx.moveTo(x, y);
   ```

3. **绘制路径**

   使用绘图命令如 `lineTo()`、`arc()` 等方法，逐步绘制路径。

   ```javascript
   ctx.lineTo(x, y);
   ctx.arc(x, y, radius, startAngle, endAngle);
   // 其他绘图命令
   ```

4. **闭合路径（可选）**

   调用 `closePath()` 方法，可以闭合当前路径。

   ```javascript
   ctx.closePath();
   ```

   **注意**：当调用 `fill()` 方法时，未闭合的路径会自动闭合；但调用 `stroke()` 方法时，路径不会自动闭合，需要手动调用 `closePath()`。

5. **渲染路径**

   - **填充路径**：使用 `fill()` 方法，按照当前的填充样式，填充路径内部区域。

     ```javascript
     ctx.fill();
     ```

   - **描边路径**：使用 `stroke()` 方法，按照当前的画线样式，绘制路径的轮廓。

     ```javascript
     ctx.stroke();
     ```

## 示例：绘制一个三角形

下面的示例演示了如何使用路径方法绘制一个填充的三角形。

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // 开始新的路径
    ctx.beginPath();
    // 移动到起始点
    ctx.moveTo(75, 50);
    // 绘制线条到下一个点
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    // 填充三角形
    ctx.fill();
  }
}
```

### 代码解析

- **`ctx.beginPath()`**：开始一个新的路径。这会清空之前的路径，开始记录新的绘图命令。
- **`ctx.moveTo(75, 50)`**：将画笔移动到起始坐标 (75, 50)，不画出任何内容。
- **`ctx.lineTo(100, 75)`**：从起始点绘制一条线段到坐标 (100, 75)。
- **`ctx.lineTo(100, 25)`**：从上一个点绘制一条线段到坐标 (100, 25)。
- **`ctx.fill()`**：使用当前的填充样式（默认为黑色）填充路径内部区域。由于 `fill()` 方法会自动闭合路径，所以三角形被正确地填充。

### 注意事项

- **自动闭合路径**：当调用 `fill()` 方法时，如果路径未闭合，会自动从当前点绘制一条线回到起始点，闭合路径。
- **手动闭合路径**：如果需要在调用 `stroke()` 方法时闭合路径，需要显式调用 `ctx.closePath()`。

### 运行效果

运行上述代码后，会在 Canvas 上绘制出如下图所示的填充三角形：

![绘制三角形示例](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/triangle.png)

## 总结

- **路径是绘图的基本元素**：通过路径可以绘制复杂的形状。
- **绘制路径的基本步骤**：开始路径、绘制路径、（可选）闭合路径、渲染路径。
- **`fill()` 和 `stroke()` 方法的区别**：
  - `fill()` 用于填充路径内部区域，未闭合的路径会自动闭合。
  - `stroke()` 用于绘制路径的轮廓，未闭合的路径不会自动闭合，需要手动调用 `closePath()`。

## 进一步的路径绘图方法

Canvas 提供了丰富的路径绘图方法，可以绘制各种复杂的图形：

- **`moveTo(x, y)`**：将画笔移动到指定坐标。
- **`lineTo(x, y)`**：从当前点绘制一条线段到指定坐标。
- **`arc(x, y, radius, startAngle, endAngle, anticlockwise)`**：以 (x, y) 为圆心，绘制指定半径和角度的弧形。
- **`arcTo(x1, y1, x2, y2, radius)`**：根据控制点和半径，创建一条弧线连接当前点和指定点。
- **`quadraticCurveTo(cp1x, cp1y, x, y)`**：绘制二次贝塞尔曲线。
- **`bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`**：绘制三次贝塞尔曲线。
- **`rect(x, y, width, height)`**：创建一个矩形路径。

通过组合使用这些方法，可以绘制出各种复杂的形状和图案。

---

**练习**：

- 尝试在 Canvas 上绘制一个五角星、圆形或其他复杂形状。
- 结合 `stroke()` 和 `fill()` 方法，为形状添加边框和填充效果。

---

## 参考资料

- [Canvas API - 绘制形状](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
- [CanvasRenderingContext2D - MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D)
- [HTML5 Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)
