### 3.4.3 Text-to-3D  
目前由文字到3D模型存在两种路径：  
1. **使用“文生图-模型+NeRF生成3D模型”**  
   - 例如使用 Stable Diffusion + Controller 插件，生成多视角的2D图，再由 NeRF 形成3D建模。  

2. **使用文字生成3D模型**  
   - 这一类模型往往是文字到扩散模型和 NeRF 结合。其原理为：先通过文字到图像的扩散模型生成2D图，再通过 NeRF 将2D生成3D模型。  

---

### 3.5 渲染技术  
#### 3.4.1 APP+Web  
- **使用 WebGL 渲染**  
  - H5 使用 Babylon.js 进行模型渲染及常规的预览操作。  
  - App 通过嵌入 H5 页面渲染，PC 端同步。  

---

### 3.4 3D建模技术  
#### 3.4.1 NeRF (2D-to-3D)  
- **特点**  
  - 重建效果较逼真，但速度很慢，需要多张不同视角下的重建目标图像。  

- **NeRF 原理**  
  - NeRF 是当前最为火热的研究领域之一，效果非常惊艳。它解决的问题是：给定一些拍摄的图像，如何生成新的视角下的图。  
  - 不同于传统的三维重建方法（如点云、网格、体素等），NeRF 将场景建模成一个连续的5D辐射场，隐式存储在神经网络中。  
  - 只需输入稀疏的多角度图像 pose 训练得到一个神经辐射场模型，根据该模型可以渲染出任意视角下的清晰照片。  
  - 通俗来讲，NeRF 构造了一个隐式的渲染流程，其输入为某个视角下发射的光线位置、方向以及对应的坐标 (x, y, z)，送入神经辐射场 F0 得到体密度和颜色，最终通过渲染得到图像。  

---

### 基于 NeRF 的场景三维重建  
#### 1. **背景**  
- NeRF 原理  
- 体渲染概述  

#### 2. **数据集介绍**  
- 常见视角合成数据集：  
  - Blender  
  - LLFF  
  - ShapeNet  
- 常见三维重建数据集：  
  - DTU  
  - Tanks & Temples  
  - ETH3D  
  - ScanNet  

#### 3. **应用场景**  
- 新视角合成  
- 物体精细重建  
- 城市大场景重建  
- 人体建模  
- 3D内容迁移  

#### 4. **NeRF代码开发相关**  
- 工具：  
  - colmap  
  - tinydcudann  
- 开源框架：  
  - nerfstudio  
  - sdfstudio  
  - NerfAcc  

#### 5. **从采样提升重建精度**  
- NeuS  
- VolSDF  
- NeuS2  

#### 6. **引入几何先验**  
- MonoSDF  
- DS-NeRF  
- Geo-NeuS  
- NeuralWarp  

#### 7. **加速与提高渲染质量方法**  
- mip-NeRF  
- mip-NeRF360  
- instant-ngp  
- merf  

#### 8. **大规模 NeRF**  
- with MLP:  
  - nerf-W  
  - mega-NeRF  
  - block-NeRF  
- with grid/feature plane:  
  - cityNeRF (BungeeNeRF)  
  - GP-NeRF  
  - NeRF for Urban Scenes  

#### 9. **Text-to-NeRF**  
- DreamFusion  
- Magic3D  
