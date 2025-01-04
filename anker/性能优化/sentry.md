这个项目使用 Sentry 进行错误监控和性能跟踪。以下是项目中使用 Sentry 的具体方式和步骤：

### 1. 引入 Sentry 库
首先，项目引入了 Sentry 库：
```javascript
import * as Sentry from "@sentry/react";
import { baseKey } from 'src/services/sentry';
```
- `@sentry/react`：Sentry 的 React SDK，用于捕获和报告 React 应用中的错误和性能数据。
- `baseKey`：从 `src/services/sentry` 中引入的 Sentry DSN（Data Source Name），用于标识项目。

### 2. 初始化 Sentry
项目在初始化时配置了 Sentry：
```javascript
Sentry.init({
  dsn: baseKey,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/aiot-wapi-ci\.mkitreal\.com\/web\/editor\/works\/.*/],
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  autoSessionTracking: true,
});
```
- `dsn`：Sentry 的 DSN，用于标识项目。
- `integrations`：集成了浏览器追踪、性能分析和会话重放功能。
  - `Sentry.browserTracingIntegration()`：集成浏览器追踪功能，用于捕获页面加载时间、资源加载时间等性能数据。
  - `Sentry.browserProfilingIntegration()`：集成浏览器性能分析功能，用于捕获性能分析数据。
  - `Sentry.replayIntegration()`：集成会话重放功能，用于记录用户操作并在发生错误时重放这些操作。
- `tracesSampleRate`：设置追踪采样率为 100%。
- `tracePropagationTargets`：指定哪些 URL 应该启用分布式追踪。
- `profilesSampleRate`：设置性能分析的采样率为 100%。
- `replaysSessionSampleRate`：设置会话重放的采样率为 10%。
- `replaysOnErrorSampleRate`：在发生错误时，将会话重放的采样率设置为 100%。
- `autoSessionTracking`：启用会话跟踪。


### 总结
这个项目使用 Sentry 进行错误监控和性能跟踪的具体方式包括：
1. **引入 Sentry 库**：引入 `@sentry/react` 库和 Sentry DSN。
2. **初始化 Sentry**：配置 Sentry 的 DSN、集成插件、采样率等。


通过这些配置，项目能够捕获和报告应用中的错误、异常、性能问题等，并将这些信息发送到 Sentry 的服务器进行分析和展示。这有助于开发者实时监控应用的运行状态，快速定位和解决问题。
