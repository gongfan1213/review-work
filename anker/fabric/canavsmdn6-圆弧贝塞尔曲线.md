# 绘制圆弧和贝塞尔曲线

在前面的章节中，我们学习了如何在 Canvas 上绘制基本的路径和形状。本节将深入探讨如何绘制圆弧、圆形以及贝塞尔曲线。这些方法可以帮助我们绘制更加复杂和精美的图形。

## 一、绘制圆弧

### 1. `arc()` 方法

要在 Canvas 上绘制圆弧或圆，可以使用 `arc()` 方法。

```javascript
ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
```

- **`x`，`y`**：圆的圆心坐标。
- **`radius`**：圆的半径。
- **`startAngle`**：起始角度，以**弧度**表示，从圆的 x 轴（与正方向的 x 轴重合）开始测量。
- **`endAngle`**：终止角度，以**弧度**表示。
- **`anticlockwise`**：可选。布尔值，指定弧的绘制方向。`true` 表示逆时针方向，`false` 表示顺时针方向（默认值）。

**注意**：`startAngle` 和 `endAngle` 的单位是**弧度**，而不是度数。可以使用以下公式进行角度和弧度的转换：

```javascript
// 将角度转换为弧度
radians = (Math.PI / 180) * degrees;
```

### 2. 示例：绘制不同角度和方向的圆弧

以下示例绘制了 12 个圆弧，展示了不同的角度、方向和填充样式。

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 3; j++) {
        ctx.beginPath();
        var x = 25 + j * 50;               // x 坐标
        var y = 25 + i * 50;               // y 坐标
        var radius = 20;                   // 圆弧半径
        var startAngle = 0;                // 起始角度
        var endAngle = Math.PI + (Math.PI * j) / 2; // 终止角度
        var anticlockwise = i % 2 !== 0;   // 顺时针或逆时针

        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);

        if (i > 1) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      }
    }
  }
}
```

**代码解析**：

- **坐标计算**：通过嵌套的 `for` 循环，生成绘制圆弧的坐标 `(x, y)`，排列成 4 行 3 列的矩阵。
- **角度设置**：
  - `startAngle` 固定为 `0`（即 0 弧度，0 度）。
  - `endAngle` 从 `Math.PI`（180 度）开始，每列增加 `Math.PI / 2`（90 度），最后一列为 `Math.PI * 2`（360 度），形成完整的圆。
- **方向控制**：
  - 使用 `anticlockwise` 参数控制绘制方向：偶数行（`i % 2 === 0`）为顺时针，奇数行为逆时针。
- **绘制方式**：
  - 前两行使用 `ctx.stroke()` 描边圆弧。
  - 后两行使用 `ctx.fill()` 填充圆弧。

**注意**：此示例的 Canvas 画布尺寸为 `150 x 200` 像素，比之前的示例略大。

### 3. 效果预览

运行上述代码后，Canvas 上会呈现 12 个圆弧，展示了不同的角度、方向和填充方式。

---

## 二、贝塞尔曲线

贝塞尔曲线是一种用于绘制光滑曲线的数学曲线，在计算机图形学中应用广泛。Canvas 提供了绘制 **二次贝塞尔曲线**和 **三次贝塞尔曲线** 的方法。

### 1. 二次贝塞尔曲线

**`quadraticCurveTo()` 方法**

```javascript
ctx.quadraticCurveTo(cp1x, cp1y, x, y);
```

- **`cp1x`，`cp1y`**：控制点（Control Point）坐标。
- **`x`，`y`**：曲线的终点坐标。

二次贝塞尔曲线有一个起点、一个控制点和一个终点。

### 2. 三次贝塞尔曲线

**`bezierCurveTo()` 方法**

```javascript
ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
```

- **`cp1x`，`cp1y`**：第一个控制点坐标。
- **`cp2x`，`cp2y`**：第二个控制点坐标。
- **`x`，`y`**：曲线的终点坐标。

三次贝塞尔曲线有一个起点、两个控制点和一个终点，能够绘制更复杂和精细的曲线。

**备注**：在这两个方法中，起点是当前路径的最后一个点，可以使用 `moveTo()` 方法设置。

### 3. 贝塞尔曲线的应用

绘制贝塞尔曲线需要一定的经验，因为在 Canvas 中无法直接看到控制点和曲线的变化，需要通过调整参数来得到期望的曲线形状。然而，通过练习，我们可以使用贝塞尔曲线绘制出简单到复杂的各种图形。

### 4. 示例：使用二次贝塞尔曲线绘制对话气泡

以下示例使用多段二次贝塞尔曲线绘制了一个对话气泡。

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // 开始路径
    ctx.beginPath();
    ctx.moveTo(75, 25);

    // 上边缘和左上角
    ctx.quadraticCurveTo(25, 25, 25, 62.5);

    // 左边缘
    ctx.quadraticCurveTo(25, 100, 50, 100);

    // 下方尖角
    ctx.quadraticCurveTo(50, 120, 30, 125);
    ctx.quadraticCurveTo(60, 120, 65, 100);

    // 右边缘
    ctx.quadraticCurveTo(125, 100, 125, 62.5);

    // 右上角和上边缘
    ctx.quadraticCurveTo(125, 25, 75, 25);

    // 描边路径
    ctx.stroke();
  }
}
```

**代码解析**：

- 使用 `moveTo(75, 25)` 设置起点。
- 通过一系列 `quadraticCurveTo()` 方法，指定控制点和终点，绘制出对话气泡的边缘和尖角。
- 最后使用 `ctx.stroke()` 描边路径，完成对话气泡的绘制。

### 5. 示例：使用三次贝塞尔曲线绘制心形

以下示例使用多段三次贝塞尔曲线绘制了一个心形图案。

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // 开始路径
    ctx.beginPath();
    ctx.moveTo(75, 40);

    // 左上半部分
    ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
    ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);

    // 左下半部分
    ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);

    // 右下半部分
    ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);

    // 右上半部分
    ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
    ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);

    // 填充路径
    ctx.fill();
  }
}
```

**代码解析**：

- 使用 `moveTo(75, 40)` 设置起点。
- 通过连续的 `bezierCurveTo()` 方法，利用两个控制点，绘制心形的左上、左下、右下和右上部分。
- 最后使用 `ctx.fill()` 填充路径，绘制出实心的心形。

---

## 三、总结

- **`arc()` 方法**：用于绘制圆弧和圆形，需要注意参数的含义和角度的单位（弧度）。
- **贝塞尔曲线**：
  - **二次贝塞尔曲线**：使用一个控制点，可以绘制简单的曲线形状。
  - **三次贝塞尔曲线**：使用两个控制点，可以绘制更加复杂和精细的曲线。
- **绘制技巧**：
  - 由于 Canvas 中缺乏对控制点的可视化反馈，绘制贝塞尔曲线需要通过调试和调整参数来实现。
  - 可以借助其他绘图工具（如矢量绘图软件）获取控制点坐标，再在代码中使用。

## 四、练习

- **绘制复杂图形**：尝试使用贝塞尔曲线绘制更复杂的图案，如云朵、花瓣等。
- **动画效果**：结合 Canvas 的动画能力，创建贝塞尔曲线的动态效果。
- **交互式绘图**：编写程序，让用户通过鼠标点击来设置控制点，实时绘制贝塞尔曲线。

---

通过本节的学习，您应该掌握了在 Canvas 中绘制圆弧和贝塞尔曲线的基本方法。这些技术对于创建复杂、多样的图形和图案非常重要。继续练习，您将能够运用这些技巧，绘制出更加精美的作品。
