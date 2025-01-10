这段代码实现了一个 JavaScript 和原生应用（如 iOS 和 Android）之间的通信桥梁（JSBridge）。它允许 JavaScript 调用原生代码，并接收原生代码的回调。下面我将详细讲解这段代码的各个部分及其功能。

### 全局声明

首先，我们在全局声明中扩展了 `window` 对象，以便在 TypeScript 中使用自定义属性和方法。

```typescript
declare global {
  interface Window {
    [key: string]: string | Record<string, any> | Function;
    anker_msg: {
      postMessage(msg: string): void;
      receiveMessageFromClient: (dataSource: AnkerMsg) => void;
    };
  }
}

export interface AnkerMsg {
  functionName?: string;
  callbackName?: string;
  content?: unknown;
  data?: any;
  action?: string;
}
```

### 常量和变量

定义了一些常量和变量：

```typescript
const NATIVE_CHANNEL_NAME = 'anker_web_flutter_channel';
const PC_CHANNEL_NAME = 'anker_msg';

let NATIVE_LISTEMERS: Function[] = [];
```

- `NATIVE_CHANNEL_NAME` 和 `PC_CHANNEL_NAME` 是用于标识通信通道的名称。
- `NATIVE_LISTEMERS` 是一个数组，用于存储注册的监听器。

### 核心函数 `_callNative`

这个函数用于调用原生代码，并返回一个 `Promise`，以便处理异步操作。

```typescript
const _callNative = ({ action, data }: { action: string, data?: any }): Promise<any> => {
  return new Promise((resolve, reject) => {
    const errorData = { success: false, msg: "window.flutter_inappwebview is null", data: null };

    if (window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler(NATIVE_CHANNEL_NAME, action, data).then(function (result: any) {
        var data = result;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
            ConsoleUtil.log("[from app] data: ", data);
            resolve(data);
          } catch (error) {
            errorData.msg = 'JSON.parse error';
            reject(errorData);
          }
        }
      });
    } else {
      reject(errorData);
    }
  });
}
```

- `action` 是要调用的原生方法的名称。
- `data` 是传递给原生方法的数据。
- 如果 `window.flutter_inappwebview` 存在，则调用原生方法，并处理返回结果。
- 如果返回结果是字符串，则尝试解析为 JSON。

### 环境检测函数

这些函数用于检测当前运行环境：

```typescript
export const isPc = () => {
  if (typeof (window) === 'undefined') return false;
  return !!window.anker_msg;
}

export const isFlutter = () => {
  if (typeof (window) === 'undefined') return false;
  return !!window.flutter_inappwebview;
}

export const isEufyJS = () => {
  if (typeof (window) === 'undefined') return false;
  return !!window.EufyJS;
}

export const isInNativeApp = () => {
  return isFlutter() || isEufyJS();
}
```

- `isPc` 检测是否在 PC 环境中运行。
- `isFlutter` 检测是否在 Flutter 环境中运行。
- `isEufyJS` 检测是否在 EufyJS 环境中运行。
- `isInNativeApp` 检测是否在原生应用环境中运行。

### 原生操作函数

这些函数用于调用原生代码执行特定操作：

```typescript
export const nativeReLogin = () => {
  return _callNative({ action: 'on_token_timeout' });
}

export const nativeGoBack = () => {
  return _callNative({ action: 'back' });
}

export const eufyGoBack = () => {
  window.location.href = "app://back";
}

export const eufyCloseWebview = () => {
  window.location.href = "app://close";
}

export const closeWebview = () => {
  return _callNative({ action: 'close' });
}
```

- `nativeReLogin` 触发原生应用重新登录。
- `nativeGoBack` 触发原生应用返回操作。
- `eufyGoBack` 和 `eufyCloseWebview` 通过 URL scheme 触发原生操作。
- `closeWebview` 关闭 WebView。

### 获取原生信息

这个函数用于获取原生应用的信息：

```typescript
export const getNativeInfo = async (): Promise<NativeInfo | undefined> => {
  try {
    let userInfo: NativeInfo;
    if (isFlutter()) {
      userInfo = await _callNative({ action: 'get_user_info_v1' }).then(resp => {
        return resp?.data ?? null;
      });
      return userInfo;
    } else if (isEufyJS()) {
      userInfo = await getUserInfoEufy();
      return userInfo;
    }
  } catch (error) {
  }
}
```

- `getNativeInfo` 根据当前环境调用不同的方法获取原生信息。

### 其他功能函数

这些函数实现了其他一些功能，如跳转页面、发送 AI 结果、注册监听事件等：

```typescript
export const gotoNativePage = (
  pageName: 'modelDetail' | 'modelDownload' | 'profileDetail',
  modelId?: string,
  ruleId?: string
) => {
  return _callNative({
    action: 'turn_page',
    data: { pageName, modelId, ruleId }
  });
}

export const openWebview = (
  url: string,
  type?: '1' | '2',
) => {
  return _callNative({
    action: 'open_url',
    data: { url, type }
  });
}

export const sendAiResult = (list: any) => {
  return _callNative({
    action: 'aiResult',
    data: {
      list
    }
  });
}

export const subscribeNativeEvent = (callback: Function) => {
  NATIVE_LISTEMERS.push(callback);
  if (window.onAnkerNativeEvent == null) {
    window.onAnkerNativeEvent = (data: any) => {
      NATIVE_LISTEMERS.forEach((item) => {
        try { item(data) } catch (error) { }
      });
    }
  }
}

export const logoutFromWeb = () => {
  type AnkerMsg = {
    anker_msg?: {
      postMessage(
        msg: string
      ): void
    }
  }
  const win = window as Window & AnkerMsg;
  if (typeof win.anker_msg !== 'undefined') {
    win.anker_msg.postMessage(JSON.stringify({
      action: 'command_logout',
      data: {},
    }));
  }
}

export const loginFromWeb = () => {
  type AnkerMsg = { anker_msg?: { postMessage(msg: string): void } }
  const win = window as Window & AnkerMsg;

  if (typeof win.anker_msg !== 'undefined') {
    win.anker_msg.postMessage(JSON.stringify({
      action: 'command_login',
      data: {},
    }));
  }
}

export const sendCommandToPc = (action: string, data?: any) => {
  type AnkerMsg = { anker_msg?: { postMessage(msg: string): void } }
  const win = window as Window & AnkerMsg;
  if (typeof win.anker_msg !== 'undefined' && typeof win.anker_msg.postMessage === 'function') {
    ConsoleUtil.log('--->sendCommandToPc', action, data);
    win.anker_msg.postMessage(JSON.stringify({
      action: action,
      data: data ? data : {},
    }));
  }
}

export const readFileAsBase64 = (file: Blob) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    window.anker_msg.postMessage(
      JSON.stringify({
        functionName: 'getHeaderList',
        callbackName: "",
        data: null,
      }),
    );
    var base64String = reader.result as string;
    window.anker_msg.postMessage(
      JSON.stringify({
        functionName: 'file',
        callbackName: "",
        content: base64String,
        data: null,
      }),
    );

    window.anker_msg.postMessage(
      JSON.stringify({
        functionName: 'getHeaderList',
        callbackName: "",
        data: null,
      }),
    );
  };
  reader.readAsDataURL(file);
}

export const schemeUrlPC = (pingStr: string) => {
  const url = `eufystudio://open/?${pingStr}`;
  ConsoleUtil.log('Upload printLayers.tar schemeUrlPC===:', url);

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);

  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 10000);
}

export const unSubscribeNativeEvent = (callback: Function) => {
  NATIVE_LISTEMERS = NATIVE_LISTEMERS.filter((item) => item !== callback);
}

export const openBrowser = (url: string) => {
  type AnkerMsg = { anker_msg?: { postMessage(msg: string): void } }
  const win = window as Window & AnkerMsg;
  if (typeof win.anker_msg !== 'undefined') {
    win.anker_msg.postMessage(JSON.stringify({
      functionName: 'command_openBrowser',
      callbackName: null,
      data: {},
      url: url
    }));
  }
}
```

### 接收消息和回调处理

这些函数用于接收来自原生应用的消息，并处理回调：

```typescript
export const sendCommandToPcWithResponse = (action: string, callback: Function, param?: any) => {
  const callbackName = getName((err?: Error, data?: Record<string, any>) => {
    if (!err) {
      if (timeoutId) {
        clearTimeout(timeoutId); // 清除超时计时器
      }
      callback(data);
    }
  });

  const data = param ? Object.assign(param, { callbackName }) : { callbackName };
  ConsoleUtil.log(888, '发送消息', action, data);

  //@ts-ignore
  window.anker_msg.postMessage(JSON.stringify({
    action,
    data
  }));

  // 设置超时处理
  const timeoutId = setTimeout(() => {
    ConsoleUtil.error('请求超时');
    callback(new Error('timeOut'));
  }, 10000); // 10秒超时
};

export const receivePCMessageOnWeb = (callBack: Function) => {
  if (window.anker_msg) {
    window.anker_msg.receiveMessageFromClient = (dataSource: any) => {
      const { action, data } = dataSource;
      ConsoleUtil.log(888, '接收消息', action, data);
      callBack(action, data);
    }
  }
}

function getName(cb?: Function) {
  const fnName = Math.random().toString(36).substring(2, 10);
  if (!cb) return fnName;
  window[fnName] = (str: string) => {
    try {
      const data = JSON.parse(str);
      if (typeof cb === 'function') {
        cb(null, data);
      }
    } catch (error) {
      ConsoleUtil.error('parse failed');
    }
    window[fnName] && delete window[fnName];
  }
  return fnName;
}
```

- `sendCommandToPcWithResponse` 发送消息到 PC，并处理回调。
- `receivePCMessageOnWeb` 接收来自 PC 的消息，并调用回调函数。
- `getName` 生成一个唯一的回调函数名称，并将回调函数挂载到 `window` 对象上。

### 总结

这段代码实现了一个 JSBridge，用于在 JavaScript 和原生应用之间进行通信。它提供了一系列函数，用于检测运行环境、调用原生代码、处理回调、发送和接收消息等。通过这些函数，JavaScript 可以与原生应用进行双向通信，实现复杂的交互逻辑。
