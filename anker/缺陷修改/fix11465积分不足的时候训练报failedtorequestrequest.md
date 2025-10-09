### 问题描述
在积分不足时，用户在创建宠物头像的过程中，系统错误地显示了"Failed to request."的错误提示，而不是正确的积分不足提示。

#### 前置条件
用户积分不足。

#### 操作步骤
1. 进入 `Create pet avatar` 页面。
2. 上传主图。
3. 上传辅助图。
4. 点击 `Start to create` 按钮。

#### 实际结果
积分不足时，系统显示错误提示："Failed to request."

- 响应的code字段为220100时，前端展示积分不足的提醒文案

```
// 发布创建
const submitCallBack = async () => {
  // 检查用户积分是否足够
  if (UserAllIntegral < NowModulIntegral) {
    // 显示提示信息
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
    }, 5000);
    return;
  }

  // 设置提交加载状态为 true
  setSubmitLoading(true);
  try {
    // 上传图片
    await uploadImage();

    // 构建请求参数
    const params = {
      dataset_id: uploadTokenData.dataset_id,
      thumb_key_prefix: uploadTokenData.thumb.key_prefix,
    };

    // 创建模型训练任务
    const res = await createModelTrainTask(params);

    // 如果任务创建成功
    if (res?.code === 0) {
      // 更新用户积分
      UserAllIntegral = UserAllIntegral - NowModulIntegral;
      dispatch(getUserIntegralData(UserAllIntegral));

      // 设置提交加载状态为 false
      setSubmitLoading(false);

      // 清空上传文件
      setUploadFile({});

      // 调用回调函数
      careteAvatarReCallBack();
    } else if (res?.code === 220100) {
      // 如果积分不足，显示错误提示
      dispatch(
        openToast({
          message: getTranslation(TranslationsKeys.INSUFFICIENT_POINTS),
          severity: 'error',
        }),
      );
      setSubmitLoading(false);
    } else {
      // 如果任务创建失败，显示错误提示
      dispatch(
        openToast({
          message: res?.msg || getTranslation(TranslationsKeys.FAILED_TASK),
          severity: 'error',
        }),
      );
      setSubmitLoading(false);
    }
  } catch (error) {
    // 处理上传图片或创建任务时的错误
    dispatch(
      openToast({
        message: getTranslation(TranslationsKeys.FAILED_IMAGE),
        severity: 'error',
      }),
    );
    setSubmitLoading(false);
  }
};
```
