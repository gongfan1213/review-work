# 新增lite
# 新增国家选项，马拉西亚，印度尼西亚和其他
# 东南亚子账号新增新增xdr
- hide isSea改成false,条件判断新增xdr
- 新增参数idc_region,从localStorgae当中获取其中的idc_region的值，将idc_region存储到localSTorage当中的，用户点击分享链接，复制对应的url获取其中的参数，并且将选择的国家作为参数进行拼接的，
```js
const hash = window.location.hash;
const urlParams = new URLSearchParams(hash);
const idc_region = urlParams.get('idc_region');
idc_region?localStorage.setItem('idc_region', idc_region);

```
- 增加对应的idc_region和default_region
