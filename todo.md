# 任务记录

- [x] 对齐 MarkdownEditor API 文档表格列顺序（Property / Description / Type / Default / Version）
- [x] 批量修正图表与若干组件文档中的 API 表格列顺序
- [x] 修正 chat-boot、chat-flow-container、FileMapView、ThoughtChainList、markdownInputField 等文档中的不规范表格
- [x] 修复 api.md 中图片上传示例未定义 `editorRef` 的问题
- [x] 将 history、bubble、workspace.File 文档中「废弃版本」列统一为「版本」，并为 history 子表补全「版本」列
- [x] 图表 DataItem 与 Loading、Attachment、UploadResponse 等表：去掉「必填」列，改为「说明」中标注并与 `AGENTS.md` 五列对齐
- [x] chat-layout、workspace（含 File/Browser/HtmlPreview 等）、layout-header、agentic-layout：API 表统一五列并修复 Workspace.File 曾缺「版本」列的数据行
- [x] answer-alert、SuggestionList、VisualList、task-list：API 表统一为「属性 | 说明 | 类型 | 默认值 | 版本」
- [ ] 含单元格内 `|` 的宽表需人工或专用解析逐文件处理，勿用简单按 `|` 切分的脚本批量加列
