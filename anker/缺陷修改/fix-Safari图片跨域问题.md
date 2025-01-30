### **问题背景：Safari 图片跨域问题**

Safari 浏览器在加载跨域图片时，可能会遇到以下问题：
1. **跨域限制**：如果图片的服务器没有正确设置 `CORS`（跨域资源共享）头，Safari 会阻止图片加载。
2. **安全限制**：即使设置了 `crossOrigin="anonymous"`，如果图片的服务器未正确配置 `Access-Control-Allow-Origin`，图片仍然无法加载。
3. **Canvas 污染问题**：如果图片是跨域的，且未正确设置 `CORS`，在将图片绘制到 `<canvas>` 时会触发安全错误。

---

### **为什么这样写能解决 Safari 的跨域问题？**

从代码中可以看出，解决跨域问题的核心是通过 **将图片转换为 Blob 对象**，然后使用 `URL.createObjectURL` 创建一个本地的 Blob URL 来加载图片。以下是具体分析：

---

### **1. 代码的核心逻辑**

#### **1.1 `convertToBlob` 函数**
```typescript
export const convertToBlob = async (url: string) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    return blob;
  } catch (error) {
    console.error('Error converting image to Blob', error);
    return null;
  }
};
```

- **作用**：
  - 使用 `axios` 发送 HTTP 请求，获取图片的二进制数据（`arraybuffer`）。
  - 将二进制数据封装为 `Blob` 对象，并设置正确的 MIME 类型（`content-type`）。
  - 返回 `Blob` 对象。

- **为什么这样做**：
  - 通过 `axios` 获取图片数据时，浏览器会自动处理跨域请求（如果服务器支持 `CORS`）。
  - 将图片数据转换为 `Blob` 后，图片的来源变成了本地的 Blob URL，绕过了跨域限制。

---

#### **1.2 使用 Blob URL 加载图片**
```typescript
if (!blobUrl) {
  convertToBlob(src).then((blobUrl: Blob | null) => {
    if (blobUrl) {
      const url = URL.createObjectURL(blobUrl);
      setBlobUrl(url);
    } else {
      setBlobUrl('');
    }
  });
}
```

- **作用**：
  - 调用 `convertToBlob` 将图片 URL 转换为 Blob。
  - 使用 `URL.createObjectURL(blob)` 创建一个本地的 Blob URL。
  - 将 Blob URL 设置为图片的 `src` 属性。

- **为什么这样做**：
  - Blob URL 是浏览器生成的本地 URL，与跨域无关。
  - Safari 加载 Blob URL 时，不会受到跨域限制。

---

#### **1.3 `crossOrigin="anonymous"` 的作用**
```html
crossOrigin="anonymous"
```

- **作用**：
  - 告诉浏览器以匿名模式加载图片，避免发送用户的身份凭据（如 Cookies）。
  - 如果服务器正确配置了 `CORS`，可以避免跨域问题。

- **为什么还需要 Blob 转换**：
  - 即使设置了 `crossOrigin="anonymous"`，如果图片服务器未正确配置 `CORS`，图片仍然无法加载。
  - Blob 转换是一个额外的保障，确保图片可以加载。

---

### **2. 为什么要这样写？**

#### **2.1 Safari 的跨域限制**
- Safari 对跨域资源的限制比其他浏览器更严格。
- 即使设置了 `crossOrigin="anonymous"`，如果服务器未正确配置 `CORS`，图片仍然会被阻止加载。

#### **2.2 绕过跨域限制**
- 通过 `axios` 获取图片数据时，浏览器会自动处理跨域请求。
- 将图片数据转换为 Blob 后，图片的来源变成了本地的 Blob URL，绕过了跨域限制。

#### **2.3 提高兼容性**
- 即使服务器未正确配置 `CORS`，这种方法仍然可以加载图片。
- 适用于所有浏览器，包括 Safari。

---

### **3. 代码的执行流程**

1. **初始状态**：
   - 图片的 `src` 属性为空。
   - `blobUrl` 的初始值为 `null`。

2. **加载图片**：
   - 调用 `convertToBlob` 将图片 URL 转换为 Blob。
   - 使用 `URL.createObjectURL` 创建 Blob URL。
   - 将 Blob URL 设置为图片的 `src` 属性。

3. **图片加载完成**：
   - 图片成功加载并显示在页面上。

4. **错误处理**：
   - 如果图片加载失败，显示占位符图片（`placeholderImage`）。

---

### **4. 解决跨域问题的关键点**

1. **使用 `axios` 获取图片数据**：
   - `axios` 支持跨域请求，并会自动处理 `CORS`。

2. **将图片数据转换为 Blob**：
   - Blob 是浏览器的本地对象，与跨域无关。

3. **使用 Blob URL 加载图片**：
   - Blob URL 是本地 URL，不会受到跨域限制。

4. **设置 `crossOrigin="anonymous"`**：
   - 确保浏览器以匿名模式加载图片，避免身份凭据干扰。

---

### **5. 优势和局限性**

#### **5.1 优势**
- **兼容性好**：适用于所有浏览器，包括 Safari。
- **绕过跨域限制**：即使服务器未正确配置 `CORS`，也能加载图片。
- **动态加载**：支持动态生成 Blob URL，适合懒加载场景。

#### **5.2 局限性**
- **性能开销**：
  - 需要额外的网络请求和数据处理（将图片转换为 Blob）。
- **内存占用**：
  - Blob URL 会占用内存，需要在不使用时手动释放（`URL.revokeObjectURL`）。
- **依赖服务器支持**：
  - 如果服务器完全禁止跨域请求，`axios` 也无法获取图片数据。

---

### **6. 改进建议**

1. **释放 Blob URL**
   - 在图片加载完成后，释放 Blob URL，避免内存泄漏。
   ```javascript
   useEffect(() => {
     return () => {
       if (blobUrl) {
         URL.revokeObjectURL(blobUrl);
       }
     };
   }, [blobUrl]);
   ```

2. **优化性能**
   - 如果图片数量较多，可以缓存 Blob URL，避免重复转换。

3. **服务器配置优化**
   - 如果有权限，建议在图片服务器上正确配置 `CORS`，减少客户端的额外处理。

---

### **7. 总结**

这段代码通过以下方式解决了 Safari 的图片跨域问题：
1. 使用 `axios` 获取图片数据，绕过浏览器的跨域限制。
2. 将图片数据转换为 Blob，并生成本地的 Blob URL。
3. 使用 Blob URL 加载图片，避免跨域问题。

这种方法适用于跨域图片加载受限的场景，特别是在服务器无法正确配置 `CORS` 的情况下，是一种有效的解决方案。
