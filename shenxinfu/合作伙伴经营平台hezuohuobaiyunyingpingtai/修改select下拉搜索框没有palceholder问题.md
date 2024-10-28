引入了Ref和writableComputeRef
watch
定义了useSelectrPlaceHolder自定义函数，接受三个参数:open,placeholder,overlayContainer,
open响应式引用，表示选择是否打开
placeholder
overlayContainer表示选择框的容器选择器
占位符的函数setInputSelectPlaceholder
设置搜索框的占位符
const set



2. **函数定义**：
   ```javascript
   export function useSelectSearchPlaceholder(
     open: Ref<boolean> | WritableComputedRef<boolean>,
     placeholder?: string,
     overlayContainer?: string
   ) {
   ```
   - `useSelectSearchPlaceholder` 是一个自定义的组合式函数，接收三个参数：
     - `open`: 一个响应式引用，表示选择框是否打开。
     - `placeholder`: 可选的字符串，表示搜索框的占位符文本。
     - `overlayContainer`: 可选的字符串，表示选择框的容器选择器。

3. **设置占位符的函数**：
   ```javascript
   const setInputPlaceholder = () => {
     const input = document.querySelector(
       `${overlayContainer} div.ix-select-overlay-search-wrapper .ix-input-inner`
     ) as HTMLInputElement;
     input && (input.placeholder = placeholder!);
   };
   ```
   - `setInputPlaceholder` 是一个内部函数，用于设置搜索框的占位符。
   - 使用 `document.querySelector` 查找指定选择器的输入框元素。
   - 如果找到输入框，则将其 `placeholder` 属性设置为传入的 `placeholder` 值。

4. **观察 `open` 的变化**：
   ```javascript
   watch(open, () => {
     if (open.value && placeholder) {
       setTimeout(() => {
         setInputPlaceholder();
       }, 0);
     }
   });
   ```
   - 使用 `watch` 观察 `open` 的变化。
   - 当 `open` 的值变为 `true` 且 `placeholder` 存在时，使用 `setTimeout` 延迟调用 `setInputPlaceholder` 函数。
   - 这里的 `setTimeout` 是为了确保在选择框打开后，DOM 元素已经渲染完成，能够正确找到并设置占位符。

5. **返回值**：
   ```javascript
   return {
     open,
   };
   ```
   - 返回一个对象，包含 `open`，使得调用该函数的组件可以访问到 `open` 的状态。

