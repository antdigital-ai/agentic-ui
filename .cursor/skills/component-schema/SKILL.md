---
name: component-schema
description: Develop SchemaForm, SchemaEditor, SchemaRenderer and validator in @ant-design/agentic-ui for low-code and JSON Schema. Use when building form from schema, schema editor, template engine, or validation. Triggers on Schema, SchemaForm, SchemaEditor, SchemaRenderer, LowCodeSchema, validator.
---

# Schema 组件开发

基于 JSON Schema 的低代码能力：表单、编辑器、渲染器与校验。

## 源码位置

- 导出：`src/Schema/index.ts`
- 表单：`src/Schema/SchemaForm/`
- 编辑器：`src/Schema/SchemaEditor/`
- 渲染器与模板引擎：`src/Schema/SchemaRenderer/`、`templateEngine`
- 校验：`src/Schema/validator.ts`（SchemaValidator、mdDataSchemaValidator）
- 类型：`src/Schema/types.ts`（LowCodeSchema 等）

## 主要导出

```ts
SchemaEditor, SchemaForm, SchemaRenderer, SchemaValidator, TemplateEngine, validator
SchemaEditorProps, SchemaEditorRef, SchemaFormProps, LowCodeSchema
```

## 开发规范

- 与 MarkdownEditor、Bubble 内 Schema 编辑等配合时保持 schema 结构一致。
- 参考 `AGENTS.md` 的 Props 与类型规范。

修改 Schema 表单/编辑器/渲染/校验时，参考 `src/Schema/` 与 `AGENTS.md`。
