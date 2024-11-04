# 批量添加标签到资源上的模态框
- useState定义组件的状态
- labelValue,addResourceData,labelKey,labelKeyValue,labelValue,labelFull,loading...时间长了记不大清楚了

## 定义了获取标签键和资源列表的函数getTagKey

- 调用某个api返回对应的res,当code==sucess的时候setLabelKeyList
- map遍历，返回对应的name,tagKeyId,tagList
- try,catch显示对应的错误,error.repsonse.data?.message | error.response.data?.msg 
## getReousrceList根据传入的资源向，筛选出来可以添加的标签和不可以添加的标签
- 对数组进行forEach遍历，push进去
- 判断长度大于9的设置full，push进去cant当中
## 定义了绑定资源和获取标签纸的函数
## 定义了根据标签键获取标签纸列表
- 调用某个api返回的list设置进去setLabelValueList
- try.catch补货对应的错误
# 组件的副作用和事件的处理
- useEffect调用getResourceList,up
- onCancel当中定义对应的取消的逻辑设置[],undeifned




