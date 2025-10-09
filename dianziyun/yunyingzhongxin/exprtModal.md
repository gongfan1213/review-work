# 导出资源列表功能实现
- 该部分一共分为两个部分
- step1:用户可以选择导出的范围，自定义导出列，和输入的文件名
- step2:导出成功以后，显示导出的成功的信息和id

- 用户可以选择需要导出的列，导出的范围，并且指定导出的文件名，导出操作完成以后，用户可以查看导出记录和复制下载对应的id
- 定义了id和step来处理导出过程当中的中间的状态
# 初始化函数
- useEffect
- 根据用户的信息判断,findIndex((item)=> item.value ==='tenantName')
- .splice(deptIndex,1);某些情况下data是不能导出的
- form.setFeildValue
- 根据用户信息初始化复选框的数据，移除不适用的选项
- 定义对应的data处理对应的数据,label,value,disbaled,
# 取消导出的函数
- setStep1
- init
- onCancel
# handleExprt导出函数
- 点击确认按钮处理导出事件
- 首先需要验证
- name就是label,
- validate
- getFields
- 根据表单选项进行检验getFields
- exportColumn.map((i,index) => {

- })
- 获取表单的字段值:在回调函数当中，通过form.getFields()获取表单的字段值
- 调用对应的api设置对应的id和step
- 定义了exportColumn的字段，是一个数组，包含了用户选择的导出列，map便利这个数组，，构建对应的导出参数，根据获取到的表单字段值和处理后的导出列，构建一个包含导出类型和列等信息的params,
- 如果范围是导出搜索结果，那么assign进params当中，
- then当中处理返回的结果，res.code为success并且downloadId状态为返回的id就设置对弈的td
exportResourceList(params).then((res:any)=>{
    if(res.code?.toLowerCase()==='success') {
        setDownloadId(id);
        setStep(2)\
    }
})
.catch((error) => {
    Message.error()
})
# 模态框的渲染
- Modal
- className
- title
- visible
- onCancer
- footer属性
- 根据step显示确定还是说是导出按钮，
- step为1d的时候，表格显示导出范围，rules设置对应的校验规则，filed设置对应的区域
- 添加Radio单选设置导出全部还是说是导出搜索结果
- 显示自定义导出的列
- 文件名，step为2的时候，显示对应的导出成功，并且可以下载id复制按钮
- 复制按钮copy(downloadId);
# gotoRecord
- window.location.href来设置对应的当前的窗口或者标签的url


