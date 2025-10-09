### Fabric.js 使用手册简介

#### 对图片的操作

##### HTML 插入图片
```html
<body>
  <canvas id="canvas" width='800' height='800'></canvas>
  <img src="./2.png" id="img">
</body>
```

```javascript
var canvas = new fabric.Canvas('canvas'); // 声明画布
var imgElement = document.getElementById('img'); // 声明我们的图片     
var imgInstance = new fabric.Image(imgElement, {  // 设置图片位置和样子
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  angle: 30 // 设置图形顺时针旋转角度
});

canvas.add(imgInstance); // 加入到 canvas 中
```

##### JavaScript 插入图片
```javascript
var canvas = new fabric.Canvas('canvas');
fabric.Image.fromURL('./2.png', function(oImg) {
  oImg.scale(0.1); // 图片缩小10倍
  canvas.add(oImg);
});
```

#### 交互

##### 对画布的交互
```javascript
var canvas = new fabric.Canvas('canvas');
canvas.on('mouse:down', function(options) {
  console.log(options.e.clientX, options.e.clientY);
});
```
**注：常用监听事件如下：**
- `mouse:down`：鼠标按下时
- `mouse:move`：鼠标移动时
- `mouse:up`：鼠标抬起时

##### 对画布上对象的操作
```javascript
var canvas = new fabric.Canvas('canvas');

var rect = new fabric.Rect({ width: 100, height: 50, fill: 'green' });
rect.on('selected', function() { // 选中监听事件
  console.log('selected a rectangle');
});

var circle = new fabric.Circle({ radius: 75, fill: 'blue' });
circle.on('selected', function() {
  console.log('selected a circle');
});

canvas.add(rect);
canvas.add(circle);
```
**注：常用监听事件如下：**
- `after:render`：画布重绘后
- `object:selected`：对象被选中
- `object:moving`：对象移动
- `object:rotating`：对象被旋转
- `object:added`：对象被加入
- `object:removed`：对象被移除

#### 组合
`new fabric.Group()`：接受两个参数：要组合对象名称组成的数组、组合到一起的对象的共同属性。
```javascript
var canvas = new fabric.Canvas('canvas');

var circle = new fabric.Circle({ // 绘制圆形
  radius: 100,
  fill: '#f00',
  scaleY: 0.5,
  originX: 'center', // 调整中心点的X轴坐标
  originY: 'center' // 调整中心点的Y轴坐标
});

var text = new fabric.Text('Hello World', { // 绘制文本
  fontSize: 30,
  originX: 'center',
  originY: 'center'
});

// 进行组合
var group = new fabric.Group([circle, text], {
  left: 150,
  top: 100,
  angle: 10
});

canvas.add(group);
```

通过以上步骤，您可以在 Vue 项目中快速上手 Fabric.js，享受绘制 Canvas 的过程。
