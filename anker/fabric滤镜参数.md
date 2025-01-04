### fabric 实现滤镜的方法步骤：

#### 1. 创建 Fabric 图像对象

```javascript
fabric.Image.fromURL('my-image.jpg', function(imgInstance) {
  // 添加到 canvas
  canvas.add(imgInstance);
});
```

#### 2. 应用滤镜

使用 `fabric.Image.filters` 对象中的类来创建一个滤镜实例，然后将滤镜添加到图像对象的 `filters` 数组中。

```javascript
// 创建滤镜实例，此处是灰度滤镜作为示例
var filter = new fabric.Image.filters.Grayscale();
// 当你有复杂的滤镜也可以使用动态的值进行设置，此处是一个示例
var filter = new fabric.Image.filters.Brightness({ brightness: value });

// 添加滤镜到图像对象的 filters 数组中
imgInstance.filters.push(filter);

// 应用滤镜
imgInstance.applyFilters();
```

### 3. 重新渲染

```javascript
canvas.add(imgInstance);
canvascanvas.renderAll();
```

### 官方内置的复杂滤镜：

#### "Brightness"：亮度

此处亮度映射了一个数值，因为亮度为1时已经看不见了，没有意义，所以此处映射值为-0.8 ~ 0.8 后续可以调整。

此处是一个对比效果图，中间图片为不加滤镜时的效果，左右两边分别是正值与负值的效果，这个方法可填入的范围是 `{ min: -1, max: 1 }`。

![Brightness Filter Example](https://example.com/brightness-filter-example.png)


### "Contrast"：对比度

对比度此处也映射了一个数值，范围是 -0.9 ~ 1，方法支持填入的范围是 { min: -1, max: 1 }，对比图如下：

![Contrast Filter Example](https://example.com/contrast-filter-example.png)

### "Saturation"：饱和度

方法支持填入的范围是 { min: -1, max: 1 }
### "HueRotation"：色调

方法支持填入的范围是 { min: -1, max: 1 }，这个参数正值与负值效果一致，下面示意图是不同程度效果展示：

![HueRotation Filter Example](https://example.com/huerotation-filter-example.png)

### "Pixelate"：像素化

需要注意的是方法支持填入的范围是 { min: -100, max: 100 }，这个参数正值与负值效果一致，下面示意图是不同程度效果展示：

![Pixelate Filter Example](https://example.com/pixelate-filter-example.png)
### "Blur"：模糊

方法支持填入的范围是 { min: -1, max: 1 }，这个参数正值与负值效果一致，下面示意图是不同程度效果展示：

![Blur Filter Example](https://example.com/blur-filter-example.png)

### "Gamma"：调整

方法支持填入的范围是 { min: 0.01, max: 2.2 }，我们将其映射到了 -1 ~ 1 的数据上，方便滑块操作展示：

![Gamma Filter Example](https://example.com/gamma-filter-example.png)

### "Shadows"：阴影滤镜

这个滤镜是通过 `BlendColor`（颜色混合）模拟的一个阴影的效果，值的范围是 -1 ~ 1，代码如下：

```javascript
// value 的范围可以是 -1（变暗）到 1（变亮），0 表示没有变化
const shadowValue = value; // 根据需要调整这个值
const shadowColor = shadowValue > 0 ? 'white' : 'black';
const blendMode = shadowValue > 0 ? 'screen' : 'multiply';
const absoluteValue = value > 0 ? Math.abs(value) : 0.01 * (1 + value);
// console.log("setImageClarify====", shadowColor + " absoluteValue=" + absoluteValue);

const shadowsFilter = new fabric.Image.filters.BlendColor({
  color: shadowColor,
  mode: blendMode,
  alpha: absoluteValue
});
```

通过上述代码，可以实现对图像的阴影效果调整。
### "Clarify"：锐化滤镜

这个滤镜比较特殊，官方没有提供，而是通过 Convolute 中的 matrix 矩阵数据进行动态模拟，方法支持填入的范围是 { min: 0.01, max: 2.2 }，映射了 0 ~ 10 的数据，代码如下：

```javascript
private inputRange = { min: -1, max: 1 };
private outputClarifyRange = { min: 0, max: 10 };
const clarifyValue = this.mapValue(value, this.inputRange.min, this.inputRange.max, this.outputClarifyRange.min, this.outputClarifyRange.max);
const clarifyFilter = new fabric.Image.filters.Convolute({
  matrix: [
    0, -clarifyValue, 0,
    -clarifyValue, 4 * clarifyValue + 1, -clarifyValue,
    0, clarifyValue, 0
  ]
});
```

通过上述代码，可以实现对图像的锐化效果调整。
### 官方提供的简单滤镜模板

#### "BlackWhite"：黑白

```javascript
const filter = new fabric.Image.filters.BlackWhite();
```

![BlackWhite Filter Example](https://example.com/blackwhite-filter-example.png)

#### "Sepia"：棕褐色滤镜

```javascript
const filter = new fabric.Image.filters.Sepia();
```

![Sepia Filter Example](https://example.com/sepia-filter-example.png)
### "Invert"：反向

```javascript
const filter = new fabric.Image.filters.Invert();
```

![Invert Filter Example](https://example.com/invert-filter-example.png)

### "Brownie"：巧克力

```javascript
const filter = new fabric.Image.filters.Brownie();
```

![Brownie Filter Example](https://example.com/brownie-filter-example.png)
### "Vintage"：复古

```javascript
const filter = new fabric.Image.filters.Vintage();
```

![Vintage Filter Example](https://example.com/vintage-filter-example.png)

### "Kodachrome"：胶片

左侧为效果图，右侧为原图

```javascript
const filter = new fabric.Image.filters.Kodachrome();
```

![Kodachrome Filter Example](https://example.com/kodachrome-filter-example.png)
### "Technicolor"：鲜艳

```javascript
const filter = new fabric.Image.filters.Technicolor();
```

![Technicolor Filter Example](https://example.com/technicolor-filter-example.png)

### "Polaroid"：高光

```javascript
const filter = new fabric.Image.filters.Polaroid();
```

![Polaroid Filter Example](https://example.com/polaroid-filter-example.png)

### 组合滤镜

所有的简单滤镜是来自复杂滤镜中的一些搭配组合而成，当然也存在一些其他官方没有提供的滤镜，需要我们自己去搭配，以下是一些例子与关键实现参数。

#### 老照片效果

可以通过 Noise、Brightness、Contrast 和 Sepia 滤镜模拟老照片效果

```javascript
var filter1 = new fabric.Image.filters.Noise({
  noise: 100 // 增加噪声
});
var filter2 = new fabric.Image.filters.Brightness({
  brightness: -0.1 // 降低亮度
});
var filter3 = new fabric.Image.filters.Contrast({
  contrast: 0.1 // 增加对比度
});
var filter4 = new fabric.Image.filters.Sepia(); // 棕褐色滤镜
image.filters.push(filter1, filter2, filter3, filter4);
image.applyFilters();
canvas.renderAll();
```

#### 高光效果

可以通过 Brightness 和 Contrast 滤镜模拟高光效果

```javascript
var filter1 = new fabric.Image.filters.Brightness({
  brightness: 0.1 // 增加亮度
});
var filter2 = new fabric.Image.filters.Contrast({
  contrast: 0.1 // 增加对比度
});
image.filters.push(filter1, filter2);
image.applyFilters();
canvas.renderAll();
```

### Convolute 模拟滤镜

Fabric.js 并没有内置的 Convolute 滤镜，但可以尝试使用卷积滤镜来模拟这种效果，以下是使用合适的矩阵来模拟不同的滤镜，以下是代码，以及滤镜效果展示（左侧滤镜效果图，右侧原图）

```javascript
var filter = new fabric.Image.filters.Convolute({
  // 浮雕滤镜
  matrix: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
});
// 浮雕效果（另一种）
'NewEmboss': [2, 0, 0, 0, -1, 0, 0, 0, -1],
// 凹入滤镜
'Inset': [1, 1, 1, 1, -8, 1, 1, 1, 1],
// 突出滤镜
'Outset': [-1, -1, -1, -1, 9, -1, -1, -1, -1],
// 边缘强化滤镜
'EdgeEnhance': [0, 1, 0, 1, -4, 1, 0, 1, 0],
// 边缘检测（水平方向）
'LevelEdge': [-1, 0, 1, -2, 0, 2, -1, 0, 1],
// 边缘检测（垂直方向）
'VerticalEdge': [-1, -2, -1, 0, 0, 0, 1, 2, 1],
// 增强对比度
'EnhanceContrast': [0, -1, 0, -1, 5, -1, 0, -1, 0],
// 高通滤波器（寻找细节）
'HighPassFilter': [-1, -1, -1, -1, 8, -1, -1, -1, -1],
});
object.filters.push(filter);
object.applyFilters();
canvas.renderAll();
```

#### 浮雕滤镜

```javascript
matrix: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
```

![Emboss Filter Example](https://example.com/emboss-filter-example.png)

#### 浮雕效果（另一种）

```javascript
matrix: [2, 0, 0, 0, -1, 0, 0, 0, -1],
```

![NewEmboss Filter Example](https://example.com/newemboss-filter-example.png)

#### 凹入滤镜

```javascript
matrix: [1, 1, 1, 1, -8, 1, 1, 1, 1],
```

![Inset Filter Example](https://example.com/inset-filter-example.png)

#### 突出滤镜

```javascript
matrix: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
```

![Outset Filter Example](https://example.com/outset-filter-example.png)

