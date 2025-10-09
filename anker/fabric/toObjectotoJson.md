### `toObject` 和 `toJSON` 方法

在 Fabric.js 中，`toObject` 和 `toJSON` 方法用于将画布或对象的状态序列化为 JavaScript 对象或 JSON 字符串。这对于保存、传输和恢复画布状态非常有用。

#### `toObject` 方法

`toObject` 方法将画布或对象的状态序列化为一个 JavaScript 对象。这个对象包含了所有必要的信息，可以用来重建画布或对象的当前状态。

##### 用法示例

```javascript
var canvas = new fabric.Canvas('c');

// 添加一个矩形到画布
canvas.add(new fabric.Rect({
  left: 50,
  top: 50,
  height: 20,
  width: 20,
  fill: 'green'
}));

// 将画布序列化为对象
var canvasObject = canvas.toObject();
console.log(canvasObject);
```

输出的对象可能如下所示：

```json
{
  "objects": [
    {
      "type": "rect",
      "left": 50,
      "top": 50,
      "width": 20,
      "height": 20,
      "fill": "green",
      "overlayFill": null,
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "selectable": true,
      "hasControls": true,
      "hasBorders": true,
      "hasRotatingPoint": false,
      "transparentCorners": true,
      "perPixelTargetFind": false,
      "rx": 0,
      "ry": 0
    }
  ],
  "background": "rgba(0, 0, 0, 0)"
}
```

#### `toJSON` 方法

`toJSON` 方法将画布或对象的状态序列化为一个 JSON 字符串。这个字符串可以用来保存到文件或通过网络传输，然后可以用来重建画布或对象的当前状态。

##### 用法示例

```javascript
var canvas = new fabric.Canvas('c');

// 添加一个矩形到画布
canvas.add(new fabric.Rect({
  left: 50,
  top: 50,
  height: 20,
  width: 20,
  fill: 'green'
}));

// 将画布序列化为 JSON 字符串
var canvasJSON = JSON.stringify(canvas);
console.log(canvasJSON);
```

输出的 JSON 字符串可能如下所示：

```json
'{"objects":[{"type":"rect","left":50,"top":50,"width":20,"height":20,"fill":"green","overlayFill":null,"stroke":null,"strokeWidth":1,"strokeDashArray":null,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"selectable":true,"hasControls":true,"hasBorders":true,"hasRotatingPoint":false,"transparentCorners":true,"perPixelTargetFind":false,"rx":0,"ry":0}],"background":"rgba(0, 0, 0, 0)"}'
```

#### 自定义 `toObject` 和 `toJSON`

有时，您可能需要自定义对象的序列化表示。例如，您可能希望在序列化时包含额外的属性。您可以通过覆盖对象的 `toObject` 方法来实现这一点。

##### 用法示例

```javascript
var rect = new fabric.Rect({
  left: 50,
  top: 50,
  height: 20,
  width: 20,
  fill: 'green'
});

// 自定义 toObject 方法
rect.toObject = (function(toObject) {
  return function() {
    return fabric.util.object.extend(toObject.call(this), {
      customProperty: 'customValue'
    });
  };
})(rect.toObject);

canvas.add(rect);

// 序列化画布
var canvasObject = canvas.toObject();
console.log(canvasObject);
```

输出的对象可能如下所示：

```json
{
  "objects": [
    {
      "type": "rect",
      "left": 50,
      "top": 50,
      "width": 20,
      "height": 20,
      "fill": "green",
      "overlayFill": null,
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "selectable": true,
      "hasControls": true,
      "hasBorders": true,
      "hasRotatingPoint": false,
      "transparentCorners": true,
      "perPixelTargetFind": false,
      "rx": 0,
      "ry": 0,
      "customProperty": "customValue"
    }
  ],
  "background": "rgba(0, 0, 0, 0)"
}
```

通过自定义 `toObject` 方法，您可以确保在序列化时包含额外的属性。

### 总结

- `toObject` 方法将画布或对象的状态序列化为一个 JavaScript 对象。
- `toJSON` 方法将画布或对象的状态序列化为一个 JSON 字符串。
- 这两个方法对于保存、传输和恢复画布状态非常有用。
- 您可以通过覆盖对象的 `toObject` 方法来自定义序列化表示。
