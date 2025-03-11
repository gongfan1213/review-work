- treeColumnDrop 的方法，它似乎是用于处理一个基于 Vue.js 和 VXETable 的表格组件中的列拖拽功能。代码使用了 Sortable.js 库来实现列的拖拽排序。下面我将逐行解释代码的功能：

```js
treeColumnDrop () {
  // 在DOM更新后执行回调函数
  this.$nextTick(() => {
    // 获取到表格的引用
    const $table = this.$refs.tree
    // 创建Sortable实例，使表头的列可以拖拽排序
    this.sortableColumnData = Sortable.create(
      // 选择表头行的DOM元素
      $table.$el.querySelector(
        '.body--wrapper>.vxe-table--header .vxe-header--row'
      ),
      {
        // 指定拖拽的把手为表头列
        handle: '.vxe-header--column',
        // 拖拽结束后的回调函数
        onEnd: ({ item, newIndex, oldIndex }) => {
          // 获取表格的列数据
          const { fullColumn, tableColumn } = $table.getTableColumn()
          const targetThElem = item // 拖拽的目标列元素
          const wrapperElem = targetThElem.parentNode // 目标列的父元素
          const newColumn = fullColumn[newIndex] // 新位置的列数据

          // 如果新位置的列是固定列，则不允许拖拽
          if (newColumn.fixed) {
            const oldThElem = wrapperElem.children[oldIndex]
            // 将列移回原来的位置
            if (newIndex > oldIndex) {
              wrapperElem.insertBefore(targetThElem, oldThElem)
            } else {
              wrapperElem.insertBefore(
                targetThElem,
                oldThElem ? oldThElem.nextElementSibling : oldThElem
              )
            }
              // 显示错误消息
            VXETable.modal.message({
              content: '固定列不允许拖动，即将还原操作！',
              status: 'error'
            })
            return
          }

          // 获取旧列和新列的索引
          const oldColumnIndex = $table.getColumnIndex(tableColumn[oldIndex])
          const newColumnIndex = $table.getColumnIndex(tableColumn[newIndex])
          // 从原位置移除列
          const currRow = fullColumn.splice(oldColumnIndex, 1)[0]

          // 如果列标题是'ID'或'需求ID'，则不允许拖拽
          if (['ID', '需求ID'].includes(currRow.title)) {
            const oldThElem = wrapperElem.children[oldIndex]
            // 将列移回原来的位置
            if (newIndex > oldIndex) {
              wrapperElem.insertBefore(targetThElem, oldThElem)
            } else {
              wrapperElem.insertBefore(
                targetThElem,
                oldThElem ? oldThElem.nextElementSibling : oldThElem
              )
            }
             // 显示错误消息
            VXETable.modal.message({
              content: `${currRow.title}列不允许拖动`,
              status: 'error'
            })
            return
          }

          // 将列插入到新位置
          fullColumn.splice(newColumnIndex, 0, currRow)
          // 重新加载列数据
          $table.loadColumn(fullColumn)
          // 获取所有有字段名的列
          const fields = fullColumn.filter(({ field }) => field)
          // 获取这些列的字段名，排除'id'
          const fieldKeys = fields
            .map(({ field }) => field)
            .filter(key => key !== 'id')
          // 将字段名数组保存到本地存储，用于持久化用户的列顺序设置
          this.$ls.set(VXE_GRID_COLUMN_STORAGE, fieldKeys)
        }
      }
    )
  })
},
```
在Vue组件更新DOM后，使用$nextTick来确保DOM元素已经渲染。

使用Sortable.create来使表头的列可以拖拽。

在拖拽结束后，通过回调函数处理列的重新排序。

如果拖拽的列是固定列或者是特定的列（如'ID'），则不允许拖拽，并将列移回原位置，并显示错误消息。

如果拖拽合法，则更新列的顺序，并将新的列顺序保存到本地存储中。
