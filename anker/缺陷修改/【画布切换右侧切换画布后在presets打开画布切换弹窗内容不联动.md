### 工作内容总结

在这段代码中，主要的工作内容是实现画布类型的切换，并确保在不同位置（右侧和弹窗）显示一致的画布类型。具体操作步骤和实现细节如下：

### 操作步骤

1. **右侧切换画布**：
   - 用户在右侧选择不同的画布类型（平面画布或圆柱画布）。
   - 触发画布类型切换事件，更新画布类型。

2. **打开 Presets 弹窗**：
   - 用户点击 Presets 按钮，打开画布切换弹窗。
   - 弹窗显示当前选中的画布类型。

### 实现细节

#### 1. 定义画布类型和事件名称

```typescript
export enum EventNameCons {
  EventUpdateLayer = 'EventUpdateLayer',
  EventOpenDisignDialog = 'EventOpenDisignDialog',
  EventHanlederSliderMax = 'EventHanlederSliderMax',
  EventCanvasTypeChange = 'EventCanvasTypeChange',
}

type CanvasType = 'flat_canvas' | 'cylindrical_canvas';
```

#### 2. 初始化画布类型

```typescript
const projectInfo = useProjectData();
const defaultSelectValue = projectInfo?.project_info?.category === CanvasCategory.CANVAS_CATEGORY_CYLINDRICAL ? 'cylindrical_canvas' : 'flat_canvas';
const [selectedCanvasType, setSelectedCanvasType] = useState(defaultSelectValue);
```

#### 3. 处理画布类型切换

```typescript
const handleCanvasTypeChange = (type: CanvasType) => {
  if (selectedCanvasType !== type) {
    setSelectedCanvasType(type);
    eventBus.emit(EventNameCons.EventCanvasTypeChange, type);
  }
};
```

#### 4. 监听画布类型切换事件

```typescript
useEffect(() => {
  const handleCanvasTypeChangeListener = (type: CanvasType) => {
    setSelectedCanvasType(type);
  };

  eventBus.on(EventNameCons.EventCanvasTypeChange, handleCanvasTypeChangeListener);

  return () => {
    eventBus.off(EventNameCons.EventCanvasTypeChange, handleCanvasTypeChangeListener);
  };
}, []);
```

#### 5. 在 Presets 弹窗中显示当前画布类型

```typescript
<div className="select-dialog-top-label-category">
  {canvasOptions.map((canvas) => (
    <div key={canvas.id}>
      <div
        className={clsx('select-dialog-top-label-class', {
          'option-selected': selectedCanvasType === canvas.id,
        })}
        onClick={() => {
          handleCanvasTypeChange(canvas.id as CanvasType);
        }}
      >
        {canvas.attributes.categoryType.data.attributes.categoryName}
      </div>
      {selectedCanvasType === canvas.id && (
        <div className="select-dialog-top-label-line">
          <i></i>
        </div>
      )}
    </div>
  ))}
</div>
```

#### 6. 处理画布类型选择

```typescript
function handleCategorySelection(item: { str: string; value: number }) {
  console.log('handleCategorySelection', item);
  BaseMapChangeManager.getInstance().replaceCategory(
    item.value,
    item.value === CanvasCategory.CANVAS_CATEGORY_CYLINDRICAL
      ? CanvasSubCategory.CANVAS_CATEGORY_CYLINDRICAL_CUP1
      : CanvasSubCategory.CANVAS_CATEGORY_STANDARD_A3,
  );
  const newCanvasType = item.value === CanvasCategory.CANVAS_CATEGORY_CYLINDRICAL ? 'cylindrical_canvas' : 'flat_canvas';
  eventBus.emit(EventNameCons.EventCanvasTypeChange, newCanvasType);
}
```

### 预期结果

1. **右侧切换画布后**：
   - 画布类型切换事件被触发，更新画布类型。
   - Presets 弹窗显示当前选中的画布类型。

2. **打开 Presets 弹窗**：
   - 弹窗显示与右侧一致的画布类型。
   - 如果是首次切换，则显示默认类型下的画布；如果选择过一次，则显示上一次的画布。

通过以上实现，确保了在右侧切换画布后，Presets 弹窗显示的内容与右侧一致，满足预期结果。
