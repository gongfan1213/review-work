# 智能优化用例和自动化按钮的界面代码

```js
 <div class="case-button" v-if="amode === 'view' && showButton && !isTestPlan" >
              <div class="background-img">
                <img src="./imgs/AiIcon.svg" alt="AI Logo" class="ai-icon">
                <span class="separator">|</span>
                <a-button
                  type="link"
                  @click="e => startAiOptCase(e)"
                  :loading="isOptCaseLoading"
                  :disabled="isGenE2eCaseLoading"
                  class="ai-button"
                  :class="{isLoading: isOptCaseLoading}"
                  html-type="button"><span style="font-size: 12px;">智能优化用例</span></a-button>
      e.stopPropagation()
      e.preventDefault()
      this.$refs.genE2eCaseForm.cancel()
      this.$refs.developCaseForm.open(this.testcase)
    },
```
- 2） 点击“智能优化用例”按钮，则出现千流AI智能优化用例弹窗。；点击“生成自动化用例”按钮，则出现千流AI生成自动化用例弹窗；同一时间只能显示1个AI生成弹窗（例如：若详情页已显示AI智能优化用例弹窗，点击“生成自动化用例”操作 则关闭AI智能优化用例弹窗，显示AI生成自动化用例弹窗）目前【生成自动化用例】操作入口只有 AF产品 可见，因此其他产品线的用例详情看到的操作入口如下：操作按钮的状态有“默认、加载中”2种；
当AI生成任务结束，操作入口由加载中状态回到默认状态；
# 智能优化用例功能实现代码
```js
export default {
  directives: {
    draggable: {
      bind (el, binding) {
        // 初始位置设置为右下角
        el.style.position = 'absolute'
        el.style.bottom = '0'
        el.style.right = '0'

        const header = el.querySelector('.form-header')
        header.style.cursor = 'move'

        function preventTextSelection (event) {
          event.preventDefault()
        }
        const documentWidth = document.querySelector('.case-detail').clientWidth
        const documentHeight = document.querySelector('.case-detail').clientHeight

        header.onmousedown = function (e) {
          // 计算鼠标相对元素的位置
          const disX = e.clientX - el.offsetLeft
          const disY = e.clientY - el.offsetTop

          // 禁用文本选择
          document.body.style.userSelect = 'none'
          document.addEventListener('selectstart', preventTextSelection)

          document.onmousemove = function (e) {
            // 计算移动后的元素位置
            let left = e.clientX - disX
            let top = e.clientY - disY

            // 防止拖动超出窗口边界
            left = Math.max(0, Math.min(left, documentWidth - el.offsetWidth))
            top = Math.max(0, Math.min(top, documentHeight - el.offsetHeight))

            // 移动当前元素
            el.style.left = left + 'px'
            el.style.top = top + 'px'
          }
          
           document.onmouseup = function () {
            // 当鼠标放开时，解除事件绑定
            document.onmousemove = null
            document.onmouseup = null

            // 重新启用文本选择
            document.body.style.userSelect = ''
            document.removeEventListener('selectstart', preventTextSelection)
          }
        }
         let startX, startWidth
        // 创建拖拽手柄
        const handle = document.createElement('div')
        handle.style.width = '10px'
        handle.style.height = 'calc(100% - 40px)'
        handle.style.position = 'absolute'
        handle.style.top = '40px'
        handle.style.right = '-5px'
        handle.style.cursor = 'ew-resize'
        el.appendChild(handle)
        handle.addEventListener('mousedown', (e) => {
          startX = e.clientX
          startWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10)
          document.documentElement.addEventListener('mousemove', onMouseMove)
          document.documentElement.addEventListener('mouseup', onMouseUp)

          // 禁用文本选择
          document.body.style.userSelect = 'none'
          document.addEventListener('selectstart', preventTextSelection)
        })
  const onMouseMove = (e) => {
          const newWidth = startWidth + e.clientX - startX
          el.style.width = Math.min(850, Math.max(450, newWidth)) + 'px'
        }

        const onMouseUp = () => {
          document.documentElement.removeEventListener('mousemove', onMouseMove)
          document.documentElement.removeEventListener('mouseup', onMouseUp)
          // 重新启用文本选择
          document.body.style.userSelect = ''
          document.removeEventListener('selectstart', preventTextSelection)
        }
      }
    }
  },
  
  data () {
    return {
      isContentOutOfView: false,
      close: true,
      loading: false,
      submitdisabled: false,
      defaultDisabled: true,
      requestTaskID: '',
      formData: {
        doc_pre: '',
        doc_step: '',
        doc_except: '',
        doc_post: ''
      },
      dataMap: {
        前置条件: 'doc_pre',
        操作步骤: 'doc_step',
        期望结果: 'doc_except',
        后置条件: 'doc_post'
      },
      controller: null,
      streamData: '',
      errorPart: ''
    }
  },
  methods: {
    /**
     * 取消操作，关闭当前对话框并中止请求
     */
    cancel () {
      this.close = true
      this.$emit('updateOptCaseLoading', false)
      this.controller && this.controller.abort()
    },

    /**
     * 打开对话框，初始化表单数据并开始请求API
     * @param {Object} data - 用例数据
     */
    open (data) {
      this.loading = false
      this.close = false
      this.testcase = data
      this.formData = {
        doc_pre: '',
        doc_step: '',
        doc_except: '',
        doc_post: ''
      }
      this.startRequestApi()
    },
    
    /**
     * 异步请求API，处理流数据并更新状态
     */
    async startRequestApi () {
      // 定义请求 URL
      const url = `/api/v4/chat_agent`

      // 触发更新加载状态事件
      this.$emit('updateOptCaseLoading', true)

      let response
      let isTimeout = false

      try {
        // 创建 AbortController 实例
        this.controller = new AbortController()
        const signal = this.controller.signal

        // 禁用提交按钮并设置加载状态
        this.submitdisabled = true
        this.loading = true

        // 发送 POST 请求
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: signal,
          body: JSON.stringify({
            stream: true,
            conversation_id: this.getUuid(),
            action: 'optimizeTestCases',
            query: `用例名称：\n${this.testcase.name}\n 前置条件: \n${this.testcase.doc_pre}\n 操作步骤: \n${this.testcase.doc_step}\n 期望结果: ${this.testcase.doc_except}\n 后置条件: ${this.testcase.doc_post}\n 用例备注: ${this.testcase.doc} `
          })
        })
// 检查响应状态
        if (!response || response.status !== 200) {
          this.submitdisabled = true
          this.$emit('updateOptCaseLoading', false)
          this.loading = false
          const result = await response.json()
          const text = result ? result.message : 'request error'
          return
        }
        if (!response.body) return
         // 获取响应流的读取器
        const reader = response.body.getReader()

        if (!reader) return
        // 读取响应流
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            this.submitdisabled = false
            this.loading = false
            break
          }

          // 处理事件消息
          this.handleEventMessage(value)
        }
      } catch (error) {
        // 处理请求错误
        if (error && error.name === 'AbortError') {
          if (isTimeout) {
            this.submitdisabled = true
            this.loading = false
            isTimeout = false
          }
          return
        }
        this.loading = false
        this.$message.error('AI服务异常，请稍后重试！')
        return
      }
      
      // 检查表单数据是否为空
      if (
        this.formData.doc_pre === '' &&
        this.formData.doc_step === '' &&
        this.formData.doc_except === '' &&
        this.formData.doc_post === ''
      ) {
        this.submitdisabled = true
      }

      // 触发更新加载状态事件
      this.$emit('updateOptCaseLoading', false)
    },
/**
     * 处理流数据
     * @param {Uint8Array} value - 流数据
     */
    handleEventMessage (value) {
      // 将接收到的二进制数据解码为字符串
      let content = new TextDecoder().decode(value)

      // 如果有前一次未处理完的错误部分，将其拼接到当前内容前面
      if (this.errorPart) {
        content = this.errorPart + content
        this.errorPart = ''
      }

      // 按行分割内容
      const parts = content.split('\n')

      // 遍历每一行内容
      for (let index = 0; index < parts.length; index++) {
        let part = parts[index]
        if (!part) continue // 跳过空行

        try {
          // 移除 'event: ping' 字符串
          part = part.replace('event: ping', '')

          // 将 JSON 字符串解析为对象
          const eventData = JSON.parse(part.trim())
          const eventName = eventData.event
          if (!eventName) {
            continue // 如果没有事件名称，跳过
          }
          // 根据事件名称执行相应操作
          if (eventName === 'sf_task_agent_start') {
            this.streamData = '' // 重置 streamData
          } else if (eventName === 'message') {
            this.streamData += eventData.answer // 拼接消息内容
            const result = this.handleStreamData(this.streamData) // 处理拼接后的数据
            this.requestTaskID = eventData.task_id // 更新任务 ID
            this.outputData(result) // 输出处理结果
          } else if (eventName === 'workflow_finished') {
            this.streamData = eventData.data.outputs.answer // 获取最终输出
            const result = this.handleStreamData(this.streamData) // 处理最终输出
            this.outputData(result) // 输出处理结果
          } else if (eventName === 'message_end') {
            this.errorPart = '' // 清空错误部分
            if (this.streamData.trim() === '') {
              // 检查是否有内容
              this.submitdisabled = true // 禁用提交按钮
            } else {
              this.submitdisabled = false // 启用提交按钮
            }
            this.loading = false // 停止加载状态
          }
        } catch (error) {
          // 如果解析出错，将当前部分保存到 errorPart，并禁用提交按钮
          this.errorPart = part
          this.submitdisabled = true
        }
      }
       this.$nextTick(() => {
        const modalBody = this.$refs.modalBody
        if (modalBody) {
          modalBody.scrollTop = modalBody.scrollHeight
        }
      })
    },

    /**
     * 提取表单数据
     * @param {string} content - 流数据内容
     * @returns {Array} - 提取后的表单数据数组
     */
    handleStreamData (content) {
      const regex = /### (.+?)\n([\s\S]*?)(?=###|$)/g
      const result = []
      let match

      while ((match = regex.exec(content)) !== null) {
        result.push({
          key: match[1].trim(),
          value: match[2].trim()
        })
      }
      return result
    },
 /**
     * 渲染数据
     * @param {Array} arr - 提取后的表单数据数组
     */
    outputData (arr) {
      arr.map((item) => {
        if (this.dataMap[item.key]) {
          this.formData[this.dataMap[item.key]] = item.value
        }
      })
    },

    /**
     * 上报数据
     */
    async acceptRequestApi () {
      const url = `/api/users/code_completion_log`
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: this.requestTaskID,
            isAccept: true,
            action: 'optimizeTestCases'
          })
        })
      } catch (error) {
        console.log(`request error. ${url}`, error.message)
      }
    },
    
    
    /**
     * 生成UUID
     * @returns {string} - 生成的UUID
     */
    getUuid () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0
        var v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },

    /**
     * 提交表单数据
     */
    submit () {
      if (
        this.formData.doc_pre === '' &&
        this.formData.doc_step === '' &&
        this.formData.doc_except === '' &&
        this.formData.doc_post === ''
      ) {
        this.$message.error('请填写完整用例')
        return
      }
      const params = {
        doc_pre: this.formData.doc_pre.replace(/\n/g, '<br />'),
        doc_step: this.formData.doc_step.replace(/\n/g, '<br />'),
        doc_except: this.formData.doc_except.replace(/\n/g, '<br />'),
        doc_post: this.formData.doc_post.replace(/\n/g, '<br />')
      }
      
      updateCaseApi(this.testcase.version_id, this.testcase.id, {
        case_code: this.testcase.case_code,
        case_type: this.testcase.case_type,
        doc: this.testcase.doc,
        isautomated: this.testcase.isautomated,
        name: this.testcase.name,
        priority: this.testcase.priority,
        tags: this.testcase.tags,
        test_method: this.testcase.test_method,
        ...params
      })
        .then((resp) => {
          this.cancel()
          this.$emit('updateData', resp)
        })
        .catch((handleCallbackErr) => {
          this.$message.error('保存失败')
        })
      // 上报数据
      this.acceptRequestApi()
    },
    stopGeneration () {
      this.submitdisabled = false
      this.$emit('updateOptCaseLoading', false)
      this.controller && this.controller.abort()
      this.loading = false
    }
  }
}
          
        
```

### 3）千流AI-智能优化用例弹窗：
 - 弹窗默认高度740px，弹窗最大高度850px。默认宽度640px，最大宽度850px，最小宽度450px;
-  高度根据流式生成内容自适应弹窗高度，超过最大高度则显示滚动条（页面内容向上滚动，始终显示最下方的流式生成内容）。
 - 宽度支持用户自定义拖拽调整弹窗宽度；
-  弹窗有【标题栏、内容栏、对话框（位置预留，当前不做）】3部分；
 - 标题栏有“主标题、副标题”2个；且高度固定。
 - 内容栏有“前置条件、步骤、预期结果、后置条件”4部分。
- 当用例内容流式生成中：
- 1、当流式生成内容不超过弹窗最大高度时，自适应弹窗高度（加载中整行、停止生成按钮始终跟随在生成内容下方）
- 2、当流式生成内容超过弹窗最大高度时，显示滚动条（加载中整行、停止生成按钮固定显示在弹窗最下方，弹窗内容栏向上滚动，
-  始终显示最下方的流式生成内容）
- 支持拖拽移动弹窗位置。（拖拽规则与之前弹窗一致）
- 状态说明
- 1、生成中：“采纳”按钮禁用；内容区仅显示；支持点击“停止生成”按钮；
    点击“停止生成”，则中止生成任务，页面由“生成中”效果切换为“生成结束”效果；
- 2、生成结束：“采纳”按钮高亮；内容区支持编辑！（当用户输入内容超过弹窗高度时，内容区显示滚动条支持向上滚动）
    点击“采纳”，则关闭弹窗并将弹窗内容覆盖到用例详情。
- 3、此弹窗通过点击“采纳”按钮，可以关闭弹窗；通过点击“关闭icon”，可以关闭弹窗；
- 4）千流AI-生成自动化用例弹窗
 - 弹窗高度、宽度、拖动调整位置等操作与【智能优化用例弹窗规则一致】
 - 弹窗有【标题栏、内容栏、对话框（位置预留，当前不做）】3部分；
 - 标题栏有“主标题、副标题”2个；且高度固定。
 - 内容栏有“内容显示框”1部分。
- 当用例内容流式生成中：
- 1、当流式生成内容不超过弹窗最大高度时，自适应弹窗高度（加载中整行、停止生成按钮始终跟随在生成内容下方）
- 2、当流式生成内容超过弹窗最大高度时，显示滚动条（加载中整行、停止生成按钮固定显示在弹窗最下方，弹窗内容栏向上滚动，
 始终显示最下方的流式生成内容）
- 支持拖拽移动弹窗位置。（拖拽规则与之前弹窗一致）
- 状态说明：
- 1、生成中：“复制”按钮禁用；内容区仅显示；支持点击“停止生成”按钮；
         点击“停止生成”，则中止生成任务，页面由“生成中”效果切换为“生成结束”效果；
- 2、生成结束：“复制” 按钮高亮；内容区仅显示。点击“复制”，则显示“复制成功”；
- 3、生成的自动化代码不支持换行，超过弹窗宽度则内容区显示横向滚动条；
- 4、此弹窗通过点击“关闭icon”可以关闭弹窗；

