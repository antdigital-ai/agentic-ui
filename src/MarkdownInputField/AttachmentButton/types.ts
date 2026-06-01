/**
 * 附件相关的类型已统一收敛到 `src/MarkdownInputField/types/attachment.ts`。
 *
 * 此处保留 re-export 以维持既有的 `from '../AttachmentButton/types'` 导入路径
 * 不变（包含 `src/index.ts`、各 `__tests__` 与子模块）。
 */
export type { AttachmentFile, UploadResponse } from '../types/attachment';
