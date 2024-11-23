- 技术栈：React+typescript+Fabric.js
- faric.js在html5上进行2d绘图和交互的，使用fabric框架构建2d编辑器的前端
- npm install fabric
- github.com/fabricjs/fabric.js/releases

  ## 初始化fabric.js canvas

```js
<canvas id="canavs"></canvas>
```



- 在html上创建一个canvas标签容器之后作用于fabric.js进行初始化，通过以下构造器挂载

```js
const canvas = new fabric.Canabs(element:HTMLCanvasElement | string | null,options?:ICanvasoptions){
//参数说明，element所挂载元素document或者id，optionscanavs在行为和外观上的配置
//options常见的选项
width：number；//宽度
height：number；//高度
preserveObjectStacking：boolean；//选中的时候是否保持对象的堆叠顺序
selectionBorderColor:string;//选择边框颜色
selectionColor:string;//选择狂背景颜色
```

- 初始化挂载完毕以后，就是可以通过实例化变量对象canvas进行对画布的交互
## 3.添加基本的形状和状态
- 基础形状
- class：Rect 用户绘制矩形

```js
//create a rectangle
const rect = new fabric.Rect({
left:100,//x位置
top：100，//y位置
width：200，//宽度
height：100，//高度
stroke：‘black’，//边框颜色
strokeWidth：1，
fill：‘red'，//背景颜色
//。。。
});
//addd the rectangle to the canvas
canavs.add(rect);
```

- circle用于绘制圆形的

```js
//创建圆形
const circle = new fabric.Circle({
left:300,
top:300,
fill:'blue',
radius:40,//半径
});
//添加到画布
canvas.add(circle);
```
- class:ellipse绘制椭圆形

```js
//create an ellipse
const ellipse = new fabric.Ellipse({
left:200,
top:100,
fill:'blue',
rx:50,//radius x
ry:25,//radius y
//....
}):
//add ellipse to canvas
canvas.add(ellipse);
```
- class:Polygon用于绘制多边形

```js
const polyline = new fabric.Polygon([
{x:10,y:10},
{x:50,y:30},
{x:40,y:70},
{x:60,y:90},
{x:100,y:150}],{
left:100,top:100,stroke:'green',
strokeWidth:1,
//...
});
canvas.add(polyline);
```

- clas:polyline用于绘制多边线

```js
const points = [
{x;10,y:10},
{x:50,y:30},
{x:40,y:70},
{x:60,y:90},
{x:100,y:150},
```
- class:line 用于绘制直线

```js
//[50,100,200,200]分别表示【x1，x2，y1,y2]
const line  = new fabric.Line([50,100,200,200],{
stroke:'green',
strokeWidth:2,
//...
});
canvas.add(line);
```
- class:path用于绘制路径
- fabric。path对象允许你通过定义一系列的绘图命令来创建复杂的形状，路径命令通常遵循svg可缩放十辆图像的路径数据格式的

```js
//创建一个路径对象
const path =new fabric.Path('M 0 0 L 200 100 L 170 200 z', {
fill:'red',//填充颜色
stroke：‘blue’，//边框颜色
strokeWdith:1,//边框的宽度
//。。。
});
//将路径对象添加到画布当中
canvas.add(path);
```

- M 0 0表示移动到坐标（0，0）
- L 200 100表示从当前点绘制一条直线到坐标（200，100）
- L170 200 表示从当前点绘制一条直线到坐标（170，200）
- z表示关闭路径，就是绘制一条直线回到起点
- 通过这种方式你可以使用fabric.path来创建任意复杂的形状
复杂对象
- class：text 用于绘制不可编辑的文本
- class：IText用于绘制不可换行的可以编辑的文本
- class：Textbox用于绘制可以调整文本框可以编辑的文本

```js
const text = new fabric.Textbox 或者new fabric。IText 或者new fabric。Text
（‘Text’，「
left：100，
top：200，
//。。。
});
canvas.add(textbox);
```

- jsdoc:class:Image 用于绘制位图.jpg,.jpeg.png,.webp,.gif..

```js
fabric.Image.fromURL('path/to/your/image.jpg',function(img){
//调整图像参数
img.set({
left:100,
top:100,
//...
});
//将图像添加到画布当中
canvas.add(img);
});
```

- class: ActiveSelection用于处理多个选定的对象的集合

```js
//例如存在3个矩形对象rect1，rect2，rect3
//添加到对象到画布当中
canvas.add(rect1,rect2,rect3);
//选择多个对象
canavs.setActiveObject(new fabric.ActiveSelection({rect1,rect2,rect3]);
```
## 画布和对象的交互
- 画布交互常用的功能
- fabricjs.com/docs/fabric.Camvas.html
- object:added想画布当中添加新对象的时候触发
- object：removed删除画布当中对象时候触发
- object：modified当对象结束修改的时候触发
- object：rotating当对象旋转的时候触发
- object：scaling当对象进行缩放的时候触发
- object：moving当对象移动位置的时候触发
- object：skewing当对象倾斜变化的时候触发
- selection：cleared 清除画布人意对象选中的状态的时候触发
- selection：updated画布选中对象更改的时候触发
- selection：created选中画布对象的时候触发的
- mouse：down监听鼠标点下事件
- mouse：move监听鼠标移动事件
- mouse：up监听鼠标松开的事件
- mouse：over监听鼠标悬浮的事件
- mouse：dblclick监听鼠标双击事件

```js
//以上监听事件用法是一致的
canvas.on('object:modified',e=>{
//回调函数e当中包含监听事件所需要的数据信息
console.log(e);
}):
```

## 对象的交互常用的功能
- https：//fabric.js/docs/fabric.Object.html
- event:removed所监听对象被删除
- event：selected所监听对象激活选中
- event：deselected所监听对象选中状态失效
- event：modfiedi所监听的对象属性之北修改以后
- event：rotating所监听的对象旋转的时候
- event：rotated所监听的对象旋转以后
- event：scaling所监听的对象缩放以后
- event：scaled 所监听的对象缩放以后
- event：moving所监听对象位置移动以后
- event：moved所监听对象位置移动以后
- event：skewing所监听对象倾斜变化的时候
- event：skewed所监听的对象倾斜变化以后
- event：mousedown鼠标点下区域所在的监听对象上
- event：mouseup鼠标送卡区域所在的监听对象上的时候
- event：mouseover鼠标悬浮区域所在的监听对象上
- event：mousedblclick双击监听对象的时候
- 以上监听对象事件用法是一致的例如

```js
//其中的event不需要加上
canvas.on('modified',e=>{
//回调函数e当中包含监听事件当中所需要的数据信息
console。log（e）；
});
```
- 修改对象的参数或者状态

  ```js
  //方式1
  object.set('xxx',xxx);
  //方式2
  object.set({
  'xx':'xx',
  'xx'：‘xx’，
  }):
  ```
  - 复制和粘贴对象方式如下

  ```js
  let clipboard:fabric.Object | fabric.Object[];
  //复制
  //使用clone方式
  object.clone((copyElement:fabric.Object)=>{
clipboard = copyElement;
},
//对象所需要自定义的参数名称，以字符串的形式
```
- 复制多个对象的情况下，clipboard的类型应该是fabric.object[],粘贴的时候应该循环添加的
- 改变对象的层级，方式如下
```js
//将对象置于最高层级
object。bringToFront（）；或者canvas.bringToFront(object);
//将对象向上提高一个层级
object.bringForward();或者canvas.bringForward(object);
//将对象层级降至最低
object.sendToBack();或者canvas.sendToBack(object);
//将对象向下一个层级
object.sendBackwards();//或者canvas。sendBackwards（object）；
```
- 多选的时候应该循环调用或者群组后调用再解散等方式处理

- 群组对象与解散群组的方式

```js
//群组
//画布当中存在多个选中的对象
let activeKlass = this.canvas.getActiveObject() as fabric.ActiveSelection;
activeKlass.toGroup();
//画布当中不存在选中的对象的时候，假如说将rect和circle这两个对象进行群组并且添加到画布
const group = new fabric.Group([rect,circle],{
//..
});
//将该群组对象添加到画布当中
canvas.add(group);
// 介山群组
group.toActiveSelection();
```

- 锁定和解锁对象

```js
//当都是true的时候就解锁默认的，当都是false的时候锁定
object.set({
selection:false,
//是否可以选中booleam
evented：false，
//是否允许交互事件：boolean
});
```


  
