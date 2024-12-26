### 问题描述

在2D编辑器中，点击Snapshot拍照时，关闭拍照按钮的图标与UI设计图不一致。

### 代码问题

在代码中，发现了多处 `src` 属性设置不一致的问题，导致图标显示不正确。

### 解决方案

1. **确保 `src` 属性设置正确**：将 `src` 属性设置为正确的图标路径。
2. **删除重复的 `src` 属性设置**：确保每个 `img` 标签只有一个 `src` 属性。

### 修改后的代码

```jsx
import React from 'react';
import { Box, LinearProgress } from '@mui/material';
import camera from 'src/assets/editor/img_camera.png';
import ic_down from 'src/assets/svg/ic_down.svg';
import appbar_close_icon from 'src/assets/img/appbar_close_icon.png';
import progress_close_icon from 'src/assets/svg/progress_close_icon.svg';
import canvas_icon from 'src/assets/img/canvas.png';
import snapshot_icon from 'src/assets/img/snapshot.png';
import ic_auto_measure from 'src/assets/svg/ic_auto_measure.svg';

const MyComponent = () => {
  const autoMeasureModel = { progress: 50 }; // Example progress value
  const photoInfo = { process: 75 }; // Example process value

  return (
    <div>
      <div>
        <Box className="progressBox" sx={{ width: '80%' }}>
          <LinearProgress variant="determinate" value={autoMeasureModel.progress} />
          <span className="processvalue">{autoMeasureModel.progress ? `${autoMeasureModel.progress}%` : ''}</span>
          <img
            src={progress_close_icon}
            className="closeTabIcon"
            onClick={() => {
              sendCommandToPc(CustomPcAction.Command_Auto_Measure, {});
            }}
          />
        </Box>
      </div>
      <div>
        <Box className="progressBox" sx={{ width: '80%' }}>
          <LinearProgress variant="determinate" value={photoInfo.process} />
          <span className="progressText">{photoInfo.process + '%'}</span>
          <img
            src={progress_close_icon}
            className="closeTabIcon"
            onClick={() => {
              // 发送停止拍照指令
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default MyComponent;
```

### 解释

1. **`src` 属性设置**：确保 `img` 标签的 `src` 属性设置为正确的图标路径。
2. **删除重复的 `src` 属性**：确保每个 `img` 标签只有一个 `src` 属性。

### 测试步骤

1. 进入2D编辑器，点击Snapshot拍照。
2. 观察关闭拍照按钮的图标是否与UI设计图一致。

### 预期结果

关闭拍照按钮的图标与UI设计图一致。
