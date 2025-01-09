### 问题描述

在2D编辑器中，用户可以选择两种画布类型：平面画布（Flat Canvas）和圆柱画布（Cylindrical Canvas）。需要实现以下功能：
1. 根据选择的画布类型动态更新选项列表。
2. 确保画布类型切换时，UI和数据正确更新。

### 解决方案

1. **画布类型选择**：在 `useEffect` 中根据 `selectedCanvasType` 动态更新选项列表。
2. **图标路径**：确保 `img` 标签的 `src` 属性设置为正确的图标路径。

### 修改后的代码

#### 画布类型选择

```jsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCustomTranslation, TranslationsKeys } from 'src/utils/translation';
import clsx from 'clsx';
import ProjectManager from 'src/templates/2dEditor/utils/ProjectManager';

const MyComponent = () => {
  const [selectedCreate, setSelectedCreate] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [createloading, setCreateLoading] = useState(false);
  const [mockCylindricalData, setMockCylindricalData] = useState<CategoryModel[]>([]);
  const [mockMaterialData, setMockMaterialData] = useState<CategoryModel[]>([]);
  const [firstOptions, setFirstOptions] = useState<CategoryModel[]>([]);
  const [optionList, setOptionList] = useState<CategoryModel[]>([]);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { getTranslation } = useCustomTranslation();
  const [btnName, setBtnName] = useState<string>(getTranslation(TranslationsKeys.Create));
  const [selectedCanvasType, setSelectedCanvasType] = useState('flat_canvas');

  const flatCanvas = {
    id: 'flat_canvas',
    attributes: {
      categoryType: {
        data: {
          attributes: {
            categoryName: getTranslation(TranslationsKeys.canvas_flat),
          },
        },
      },
    },
  };

  const cylindricalCanvas = {
    id: 'cylindrical_canvas',
    attributes: {
      categoryType: {
        data: {
          attributes: {
            categoryName: getTranslation(TranslationsKeys.canvas_cylindrical),
          },
        },
      },
    },
  };

  const canvasOptions = [flatCanvas, cylindricalCanvas];

  useEffect(() => {
    if (selectedCanvasType === 'flat_canvas' && mockMaterialData.length > 0) {
      setFirstOptions(mockMaterialData);
      if (mockMaterialData.length > 0) {
        setSelectedOption(mockMaterialData[0]?.id);
        setCategoryData(mockMaterialData[0]?.attributes);
        setOptionList(mockMaterialData[0]?.attributes?.options);
        setSelectedCreate(null);
        setSubmitDisabled(true);
        setDrinkware(mockMaterialData[0].attributes.categoryType.data.attributes.categoryKey);
        form.setFieldsValue({
          baseMapWidth: 0,
          baseMapHeight: 0,
          cupHeight: 0,
        });
      }
    } else if (selectedCanvasType === 'cylindrical_canvas' && mockCylindricalData.length > 0) {
      setFirstOptions(mockCylindricalData);
      if (mockCylindricalData.length > 0) {
        setSelectedOption(mockCylindricalData[0]?.id);
        setCategoryData(mockCylindricalData[0]?.attributes);
        setOptionList(mockCylindricalData[0]?.attributes?.options);
        setSelectedCreate(null);
        setSubmitDisabled(true);
        setDrinkware(mockCylindricalData[0].attributes.categoryType.data.attributes.categoryKey);
        form.setFieldsValue({
          baseMapWidth: 0,
          baseMapHeight: 0,
          cupHeight: 0,
        });
      }
    }
  }, [selectedCanvasType, mockMaterialData, mockCylindricalData]);

  // 获取所有小类
  const fetchSonClass = async (value?: number) => {
    setLoading(true);
    ProjectManager.getInstance().fetchSonClass((data: any, mockMaterialData: any[], mockCylindricalData: any[], mockBlankData: []) => {
      setLoading(false);
      setFirstOptions(mockMaterialData);
      setMockCylindricalData(mockCylindricalData);
      setMockMaterialData(mockMaterialData);
      setOptionList(mockMaterialData?.[0]?.attributes?.options);
      setCategoryData(mockMaterialData?.[0]?.attributes);
      setSelectedOption(mockMaterialData?.[0]?.id);
    });
  };

  return (
    <div>
      <div className="select-dialog-top-label-category">
        {canvasOptions.map((canvas) => (
          <div key={canvas.id}>
            <div
              className={clsx('select-dialog-top-label-class', {
                'option-selected': selectedCanvasType === canvas.id,
              })}
              onClick={() => {
                setSelectedCanvasType(canvas.id);
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
      <div className="select-dialog-top-label" style={{ borderBottom: selectedCanvasType === 'flat_canvas' ? '1px solid #ccc' : 'none' }}>
        {selectedCanvasType === 'flat_canvas' && firstOptions.map((item: any, index: number) => (
          <div key={item.id}>
            <div
              className={clsx('select-dialog-top-label-class', {
                'option-selected': selectedOption === item.id,
              })}
              onClick={() => {
                setCategoryData(item?.attributes);
                setSelectedOption(item.id);
              }}
            >
              {item.attributes.categoryType.data.attributes.categoryName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyComponent;
```

#### 样式调整

```scss
.select-dialog-top-label-category {
  border-bottom: none;
  padding: 0 24px;
  max-width: 1000px;
  height: 27px;
  line-height: 27px;
  overflow-x: auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 16px;
  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: transparent;
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
  .select-dialog-top-label-class {
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 27px;
    margin: 0 0 0 12px;
    white-space: nowrap;
    font-family: Poppins;
    font-weight: 600;
    font-size: 16px;
    line-height: 27px;
    color: rgba(0, 0, 0, 0.4);
    &.option-selected {
      color: #000000;
    }
    &:hover {
      color: #000000;
    }
    &:first-child {
      margin-left: 0;
    }
  }
  .select-dialog-top-label-line {
    width: 100%;
    display: flex;
    justify-content: center;
    i {
      display: inline-block;
      width: 20px;
      height: 2px;
    }
  }
}

.select-dialog-top-label {
  padding: 0 24px;
  max-width: 1000px;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 22px;
  margin: 14px auto;
  white-space: nowrap;
  font-family: Poppins;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.4);
  &.option-selected {
    color: #000000;
  }
  &:hover {
    color: #000000;
  }
  .select-dialog-top-label-line {
    width: 100%;
    display: flex;
    justify-content: center;
    i {
      display: inline-block;
      width: 100%;
      height: 2px;
      background-color: #000;
    }
  }
}
```

### 解释

1. **`useEffect`**：根据 `selectedCanvasType` 动态更新选项列表。
2. **`fetchSonClass`**：获取所有小类数据，并根据画布类型更新选项列表。
3. **样式调整**：确保画布类型切换时，UI显示正确。

### 测试步骤

1. 进入2D编辑器，选择不同的画布类型（平面画布或圆柱画布）。
2. 确认选项列表和UI显示正确。
3. 点击Snapshot拍照，确认关闭拍照按钮的图标显示正确。

### 预期结果

1. 选择不同的画布类型时，选项列表和UI正确更新。
2. 点击Snapshot拍照时，关闭拍照按钮的图标显示正确。
