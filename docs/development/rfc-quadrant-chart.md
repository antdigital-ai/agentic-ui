# RFC：基于 `chartType` 注释 + Markdown 表格的四象限图 {#rfc-quadrant-chart}

## 背景

业务上需要展示「四象限矩阵」式内容（如优先级矩阵：紧急/重要维度划分任务优先级、技术评估矩阵、竞品分析矩阵等），版式上常见为 **2×2 网格**，每个象限带标签并包含归属该象限的项目列表。

本仓库中，图表与部分结构化展示已统一为 **HTML 注释（JSON）+ GFM 管道表格** 的数据契约（见 `parseTable.ts`、`docs/utils/chart-config.md`）。`docCards` 实现了卡片栅格布局，但 **未覆盖「按两个数值维度分类到四象限」** 的版式需求。

本 RFC 约定：在**不破坏**现有注释与解析行为的前提下，用与现有图表 **同一套作者写法** 支持「四象限图」；新增独立 `chartType`，由 `ChartRender` 专门渲染。

## 目标

- **作者侧**：与现有图表一致，在管道表上方写一行 JSON 注释，包含 `chartType: "quadrant"` 与 `x`/`y` 字段指定数值维度列。
- **数据侧**：**一行 Markdown 表 = 一个数据点**；数据点按 X/Y 阈值自动分配到四个象限。
- **呈现侧**：2×2 网格布局，每个象限带标签，包含该象限内的项目（名称 + 可选描述）。
- **可访问性**：使用 `grid`/`gridcell` 语义，每个象限有 `aria-label`。

## 非目标

- 不在本 RFC 中实现交互式散点图（拖拽点到不同象限）。
- 不强制与 Chart.js 复用；UI 为静态卡片/标签布局，仅用 React + CSS-in-JS。

## 命名

- **chartType 取值**：`quadrant`

## 列契约

| 语义       | 建议表头                          | 是否必填 | 说明                                        |
| ---------- | --------------------------------- | -------- | ------------------------------------------- |
| 名称       | `名称`、`标题`、`项目`、`name`    | 是       | 项目名称，显示在象限内                      |
| X 数值     | 由 `x` 配置字段指定              | 是       | 用于横轴分组的数值                          |
| Y 数值     | 由 `y` 配置字段指定              | 是       | 用于纵轴分组的数值                          |
| 描述       | `描述`、`简介`、`说明`            | 否       | 项目描述，显示在名称下方                    |

## 配置字段

| 字段             | 类型       | 说明                                                         |
| ---------------- | ---------- | ------------------------------------------------------------ |
| `chartType`      | `string`   | 固定为 `"quadrant"`                                          |
| `x`              | `string`   | X 轴数值列名（对应表头）                                    |
| `y`              | `string`   | Y 轴数值列名（对应表头）                                    |
| `title`          | `string`   | 图表标题（可选）                                             |
| `xAxisLabel`     | `string`   | X 轴展示标签（可选，默认用 `x` 值）                         |
| `yAxisLabel`     | `string`   | Y 轴展示标签（可选，默认用 `y` 值）                         |
| `quadrantLabels` | `string[]` | 四个象限标签 `[Q1右上, Q2左上, Q3左下, Q4右下]`（可选）      |
| `xThreshold`     | `number`   | X 轴分界阈值（可选，默认取数据中位数）                      |
| `yThreshold`     | `number`   | Y 轴分界阈值（可选，默认取数据中位数）                      |
| `fieldMap`       | `object`   | `{ name?: string; description?: string }` 字段映射（可选）   |

## 象限布局

```
  ┌───────────────┬───────────────┐
  │   Q2 (左上)    │   Q1 (右上)    │  ← high Y
  │  low X, high Y │ high X, high Y │
  ├───────────────┼───────────────┤
  │   Q3 (左下)    │   Q4 (右下)    │  ← low Y
  │  low X, low Y  │ high X, low Y  │
  └───────────────┴───────────────┘
     low X              high X
```

## 注释示例

```markdown
<!-- {"chartType": "quadrant", "x": "紧急度", "y": "重要度", "title": "优先级矩阵", "xAxisLabel": "紧急程度", "yAxisLabel": "重要程度", "quadrantLabels": ["重要且紧急", "重要不紧急", "不重要不紧急", "不重要但紧急"]} -->

| 名称         | 紧急度 | 重要度 | 描述           |
| :----------- | -----: | -----: | :------------- |
| 优化数据库   |     80 |     90 | 紧急且重要     |
| 学习新技术   |     20 |     85 | 不紧急但重要   |
| 回复邮件     |     75 |     30 | 紧急不重要     |
| 整理桌面     |     15 |     20 | 不紧急不重要   |
```

## 与现有类型的关系

| 类型           | 作用                                                 |
| -------------- | ---------------------------------------------------- |
| `scatter`      | 散点图，仅绘制数值点位，不做象限分组                 |
| `docCards`     | 卡片栅格，不按数值维度分类                           |
| `quadrant`     | **四象限矩阵**，按 X/Y 数值将项目分配到 2×2 网格    |

## 解析与渲染

- **parseTable / chart 节点**：`chartType === 'quadrant'` 时参与图表节点生成；校验规则需满足「名称列可识别」且「x/y 列存在」，否则整表降级。
- **ChartRender**：新分支渲染四象限容器；不加载 Chart.js runtime（纯 React + CSS-in-JS）。
- **样式**：使用 `prefixCls` + CSS-in-JS，四象限用不同浅色背景区分。
- **国际化**：新增 `quadrantChart` 标签（中文「四象限图」/英文「Quadrant Chart」）。

## 兼容性

- **未使用** `quadrant` 的文档与现有表图行为不变。
- 新类型占用新的 `chartType` 字符串；不与现有类型冲突。

## 测试用例

- 单表 + `quadrant`：按中位数阈值正确分配四象限。
- 自定义阈值：`xThreshold`/`yThreshold` 覆盖中位数。
- 无描述列：仅显示名称，不报错。
- 名称列无法解析时：渲染空状态。
- 缺少 x/y 时：渲染空状态。
- 非数值行：跳过分配。
- 自定义象限标签：正确渲染。
- 轴标签：正确展示。

## 状态

- **Implemented**：以 `chartType: "quadrant"` 落地。实现细节：
  - 渲染：`src/Plugins/chart/QuadrantChart/`（`QuadrantChart.tsx` + `style.ts` + `utils.ts`）。
  - 解析降级：`src/MarkdownEditor/editor/parser/parse/parseTable.ts` 在 `chartType === 'quadrant'`
    时校验名称列 + x/y 列；命中失败整表降级为普通 Markdown 表格。
  - 公共契约：`columns`/`dataSource`/`title`/`x`/`y` 与现有 chart 节点一致；`xAxisLabel`、`yAxisLabel`、
    `quadrantLabels`、`xThreshold`、`yThreshold`、`fieldMap` 放在 chart config 的 `rest` 中。
  - i18n：新增 `quadrantChart` 标签（中文「四象限图」/英文「Quadrant Chart」）。
  - 单元测试：`src/Plugins/chart/__tests__/QuadrantChart.test.tsx`。
  - 字段解析：`src/Utils/columnMatching.ts` 新增 `QuadrantField`、`resolveQuadrantFields` 等。
