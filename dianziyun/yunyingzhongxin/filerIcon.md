# filterIcon
- 使用popover和IconFilter组件实现了一个带有提示文本的过滤器的图标，根据disabled属性来决定图标的可用性
- 使用了arcon-design、web-react库当中的IconFilter和popover组件，
- 
props=>{
｛return props.disbaled ？ （
<Popover content={props.tipText} trigger='hover'>
<IconFilter 
style ={{fontSize:16,cursor:'not-allowed',color:'#c0c6ce'/>
</Popover>）｝
- 接受两个属性tpText和disbaled
- 根据disbaled的属性的值来决定返回的内容，如果为true则返回一个带有提示文本的Popover组件，其中包含了一个不可用的IconFilter图标如果disbaled为假的，则返回一个空的fragment
