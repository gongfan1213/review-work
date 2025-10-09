<img width="307" alt="image" src="https://github.com/user-attachments/assets/ad96719f-f1c7-44ee-a731-a7c257881785" />


```
.outBottomBox {
    background-color: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 10px;
    .outLineswitchBox {
      margin: 5px 10px 5px 16px;
      display: flex;
      flex-direction: row;
      line-height: 32px;
      .btn_bg{
        margin-left: 12px;
        margin-top: 4px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        width: 42px;
        height: 20px;
        border-radius: 11px;
        background-color: #33bf5a;
        cursor: pointer;
        &.btn_bg_selected {
          animation: gradientBg 0.1s linear forwards;
        }
        &.btn_bg_selectedBack {
          animation: gradientBackBg 0.1s linear forwards;
        }
        .btn_box{
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #fff;
          &.btn_box_selected{
            animation: gradient 0.1s linear forwards;
          }
          &.btn_box_selectedBack {
            animation: gradientBack 0.1s linear forwards;
          }
        }
      }
      @keyframes gradientBg {
        0% {
          background-color: #d9d9d9;
        }
        100% {
          background-color: #33bf5a;
        }
      }
      @keyframes gradientBackBg {
        0% {
          background-color: #33bf5a;
        }
        100% {
          background-color: #d9d9d9;
        }
      }
      @keyframes gradient {
        0% {
          transform: translateX(2px);
        }
        100% {
          transform: translateX(22px);
        }
      }
      @keyframes gradientBack {
        0% {
          transform: translateX(22px);
        }
        100% {
          transform: translateX(2px);
        }
      }

      .label {
        color: #888;
        font-size: 12px;
      }
    }
  }
  <div
                  onClick={async (e) => {
                    if (photoInfo.contour && photoInfo.contour.length > 0) {
                      if (!outLineswitch) {
                        // 绘制轮廓
                        outlinePaths.current = await baseMapChangeManager.getCutImgs(
                          photoInfo.mask_image,
                          photoInfo.contour,
                        );
                        setRectIndex(0);
                        drwaOutLine(photoInfo.contour, 0);
                      } else {
                        clearCanvas();
                      }
                      setOutLineswitch(!outLineswitch);
                    } else {
                      dispatch(
                        openToast({
                          message: getTranslation(TranslationsKeys.SNAPSHOT_NO_CONTOURDATA),
                          severity: 'warning',
                        }),
                      );
                    }
                  }}
                  className={clsx(
                    classes.btn_bg,
                    { [classes.btn_bg_selectedBack]: !outLineswitch },
                    { [classes.btn_bg_selected]: outLineswitch }
                  )}
                >
```
