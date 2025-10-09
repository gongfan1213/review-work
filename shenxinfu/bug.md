# [2024090900169]【客户经营平台930】指定客户经营接口人弹窗，“角色职责”后少了冒号“:”
# [2024082900347]【历史遗留】【组件库】【交互检视】指定服务总接口人的界面样式问题
# [2024082800427]【经营平台930】指定服务总接口人，点击空白处关闭确认变更弹窗，指定服务总接口人的确定按钮仍被禁用
# [2024082800434]【经营平台930】指定服务总接口人中，点击取消button关闭确认变更二次弹窗后，关闭了所有弹窗并toast提示成功
```js
//const openModal = (isEmpty: boolean, value: number[] | undefined , oldValue: number[] | undefined) => {
const openModal = (isEmpty: boolean, value: number[] | undefined) => {
  return new Promise((resolve) => {
    modal.confirm(
      {
          });
          resolve(true);
        },
        onClose: () => {
          resolve(false);
        },
        onCancel: () => {
        //  formGroup.setValue({
          //  ids: oldValue,
         // });
          resolve(false);
        },
      }
  }
}

//const deleteInterfacePerson = () => {
 // const ids = formGroup.getValue().ids;
 // openModal(true, undefined, ids);
//}
const deleteInterfacePerson = () =>  openModal(true, undefined)

```
# [2024082900385]【经营平台930】指定服务总接口人，确认变更弹窗点击“取消”，清除了已选中的子账号
删除oldValue
# [2024081400101]千流AI-【E2E自动化用例生成】测试任务页面不应该出现 ai生成按钮
# [2024081300208]千流AI-【E2E自动化用例生成】编辑测试用例时，不显示AI生成的背景框
# [2024081300330]千流AI-【E2E自动化用例生成】AI生成测试设计操作样式修改
# [2024080800410]千流AI-【AI分阶段生成测试设计】需求条目数超过18条，会导致翻页按钮被遮住
# [2024080900015]千流AI-【AI分阶段生成测试设计】触发生产测试需求项，出现报错“操作失败”
if (error.response) {
    const data = error.response.data
    const errorMessage = data.message || '操作失败'

# [2024080900248]千流AI-【测试设计详情】xmind与上方标题有分隔间距，需要去掉
# [2024080900324]千流AI-【AI分阶段生成测试设计】当有AI生成进行中的任务时，要禁用掉测试分析、测试设计页面右键的相关编辑脑图的操作
# [2024080200291]千流AI-【AI分阶段生成测试设计】当关联的需求内容为空时，触发AI生成需求分析的提示优化下
# [2024080200105]千流AI-【AI分阶段生成测试设计】AI全量生成测试点按钮禁用状态显示与交互不一致（需求分析/测试分析的生成按钮同理
# [2024080600152]千流AI-【AI分阶段生成测试设计】测试设计生成完成后会刷新测试分析页面数据
```js
const isOngoing = ['排队中', '进行中'].includes(data.display)
        const mode = isOngoing ? 'readonly' : 'eit'
        this.xxxxsetMode(mode)
        this.xxxxxsetState(data)
        if (data.task_step !== 'DS' && (!isOngoing || (isOngoing && data.task_step !== this.currentTab))) {
          // 若相应数据有更新但未渲染，则进行渲染更新
          if (this.cccccdesignData !== this.Data) {
            this.sccccetMode(mode, this.Data)
          }
          return
        }
```
# [2024080500626]千流AI-【AI分阶段生成测试设计】建议优化需求分析生成中的图标和提示显示在测试需求列表页面中间
# [2024080200250]千流AI-【AI分阶段生成测试设计】新增需求项时，需求项名称必填未做校验
 - prop="demand_name"
# [2024080200255]千流AI-【AI分阶段生成测试设计】AI生成过程中，需求分析结果仍然可以编辑和删除，需要屏蔽掉
- :disabled="isDisabled
# [2024080200086]千流AI-【AI分阶段生成测试设计】新增测试设计弹窗、编辑测试设计弹窗， 显示与交互不符
```js
<tooltip placement="bottom" effect="light" color="#666666">
            <template #content color="#666666">
              <div>请用一x项</div>
              <div>的xxxx骤</div>
              <div>示例：xxxxx风</div>
              <div> 险的功能xxxxxxx对措施。</div>
            </template>

```
# [2024080300067]千流AI-【AI分阶段生成测试设计】需求分析阶段，单击“生成需求项”，内容不存在时，无需 二次确认
# [2024080300069]千流AI-【AI分阶段生成测试设计】首次创建完测试设计任务后，生成需求项的任务 需要自动拉起；  
```js
 const generate = this.$route.query.generate
          if (generate && this.demandtotal === 0) {
            this.handleStartFullDesign()
            this.$router.replace({
              ...this.$route,
              query: {
                ...this.$route.query,
                generate: undefined
              }
            })
          }

```
# [2024080200267]千流AI-【AI分阶段生成测试设计】需求分析列表搜索搜索后图标显示重叠，同时建议不区分大小写
# [2024080200244]千流AI-【AI分阶段生成测试设计】新增需求项弹窗，必填项校验与交互不符
# [2024080200272]千流AI-【AI分阶段生成测试设计】AI停止生成边框优化下颜色，与交互保持一致
# [2024080200261]千流AI-【AI分阶段生成测试设计】建议需求分析、测试分析、测试设计tab选中做下间距处理
#  [2024080200114]千流AI-【AI分阶段生成测试设计】新增需求项页面，必填项 说明与交互不一致
# [2024080200247]千流AI-【AI分阶段生成测试设计】新增需求项成功tips提示与交互不符
 Message.success('操作成功')
          this.$message.success('操作成功')

# [2024080200064]千流AI-【AI分阶段生成测试设计】编辑测试设计时，筛选所属项目和版本弹窗显示异常
# [2024071800247]--要改【集成测试】【用数可视组】【体验】告警规则配置-风险类型说明 示意图变形了
width: auto;
    height: auto;

# [2024071800248]--要改【集成测试】【用数可视组】【体验】适用范围改为过滤条件
#  [2024071800016]【集成测试】数据类型管理中搜索数据类型名称没有生效
```js
@on-refresh="handleRefresh" />
 private handleRefresh(data?: []) {
        this.loadData({
            match_filters: data
        });
    }

```
#  [2024071700470]【改】【集成测试】【用数可视组】【动态数据资产】数据类型画像-移除文案，不需要加粗
font-bold
# [2024080200267]千流AI-【AI分阶段生成测试设计】需求分析列表搜索搜索后图标显示重叠，同时建议不区分大小写
后端问题，clearable
# [2024071700468]【改】【集成测试】【用数可视组】【GPT助手】GPT助手匹配API中API描述超长，导致后面内容超过回复框边界
# [2024071600450]【用数可视】【app画像】在描述为空时，修改名称保存之后会带入desc为null
feat: 资产管理页面修改
- 1.新增应用资产管理,加参数：name_is_update: true

- 2.编辑应用资产管理,保存之前调用查询接口，如果接口返回的数据的 name 和表单 name 相同， name_is_update 设置为 true，如果不同就设置为 false，desc_is_update 永远设置为 false

- 修改其他字段，name_is_update还是为false 

- 忽略和删除加参数 name_is_update: true,desc_is_update: true image
- 3.1-删除 image 3.2-忽略 image

- 应用画像 保存之前调用查询接口，如果接口返回的数据的 desc 和表单 desc 相同， desc_is_update 设置为 true，如果不同就设置为 false，name_is_update 永远设置为 false

- 应用画像基础信息 保存之前调用查询接口，如果接口返回的数据的 name 和表单 name 相同， name_is_update 设置为 true，如果不同就设置为 false，desc_is_update 永远设置为 false
- 6.保存之前调用查询接口，如果接口返回的数据的 desc 和表单 desc 相同，desc_is_update 设置为 true，如果不同就设置为 false，name_is_update 永远设置为 false
- 7.保存之前调用查询接口，如果接口返回的数据的 desc 和表单 desc 相同，desc_is_update 设置为 true，如果不同就设置为 false，name_is_update 永远设置为 false

```js
if (!val.desc) {
        delete val.desc;
        delete val.desc_is_update;
    }
    let params = getFormData(val);
 const val = cloneDeep(data);
        delete val.desc_is_update;
        val.name_is_update = true;
        return postApps(getFormData(this.handlePort(val)));
const params = { name: data.name, level: data.level, responsible_names: data.responsible_names, name_is_update: data.name !== this.originalName, desc_is_update: false};

```
