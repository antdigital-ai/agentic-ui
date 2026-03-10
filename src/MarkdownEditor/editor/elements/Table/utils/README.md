# 表格列宽逻辑说明

## 一、场景与行为（快速参考）

| 场景 | 行为 |
|------|------|
| 显式传入 `otherProps.colWidths` | 始终使用，不参与自动计算 |
| 容器宽度充足（`scrollWidth ≤ clientWidth`） | 不设置 colgroup，交给浏览器 |
| 表格溢出（`scrollWidth > clientWidth`） | 根据列数计算列宽并设置 colgroup |
| 未测量（`clientWidth === 0`，如 SSR/测试） | 保守地按需计算，显示 colgroup |

**实现**：`ResizeObserver` 监听容器 → `checkOverflow` 比较 `table.scrollWidth` 与 `container.clientWidth` → `needsColWidths` 为 true 时才调用 `getReadonlyTableColWidths` 并渲染 colgroup。宽容器下多数表格不再计算列宽，布局由浏览器处理。

## 二、整体策略（按列数分布）

| 条件 | 行为 |
|------|------|
| 显式传入 `otherProps.colWidths` | 始终使用，不参与自动计算 |
| 容器宽度充足（无溢出） | 不设置 colgroup，由浏览器自然分布 |
| 容器宽度不足（表格溢出） | 计算并设置 colgroup |
| 1–4 列 | 使用百分比平分（如 3 列为 33.33%） |
| 5 列及以上 | 每列 120px 固定宽度 |

## 三、调用流程

```
ReadonlyTableComponent
  └─ useReadonlyTableColWidths(containerRef, tableRef, columnCount, otherProps)
       └─ ResizeObserver 监听容器
       └─ scrollWidth > clientWidth 或 clientWidth === 0 → needsColWidths = true
       └─ needsColWidths ? getReadonlyTableColWidths() : []
  └─ TableColgroup 渲染 colgroup
```

## 四、常量定义

见 `Constants/mobile.ts`：

- `TABLE_COL_WIDTH_MIN_COLUMNS = 5`：列数阈值
- `TABLE_DEFAULT_COL_WIDTH = 120`：5+ 列时的默认宽度 (px)
- `TABLE_LAST_COL_MIN_WIDTH = 80`：px 模式下最后一列的最小宽度（弹性列）

## 五、文件职责

- `useReadonlyTableColWidths.ts`：Hook，封装溢出检测与列宽按需计算，含完整场景表
- `getTableColWidths.ts`：纯函数，根据列数和 otherProps 计算列宽数组
- `TableColgroup.tsx`：根据列宽数组渲染 `<colgroup>`，支持 px 与百分比
