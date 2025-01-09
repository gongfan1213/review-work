### Fabric.js 使用手册简介

#### 什么是 Fabric.js?
Fabric.js 是一个可以简化 Canvas 程序编写的库。 Fabric.js 为 Canvas 提供所缺少的对象模型、SVG 解析器、交互和一整套其他不可或缺的工具。由于 Fabric.js 为国外框架，官方 API 杂乱繁多，相关文档大多为英文文档，而且数量不多，所以本文旨在帮助新手在项目中快速上手 Fabric.js，享受绘制 Canvas 的过程。

#### 为什么要使用 Fabric.js？
Canvas 提供一个好的画布能力，但 API 不够友好。绘制简单图形其实还可以，不过做一些复杂的图形绘制，编写一些复杂的效果，就不是那么方便了。Fabric.js 就是为此而开发，它主要就是用对象的方式去编写代码。

#### Fabric.js 能做的事情
- 在 Canvas 上创建、填充图形（包括图片、文字、规则图形和复杂路径组成图形）。
- 给图形填充渐变颜色。
- 组合图形（包括组合图形、图形文字、图片等）。
- 设置图形动画集用户交互。
- 生成 JSON, SVG 数据等。
- 生成 Canvas 对象自带拖拉拽功能。

#### 起步
##### Vue 项目中引入 Fabric.js

假设您的项目中正在使用 ES6 和 Webpack，您可以开始使用 Fabric.js，如下所示：

1. 在命令行中：
   ```bash
   npm install fabric
   # 或者
   yarn add fabric
   ```

2. 将其引入 .vue 文件中：
   ```javascript
   import { fabric } from 'fabric';
   ```

3. 在 .vue 的单文件中的 `mounted` 生命周期里开始你的 Fabric.js 之旅：
   ```javascript
   mounted() {
     var canvas = new fabric.Canvas('main');
     // 你的 Fabric.js 代码
   }
   ```

注：默认的 fabric npm 模块产生了相当大的包，如果 Fabric.js 中您有很多可能不需要的包，在这种情况下，可以在 [此处](http://fabricjs.com/build) 或在命令行中构建你自己的版本。

#### 绘制图形
##### 绘制规则图形
1. 声明画布：
   ```javascript
   var canvas = new fabric.Canvas('main');
   ```

2. 绘制图形：
   ```javascript
   var rect = new fabric.Rect({
     left: 100, // 距离画布左侧的距离，单位是像素
     top: 100, // 距离画布上边的距离
     fill: 'red', // 填充的颜色
     width: 30, // 方形的宽度
     height: 30 // 方形的高度
   });
   ```

3. 添加图形至画布：
   ```javascript
   canvas.add(rect);
   ```

其他规则图形：
- 绘制方形：`var rect = new fabric.Rect`
- 绘制圆形：`var circle = new fabric.Circle`
- 绘制三角形：`var triangle = new fabric.Triangle`

##### 绘制不规则图形
使用路径绘图：用点和线的移动的方式进行绘图。通过对线、曲线、弧的应用绘制非常复杂的图形。

在 `fabric.Path()` 方法中，“M”代表“移动”命令，这个“M 00” 代表把画笔移动到（0,0）点坐标。“L”代表“线”，“L 200 100 ”的意思是使用钢笔画一条线，从（0,0）坐标画到（200,100）坐标。“z” 代表让图形闭合路径。

画好三角形后，我们可以用 `set()` 方法对三角形的位置、颜色、角度、透明度等属性进行设置。

具体代码如下：
```javascript
var path = new fabric.Path('M 0 0 L 200 100 L 170 200 z');
path.set({ left: 120, top: 120, fill: 'red' });
canvas.add(path);
```

通过以上步骤，您可以在 Vue 项目中快速上手 Fabric.js，享受绘制 Canvas 的过程。
