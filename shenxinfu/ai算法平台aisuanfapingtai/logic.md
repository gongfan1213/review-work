# 接口
- 创建了统一的url适配器，针对不同的请求操作
- 传递路径和参数
- return url.charAt(0)===='/'?url:`${PREFIX}/${url}`;
- 判断是绝对路径则直接使用和相对路径加上对应的前缀
# 刷新
- get请求接口
- success,msg,data
- trycatch,async,awit
- this.$refs.table;
- 设置分页setTotal,loadTableData(DATA.list)
# 新增和编辑操作
- 封装同一个组件，定义一个方法
- this.$modal(addForm,
- 设置宽度高度autoDestory)
- 新增
- resetForm
- 获取对应实例
- formWin.forRoot.resetForm
  open设置对应的名称，title,data,submit当中async=>{
      处理对应的逻辑
      getJSONValue
      ajaaxSubmitPerson传递对应的参数,formWin,和方法
 }
## 提交函数
- 传递对应的方法,formWin,还有params,
- 判断是编辑还是修改，调用对应的接口，
- 返回success,msg,code,data
- 失败$showError
- 成功过刷新列表formWin.hide
- mounted阶段刷新表格
## 编辑方法
- setJsonaValue
- 。open打开函数
- title,height,datasubmit:async当中执行具体的逻辑
- getJSONvalue()相当于接口参数
- 再拼接上具体的id或者其他值
- 调用ajaxSubmit处理对应的接口请求
# 删除
- 先弹出对应的弹窗，.conformtitle,subTitle,msg,autoClose:true,callback当中调用对应的接口ajaxDelete方法
  callbakc:(actionName)=>{if(actionname==='submit'){
      this.ajaxDeletPerson()
 }}
- 批量删除
- getAllSelections
- this.$confirm:对应的titlle,subtitle,msg,autoClose,callback当中处理对应的逻辑，处理对应的接口请求参数，id值，还有实例.hide,调用对应接口请求方法
- forEach
- ajaxDelete方法
- 调用对应删除接口
- success,msg,处理错误，this.$ok,删除成功后刷新表格
# 封装的组件
- 新增和编辑都用一个组件，传进去某些值判断是否显示某些值
# size ,pageChange
Object.assign(params,{pageNo,pageSize})
  //再刷新列表
