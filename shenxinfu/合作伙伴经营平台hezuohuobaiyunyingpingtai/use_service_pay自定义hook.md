# 自定义hook
好的，我来详细解释一下 use_service_pay.ts 文件中的订阅服务表格是如何定义和使用的。


文件结构和功能概述

这个文件主要是一个 Vue Composition API 的钩子函数，用于处理和展示客户的服务订阅状态。它通过从 API 获取的数据来生成一个包含服务订阅状态的表格。

主要部分解析


导入模块和常量定义


```js
import { Ref, computed, unref } from '@vue/composition-api';
import * as GetServicePaymentList from '@/api/prosecution/types/getServicePaymentList';
import { $i } from '@/framework/i18n';
import { ProductType } from '@xcentral/const/product';
import ctig0 from '../detail/imgs/ctig_0.svg';
import ctig1 from '../detail/imgs/ctig_1.svg';
import mss0 from '../detail/imgs/mss_0.svg';
import mss1 from '../detail/imgs/mss_1.svg';
import saseAc0 from '../detail/imgs/sase_ac_0.svg';
import saseAc1 from '../detail/imgs/sase_ac_1.svg';
import saasAes0 from '../detail/imgs/saas_aes_0.svg';
import saasAes1 from '../detail/imgs/saas_aes_1.svg';
import saseVpn0 from '../detail/imgs/sase_vpn_0.svg';
import saseVpn1 from '../detail/imgs/sase_vpn_1.svg';
import xdlp0 from '../detail/imgs/xdlp_0.svg';
import xdlp1 from '../detail/imgs/xdlp_1.svg';
import xdr0 from '../detail/imgs/xdr_0.svg';
import xdr1 from '../detail/imgs/xdr_1.svg';
import ztna0 from '../detail/imgs/ztna_0.svg';
import ztna1 from '../detail/imgs/ztna_1.svg';

export const NOT_PURCHASED = -1;
```
这里导入了 Vue Composition API 的一些工具函数、API 类型定义、国际化工具 $i 和一些常量及图标资源。NOT_PURCHASED 常量用于表示未购买的状态。


定义辅助函数
```js
function isNotPurchased(val: number) {
  return val === NOT_PURCHASED;
}
```
这个辅助函数用于判断某个服务是否未购买。

定义服务映射表

```js
const serviceMap: Record<
  string,
  {
    name: string;
    purchased: {
      icon: string;
      tip?: string;
    };
    notPurchased: {
      icon: string;
      tip?: string;
    };
  }
> = {
  [ProductType.saseCtig]: {
    name: $i('partner.customer_operation_detail.service_pay_status.ctig'),
    purchased: {
      icon: ctig1,
      tip: $i('partner.customer_operation_detail.service_pay_status.purchased'),
    },
    notPurchased: {
      icon: ctig0,
      tip: $i('partner.customer_operation_detail.service_pay_status.not_purchased'),
    },
  },
  // 其他服务类型的定义...
};
```

serviceMap 是一个对象，键是服务的类型，值是一个包含服务名称、已购买状态和未购买状态的对象。每个状态包含一个图标和一个提示信息。

定义 useServicePay 函数
```js
export function useServicePay(
  serviceData:
    | Ref<GetServicePaymentList.ResponseData>
    | GetServicePaymentList.ResponseData
) {
  function getItems(
    data: GetServicePaymentList.ResponseData[keyof GetServicePaymentList.ResponseData],
    order: string[]
  ) {
    return Object.entries(data)
      .filter((key) => key[0] !== 'proportion')
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map((item) => {
        const { name, purchased, notPurchased } = serviceMap[item[0]];
        const status = item[1] as number;
        const { icon, tip } = isNotPurchased(item[1] as number)
          ? notPurchased
          : purchased;
        return {
          status,
          name,
          icon,
          tip,
        };
      });
  }

  const serviceRenderedData = computed(() => {
    const data = unref(serviceData);

    return [
      {
        key: 'office',
        name: $i('partner.customer_operation_detail.service_pay_status.integrated_office.title'),
        items: getItems(data.integrated_office, [
          ProductType.saseZtna,
          ProductType.xdlp,
          ProductType.saseAc,
          ProductType.saseVpn,
        ]),
      },
      {
        key: 'cloud',
        name: $i('partner.customer_operation_detail.service_pay_status.cloud_security.title'),
        items: getItems(data.cloud_security, [
          ProductType.mss,
          ProductType.xdr,
          ProductType.edr,
        ]),
      },
      {
        key: 'offline',
        name: $i('partner.customer_operation_detail.service_pay_status.offline_equipment_empowerment.title'),
        items: getItems(data.offline_equipment_empowerment, [
          ProductType.saseCtig,
        ]),
      },
    ];
  });

  return {
    serviceRenderedData,
  };
}
```



