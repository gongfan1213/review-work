### Fabric.js 使用手册简介

#### 序列化与反序列化

##### 序列化
将 Canvas 对象转换为 JSON 字符串。
```javascript
var canvas = new fabric.Canvas('canvas');

var rect = new fabric.Rect({
  width: 100,
  height: 100,
  fill: 'red'
});

canvas.add(rect);

console.log(JSON.stringify(canvas.toJSON()));
```

##### 反序列化
从 JSON 字符串加载 Canvas 对象。
```javascript
var canvas = new fabric.Canvas('canvas');

canvas.loadFromJSON('{"objects":[{"type":"rect","left":50,"top":50,"width":20,"height":20,"fill":"green","overlayFill":null}]}');
```

##### SVG
将 Canvas 对象转换为 SVG 字符串。
```javascript
var canvas = new fabric.Canvas('canvas');

var rect = new fabric.Rect({
  width: 100,
  height: 100,
  fill: 'red'
});

canvas.add(rect);

console.log(canvas.toSVG());
```

通过以上步骤，您可以在 Vue 项目中快速上手 Fabric.js，享受绘制 Canvas 的过程。
