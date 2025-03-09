# 自动化用例界面代码
```js
cmOptions: {
        readOnly: true,
        lineNumbers: true,
        mode: 'robot',
        theme: 'idea'
      },
       computed: {
    productId () {
      const pro = this.activedProject()
      if (pro && pro.id) {
        return pro.id
      }
      return -1
    },
    productName () {
      const pro = this.activedProject()
      if (pro && pro.name) {
        return pro.name
      }
      return '无'
    }
  },
  async startRequestApi () {
      const url = `/api/e2e_case_task/generate`
      this.$emit('updateGenE2eCaseLoading', true)
      let response // Response;
      let isTimeout = false
      try {
        this.controller = new AbortController()
        const signal = this.controller.signal

        this.submitdisabled = true
        this.loading = true
        const body = JSON.stringify({
          display_name: this.$store.state.user.name,
          case_code: this.testcase.case_code,
          case_id: this.testcase.id,
          case_name: this.testcase.name,
          case_pre_step: this.testcase.doc_pre || '',
          case_step: this.testcase.doc_step || '',
          case_expect: this.testcase.doc_except || '',
          case_post_step: this.testcase.doc_post || '',
          case_remark: this.testcase.doc || '',
          case_level: this.testcase.priority,
          case_module: this.caseData.path,
          product_id: this.productId,
          product_name: this.productName
        })
         response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: signal,
          body: body
        })

        if (!response || response.status !== 200) {
          this.submitdisabled = true
          this.$emit('updateGenE2eCaseLoading', false)
          this.loading = false
          const result = await response.json()
          const text = result ? result.message : 'request error'
          // console.log(text)
          // this.addErrorMessage(text);
          return
        }
        if (!response.body) return
         const reader = response.body.getReader()

        if (!reader) return
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            this.submitdisabled = false
            this.loading = false
            break
          }

          this.handleEventMessage(value)
        }
      } catch (error) {
        if (error && error.name === 'AbortError') {
          if (isTimeout) {
            this.submitdisabled = true
            this.loading = false
            // this.addErrorMessage('请求超时');
            isTimeout = false
          }
          return
        }
          this.loading = false
        console.log(`request error. ${url}`, error.message)
        this.$message.error('AI服务异常，请稍后重试！')
        // this.addErrorMessage("服务异常. 若异常依旧，请 dim/企微 联系千流客服.");
        return
      }
      if (this.formData.e2eCase === '') {
        this.submitdisabled = true
      }
      console.log(`request done. ${url}`)
      this.$emit('updateGenE2eCaseLoading', false)
    },
    async acceptRequestApi () {
      const url = `/api/users/code_completion_log`
      // 设置超时时间为5分钟
      const timeOutNum = 300000
      let response // Response;
      let isTimeout = false
      try {
        this.controller = new AbortController()
        const signal = this.controller.signal

        setTimeout(() => {
          this.controller && this.controller.abort()
          isTimeout = true
        }, timeOutNum)

        this.submitdisabled = true
        this.loading = true
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: signal,
          body: JSON.stringify({
            id: this.requestTaskID,
            isAccept: true,
            action: 'e2eCaseGen'
          })
        })
      } catch (error) {
        if (error && error.name === 'AbortError') {
          if (isTimeout) {
            this.submitdisabled = false
            this.loading = false
            // this.addErrorMessage('请求超时');
            isTimeout = false
          }
          return
        }
        console.log(`request error. ${url}`, error.message)
        // this.addErrorMessage("服务异常. 若异常依旧，请 dim/企微 联系千流客服.");
        return
      }

      console.log(`request done. ${url} ${this.requestTaskID}`)
    },
    submit () {
      // 复制到粘贴板
      const textarea = document.createElement('textarea')
      textarea.value = this.formData.e2eCase
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success('复制成功')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textarea)
      // TODO:更新es上的接收状态
      // this.acceptRequestApi()
    },
    // 渲染数据
    outputData (content) {
      console.log(content)

      this.formData.e2eCase = content
    },
    getUuid () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0
        var v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
     // 处理流数据
    handleEventMessage (value) {
      let content = new TextDecoder().decode(value)
      // console.log(content)
      if (this.errorPart) {
        content = this.errorPart + content
        this.errorPart = ''
      }
      // json 序列化
      const parts = content.split('\n\n')
      for (let index = 0; index < parts.length; index++) {
        const part = parts[index]
        // console.log(part)
        if (!part) continue
        try {
          const eventData = JSON.parse(part.trim())
          // console.log(eventData)
          const eventName = eventData.event
          if (!eventName) {
            continue
          }
          if (eventName === aiE2EConstant.workflowStarted) {
            this.streamData = ''
          } else if (eventName === aiE2EConstant.message) {
            this.streamData += eventData.data
            // task_id 是 es id
            this.requestTaskID = eventData.task_id
            this.outputData(this.streamData)
          } else if ([aiE2EConstant.workflowFinished, aiE2EConstant.workflowFail].includes(eventName)) {
            if (this.streamData.trim() === '') {
              this.submitdisabled = true
            } else {
              this.submitdisabled = false
            }
            this.loading = false
            if (eventName === aiE2EConstant.workflowFail) {
              this.cancel()
              this.$message.error(`AI生成失败: ${eventData.data}`)
            }
          }
        } catch (error) {
          this.errorPart = part
          this.submitdisabled = true
        }
      }
    },
```
