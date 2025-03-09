该文档围绕深信服云图小程序展开，涵盖登录逻辑、组件与文件功能、服务中心能力建设等内容。具体整理如下：
1. **小程序概述**：云图小程序未登录时功能受限。用户进入深信服云图首页可点击服务中心页面，但部分功能受限。如点击紧急保障可正常使用，点击其他功能模块时，若已登录设备人真正账号，单点登录跳转正常使用功能；若为个人认证账号，会提示账号升级，升级后直接单点登录，暂不升级则进入社区登录页面，输入社区账号密码登录后正常使用功能。
2. **登录功能**
    - **login.vue组件**：负责处理用户登录逻辑。组件初始化时在data中定义多个变量存储用户输入和状态信息，mounted钩子函数加载滑块验证数据，onLoad在页面加载时保存重定向页面参数，onShow刷新Cookie并获取登录信息。获取登录信息通过getLoginInfo方法从本地存储获取上次登录信息并填充字段。changeAccountType方法切换主账号和子账号登录方式并清空相关数据，checkAccount方法检查输入账号是否存在冲突账号并更新冲突账号列表 。核心登录方法login的步骤为：检查是否正在登录，若正在登录则直接返回；获取用户信息，若没有则调用getUserProfile方法获取；显示加载中提示；调用API登录，传递加密后的用户名和密码及其他必要参数；根据API返回结果处理，登录成功保存登录信息并根据返回数据决定跳转，登录失败根据错误码处理。此外还有setLoginInfo、setVerificationInfo等辅助方法。
    - **相关组件和文件**
        - **slide_verify/index.vue**：滑块验证组件，包含滑块的拖动逻辑和验证逻辑。
        - **encrypt_password.ts**：提供encryptPassword方法加密用户密码，提供wxLogin方法获取微信登录凭证。
        - **formate.ts**：提供URL参数解析和时间格式化等工具函数。
        - **agreement.vue**：用户协议组件，处理用户协议的同意情况。
        - **tab.vue**：Tab组件，切换主账号和子账号登录方式。
        - **input_with_delete.vue、password_input.vue**：自定义输入框组件，分别用于普通输入框和密码输入框。
        - **conflict_account.vue**：冲突账号组件，处理多个冲突账号的选择。
        - **custom_navigation.vue**：自定义导航栏组件，显示导航栏和处理返回操作。
        - **const.ts、cache.ts**：常量和缓存键值定义文件。
3. **服务中心能力建设**
    - **热门问题**：通过template定义热门问题的展示结构，包含header显示标题和产品切换，tabs展示不同分类，u - picker用于选择产品等操作。
    - **tabs.vue组件**：实现可滚动标签栏。通过接收list属性展示标签列表，keyName指定标签项显示名称的键名。组件内定义currentIndex、scrollLeft、tabsWidth等数据，提供handleChangeList、getScrollLeft、handleClick、getTabsWidth等方法，在mounted钩子函数获取标签栏宽度并初始化标签列表。功能包括标签栏展示、标签切换和事件触发。
    - **服务类型相关常量和映射**：定义overviewTypeEnum标识不同服务类型，AfterServiceMap和SelfServiceMap分别包含售后服务和自助服务的详细信息，NavigateMap将服务类型映射到对应的导航路径。
    - **Grid组件**：通过接收title、col等属性展示服务列表，v - for遍历list生成服务项，点击服务项调用handleClick方法进行相应操作。
    - **Overview组件**：展示售后服务和自助服务两个网格，处理点击事件，根据选项类型执行拨打电话、跳转到特定页面或显示默认提示等操作。
4. **小程序常用API**
    - **uni.navigateTo**：保留当前页面，跳转到应用内某个页面，可使用uni.navigateBack返回原页面。
    - **uni.showToast**：显示消息提示框。
    - **uni.makePhoneCall**：拨打电话。
    - **uni.navigateBack**：关闭当前页面，返回上一页面或多级页面。
    - **uni.redirectTo**：关闭当前页面，跳转到应用内某个页面。
    - **uni.reLaunch**：关闭所有页面，打开到应用内某个页面。
    - **uni.switchTab**：跳转到tabBar页面，并关闭其他所有非tabBar页面。
5. **其他组件和页面**
    - **Tabbar组件**：定义底部导航栏，包含首页、服务中心和我的等导航项。template部分遍历导航项列表生成导航项，点击时调用handleChangeTab方法切换页面，根据当前选中项动态设置标题样式。script部分定义属性接收当前选中导航项，监听其变化并更新，返回导航项列表并处理点击事件。style部分使用scss定义导航栏样式。
    - **scc_home/index.vue文件**：定义首页布局和逻辑，template部分包含自定义导航栏、轮播图、服务组件等多个组件。script部分监听登录状态变化，处理页面显示、加载时的逻辑，提供刷新首页数据、处理认证等方法。style部分使用scss定义页面布局和样式。 
# 深信服云图小程序功能说明
## 一、小程序概述
云图小程序存在未登录功能受限的情况。用户进入深信服云图首页时，可点击服务中心页面，但部分功能无法正常使用。
1. **行为路径**：点击小程序进入，点击服务中心，点击紧急保障，可正常跳转到对应功能页使用；点击其他功能模块，会先判断登录状态。若已登录设备人真正账号，单点登录跳转后可正常使用功能；若是个人认证账号，会提示账号升级，完成升级后直接单点登录，若暂不升级，则进入社区登录页面，输入社区账号密码登录后可正常使用功能 。
2. **服务中心布局**：服务中心以`ugrid 8`形式展示8个图标，涵盖售后服务在线管理、拨打紧急保障、我要投诉、服务工单、社区资料、维保查询、维修进度等功能，还设有热门问题板块，包括高频问题、文档类、升级包、工具类，且可通过右边切换选择A下一代防火墙等产品线，展示对应问题 。
3. **登录功能**：用户在登录界面输入用户名、密码或通过手机号登录。登录逻辑在`login.vue`组件中实现，该组件负责处理用户登录相关的一系列操作 。
4. **组件初始化**：在`data`中定义`username`、`password`、`adminUser`、`userID`、`isLogining`、`errorMsg`等变量，用于存储用户输入和状态信息。
5. **生命周期钩子**
    - `mounted`钩子函数中调用`loadSlideData`方法加载滑块验证数据。
    - `onLoad`：在页面加载时，如果有重定向页面参数，则保存该参数。
    - `onShow`：在页面显示时，刷新Cookie并获取登录信息。
6. **获取登录信息**：`getLoginInfo`方法从本地存储中获取上次登录的信息，并填充到相应的字段中。
7. **切换账号类型**：`changeAccountType`方法用于切换主账号和子账号登录方式，并清空相关数据。
8. **检查账号**：`checkAccount`方法用于检查输入的账号是否存在冲突账号，并根据返回的数据更新冲突账号列表。
9. **登录方法**：`login`方法是核心的登录逻辑，具体步骤如下：
    - 检查是否正在登录，如果是则直接返回。
    - 尝试获取用户信息，如果没有则调用`getUserProfile`方法获取。
    - 显示加载中提示。
    - 调用API登录，传递加密后的用户名和密码，以及其他必要参数。
    - 根据API返回的结果进行处理：
        - 如果登录成功，保存登录信息，并根据返回的数据决定跳转到双因素验证页面或直接登录。
        - 如果登录失败，根据错误码进行不同的处理，如密码过期、需要验证码等。
10. **其他辅助方法**
    - `setLoginInfo`：缓存用户上一次的登录信息。
    - `setVerificationInfo`：存储用户信息，用于双因素验证。
    - `setAccount`：选择冲突账号。
    - `toEditPwd`：跳转到修改密码页面。
    - `callSevices`：拨打售后服务电话。
    - `handleLogin`：处理快速登录。
    - `goHome`：跳转到首页。
    - `getPhone`、`getUserData`：处理手机号授权登录。
    - `goAuthRegister`：跳转到授权注册页面。
    - `confirm`：确认选择的企业信息进行登录。
11. **相关组件和文件**
    - `slide_verify/index.vue`：滑块验证组件，用于在登录时进行滑块验证，包含滑块的拖动逻辑和验证逻辑。
    - `encrypt_password.ts`：提供`encryptPassword`方法，用于加密用户密码；提供`wxLogin`方法，用于获取微信登录凭证。
    - `formate.ts`：提供URL参数解析和时间格式化等工具函数。
    - `agreement.vue`：用户协议组件，用于显示和处理用户协议的同意情况。
    - `tab.vue`：Tab组件，用于切换主账号和子账号登录方式。
    - `input_with_delete.vue`、`password_input.vue`：自定义输入框组件，分别用于普通输入框和密码输入框。
    - `conflict_account.vue`：冲突账号组件，用于处理多个冲突账号的选择。
    - `custom_navigation.vue`：自定义导航栏组件，用于显示导航栏和处理返回操作。
    - `const.ts`、`cache.ts`：常量和缓存键值定义文件。

## 二、服务中心能力建设
1. **热门问题**
```html
<template>
    <view class="hot-questions">
        <view class="hot-questions__header">
            <view class="hot-questions__header--title">热门问题</view>
            <view class="hot-questions__header--product" @click="handleChangeProduct">
                <text class="name">{{ productName }}</text>
                <view class="icon">
                    <u-icon name="arrow-down" size="24rpx" color="#5E6573"></u-icon>
                </view>
            </view>
        </view>
        <view class="hot-questions__tabs">
            <tabs :list="list" />
        </view>
        <u-picker :show="isShow" :columns="columns" key-name="label" :visible-item-count="10" :default-index="defaultIndex" @cancel="handleCancel" @confirm="handleConfirm">
        </u-picker>
    </view>
</template>
```
2. **tabs.vue组件**
```html
<template>
    <view class="tabs-wrap">
        <scroll-view class="tabs-wrap__scroll" scroll-x :scroll-left="scrollLeft" scroll-with-animation>
            <view v-for="(item, index) in list" :key="index" :class="['item', currentIndex === index? 'active' : '']" @click="handleClick(index, item)">
                {{ item[keyName] || item }}
            </view>
        </scroll-view>
    </view>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    name: 'Tabs'
})
export default class Tabs extends Vue {
    @Prop({ type: Array, default: () => [] })
    readonly list!: SafeAny[];
    @Prop({ type: String, default: 'name' })
    readonly keyName!: string;
    currentIndex = 0;
    scrollLeft = 0;
    tabsWidth = 0;

    handleChangeList() {
        this.currentIndex = 0;
        // 更新滚动位置逻辑
    }

    getScrollLeft(index: number) {
        // 计算并设置滚动视图的左边距，使选中的标签居中显示逻辑
    }

    handleClick(index: number, item: SafeAny) {
        this.currentIndex = index;
        // 触发changeTab事件逻辑
    }

    getTabsWidth() {
        // 获取标签栏的宽度逻辑
    }

    mounted() {
        this.getTabsWidth();
        // 初始化标签列表逻辑
    }
}
</script>
```
3. **服务类型相关常量和映射**
```typescript
export const enum overviewTypeEnum {
    'onlineService' = 'onlineService',
    'dial' = 'dial',
    'emergentReport' = 'emergentReport',
    'complaint' = 'complaint',
    'workOrder' = 'workOrder',
    'community' = 'community',
   'maintenanceInquiry' ='maintenanceInquiry',
   'repairProgress' ='repairProgress'
}

export const AfterServiceMap = [
    {
        type: overviewTypeEnum.onlineService,
        title: '在线服务',
        url: '/static/img/service_center/home_page/online_service.png'
    },
    {
        type: overviewTypeEnum.dial,
        title: '拨打400',
        url: '/static/img/service_center/home_page/dial.png'
    },
    {
        type: overviewTypeEnum.emergentReport,
        title: '紧急报障',
        url: '/static/img/service_center/home_page/emergent_report.png'
    }
    // 其他售后服务项
]

// 类似定义SelfServiceMap和NavigateMap
```
4. **Grid组件**
```html
<template>
    <view class="grid-wrap">
        <view class="grid-wrap__title">{{ title }}</view>
        <view class="grid-wrap__content">
            <u-grid :col="col" :border="isBorder">
                <u-grid-item v-for="item in list" :key="item.type" @click="handleClick(item.type)">
                    <image :src="$imgWrapper(item.url)" style="width: 84rpx; height: 84rpx"></image>
                    <text class="title">{{ item.title }}</text>
                </u-grid-item>
            </u-grid>
        </view>
    </view>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { GridListItem } from './type';

@Component({
    name: 'Grid'
})
export default class Grid extends Vue {
    @Prop({ type: String, default: '售后服务' }) title!: string;
    @Prop({ type: Number, default: 4 }) col!: number;
    // 定义handleClick方法处理点击事件
    handleClick(type) {
        // 根据type执行相应操作逻辑
    }
}
</script>
```
5. **Overview组件**
```html
<template>
    <view class="overview-wrap">
        <grid :list="afterServiceMap" @grid-click="handleGirdClick" />
        <grid :list="selfServiceMap" title="自助服务" @grid-click="handleGirdClick" />
    </view>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Grid from './grid.vue';
import { AfterServiceMap, SelfServiceMap, overviewTypeEnum, NavigateMap } from './const';

@Component({
    name: 'Overview',
    components: {
        Grid
    }
})
export default class Overview extends Vue {
    afterServiceMap = AfterServiceMap;
    selfServiceMap = SelfServiceMap;

    get AFTER_SALE_PHONE() {
        return this.$constData.AFTER_SALE_PHONE;
    }

    handleDefault() {
        // 显示提示即将开通，敬请期待逻辑
    }

    callSevices() {
        // 拨打售后服务电话逻辑
    }

    handleNavigateTo(type) {
        // 根据类型跳转到相应页面逻辑
    }

    handleToWebView() {
        // 跳转到WebView页面逻辑
    }

    handleGirdClick(type) {
        if (type === overviewTypeEnum.dial) {
            this.callSevices();
        } else if (type === overviewTypeEnum.workOrder) {
            this.handleNavigateTo(type);
        } else {
            this.handleDefault();
        }
    }
}
</script>
```
6. **小程序常用API**
    - **uni.navigateTo**：用于保留当前页面，跳转到应用内的某个页面，使用`uni.navigateBack`可以返回到原页面。
```typescript
uni.navigateTo({
    url: '/path/to/page' // 目标页面的路径
});
```
    - **uni.showToast**：显示消息提示框。
```typescript
uni.showToast({
    title: '提示的内容', // 提示信息
    icon: 'none' // 'success' 图标类型,默认为
});
```
    - **uni.makePhoneCall**：拨打电话。
```typescript
uni.makePhoneCall({
    phoneNumber: '1234567890' // 要拨打的电话号码
});
```
    - **uni.navigateBack**：关闭当前页面，返回上一页面或多级页面。
```typescript
uni.navigateBack({
    delta: 1 // delta返回的页面数,如果大于现有页面数,则返回到首页
});
```
    - **uni.redirectTo**：关闭当前页面，跳转到应用内的某个页面。
```typescript
uni.redirectTo({
    url: '/path/to/page' // 目标页面的路径
});
```
    - **uni.reLaunch**：关闭所有页面，打开到应用内的某个页面。
```typescript
uni.reLaunch({
    url: '/path/to/page' // 目标页面的路径
});
```
    - **uni.switchTab**：跳转到`tabBar`页面，并关闭其他所有非`tabBar`页面。
```typescript
uni.switchTab({
    url: '/path/to/tabBar/page' // tabBar目标页面的路径
});
```
7. **Tabbar组件**
```html
<template>
    <view class="tabbar-wrap">
        <view class="tabbar-wrap__content">
            <view v-for="item in lists" :key="item.name" class="tabbar-wrap__content--item" :class="item.isBulge? 'bulge-cls' : ''" :style="tabbarItemSty">
                <view class="item-box" @click="() => handleChangeTab(item.key)">
                    <view class="item-img">
                        <image :src="getImgUrl(item)" style="width: 48rpx; height: 48rpx;"></image>
                    </view>
                    <view class="item-title" :class="currentKey === item.key? 'active-title' : ''">
                        {{ item.name }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

export interface ItemType {
    key: string;
    url: string;
    activeUrl: string;
    name: string;
    isBulge: boolean;
}

@Component({
    name: 'Tabbar'
})
export default class Tabbar extends Vue {
    @Prop() tabbarKey!: string;
    currentKey = '';

    get lists(): ItemType[] {
        // 返回导航项的列表逻辑
    }

    handleChangeTab(key: string) {
        // 根据不同的key进行页面跳转逻辑
    }

    @Watch('tabbarKey')
    onTabbarKeyChange(newValue: string) {
        this.currentKey = newValue;
    }
}
</script>
<style scss>
/* 定义导航栏的样式，包括导航项的布局、图片和文字的样式 */
.tabbar-wrap {
    /* 整体样式 */
}
.tabbar-wrap__content {
    /* 内容区域样式 */
}
.tabbar-wrap__content--item {
    /* 每个导航项样式 */
}
.bulge-cls {
    /* 突出显示样式 */
}
.item-box {
    /* 点击区域样式 */
}
.item-img {
    /* 图片样式 */
}
.item-title {
    /* 标题样式 */
}
.active-title {
    /* 选中标题样式 */
}
</style>
```
8. **scc_home/index.vue文件**
### 5. 其他组件和页面
#### Tabbar组件
- **功能概述**：定义底部导航栏组件，用于在不同页面间切换，包含首页、服务中心和我的等主要导航项。
- **主要部分解析**
    - **template模板部分**
```html
<template>
    <view class="tabbar-wrap">
        <view class="tabbar-wrap__content">
            <view v-for="item in lists" :key="item.name" class="tabbar-wrap__content--item" :class="item.isBulge? 'bulge-cls' : ''" :style="tabbarItemSty">
                <view class="item-box" @click="() => handleChangeTab(item.key)">
                    <view class="item-img">
                        <image :src="getImgUrl(item)" style="width: 48rpx; height: 48rpx;"></image>
                    </view>
                    <view class="item-title" :class="currentKey === item.key? 'active-title' : ''">
                        {{ item.name }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
```
通过`v - for="item in lists"`遍历导航项列表生成每个导航项；`@click="() => handleChangeTab(item.key)"`点击导航项时调用`handleChangeTab`方法进行页面切换；`:class="currentKey === item.key? 'active-title' : ''"`根据当前选中的导航项动态设置标题样式。
    - **script脚本部分**
```typescript
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

export interface ItemType {
    key: string;
    url: string;
    activeUrl: string;
    name: string;
    isBulge: boolean;
}

@Component({
    name: 'Tabbar'
})
export default class Tabbar extends Vue {
    @Prop() tabbarKey!: string;
    currentKey = '';

    get lists(): ItemType[] {
        // 返回导航项的列表，包含每个导航项的key、图片URL、名称和是否突出显示等信息
    }

    handleChangeTab(key: string) {
        // 根据不同的key进行页面跳转，如使用uni.switchTab等方法
    }

    @Watch('tabbarKey')
    onTabbarKeyChange(newValue: string) {
        this.currentKey = newValue;
    }
}
```
`@Prop tabbarKey`定义属性接收父组件传递的当前选中的导航项；`@Watch tabbarKey`监听其变化并更新`currentKey`；`get lists()`返回导航项列表；`handleChangeTab(key: TabKey)`处理导航项的点击事件实现页面跳转。
    - **style样式部分**：使用`scss`定义导航栏样式，包括导航项布局、图片和文字样式等。如设置导航栏整体背景色、文字颜色、图片大小和位置等。
#### scc_home/index.vue文件
- **功能概述**：定义首页的主要页面布局和逻辑，涵盖顶部导航栏、轮播图、服务组件、消息推送、账号升级提示等功能。
- **主要部分解析**
    - **template模板部分**
```html
<template>
    <view class="main__page">
        <custom-navigation small-title="深信服云图" :show-login="true" :swiper="true" :is-index="true">
            <view slot="swiper">
                <home-swiper />
            </view>
        </custom-navigation>
        <view class="swiper-bottom">
            <view class="tips">
                <message-push />
            </view>
            <service ref="service" />
            <mss-portal ref="mss" />
            <view v-if="getUnMergeName">
                <view v-if="getKeyIdcomp && isLogin" class="update_cloud_account" @click="upgradeAccount">
                    <view>
                        <view class="update">升级信服云账号</view>
                        <text>如已有信服云账号，升级后可在小程序管理云业务</text>
                    </view>
                    <uni-icons type="forward" :size="18" color="#999" />
                </view>
                <alarm v-if="!getKeyIdcomp" ref="alarmCard" />
            </view>
        </view>
        <tabbar />
    </view>
</template>
```
包含`<custom - navigation>`自定义导航栏组件；`<home - swiper />`轮播图组件；`<service />`服务组件；`<message - push />`消息推送组件；`<auth - register - result />`账号注册结果提示组件（文档中未详细提及相关代码）；`<tabbar />`底部导航栏组件。
    - **script脚本部分**
```typescript
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component({
    name: 'HomePage',
    components: {
        // 注册使用的子组件
    }
})
export default class HomePage extends Vue {
    @Watch('isLogin')
    onIsLoginChange(newValue: boolean) {
        // 监听登录状态变化，触发相应登录逻辑，如更新页面显示内容、获取用户信息等
    }

    onShow() {
        // 页面显示时刷新首页数据，如获取最新消息、服务状态等
    }

    onLoad(query: any) {
        // 页面加载时处理URL参数，进行相应跳转和认证，如根据参数判断是否需要引导用户进行特定操作
    }

    mounted() {
        // 组件挂载时加载服务数据，如初始化服务组件的配置、获取服务列表等
    }

    refreshHomePage() {
        // 刷新首页数据的方法，可能会重新获取所有相关数据并更新页面显示
    }

    handleAuthentication() {
        // 处理认证认证的方法，可能涉及调用登录接口、验证用户身份等操作
    }

    handleConfirmModal() {
        // 处理账号升级提示框的确认操作，如发起账号升级请求、更新页面状态等
    }

    handleCancelModal() {
        // 处理账号升级提示框的取消操作，如关闭提示框、恢复页面原有状态等
    }
}
```
`@Watch isLogin`监听登录状态变化；`onShow`在页面显示时刷新首页数据；`onLoad`处理页面加载时的URL参数；`mounted`组件挂载时加载服务数据；`refreshHomePage`刷新首页数据；`handleAuthentication`处理认证认证；`handleConfirmModal`和`handleCancelModal`处理账号升级提示框的确认和取消操作。
    - **style样式部分**：使用`scss`定义页面布局和样式，包括轮播图、提示信息、底部间隙等样式设置，如设置轮播图高度、提示信息字体大小和颜色、底部间隙的间距等。 ### 5. 其他组件和页面
#### Tabbar组件
- **功能概述**：定义底部导航栏组件，用于在不同页面间切换，包含首页、服务中心和我的等主要导航项。
- **主要部分解析**
    - **template模板部分**
```html
<template>
    <view class="tabbar-wrap">
        <view class="tabbar-wrap__content">
            <view v-for="item in lists" :key="item.name" class="tabbar-wrap__content--item" :class="item.isBulge? 'bulge-cls' : ''" :style="tabbarItemSty">
                <view class="item-box" @click="() => handleChangeTab(item.key)">
                    <view class="item-img">
                        <image :src="getImgUrl(item)" style="width: 48rpx; height: 48rpx;"></image>
                    </view>
                    <view class="item-title" :class="currentKey === item.key? 'active-title' : ''">
                        {{ item.name }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
```
通过`v - for="item in lists"`遍历导航项列表生成每个导航项；`@click="() => handleChangeTab(item.key)"`点击导航项时调用`handleChangeTab`方法进行页面切换；`:class="currentKey === item.key? 'active-title' : ''"`根据当前选中的导航项动态设置标题样式。
    - **script脚本部分**
```typescript
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

export interface ItemType {
    key: string;
    url: string;
    activeUrl: string;
    name: string;
    isBulge: boolean;
}

@Component({
    name: 'Tabbar'
})
export default class Tabbar extends Vue {
    @Prop() tabbarKey!: string;
    currentKey = '';

    get lists(): ItemType[] {
        // 返回导航项的列表，包含每个导航项的key、图片URL、名称和是否突出显示等信息
    }

    handleChangeTab(key: string) {
        // 根据不同的key进行页面跳转，如使用uni.switchTab等方法
    }

    @Watch('tabbarKey')
    onTabbarKeyChange(newValue: string) {
        this.currentKey = newValue;
    }
}
```
`@Prop tabbarKey`定义属性接收父组件传递的当前选中的导航项；`@Watch tabbarKey`监听其变化并更新`currentKey`；`get lists()`返回导航项列表；`handleChangeTab(key: TabKey)`处理导航项的点击事件实现页面跳转。
    - **style样式部分**：使用`scss`定义导航栏样式，包括导航项布局、图片和文字样式等。如设置导航栏整体背景色、文字颜色、图片大小和位置等。
#### scc_home/index.vue文件
- **功能概述**：定义首页的主要页面布局和逻辑，涵盖顶部导航栏、轮播图、服务组件、消息推送、账号升级提示等功能。
- **主要部分解析**
    - **template模板部分**
```html
<template>
    <view class="main__page">
        <custom-navigation small-title="深信服云图" :show-login="true" :swiper="true" :is-index="true">
            <view slot="swiper">
                <home-swiper />
            </view>
        </custom-navigation>
        <view class="swiper-bottom">
            <view class="tips">
                <message-push />
            </view>
            <service ref="service" />
            <mss-portal ref="mss" />
            <view v-if="getUnMergeName">
                <view v-if="getKeyIdcomp && isLogin" class="update_cloud_account" @click="upgradeAccount">
                    <view>
                        <view class="update">升级信服云账号</view>
                        <text>如已有信服云账号，升级后可在小程序管理云业务</text>
                    </view>
                    <uni-icons type="forward" :size="18" color="#999" />
                </view>
                <alarm v-if="!getKeyIdcomp" ref="alarmCard" />
            </view>
        </view>
        <tabbar />
    </view>
</template>
```
包含`<custom - navigation>`自定义导航栏组件；`<home - swiper />`轮播图组件；`<service />`服务组件；`<message - push />`消息推送组件；`<auth - register - result />`账号注册结果提示组件（文档中未详细提及相关代码）；`<tabbar />`底部导航栏组件。
    - **script脚本部分**
```typescript
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component({
    name: 'HomePage',
    components: {
        // 注册使用的子组件
    }
})
export default class HomePage extends Vue {
    @Watch('isLogin')
    onIsLoginChange(newValue: boolean) {
        // 监听登录状态变化，触发相应登录逻辑，如更新页面显示内容、获取用户信息等
    }

    onShow() {
        // 页面显示时刷新首页数据，如获取最新消息、服务状态等
    }

    onLoad(query: any) {
        // 页面加载时处理URL参数，进行相应跳转和认证，如根据参数判断是否需要引导用户进行特定操作
    }

    mounted() {
        // 组件挂载时加载服务数据，如初始化服务组件的配置、获取服务列表等
    }

    refreshHomePage() {
        // 刷新首页数据的方法，可能会重新获取所有相关数据并更新页面显示
    }

    handleAuthentication() {
        // 处理认证认证的方法，可能涉及调用登录接口、验证用户身份等操作
    }

    handleConfirmModal() {
        // 处理账号升级提示框的确认操作，如发起账号升级请求、更新页面状态等
    }

    handleCancelModal() {
        // 处理账号升级提示框的取消操作，如关闭提示框、恢复页面原有状态等
    }
}
```
`@Watch isLogin`监听登录状态变化；`onShow`在页面显示时刷新首页数据；`onLoad`处理页面加载时的URL参数；`mounted`组件挂载时加载服务数据；`refreshHomePage`刷新首页数据；`handleAuthentication`处理认证认证；`handleConfirmModal`和`handleCancelModal`处理账号升级提示框的确认和取消操作。
    - **style样式部分**：使用`scss`定义页面布局和样式，包括轮播图、提示信息、底部间隙等样式设置，如设置轮播图高度、提示信息字体大小和颜色、底部间隙的间距等。 
