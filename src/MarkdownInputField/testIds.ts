/**
 * MarkdownInputField 内置 testId 常量
 * 用于 E2E 测试与自动化测试中的 data-testid 定位
 */
export const MARKDOWN_INPUT_FIELD_TEST_IDS = {
  /** 根容器 */
  ROOT: 'markdown-input-field',
  /** 顶部操作区域 */
  TOP_AREA: 'markdown-input-field-top-area',
  /** 前置工具栏区域 */
  BEFORE_TOOLS: 'markdown-input-field-before-tools',
  /** 编辑器容器 */
  EDITOR: 'markdown-input-field-editor',
  /** 编辑器内容区 */
  EDITOR_CONTENT: 'markdown-input-field-editor-content',
  /** 快速操作区（放大、提示词优化等） */
  QUICK_ACTIONS: 'markdown-input-field-quick-actions',
  /** 工具栏包装器 */
  TOOLS_WRAPPER: 'markdown-input-field-tools-wrapper',
  /** 发送工具区域 */
  SEND_TOOLS: 'markdown-input-field-send-tools',
  /** 发送操作区（附件、语音、发送按钮等） */
  SEND_ACTIONS: 'markdown-input-field-send-actions',
  /** 文件上传状态提示 */
  UPLOAD_STATUS: 'markdown-input-field-upload-status',
  /** 更多操作按钮（折叠时的省略号） */
  MORE_ACTIONS: 'markdown-input-field-more-actions',
  /** 附件列表 */
  ATTACHMENT_LIST: 'markdown-input-field-attachment-list',
} as const;
