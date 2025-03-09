- 1.云网络可视化-图例更改
- 2.云攻击路径管理-详情，云攻击路径管-表格，影响资产数和涉及资产类型数据表格渲染问题，相关的字段的调整，工具栏的迁移
- 3.云网络可视化-资产检索，新增资产检索按钮，点击资产检索弹出对话框，显示搜索VPC名称/资产IP/资产名称的搜索框，复合搜索，以及显示序号资产ip,VPC名称，所属云环境，所属云账号，所属VPC，VPC ID的表格并且具有分页功能，点击操作栏的查看详情，跳转到具体的拓扑图，点击查看详情，直接在当前页面跳转到具体资产，高亮显示；且搜索条件带入到VPC详情（下钻）
- 4.云攻击路径管理-风险可利用性分析-无防护暴露列表-表格，云攻击路径管理-风险可利用性分析-漏洞风险-漏洞风险列表-表格，云攻击路径管理-检测策略-暴露面检测策略-表格，云攻击路径管理-检测策略-暴露面检测策略-表格，解决了相关的表格原先的高度的塌陷，height:100%,，云攻击路径管理-操作-表格全部取消，只显示操作和序号，图标调整，和添加对应的图标
- 直接为表格或表格行设置高度（height）属性也可以解决高度塌陷的问题
- 如果表格内部的元素使用了浮动（float），可能会导致高度塌陷。确保清除内部元素的浮动。
- 增加表格单元格（<td> 或 <th>）的内边距（padding）也可以增加表格的高度
- 你可以为表格或表格的行（<tr>）设置一个最小高度（min-height），以确保即使没有足够的内容，表格的高度也不会塌陷。
- 5.云攻击路径管理-影响资产数，搜索改成模糊搜索，取消校验
- 6.云攻击路径管理-设置攻击路径定时开关配置，云攻击路径管理，设置攻击路径定时开关配置cronswitch为1为开启，0为关闭，先通过get请求获取攻击路径定时开关配置getAttackSwitchStatus，然后通过post请求当按钮操作时获取攻击路径定时开关配置postAttackSwitchStatus，
# 配置定时开关检测代码

```js
<div class="auto-detect">
                <div v-if="autoDetect" class="auto-detect-show">
                    <div class="auto-detect-icon"></div>
                    <span class="auto-detect-text">{{ _('已开启自动检测机制，每天00:00-05:00检测一次') }}</span>
                </div>
                <div v-else class="auto-detect-show-gray">
                    <div class="auto-detect-icon-gray"></div>
                    <span class="auto-detect-text-gray">{{ _('已关闭自动检测机制，每天00:00-05:00检测一次') }}</span>
                </div>
                <IxSwitch :value.sync="autoDetect" :checked="autoDetect" size="sm"
                class="auto-detect-button" :loading="isLoadingButton" @change="onSwitchChange" />
            </div>
        async function onSwitchChange(value: boolean) {
    if (isLoadingButton.value) return;
    isLoadingButton.value = true;
    try {
        const response = await postAttackSwitchStatus({ cronswitch: value ? 1 : 0 });
        if (response.code === HTTP_RESPOND_CODE.successCode) {
            autoDetect.value = response.cronswitch === 1;
        }
    } catch (error) {
        Error(_('操作失败'));
    } finally {
        isLoadingButton.value = false;
    }
}
async function getSwitchStatus() {
    try {
        const { code, cronswitch} = await getAttackSwitchStatus();
        if (code === HTTP_RESPOND_CODE.successCode) {
            autoDetect.value = typeof cronswitch == 'number' ? cronswitch : 0;
        }
    } catch (error) {
        Error(_('操作失败'));
        autoDetect.value = false;
    }
}
export default defineComponent({
    setup(props, { emit }) {
        const { error } = useMessage();

        onMounted(() => {
            onDetectionStatus();
            getSwitchStatus();
        });
        onDeactivated(() => {
            taskTimer.value && clearInterval(taskTimer.value);
            usedTimer.value && clearInterval(usedTimer.value);

        });
```
### 1.云资产-资产同步-修改资产同步文字展示，初次点击展示任务下发成功，多次点击显示任务进行中，云网络可视-防火墙详情-ACL策略表格新增一行策略，ACL策略，网络可视-安全组-新增状态一栏，
```js
  private async assetSync() {
        const { code, msg } = await postAssetSync(
            {
                successMsg: _('开始同步资产'),
                errorMsg: false
            }
        );
        // 同步异常，细分error和info提示
        if (HTTP_RESPOND_CODE.successCode !== code) {
            HTTP_RESPOND_CODE.AssetSyncPendingWarn === code ?
            this.$notifyInfo(msg) :
            this.$notifyError(msg);
        }
    }
export const STATUS_MAP = {
    activate: $i('mcsm.cloud_network.edge.drawer.activate'),
    stop: $i('mcsm.cloud_network.edge.drawer.stop'),
    other: $i('mcsm.cloud_network.edge.drawer.other'),
};
<template #status="{ value }">
            <span :title="STATUS_MAP[value] || '-'">
                {{ STATUS_MAP[value] || '-' }}
            </span>
        </template>

```
# 1.所有模块-fix(2024070300017): 【CSC2.0.1】【缺陷预防】【异常场景】routePermission全局接口调用失败仍展示页面，当查询App授权失败的之后，返回空白页面，并且提示查询App授权失败的弹窗
```js
<Layout v-if="isLayoutVisible" />
import store from '@/store';
const isLayoutVisible = computed(() => store?.state?.auth?.isLayoutVisible ?? true);
 FailCode: 17005,
 export const actions = {
    async [AuthActionsMap.getRoutePermission]({ commit }: ContextType): Promise<void> {
        try {
            const res = await getRoutePermission();
            if (res.code === HTTP_RESPOND_CODE.successCode) {
                const { permission, userInfo, platform, authorization } = res.data;
                commit(AuthMutationMap.updatePermission, permission);
                commit(AuthMutationMap.updateUser, userInfo);
                commit(AuthMutationMap.updatePlatformXdr, platform === Platform.xdr);
                commit(GlobalMutationMap.updateLayout,
                    platform === Platform.xdr ? LayoutValue.topLeftXdr : LayoutValue.mcsmTopBrand3);
                commit(AuthMutationMap.updatePlatformEdition, authorization.edition);
                commit(AuthMutationMap.updateLayoutVisibility, true);
            } else if (res.code === HTTP_RESPOND_CODE.FailCode) {
                commit(AuthMutationMap.updateLayoutVisibility, false);
            }
        } catch (e) {
            commit(AuthMutationMap.updatePermission, {});
            commit(AuthMutationMap.updateUser, {});
            commit(AuthMutationMap.updateLayoutVisibility, false);
        }
    }
    [AuthMutationMap.updateLayoutVisibility](state: AuthState, data: boolean): void {
        state.isLayoutVisible = data;
    },
    updateLayoutVisibility = 'auth/updateLayoutVisibility',
```
