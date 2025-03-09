- 未登录的功能使用受限
- 用户故事：
- 当用户进入sxfyuntu首页的时候，仍然能点击服务中心页面，但是部分功能使用受限
- 行为路径：点击小程序=》点击服务中心-》点击400紧急保障-》调到对应的功能也，正常使用，点击其他功能模块-》是否登录-》已经登录-》设备人真正账号-》单点登录跳转正常使用功能
- 个人认证账号-》提示账号升级-》进入账号升级页面-》完成升级后直接单点登录
- 暂不升级-》进入社区登录页面-》输入社区账号密码登录-》正常使用功能
- 服务中心
- ugrid展示8个图标
- 售后服务,在线管理，拨打400,紧急保障，我要投诉
- 自助服务
- 服务工单，社区资料，维保查询，维修进度

- 售后服务
- 热门问题
- 高频问题，文档类，升级包，工具类
- 下一代防火墙A右边切换对应的产品，点击可以选择产品线，
- 列表展示对应的问题
- 登录功能
- 用户输入信息
- 用户在界面上输入用户名、密码等信息，或者通过手机号进行登录。
- 未登录的功能使用受限

```js
<cn-delete-input
  v-model="username"
  placeholder="手机号/邮箱/账号名"
  ref="username"
  @blur="checkAccount(username, isSubAccount)"
/>

<cn-password-input ref="passwordInputRef" v-model="password" placeholder="密码" />

<button class="login-btn" type="primary" :disabled="disabledLogin" :loading="isLogining" @click="login">
  登录
</button>

```

- 表单验证
在用户点击登录按钮时，前端会对输入的信息进行验证，确保信息的完整性和正确性。
```js
get disabledLogin(): boolean {
  return !this.isAgree || !this.username || !this.password || (this.isSubAccount && !this.adminUser);
}
```
- 发送请求
前端将用户输入的信息发送到后端服务器进行验证。这个过程通过调用API接口实现。
```js
async login(mask = true): Promise<void> {
  if (this.isLogining) {
    return;
  }
  this.isLogining = true;

  let userProfile = readLocalUserProfile();
  if (!userProfile) {
    try {
      userProfile = await getUserProfile();
    } catch (error) {
      this.isLogining = false;
      return;
    }
  }

  mask && uni.showLoading({ title: '加载中...', mask: true });
  let {
    success,
    data,
    msg = '',
    code,
  } = await this.$api.login.login({
    data: {
      is_encrypt: true,
      username: this.username.trim(),
      password: encryptPassword(this.password.trim()),
      ...(this.userID ? { user_id: this.userID } : {}),
      ...(this.isSubAccount ? { admin_user: this.adminUser } : {}),
    },
    mask: false,
    msg: '',
  });

  this.isLogining = false;

  if (success) {
    this.setLoginInfo();
    const params: Record<string, SafeAny> = {
      isSubAccount: this.isSubAccount,
    };
    if (this.redirectPage) {
      params.redirect_page = this.redirectPage;
    }
    if (data?.exp_flag) {
      uni.navigateTo({
        url: `/user/exp_verification${parseURLParams(params)}`,
      });
    } else {
      this.setVerificationInfo(data!);
      uni.navigateTo({
        url: `/user/user_verification${parseURLParams(params)}`,
      });
    }
  } else {
    this.errorMsg = msg;
    switch (code) {
      case XAASAUTH_CODE.pwdExpired:
        this.toEditPwd(EditPasswordType.pwdExpired);
        this.setLoginInfo();
        break;
      case XAASAUTH_CODE.needPwd:
      case XAASAUTH_CODE.needResetPwd:
        this.toEditPwd(EditPasswordType.initLogin);
        break;
      case XAASAUTH_CODE.needCaptcha:
        this.isShowCaptcha = true;
        break;
      case XAASAUTH_CODE.cookieExpired:
        this.errorMsg = '';
        const success = await refreshCookie(false);
        success && (await this.login(false));
        break;
      case XAASAUTH_CODE.skipVerify:
        await authorizeLogin();
        this.setLoginInfo();
        break;
      default:
        break;
    }
    hideLoading();
    setTimeout(() => {
      this.errorMsg = '';
    }, DELAY_TIME);
  }
}
```
- 处理响应
根据后端返回的响应结果，前端进行相应的处理，比如登录成功后跳转到主页，登录失败则显示错误信息。
```js
if (success) {
  this.setLoginInfo();
  const params: Record<string, SafeAny> = {
    isSubAccount: this.isSubAccount,
  };
  if (this.redirectPage) {
    params.redirect_page = this.redirectPage;
  }
  if (data?.exp_flag) {
    uni.navigateTo({
      url: `/user/exp_verification${parseURLParams(params)}`,
    });
  } else {
    this.setVerificationInfo(data!);
    uni.navigateTo({
      url: `/user/user_verification${parseURLParams(params)}`,
    });
  }
} else {
  this.errorMsg = msg;
  // 处理各种错误情况
}
```

- 好的，我将详细讲解 login.vue 中的登录逻辑，并解释相关的组件和文件的作用。

- 登录逻辑详细讲解
- login.vue 是一个 Vue 组件，负责处理用户登录的逻辑。以下是详细的登录逻辑步骤：

- 组件初始化：

- 在组件的 data 中定义了多个变量，如 username, password, adminUser, userID, isLogining, errorMsg 等，用于存储用户输入和状态信息。
- mounted 钩子函数中调用 loadSlideData 方法加载滑块验证数据。
- 生命周期钩子：

- onLoad：在页面加载时，如果有重定向页面参数，则保存该参数。
- onShow：在页面显示时，刷新 Cookie 并获取登录信息。
- 获取登录信息：

- getLoginInfo 方法从本地存储中获取上次登录的信息，并填充到相应的字段中。
切换账号类型：

- changeAccountType 方法用于切换主账号和子账号登录方式，并清空相关数据。
检查账号：

- checkAccount 方法用于检查输入的账号是否存在冲突账号，并根据返回的数据更新冲突账号列表。
登录方法：

- login 方法是核心的登录逻辑，详细步骤如下：
- 检查是否正在登录，如果是则直接返回。
- 获取用户信息，如果没有则调用 getUserProfile 方法获取。
- 显示加载中提示。
- 调用登录 API，传递加密后的用户名和密码，以及其他必要参数。
- 根据 API 返回的结果进行处理：
- 如果登录成功，保存登录信息，并根据返回的数据决定跳转到双因素验证页面或直接登录。
- 如果登录失败，根据错误码进行不同的处理，如密码过期、需要验证码等。
- 其他辅助方法：

- setLoginInfo：缓存用户上一次的登录信息。
- setVerificationInfo：存储用户信息，用于双因素验证。
- setAccount：选择冲突账号。
- toEditPwd：跳转到修改密码页面。
- callSevices：拨打售后服务电话。
- handleLogin：处理快速登录。
- goHome：跳转到首页。
- getPhone 和 getUserData：处理手机号授权登录。
- goAuthRegister：跳转到授权注册页面。
- confirm：确认选择的企业信息进行登录。
- 相关组件和文件
- slide_verify/index.vue：

- 滑块验证组件，用于在登录时进行滑块验证。
- 包含滑块的拖动逻辑和验证逻辑。
encrypt_password.ts：

- 提供 encryptPassword 方法，用于加密用户密码。
wx_login_util.ts：

- 提供 wxLogin 方法，用于获取微信登录凭证。
formate.ts：

- 提供 URL 参数解析和时间格式化等工具函数。
agreement.vue：

- 用户协议组件，用于显示和处理用户协议的同意情况。
tab.vue：

- Tab 组件，用于切换主账号和子账号登录方式。
input_with_delete.vue 和 password_input.vue：

- 自定义输入框组件，分别用于普通输入框和密码输入框。
conflict_account.vue：

- 冲突账号组件，用于处理多个冲突账号的选择。
custom_navigation.vue：

- 自定义导航栏组件，用于显示导航栏和处理返回操作。
const.ts 和 cache.ts：

- 常量和缓存键值定义文件。
# 服务中心能力建设
热门问题
```js
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
    <u-picker :show="isShow"
              :columns="columns"
              key-name="label"
              :visible-item-count="10"
              :default-index="defaultIndex"
              @cancel="handleCancel"
              @confirm="handleConfirm">
    </u-picker>
  </view>
</template>
script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ColumnsType } from './type';
import Tabs from './tabs.vue';

@Component({
  name: 'HotQuestions',
  components: {
    Tabs
  }
})
export default class HotQuestions extends Vue {
  productName = '下一代防火墙AF2';
  isShow = false;

  columns = [
    [{
      id: 1,
      label: '下一代防火墙AF',
    },
    {
      id: 2,
      label: '下一代防火墙AF2',
    },
    {
      id: 3,
      label: '下一代防火墙AF3',
    },
    {
      id: 4,
      label: '下一代防火墙AF4',
    },
    {
      id: 5,
      label: '3下一代防火墙AF5',
    }]
  ]list = [
    {
      name: '高频问题',
      id: 1
    },
    {
      name: '文档类',
      id: 2
    },
    {
      name: '升级包',
      id: 3
    },
    {
      name: '工具类',
      id: 4
    },
    {
      name: '类',
      id: 5
    },
    {
      name: '升级包',
      id: 3
    },
    {
      name: '工具类',
      id: 4
    },
    {
      name: '类',
      id: 5
    }
  ]

  get defaultIndex() {
    return [this.columns[0].findIndex(item => item.label === this.productName)]
  }

  handleChangeProduct() {
    this.isShow = true;
  }

  handleCancel() {
    this.isShow = false;
  }

  handleConfirm(data: { value: ColumnsType[]}) {
    this.productName = data.value[0].label;
    this.handleCancel();
  }
}
</script>
```
# tabs.vue
```js
<template>
  <view class="tabs-wrap">
    <scroll-view class="tabs-wrap__scroll" scroll-x :scroll-left="scrollLeft" scroll-with-animation>
      <view
        v-for="(item, index) in list"
        :key="index"
        :class="['item', currentIndex === index ? 'active' : '']"
        @click="handleClick(index, item)"
      >
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
    this.getScrollLeft(0);
  }
  getScrollLeft(index: number) {
    const query = uni.createSelectorQuery().in(this);
    query
      .selectAll('.item')
      .boundingClientRect((res: SafeAny) => {
        let totalWidth = 0;
        for (let i = 0; i < this.currentIndex; i++) {
          totalWidth += res[i].width + 8;
        }
        const clickedTabCenter = totalWidth + res?.[index]?.width / 2;
        const newLeft = clickedTabCenter - this.tabsWidth / 2;
        this.scrollLeft = newLeft;
      })
      .exec();
  } handleClick(index: number, item: SafeAny) {
    if (this.currentIndex === index) {
      return;
    }
    this.currentIndex = index;
    this.getScrollLeft(index);
    this.$emit('changeTab', item);
  }

  getTabsWidth() {
    const query = uni.createSelectorQuery().in(this);
    query
      .select('.tabs-wrap')
      .boundingClientRect((res: SafeAny) => {
        this.tabsWidth = res.width;
      })
      .exec();
  }

  mounted() {
    this.getTabsWidth();
    this.handleChangeList();
  }
}
```

- ●属性定义：
- ○`@Prop({ type: Array, default: () => [] }) readonly list!: SafeAny[];`：定义 `list` 属性，用于接收标签列表。
- ○`@Prop({ type: String, default: 'name' }) readonly keyName!: string;`：定义 `keyName` 属性，用于指定标签项中显示名称的键名。
- ●数据定义：
- ○`currentIndex = 0;`：当前选中的标签索引。
- ○`scrollLeft = 0;`：滚动视图的左边距，用于控制滚动位置。
- ○`tabsWidth = 0;`：标签栏的宽度。
- ●方法定义：
- ○`handleChangeList()`：重置当前选中的标签索引为0，并更新滚动位置。
- ○`getScrollLeft(index: number)`：计算并设置滚动视图的左边距，使选中的标签居中显示。
- ○`handleClick(index: number, item: SafeAny)`：处理标签点击事件，更新当前选中的标签索引，并触发 `changeTab` 事件。
- ○`getTabsWidth()`：获取标签栏的宽度。
- ●生命周期钩子：
- ○`mounted()`：在组件挂载后，获取标签栏的宽度并初始化标签列表tabs总结
- 这个 `Tabs` 组件实现了一个可滚动的标签栏，用户可以在多个标签之间进行切换。组件通过计算标签的位置和宽度，确保选中的标签始终居中显示，并在标签切换时触发自定义事件通知父组件。




- 主要功能
- 1.标签栏展示：展示一组可滚动的标签，用户可以水平滚动查看所有标签。
- 2.标签切换：点击标签时，切换到对应的标签，并居中显示选中的标签。
- 3.事件触发：在切换标签时触发一个自定义事件，通知父组件当前选中的标签。



更新上报埋点url:上报自定义事件，单个漏洞分发
![image](https://github.com/user-attachments/assets/658c23f0-3d3a-44da-b980-6d3d7420570b)
this.$sensors,tracj('btachDistribution',{event_name:this.$('')});
- 这段代码的主要功能是：
- 1.定义了一个枚举 `overviewTypeEnum`，用于标识不同的服务类型。
- 2.定义了两个数组 `AfterServiceMap` 和 `SelfServiceMap`，分别包含售后服务和自助服务的详细信息（包括类型、标题和图片地址）。
- 3.定义了一个对象 `NavigateMap`，用于将服务类型映射到对应的导航路径。
- 通过这些定义，可以在服务中心页面中使用这些常量和映射来构建服务列表，并在用户点击某个服务时导航到相应的页面
```js
export const enum overviewTypeEnum {
  'onlineService' = 'onlineService',
  'dial' = 'dial',
  'emergentReport' = 'emergentReport',
  'complaint' = 'complaint',
  'workOrder' = 'workOrder',
  'community' = 'community',
  'maintenanceInquiry' = 'maintenanceInquiry',
  'repairProgress' = 'repairProgress',
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
  },
  {
    type: overviewTypeEnum.complaint,
    title: '我要投诉',
    url: '/static/img/service_center/home_page/complaint.png'
  }
]
export const SelfServiceMap = [
  {
    type: overviewTypeEnum.workOrder,
    title: '服务工单',
    url: '/static/img/service_center/home_page/default.png'
  },
  {
    type: overviewTypeEnum.community,
    title: '社区资料',
    url: '/static/img/service_center/home_page/default.png'
  },
  {
    type: overviewTypeEnum.maintenanceInquiry,
    title: '维保查询',
    url: '/static/img/service_center/home_page/default.png'
  },
  {
    type: overviewTypeEnum.repairProgress,
    title: '维修进度',
    url: '/static/img/service_center/home_page/default.png'
  }
]

export const NavigateMap: Record<string, string> = {
  [overviewTypeEnum.workOrder]: '/service_center/orders'
}
```
# 1
# 2
```js
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
import  { GridListItem } from './type';

@Component({
  name: 'Grid',
})
export default class Grid extends Vue {
  @Prop({ type: String, default: '售后服务' }) title!: string;
  @Prop({ type: Number, default: 4 }) col!: number;
  @Prop({ type: Boolean, default: false }) isBorder!: boolean;
  @Prop({ type: Array, default: () => [] }) list!: Array<GridListItem>;

  handleClick(type: string) {
    this.$emit('grid-click', type);
  }
}
</script>
view class="grid-wrap"`：外层容器，包含标题和内容部分。
`view class="grid-wrap__title"`：显示网格的标题。
`view class="grid-wrap__content"`：包含网格内容。
`u-grid`：网格容器，接受 `col` 和 `isBorder` 两个属性，分别表示列数和是否显示边框。
`u-grid-item`：网格项，使用 `v-for` 指令遍历 `list` 数组生成每个网格项。
每个网格项包含一个图片和一个文本，图片的来源由 `item.url` 决定，文本内容是 `item.title`。
点击网格项时，触发 `handleClick` 方法。
```
# 3
```js
<template>
  <view class="home-page">
    <overview />
  </view>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Overview from './components/overview/index.vue';

@Component({
  name: 'HomePage',
  components: {
    Overview
  }
})
export default class HomePage extends Vue {}
</script>
export interface GridListItem {
  type: string;
  title: string;
  url: string;
}

```
# 封装overview组件
- ●属性和数据定义：
- ○`afterServiceMap`：售后服务选项的数据，来源于 `AfterServiceMap`。
- ○`selfServiceMap`：自助服务选项的数据，来源于 `SelfServiceMap`。
- ●计算属性：
- ○`AFTER_SALE_PHONE`：从 `this.$constData` 获取售后电话常量。
- ●方法定义：
- ○`handleDefault`：默认处理方法，显示一个提示 "即将开通，敬请期待"。
- ○`callSevices`：拨打售后服务电话。
- ○`handleNavigateTo`：根据类型跳转到相应页面。
- ○`handleToWebView`：跳转到 WebView 页面。
- ○`handleGirdClick`：处理网格点击事件，根据不同的类型执行不同的操作：如果是 `overviewTypeEnum.dial`，则调用 `callSevices` 方法拨打电话。
- ■如果是 `overviewTypeEnum.workOrder`，则调用 `handleNavigateTo` 方法跳转到相应页面。
- ■其他类型则调用 `handleDefault` 方法显示提示。
- 总结
- 这个 `Overview` 组件实现了以下功能：
- 1.展示两个网格：
- a.一个网格显示售后服务选项。
- b.另一个网格显示自助服务选项，标题为 "自助服务"。
- 2.处理点击事件：
- a.点击网格中的选项时，根据选项的类型执行不同的操作。
- b.包括拨打电话、跳转到特定页面，或者显示默认提示。
- 这个组件用于展示和处理售后服务和自助服务的选项，用户可以通过点击网格中的选项来进行相应的操作。

```js
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

  // 默认
  handleDefault() {
    uni.showToast({
      title: '即将开通，敬请期待',
      icon: 'none'
    })
  }

  callSevices() {
    uni.makePhoneCall({
      phoneNumber: this.AFTER_SALE_PHONE,
    });
  } // 跳转页面
  handleNavigateTo(type: string) {
    const url = NavigateMap[type];
    uni.navigateTo({
      url,
    })
  }

  // 跳转webview
  handleToWebView(type: string) {
    uni.navigateTo({
      url: `/webview/index?path=${type}`,
    })
  }

  /** 处理overview各个入口执行行为， 跳转统一用上面的方法即可，
  如果需要特殊处理，自己写个方法
  case用到的自己补充 **/
  handleGirdClick(type: string) {
    switch(type) {
      case overviewTypeEnum.dial:
      this.callSevices();
      break;
      case overviewTypeEnum.workOrder:
      this.handleNavigateTo(type);
      break;
      default: 
      this.handleDefault();
      break;
    }
    
  }
}
</script>
```
以下是为你整理后的内容，在保持原意的基础上，优化了表述方式和排版，使内容更加清晰易读：

在 uni-app 开发中，以下是一些常用的 API 介绍：
1. **uni.navigateTo**
    - **含义**：保留当前页面，跳转到应用内的指定页面，可通过 `uni.navigateBack` 返回原页面。
    - **用法**：
```javascript
uni.navigateTo({
  url: '/path/to/page' // 目标页面的路径
});
```
2. **uni.showToast**
    - **含义**：用于显示消息提示框。
    - **用法**：
```javascript
uni.showToast({
  title: '提示信息', // 提示的内容
  icon: 'none' // 图标类型，默认为 'success'
});
```
3. **uni.makePhoneCall**
    - **含义**：实现拨打电话的功能。
    - **用法**：
```javascript
uni.makePhoneCall({
  phoneNumber: '1234567890' // 要拨打的电话号码
});
```
4. **uni.navigateBack**
    - **含义**：关闭当前页面，返回上一页面或多级页面，若返回的页面数大于现有页面数，则返回到首页。
    - **用法**：
```javascript
uni.navigateBack({
  delta: 1 // 返回的页面数
});
```
5. **uni.redirectTo**
    - **含义**：关闭当前页面，并跳转到应用内的指定页面。
    - **用法**：
```javascript
uni.redirectTo({
  url: '/path/to/page' // 目标页面的路径
});
```
6. **uni.reLaunch**
    - **含义**：关闭所有页面，然后打开到应用内的指定页面。
    - **用法**：
```javascript
uni.reLaunch({
  url: '/path/to/page' // 目标页面的路径
});
```
7. **uni.switchTab**
    - **含义**：跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
    - **用法**：
```javascript
uni.switchTab({
  url: '/path/to/tabBar/page' // 目标 tabBar 页面的路径
});
```
```js
<template>
  <view class="main__page">
    <custom-navigation small-title="深信服云图" :show-login="true" :swiper="true" :is-index="true">
      <view slot="swiper">
        <home-swiper />
      </view>
      <view class="swiper-bottom">
        <view class="tips">
          <message-push />
        </view>
        <service ref="service" />
        <mss-portal ref="mss" />
        <view v-if="getUnMergeName">
          <view v-if="getKeyIdcomp && isLogin" class="update_cloud_account" @click="upgradeAccount">
            <view>
              <view class="update"> 升级信服云账号 </view>
              <text>如已有信服云账号，升级后可在小程序管理云业务</text>
            </view>
            <uni-icons type="forward" :size="18" color="#999" />
          </view>
          <alarm v-if="!getKeyIdcomp" ref="alarmCard" />
        </view>
        <!-- padding-bottom 有个白色背景去不掉 -->
        <view class="bottom-gap"></view>
      </view>
      <!-- 手机号快速注册成功提示 -->
      <auth-register-result v-if="corpCode && fromAuthRegister" :corp-code="corpCode" ref="authRegisterResult" />
    </custom-navigation>
    <u-modal
      :show="showAuthModal"
      content="当前账号为云图个人认证账号，推荐升级为设备认证账号，享受更便捷与全面的服务。"
      showCancelButton
      title="当前账号尚未升级"
      confirm-text="前往升级"
      cancel-text="关闭"
      @confirm="handleConfirmModal"
      @cancel="handleCancelModal"
    >
    </u-modal>

    <tabbar />
  </view>
</template>
interface UrlParams {
  corp_code: string;
  from_auth_register: string;
  is_auth: string;
  redirect_page: string;
}

@Component({
  name: 'SccHome',
  components: {
    CustomNavigation,
    HomeSwiper,
    Service,
    MssPortal,
    Alarm,
    MessagePush,
    AuthRegisterResult,
    Tabbar
  }
})
export default class SccHome extends Vue {
  corpCode = '';
  fromAuthRegister = false;
  showAuthModal = false;

  @Watch('isLogin', { immediate: true })
  handleLogin(newVal: boolean) {
    if (newVal) {
      this.$store.commit('updateKeyId', '');
      this.$store.dispatch('sccLoginAction');
    }
  }
  onShow() {
    this.refreshHomePage();
  }
  async onLoad(params: Partial<UrlParams>) {
    this.corpCode = params?.corp_code || '';
    this.fromAuthRegister = params?.from_auth_register ? true : false;
    if (params?.is_auth) {
      await this.handleAuthentication();
    }
    if (params?.redirect_page) {
      uni.navigateTo({ url: params?.redirect_page });
    }
  }

  mounted() {
    (this.$refs.service as Service).loadData();
  }
  get getKeyIdcomp() {
    return this.$getters.getkeyId;
  }
  // 是否登录
  get isLogin() {
    return this.$store.state.isLogin;
  }
  get getUnMergeName() {
    return this.$getters.getUnMergeName !== 'name';
  }
  async refreshHomePage() {
    await this.$store.dispatch('getAccountInfo');
    await this.$store.dispatch('updateContext');
    uni.stopPullDownRefresh();
  }
   toLogin() {
    uni.navigateTo({
      url: '/user/login'
    });
  }
  upgradeAccount() {
    uni.navigateTo({
      url: '/scc_home/upgrade_account/index'
    });
  }
  toUserInfo() {
    uni.navigateTo({
      url: '/pages/user/index'
    });
  }
  onPullDownRefresh() {
    this.refreshHomePage();
    (this.$refs.service as Service).loadData();
    (this.$refs.alarmCard as Alarm)?.init();
    (this.$refs.mss as MssPortal).loadData();
  }

  async handleAuthentication() {
    // 无法保证watch 和 onShow的执行顺序，这里在调用一次
    await this.$store.dispatch('updateContext');
    await this.$store.dispatch('getAccountInfo');
    // TD2024101000297 暂时隐藏
    // const isAlertAuthModal = !this.$store.getters.isAuth;
    // const isSubAccount = this.$store.getters.isSubAccount;
    // if (isAlertAuthModal && !isSubAccount) {
    //   // 首页账号升级弹窗
    //   this.showAuthModal = true;
    // }
  }

  handleConfirmModal() {
    this.showAuthModal = false;
    uni.navigateTo({
      url: '/account_upgrade/index'
    });
  }

  handleCancelModal() {
    this.showAuthModal = false;
  }
}
```
# 5

```js
<template>
  <view class="tabbar-wrap">
    <view class="tabbar-wrap__content">
      <view
        v-for="item in lists"
        :key="item.name"
        class="tabbar-wrap__content--item"
        :class="item.isBulge ? 'bulge-cls' : ''"
        :style="tabbarItemSty"
      >
        <view class="item-box" @click="() => handleChangeTab(item.key)">
          <view class="item-img">
            <image :src="getImgUrl(item)" style="width: 48rpx; height: 48rpx;"></image>
          </view>
          <view class="item-title" :class="currentKey === item.key ? 'active-title' : ''">
            {{ item.name }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

@Component({
  name: 'Tabbar'
})
export default class Tabbar extends Vue {
  @Prop({ type: String, default: TabKey.home})
  readonly tabbarKey!: TabKey;

  currentKey = TabKey.home;

  @Watch('tabbarKey', { immediate: true })
  onKeyChange(val: TabKey) {
    this.currentKey = val;
  }

  get isLogin() {
    return this.$store.state.isLogin;
  }

  get lists() {
    return [
      {
        key: TabKey.home,
        url: '/static/img/scc_home/home_page.png',
        activeUrl: '/static/img/scc_home/home_page_active.png',
        name: '首页',
        isBulge: false
      },
      {
        key: TabKey.serviceCenter,
        url: '/static/img/scc_home/service_center.png',
        activeUrl: '/static/img/scc_home/service_center.png',
        name: '服务中心',
        isBulge: true
      },
      {
        key: TabKey.mine,
        url: '/static/img/scc_home/mine.png',
        activeUrl: '/static/img/scc_home/mine_active.png',
        name: '我的',
        isBulge: false
      }
    ];
  }

  get tabbarItemSty() {
    return `width: ${100 / this.lists.length}%`;
  }

  getImgUrl(item: ItemType) {
    const imgUrl = this.currentKey === item.key ? item.activeUrl : item.url;
    return this.$imgWrapper(imgUrl);
  }

  handleChangeTab(key: TabKey) {
    if (this.currentKey === key) {
      return;
    }

    this.$emit('changeTab', key);

    if (key === TabKey.serviceCenter) {
      uni.navigateTo({
        url: '/service_center/home_page'
      });
    }

    if (key === TabKey.mine) {
        uni.reLaunch({
          url: '/pages/user/index'
        });
    }

    if (key === TabKey.home) {
        uni.reLaunch({
          url: '/scc_home/index'
        });
    }
  }
}
</script>
export interface ItemType {
  key: string;
  url: string;
  activeUrl: string;
  name: string;
  isBulge: boolean;
}
```

# 功能概述及文件解析

## 一、tabbar/index.vue 文件
1. **功能概述**
这个文件定义了一个底部导航栏组件（Tabbar），用于在不同页面之间进行切换。它包含了三个主要的导航项：首页、服务中心和我的。
2. **主要部分解析**
    - **模板部分（template）**
        - `v-for="item in lists"`：遍历导航项列表，生成每个导航项。
        - `@click="() => handleChangeTab(item.key)"`：点击导航项时调用`handleChangeTab`方法进行页面切换。
        - `:class="currentKey === item.key ? 'active-title' : ''"`：根据当前选中的导航项，动态设置标题的样式。
    - **脚本部分（script）**
        - `@Prop`：定义了一个名为`tabbarKey`的属性，用于接收父组件传递的当前选中的导航项。
        - `@Watch`：监听`tabbarKey`的变化，并更新`currentKey`。
        - `get lists()`：返回导航项的列表，包括每个导航项的`key`、图片`URL`、名称和是否突出显示。
        - `handleChangeTab(key: TabKey)`：处理导航项的点击事件，根据不同的`key`进行页面跳转。
    - **样式部分（style）**
使用了`scss`，定义了导航栏的样式，包括导航项的布局、图片和文字的样式。

## 二、d:\gongfan\X-Central-MiniApp-UI\src\scc_home\index.vue 文件
1. **功能概述**
这个文件定义了首页的主要页面布局和逻辑，包括顶部导航栏、轮播图、服务组件、消息推送、账号升级提示等。
2. **主要部分解析**
    - **模板部分（template）**
        - `<custom-navigation>`：自定义导航栏组件，包含了轮播图和其他子组件。
        - `<home-swiper />`：轮播图组件。
        - `<service />`：服务组件。
        - `<message-push />`：消息推送组件。
        - `<auth-register-result />`：账号注册结果提示组件。
        - `<tabbar />`：底部导航栏组件。
    - **脚本部分（script）**
        - `@Watch`：监听`isLogin`状态的变化，触发相应的登录逻辑。
        - `onShow`：页面显示时刷新首页数据。
        - `onLoad`：页面加载时处理`URL`参数，进行相应的跳转和认证。
        - `mounted`：组件挂载时加载服务数据。
        - `refreshHomePage`：刷新首页数据的方法。
        - `handleAuthentication`：处理用户认证的方法。
        - `handleConfirmModal`和`handleCancelModal`：处理账号升级提示框的确认和取消操作。
    - **样式部分（style）**
使用了`scss`，定义了页面的整体布局和样式，包括轮播图、提示信息、底部间隙等。

## 三、总结
1. `tabbar/index.vue`：定义了一个底部导航栏组件，用于在不同页面之间进行切换。
2. `scc_home/index.vue`：定义了首页的主要布局和逻辑，包括导航栏、轮播图、服务组件、消息推送、账号升级提示等。 
