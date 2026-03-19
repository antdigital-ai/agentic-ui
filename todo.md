## TODO

- [x] 定位 `ant-agentic-md-editor-table-cell-index-spacer config-td` 样式丢失根因
- [x] 修复表格样式选择器，避免通用 `td` 覆盖 `config-td`
- [x] 运行相关测试并确认无回归
- [x] 提交、推送并更新 PR

## TODO（补回 action-buttons 样式）

- [x] 补回 `table-cell-index` 和 `table-cell-index-spacer` 的 action-buttons 样式
- [x] 运行表格相关测试确认无回归
- [x] 提交、推送并同步更新 PR

## TODO（切换 Table 宽度方案）

- [x] 梳理现有编辑态 Table 宽度计算并设计替代方案
- [x] 落地新的编辑态宽度计算实现（更稳定、少副作用）
- [x] 运行 Table 相关测试验证无回归
- [x] 提交、推送并同步更新 PR

## TODO（重构可编辑表格）

- [x] 拆分可编辑表格渲染层与读写态路由
- [x] 抽离可编辑表格宽度计算 hooks 与纯函数
- [x] 跑通 Table 全量测试确保行为兼容
- [x] 提交、推送并同步更新 PR
