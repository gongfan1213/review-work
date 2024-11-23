# 5.保存和加载canvas的内容
-  保存canvas的内容
- 导出为json的内容，可以把canvas的内容导出为json格式的，这样可以方便的保存和传输

```js
// 将canvas内容导出为json
const json = canvas.to JSON（）；
//介绍toJSON API
toJSON（propertiesToIncludeopt）
//希望再输出当=当中额外包含任何的属性，以字符串数组的形式，例如【‘custom_param','''];
propertiesToIncludeArray<optional>
//输出的Fabric规则Json如下
//Object当中将包含画布当中所有的图层对象的内容
//{objects:[{type;'rect',top:0,width:100,...},{type:'image',....}]};
```

- 将导出的json进行字符串的序列化，便于保存
```js
//可以将jsonString保存在服务器或者本地存储
const jsonString = JSON.stringify(json);
```
- 其中的位图对象type:'image' 的src属性值为base64的时候，可能会出现字符串过长的情况，可以通过替换属性值为既定的唯一标识，加载的时候统一替换回去
- 其中的lumen 2d 编辑器正是如此处理的，fillJson（）
- 导出为图像，可以将canvas的内容导出为图像例如png格式

```js
//将canva内容导出为数据url默认为png格式
//可以将dataURL用于显示图像或者下载
const dataURL =canvas.toDataURL('image/'pmg');
```

## 加载canvas内容
- 从json加载，如果已经保存了canvas的json数据，可以将其加载回canvas

```js
//存在已经保存的画布信息json字符串
const jsonString = “{objects:[{type:'rect',top:0,width:100,...},{type:'iamge',...}];
// 将json字符串解析成为对象
const json = JSON.parse(jsonString);
//从json对象当中加载canvas内容
canvas.loadFromJSON(json,function(){
//渲染canvas
canvas.renderAll();
});
```
- loadfromJSON API概要

```js
loadFromJSON(json:string|object,callback:function,reviveropt?;function)
//该api接受三个参数
//json以上介绍的保存画布信息的json字符串或者json对象
//callback回调函数，在解析json并且初始化相应的对象的时候调用的
//reviveopt 用于进一步解析json元素，在创建每一个fabirc对象后调用的
```

- 项目当中已经使用的该api的模块有
- 历史操作记录的存储
- 导入项目
- 导入模版以及模版文字

- 该api会将画布内已有的所有的对象清除后渲染，如果需要在调用之前保存某些对象所需要的，应该提前保存于变量当中，之后在callback内进行处理
- 如果存在继承重写Fabric。js源码累或者api，在调用该api的时候应该特别注意并且在callback当中进行处理的，或者重写该api
# 常用的方法的介绍
## fabric常见的api的介绍
- add 和remove
- add方法用于将一个或者多个对象添加到画布canvas当中，这个方法通常用于将图形对象比如说矩形，圆形，图像等等添加到Fabric。js的画布实例当中
- remove方法用于从画布当中移除一个对象，这个方法可以帮助你动态从画布当中删除不需要的图形对象

```js
//用法
const rect = new fabric.Rect(...);
const circle = new fabric.Circle(...);
canvas.add(rect);
canvas.add(rect.circle)
canvas.add(rect).add(circle);
canvas.remove(rect);
canvas.renderAll();
```

- 一般情况下，添加或者删除以后配合renderAll或者requestRenderAll来使用

## addWithUpdate和removeWithUpdate
- addWithUpdate和removeWitghUpdate是fabric。group累的方法，用于在更新组的同时添加或者移除对象
- addWithUPdate方法用于将一个对象添加到组当中，并且更新组的边界和位置
- removeWithUpdate方法用于从组当中移除一个对象，并且更新组的边界和位置
```js
const rect1 = new fabric.Rect(...);
const rect2 = new fabric.Rect(...);
const group = new fabric.Group([rect1]);
canvas.add(group);
//添加新的对象到组当中，并且更新组
group.addWithUpdate(rect2);
group.removeWithUpdate(rect1);
canvas.renderAll():
```
### 3.set
- 可以用来一次性设置一个或者多个属性，适用于fabric。js当中的各种对象，比如说
- Rect，circle，text等等


```js
const rect = new fabric.Rect(...);
rect.set('width',100);//这样用
rect.set({
height:100,
scaleX:1.5,
scaleY:1.5,
left:100,
top:100,
angle:360,
//
//or add some custom p
}):
//也是可以这样用的
rect.set('fill','black').set('strokeWidth',2).set('stroke','white');
canvas.renderAll():
```
- 通过set设置对象的anlge属性将以对上的左上角为轴进行旋转，如果需要以对象为中心点进行旋转，使用
object。rotate（角度）
- 设置left和top默认以画布的左上（0，0）坐标点和对象的左上坐标点进行相对位移，如果需要以对象的中心点进行相对的位置，可以通过设置对象的originX和originY的属性值为center
- 设置对象的width和height属性，并不会如预期改变对象在画布上的大小的，而是将作用于其控制狂控件，应该通过设置其scaleX，scaleY

### renderAll和requestRenderAll 
- renderAll的方法会立即重新渲染整个画布的，这意味着他会遍历所有对象并且将它们绘制到canvas上的，通常在对canvas做了某些修改以后需要立即看到效果的时候使用这个方法
- requestReenderAll方法和renderAll类似的，但是不会立即进行渲染的，而是请求在下一次浏览器的重绘周期当中进行渲染，这通常用于优化性能，避免在短时间内多次调用renderAll导致的多次重绘
-  在计算机图形学当中，重绘周期或者称为刷新周期和绘制周期是指浏览器或者绘图引擎对屏幕上的内容进行更新和重绘的时间间隔的，通常，这个周期和显示器的刷新率相关联的，丽日，如果显示器的刷新率是60Hz
- 那么重绘周期大约是每16.67毫秒（1000毫秒/60）
- 调用时机
- renderAll 当需要立即看到修改效果的时候使用的，例如在一个事件处理函数当中修改了对象的属性，并且希望立即看到变化
- requestRenderAll当你在短时间内进行了多次的修改的时候使用，来避免多次的重绘，例如，当你在一个循环当中对多个对象进行修改，可以使用requestRenderAll来减少重绘次数，提高性能
- 实例

```js
//添加一个矩形
canvas.add(rect);
canvas.renderAll();
//立即渲染
for（let i= 0；i<100;i++){
//修改对象属性
canvas.getObjects()[i].set('fill','red');
}
//推迟到下一个重绘周期再次进行重绘，性能较好
canvas.requestRenderAll();
```
- renderAll会立即渲染画布，而requestRenderAll会在下一次浏览器的重绘周期当中进行渲染，这样可以避免在短时间内多次调用renderAll导致的性能问题，
- 交互的表现是卡顿
- get Object's（typeopt？；string）
- type可选的，一个字符串，表示要获取的对象的类型，例如，如果你只想获取所有的矩形对象，可以传入rect，如果不穿入参数，则返回所有的对象

```js
//用法
const allObject = canvas.getObjects();
const allImageObject = canvas.getObjects('image');
```

- typeopt 传惨类型为fabric。js对象的所有的类型，包含以上的基本形状和复杂的对象的类型名称，字母小写
- 以上loadFromJSON 所提及的保存某些对象的情况可以使用该api获取保存
### getActiveObjects（）
- 该方法用于获取当前选中的所有的对象，返回一个数组，数组当中包含所有的选中的对象

```js
//用法
const activeObjects = canvas.getActiveObject();
```

### getActiveObject
- 需要区别于上面的api，用于获取当前被选中的对象，在fabric。js当中用户可以通过鼠标点击或者拖动来选择画布上的对象
- getActiveObject方法返回当前被选中的对象，如果没有对象被选中，则返回null
- 所返回的对象类型为以上复杂对象所述的ActiveSelection类型，该类型继承自fabric。Group，但是不同点是一种临时的分组方式，主要用于临时的编辑，例如说将选中的多个对象进行群组
批量操作进行复杂或者删除等等

```js
//用法
const activeObject = canvas.getActiveObject();
//1.duplicate(复制并且粘贴）
activeObject.clone((cloneObj)=>{
canvas.add(cloneOBj);
}):
//批量改变属性
activeObject.set（‘xxx'，xxx）；
//3.群组
activeObject.toGroup();
//
```

### loadFromJSON(json:string |object,callback:function ,reviveropt?:function )
- 使用该api需要注意的是需要确保json字符串的格式是正确的，否则可能会导致报错并且加载失败

```js
// 一般情况下；通过  toJSON导出的格式大致如下
{
"version":"4.5.0",//fabric。js版本号
"objects":[
//  画布上对象数组
  {"type":"rect",
//..其他对象属性
  }
],
///..
}
```

- 如果存在继承重写fabric。js源码累或者api，在调用的时候应该特别注意并且在
- callback当中进行处理的，或者重写该api
- 
```js
//重写方法
fabric.Canbas.prototype.loadFromJSON = function(/.重写所需要的参数*/）{
return new Promise((resolve,reject) =>{
//可以在该位置加上符合需要的逻辑
resolve（/*。。。*/）；
})
}


```


- fabric.js loadFromJSON source code;

```js
loadFromJSON:function (json,callback,reviver){
if(!json)return;
//serialize if it wasnt already
var serialized = (typeof json==='string')
? JSON.parse(json)
:fabric.util.object.clone(json);
var _this = this,
clipPath = serialized.clipPath,
renderOnAddRemove = this.renderOnAddRemove;
this.renderOnAddRemobe = false;
delete serialized.clipPathl;
this._enlivenOBjects(serialized.objects,function(enlivendOBject){
_this.clear():
_this._setBgOverlay(serialized,function(){
if(clipPath) {
_this._enlivenObject([clipPath],function(evlivnedCanvasClip){
_this.clipPath = enlivedCanbasClip [0];
_this.__setupCanvas.call(_this,serialized,enlivenedObjects,renderOnAddremove,callback);
});
}
else{
_this.___setupCanvas.call(_this,serilaized,enlivenedObject,renderOnAddRemove,callback);
}
}):
},reviver);
return this;
},
```
