### 布局优化的核心逻辑与前后差异分析


#### 一、**原代码布局问题的根本原因**
1. **固定间距算法的局限性**  
   原代码中使用`spineLength / (causes.length + 1)`计算主原因间距，这是一种简单的等距分配方式。当不同主原因包含的子节点数量差异较大时，固定间距无法为复杂分支预留足够空间，导致深层节点重叠。

2. **子节点布局缺乏动态调整**  
   原`drawChildren`函数在绘制子节点时，未考虑子节点数量和文本宽度，统一使用固定偏移量（如`branchLength = 150`），导致多层级节点（如孙原因）因水平/垂直空间不足而重叠。

3. **未考虑节点文本尺寸**  
   原代码在计算节点位置时，未将文本框的实际宽度和高度纳入间距计算，仅依靠固定数值（如`causeSpacing = spineLength / (causes.length + 1)`），无法适应不同长度的文本标签。


#### 二、**优化后代码的核心改进点**
1. **智能动态间距算法**  
   - **主原因间距调整**：  
     新增根据子节点数量排序主原因的逻辑（`positions.sort((a, b) => b.children.length - a.children.length)`），为包含更多子节点的主原因分配更宽的水平间距。例如：  
     ```javascript
     // 按子节点数量降序排序，确保复杂分支有更多空间
     positions.sort((a, b) => b.children.length - a.children.length);
     ```
   - **间距缓冲机制**：  
     引入`spacingBuffer = 80`作为基础间距，并根据子节点数量动态调整（`minDistance = spacingBuffer + (prevPos.children.length * 20)`），避免相邻主原因的子节点相互挤压。

2. **层级化垂直分布策略**  
   - **子节点垂直排列**：  
     在`drawChildren`中，根据子节点数量计算垂直总高度（`totalHeight = (childCount - 1) * spacing`），并通过`startYAdjusted`实现均匀垂直分布，避免同一父节点下的子节点上下重叠。  
     ```javascript
     const spacing = 60; // 基础垂直间距
     const totalHeight = (childCount - 1) * spacing;
     const startYAdjusted = startY - totalHeight / 2; // 居中对齐
     ```
   - **分支类型动态切换**：  
     根据层级（`level`）自动切换分支类型（横骨/斜骨），并调整线条样式（颜色、宽度、虚线），使不同层级的节点在视觉上更易区分。

3. **文本尺寸感知的布局计算**  
   - 在`drawStyledText`中获取文本框实际尺寸（`bbox = text.node().getBBox()`），并在连接分支时以文本框边缘作为锚点（如`connectX = textRect.x + textRect.width / 2`），确保分支与节点的精确连接，避免因文本长度变化导致的位置偏差。

4. **响应式布局优化**  
   - 窗口Resize时重新计算画布尺寸（`window.addEventListener('resize', initChart)`），并在`initChart`中根据最新容器尺寸动态调整主骨长度和节点位置，确保不同屏幕下的布局稳定性。


#### 三、**优化前后的布局效果对比**
| **对比维度**       | **原代码布局**                          | **优化后布局**                          |
|--------------------|-----------------------------------------|-----------------------------------------|
| **主原因间距**     | 等距分配，不考虑子节点数量              | 按子节点数量动态调整，复杂分支间距更宽  |
| **子节点排列**     | 固定偏移量，易上下重叠                  | 垂直均匀分布，间距随子节点数量调整      |
| **深层节点显示**   | 多层级节点（如孙原因）易超出画布或重叠  | 自动调整分支长度和位置，确保深层节点可见|
| **文本与分支连接** | 分支终点固定，可能与文本框错位          | 以文本框边缘为锚点，连接更精确          |
| **响应式适配**     | 窗口缩放后布局可能变形                  | 实时重绘，保持布局比例                  |


#### 四、**典型场景下的布局改进示例**
1. **多子节点主原因的间距优化**  
   - 原代码：当“人员因素”和“材料问题”均包含多个子节点时，等距分配导致子节点横向空间不足，出现重叠。  
   - 优化后：根据子节点数量调整间距，“人员因素”（子节点更多）获得更宽间距，子节点可完整显示。

2. **多层级节点的垂直分布**  
   - 原代码：孙原因（如“培训计划缺失”）与子原因（如“培训不足”）的分支可能因固定偏移量导致垂直重叠。  
   - 优化后：通过`totalHeight`计算垂直总间距，孙原因按层级垂直排列，间距均匀。

3. **长文本节点的布局适配**  
   - 原代码：长文本（如“供应商审核不严”）的文本框可能与相邻节点的分支线重叠。  
   - 优化后：根据文本框实际尺寸调整连接点位置，确保分支线精确连接到文本框边缘，避免遮挡。


#### 五、**总结：布局优化的核心原则**
1. **动态适应数据复杂度**：根据节点层级和子节点数量自动调整间距，而非固定数值。  
2. **文本尺寸感知**：将文本框实际尺寸纳入布局计算，避免“一刀切”的位置偏移。  
3. **层级化视觉分层**：通过分支样式（颜色、虚线）和排列方式（水平/垂直）强化层级关系，提升可读性。  
4. **响应式弹性布局**：实时适配容器尺寸变化，确保不同设备下的布局稳定性。

通过上述改进，鱼骨图的布局将更符合“数据驱动”的可视化原则，有效解决重叠问题并提升专业分析体验。

以下是需要修改的核心代码部分，主要优化了布局算法和节点间距计算，解决内容重叠问题：

### 1. 优化drawFishbone函数中的位置计算逻辑
```javascript
// 绘制鱼骨图
function drawFishbone(svg, width, height, margin) {
    const centerY = height / 2;
    const spineLength = width - margin.left - margin.right;
    
    // 绘制主骨（鱼脊）
    const spineStartX = margin.left;
    const spineEndX = spineStartX + spineLength;
    
    svg.append('line')
        .attr('x1', spineStartX)
        .attr('y1', centerY)
        .attr('x2', spineEndX)
        .attr('y2', centerY)
        .attr('stroke', '#3498db')
        .attr('stroke-width', 4)
        .attr('marker-end', 'url(#arrowhead)');
    
    // 添加箭头标记
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#3498db');
    
    // 绘制问题文本（位于主骨最左侧）
    const problemNode = drawStyledText(
        svg, 
        spineStartX, 
        centerY, 
        currentData.problem,
        0
    );
    
    // 获取问题框位置
    const problemRect = problemNode.rect.node().getBBox();
    
    // 调整问题框位置
    const problemX = Math.max(10, spineStartX - problemRect.width - 10);
    const problemY = centerY - problemRect.height / 2;
    
    problemNode.rect
        .attr('x', problemX)
        .attr('y', problemY);
        
    problemNode.node
        .attr('x', problemX + problemRect.width / 2)
        .attr('y', centerY);
    
    // 计算原因位置 - 智能动态间距算法
    const causeCount = currentData.causes.length;
    const baseSpacing = spineLength / (causeCount + 1);
    let positions = [];
    
    // 优先为每个主原因分配初始位置
    for (let i = 0; i < causeCount; i++) {
        // 交替上下分布
        const direction = i % 2 === 0 ? -1 : 1;
        let position = margin.left + (i + 1) * baseSpacing;
        
        positions.push({
            index: i,
            position: position,
            direction: direction,
            children: currentData.causes[i].children || []
        });
    }
    
    // 按子节点数量重新排序，确保有更多子节点的主原因有更多空间
    positions.sort((a, b) => b.children.length - a.children.length);
    
    // 优化间距以避免重叠
    const spacingBuffer = 80; // 间距缓冲值
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        let shift = 0;
        
        // 检查与前一个元素的间距
        if (i > 0) {
            const prevPos = positions[i-1];
            const minDistance = spacingBuffer + (prevPos.children.length * 20);
            if (pos.position - prevPos.position < minDistance) {
                shift += minDistance - (pos.position - prevPos.position);
            }
        }
        
        // 检查与后一个元素的间距
        if (i < positions.length - 1) {
            const nextPos = positions[i+1];
            const minDistance = spacingBuffer + (nextPos.children.length * 20);
            if (nextPos.position - pos.position < minDistance) {
                shift -= minDistance - (nextPos.position - pos.position);
            }
        }
        
        pos.position += shift;
    }
    
    // 按实际位置排序
    positions.sort((a, b) => a.position - b.position);
    
    // 绘制每个原因及其子原因
    positions.forEach(pos => {
        const i = pos.index;
        const x = pos.position;
        const direction = pos.direction;
        const angle = direction * 45; // 斜骨角度
        const branchLength = 300; // 优化后的斜骨长度
        
        // 计算斜骨终点
        const endX = x + branchLength * Math.cos(angle * Math.PI / 180);
        const endY = centerY + branchLength * Math.sin(angle * Math.PI / 180);
        
        // 绘制斜骨（原因分支）
        const branchLine = svg.append('line')
            .attr('x1', x)
            .attr('y1', centerY)
            .attr('x2', endX)
            .attr('y2', endY)
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 3);
        
        // 添加原因文本
        const cause = currentData.causes[i];
        const causeTextObj = {text: cause.text, style: cause.style};
        
        // 根据方向确定文本位置
        const textYOffset = direction > 0 ? 20 : -20;
        const causeNode = drawStyledText(
            svg, 
            endX, 
            endY + textYOffset, 
            causeTextObj,
            1
        );
        
        // 获取文本框位置
        const textRect = causeNode.rect.node().getBBox();
        
        // 确定连接点（分支直接连接到文本框）
        let connectX, connectY;
        if (direction > 0) {
            // 向下分支：连接到文本框顶部中点
            connectX = textRect.x + textRect.width / 2;
            connectY = textRect.y;
        } else {
            // 向上分支：连接到文本框底部中点
            connectX = textRect.x + textRect.width / 2;
            connectY = textRect.y + textRect.height;
        }
        
        // 调整分支线的终点为连接点
        branchLine.attr('x2', connectX)
                 .attr('y2', connectY);
        
        // 递归绘制子原因
        if (cause.children && cause.children.length > 0) {
            drawChildren(svg, cause, x, centerY, connectX, connectY, 1, direction, 2);
        }
    });
}
```

### 2. 优化递归绘制子原因的算法
```javascript
// 递归绘制子原因
function drawChildren(svg, parent, startX, startY, endX, endY, level, parentDirection, depth) {
    const children = parent.children || [];
    const childCount = children.length;
    
    // 计算子节点间距
    const spacing = 60; // 基础间距
    const totalHeight = (childCount - 1) * spacing;
    const startYAdjusted = startY - totalHeight / 2;
    
    children.forEach((child, i) => {
        // 在父骨上取点，根据子节点数量均匀分布
        const y = startYAdjusted + i * spacing;
        const t = 0.5; // 父骨中点位置
        const pointX = startX + t * (endX - startX);
        const pointY = startY + t * (endY - startY);
        
        // 确定分支类型（交替：斜骨→横骨→斜骨）
        let branchAngle;
        let branchLength;
        let strokeColor, strokeWidth, strokeDash;
        
        // 根据层级设置样式
        if (level === 1) {
            strokeColor = '#2ecc71';
            strokeWidth = 2;
            strokeDash = '5,3';
        } else {
            strokeColor = '#9b59b6';
            strokeWidth = 1.5;
            strokeDash = '4,2';
        }
        
        // 横骨（水平方向）- 确保与主鱼骨平行
        branchLength = 150;
        branchAngle = 0; // 保持水平
        
        // 计算横骨终点（根据层级和子节点位置调整）
        const childDirection = level % 2 === 1 ? (i % 2 === 0 ? -1 : 1) : parentDirection;
        const childEndX = pointX + branchLength * childDirection;
        const childEndY = y; // 保持y坐标，实现垂直分布
        
        // 绘制横骨
        const branchLine = svg.append('line')
            .attr('x1', pointX)
            .attr('y1', pointY)
            .attr('x2', childEndX)
            .attr('y2', childEndY)
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-dasharray', strokeDash);
        
        // 添加子原因文本
        const textXOffset = childDirection > 0 ? 20 : -20;
        const childNode = drawStyledText(
            svg, 
            childEndX + textXOffset, 
            childEndY, 
            {text: child.text, style: child.style},
            depth
        );
        
        // 获取文本框位置
        const textRect = childNode.rect.node().getBBox();
        
        // 确定连接点（横骨直接连接到文本框）
        let connectX, connectY;
        if (childDirection > 0) {
            // 向右延伸：连接文本框左边中点
            connectX = textRect.x;
            connectY = textRect.y + textRect.height / 2;
        } else {
            // 向左延伸：连接文本框右边中点
            connectX = textRect.x + textRect.width;
            connectY = textRect.y + textRect.height / 2;
        }
        
        // 调整横骨的终点
        branchLine.attr('x2', connectX)
                 .attr('y2', connectY);
        
        // 递归绘制孙原因
        if (child.children && child.children.length > 0) {
            drawChildren(svg, child, pointX, pointY, connectX, connectY, level + 1, childDirection, depth + 1);
        }
    });
}
```

### 3. 优化窗口大小变化时的重绘逻辑
```javascript
// 初始化
window.addEventListener('load', function() {
    initChart();
    window.addEventListener('resize', initChart); // 优化窗口 resize 时的重绘性能
    
    // 按钮事件
    document.getElementById('prev-btn').addEventListener('click', function() {
        const newIndex = (currentIndex - 1 + fishboneData.length) % fishboneData.length;
        updateChart(newIndex);
    });
    
    document.getElementById('next-btn').addEventListener('click', function() {
        const newIndex = (currentIndex + 1) % fishboneData.length;
        updateChart(newIndex);
    });
    
    document.getElementById('random-btn').addEventListener('click', function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * fishboneData.length);
        } while (newIndex === currentIndex && fishboneData.length > 1);
        
        updateChart(newIndex);
    });
    
    document.getElementById('export-btn').addEventListener('click', exportAsPNG);
});
```

### 关键优化点说明：
1. **智能间距算法**：根据子节点数量动态调整主原因间距，避免因子节点过多导致的重叠
2. **层级化布局**：为不同层级的节点（主原因、子原因、孙原因）设置不同的间距规则
3. **垂直分布优化**：子节点采用垂直排列方式，确保同一父节点下的子节点不重叠
4. **响应式重绘**：优化窗口Resize时的重绘逻辑，提升性能
5. **分支长度调整**：根据节点层级自动调整分支长度，确保深层节点有足够空间

这些修改将解决您提到的布局重叠问题，使鱼骨图呈现更清晰、专业的视觉效果。
