# RFC：基于 `chartType` 注释 + Markdown 表格的四象限图 {#rfc-quadrant-chart}

## 背景

业务上需要展示「四象限矩阵」式内容（如优先级矩阵、技术评估矩阵、竞品分析矩阵等），版式上常见为 **2×2 网格**，每个象限带标签并包含条目列表。

## 数据契约

按行顺序，前 4 行 = 4 个象限：

- **第 1 列** = 象限标签；
- **第 2 列** = 逗号分隔的条目列表（支持半角逗号、分号、竖线、斜杠与全角分隔符）。

不足 4 行时自动补空占位。

## 注释示例

```markdown
<!-- {"chartType": "quadrant", "title": "优先级矩阵"} -->

| 象限         | 内容                      |
| :----------- | :------------------------ |
| 重要且紧急   | 修复线上bug, 处理客户投诉  |
| 重要不紧急   | 技术改进, 学习新技术       |
| 不重要但紧急 | 回复邮件, 参加会议         |
| 不重要不紧急 | 整理桌面, 清理文档         |
```

## 配置字段

| 字段        | 类型     | 说明               |
| ----------- | -------- | ------------------ |
| `chartType` | `string` | 固定为 `"quadrant"` |
| `title`     | `string` | 图表标题（可选）    |

## 状态

- **Implemented**：以 `chartType: "quadrant"` 落地。
  - 渲染：`src/Plugins/chart/QuadrantChart/`。
  - 校验：`parseTable.ts` 检查至少 1 列 + 1 行数据。
  - i18n：`quadrantChart`（中文「四象限图」/ 英文「Quadrant Chart」）。
  - 单元测试：`src/Plugins/chart/__tests__/QuadrantChart.test.tsx`。
