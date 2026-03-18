# 表格列宽逻辑说明

## 一、场景与行为（快速参考）

| 场景                            | 行为                                                    |
| ------------------------------- | ------------------------------------------------------- |
| 显式传入 `otherProps.colWidths` | 始终使用，不参与自动计算                                |
| 列数 ≥ 5                        | 始终计算列宽并渲染 colgroup（避免首帧未测量导致无列宽） |
| 列数 < 5 且容器宽度充足         | 不设置 colgroup，交给浏览器                             |
| 列数 < 5 且表格溢出或未测量     | 根据列数计算列宽并设置 colgroup                         |

**实现**：列数 ≥ 5 时直接返回 `getReadonlyTableColWidths` 结果；列数 < 5 时由 `ResizeObserver` 监听容器，`checkOverflow` 为 true 时才计算列宽并渲染 colgroup。

## 二、整体策略（按列数分布）

| 条件                                           | 行为                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| 显式传入 `otherProps.colWidths`                | 始终使用，不参与自动计算                                                       |
| 传入 `element` + `containerWidth` 且列数 > 5   | **智能算法**：采样前 5 行 + `Canvas.measureText` 测宽 + 弹性分配，返回 px 列宽 |
| 传入 `element`（无 containerWidth 或列数 ≤ 5） | 用 `string-width` 按单元格内容计算每列宽度，归一化为百分比，每列 min 120px     |
| 自动计算（无 element）                         | 百分比平分（如 5 列为 20%），避免最后一列被拉长                                |
| 5 列及以上                                     | 始终渲染 colgroup                                                              |
| 1–4 列且容器宽度充足                           | 不设置 colgroup，由浏览器自然分布                                              |
| 1–4 列且溢出或未测量                           | 计算并设置 colgroup，使用百分比平分                                            |

## 三、智能列宽算法（SmartTableScouter）

当 **列数 > 5** 且同时传入 **element** 与 **containerWidth** 时启用：

1. **前置条件**：列数 ≤ 5 时直接退回百分比/auto，不启用智能算法。
2. **数据采样**：仅取前 5 行参与计算，平衡性能与准确度。
3. **测宽方式**：使用 `Canvas.measureText` 预估真实像素宽度（含单元格内边距补偿），替代简单字符计数。
4. **列度量**：每列计算 `maxContentWidth`（整格内容宽度）与 `minBreakableWidth`（该列最长“不可断行词”宽度）。
5. **弹性分配**：若容器宽度 ≥ 各列 `minBreakableWidth` 之和，则剩余空间按 `(maxW - minW)` 比例分配，避免长文本列被挤压。

## 四、调用流程

```
ReadonlyTableComponent
  └─ useReadonlyTableColWidths(..., element)
       └─ ResizeObserver 更新 containerWidth
       └─ getReadonlyTableColWidths({ columnCount, otherProps, element, containerWidth })
            └─ 有 element + containerWidth 且列数 > 5 → 智能算法 → 返回 px[]
            └─ 有 element → string-width 算每列内容宽度 → 归一化百分比（min 120px）
            └─ 无 element → 百分比平分
       └─ 列数 ≥ 5 → 直接返回
       └─ 列数 < 5 → 溢出或未测量时返回
  └─ TableColgroup 渲染 colgroup（支持 px 与百分比）
```

## 五、常量定义

见 `Constants/mobile.ts`：

- `TABLE_COL_WIDTH_MIN_COLUMNS = 5`：列数阈值（决定是否始终渲染 colgroup）
- `TABLE_LAST_COL_MIN_WIDTH = 80`：编辑模式 px 下列最后一列最小宽度（只读模式用百分比，无弹性列）

## 六、文件职责

- `useReadonlyTableColWidths.ts`：Hook，封装溢出检测与列宽按需计算，含完整场景表
- `getTableColWidths.ts`：纯函数，根据列数和 otherProps 计算列宽数组
- `TableColgroup.tsx`：根据列宽数组渲染 `<colgroup>`，支持 px 与百分比
