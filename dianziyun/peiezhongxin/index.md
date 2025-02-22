这段代码定义了一个名为 `Login` 的 React 组件，用于构建登录页面。以下是对这段代码逻辑的详细讲解：

### 导入模块
```typescriptreact
import React, { useEffect } from 'react';
import Footer from '@/components/Footer';
import Logo from '@/assets/logo.svg';
import LoginForm from './form';
import LoginBanner from './banner';
import styles from './style/index.module.less';
```
- 导入了 React 库以及 `useEffect` 钩子。
- 导入了 `Footer` 组件用于页面底部。
- 导入了 `Logo` 作为页面的标志。
- 导入了 `LoginForm` 和 `LoginBanner` 组件，分别用于显示登录表单和轮播图。
- 导入了样式文件 `index.module.less`。

### 组件定义
```typescriptreact
function Login() {
  useEffect(() => {
    document.body.setAttribute('arco-theme', 'light');
  }, []);
```
- 定义了一个名为 `Login` 的函数组件。
- 使用 `useEffect` 钩子在组件挂载时设置 `arco-theme` 属性为 `light`，用于设置页面主题。

### 渲染页面结构
```typescriptreact
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Logo />
        <div className={styles['logo-text']}>Arco Design Pro</div>
      </div>
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <LoginBanner />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles['content-inner']}>
          <LoginForm />
        </div>
        <div className={styles.footer}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
```
- 页面结构由三个主要部分组成：`logo`、`banner` 和 `content`。
- `logo` 部分包含一个 `Logo` 组件和一个文本 "Arco Design Pro"。
- `banner` 部分包含 `LoginBanner` 组件，用于显示轮播图。
- `content` 部分包含 `LoginForm` 组件，用于显示登录表单，以及 `Footer` 组件用于页面底部。

### 组件属性
```typescriptreact
Login.displayName = 'LoginPage';
```
- 设置组件的 `displayName` 属性为 `'LoginPage'`，便于调试时识别组件名称。

### 导出组件
```typescriptreact
export default Login;
```
- 将 `Login` 组件导出为默认导出，以便在其他文件中使用。

这段代码通过组合 `Logo`、`LoginBanner`、`LoginForm` 和 `Footer` 组件，构建了一个完整的登录页面，并通过样式文件进行样式管理。
