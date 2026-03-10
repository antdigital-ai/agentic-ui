# 表格列宽逻辑说明

## 一、整体策略

只读表格列宽采用「按需计算」+「按列数分布」的策略：

| 条件 | 行为 |
|------|------|
| 显式传入 `otherProps.colWidths` | 始终使用，不参与自动计算 |
| 容器宽度充足（无溢出） | 不设置 colgroup，由浏览器自然分布 |
| 容器宽度不足（表格溢出） | 计算并设置 colgroup |
| 1–4 列 | 使用百分比平分（如 3 列为 33.33%） |
| 5 列及以上 | 每列 120px 固定宽度 |

## 二、调用流程

```
ReadonlyTableComponent
  └─ ResizeObserver 监听容器
       └─ scrollWidth > clientWidth → needsColWidths = true
  └─ needsColWidths ? getReadonlyTableColWidths() : []
  └─ TableColgroup 渲染 colgroup
```

## 三、常量定义

见 `Constants/mobile.ts`：

- `TABLE_COL_WIDTH_MIN_COLUMNS = 5`：列数阈值
- `TABLE_DEFAULT_COL_WIDTH = 120`：5+ 列时的默认宽度 (px)
- `TABLE_LAST_COL_MIN_WIDTH = 80`：px 模式下最后一列的最小宽度（弹性列）

## 四、文件职责

- `getTableColWidths.ts`：纯函数，根据列数和 otherProps 计算列宽数组
- `TableColgroup.tsx`：根据列宽数组渲染 `<colgroup>`，支持 px 与百分比
