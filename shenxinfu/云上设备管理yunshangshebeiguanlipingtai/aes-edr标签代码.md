```js
const platformSelectOptions = computed(() => getAccessPlatform.formatData.value.access_platform.map(item => {
    let platform = cloneDeep(item);
    let label = '';
    let value = '';
    switch (platform.label) {
        case XCENTRAL:
            label = $i('sase.home.edit_device_modal.managment');
            value = $i('sase.home.edit_device_modal.managment');
            break;
        case NOTCONNPLATFORM:
            label = $i('sase.home.toolbar_not_platform');
            value = $i('sase.home.toolbar_not_platform');
            break;
        case EDR:
            label = AES;
            value = EDR;
            break;
        default:
            label = platform.label;
            value = platform.label;
            break;
    }

return {
    label,
    value
};
} ));
```
显示更少


