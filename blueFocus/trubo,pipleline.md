你的错误信息是：

```
turbo_json_parse_error
× Found an unknown key `tasks`.
```

这说明你的 `turbo.json` 配置文件格式不对。新版 turbo（1.x 及以后）不再支持 `tasks` 字段，而是用 `pipeline` 字段。

---

### 解决方法

1. 打开根目录下的 `turbo.json` 文件。
2. 把里面的 `"tasks": { ... }` 改成 `"pipeline": { ... }`，其它内容保持不变。

**举例：**

原来的写法（错误的）：
```json
{
  "globalDependencies": ["**/.env"],
  "tasks": {
    "build": {
      "outputs": ["dist/**", ".next/**"]
    }
  }
}
```

改成这样（正确的）：
```json
{
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "outputs": ["dist/**", ".next/**"]
    }
  }
}
```

---

修改后保存，再重新执行 `yarn build` 即可。

如果还有问题，把 turbo.json 的内容发给我，我帮你检查！
