/** 隔离兼容导出的 SDK 副作用，让未使用这些 API 的消费者可以移除整个模块。 */
export {
  createSchemaElementEditorBridge,
  useSchemaElementEditor,
  type MethodLevelConfig,
  type PostMessageSourceConfig,
  type PostMessageTypeConfig,
  type ReactSchemaElementEditorConfig,
  type SchemaElementEditorBridge,
  type SchemaElementEditorConfig,
  type SchemaElementEditorRecording,
  type SchemaValue,
} from '@schema-element-editor/host-sdk';
