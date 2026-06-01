/**
 * `useFileUploadManager` 已迁移至 `src/MarkdownInputField/hooks/useFileUploadManager.ts`。
 *
 * 本文件保留 re-export 兼容层，避免破坏既有的：
 *  - 外部 type 引用：`SendButton/index.tsx` 等模块通过 `from '../FileUploadManager'`
 *    导入 `FileUploadManagerReturn` 类型；
 *  - 主组件导入：`MarkdownInputField.tsx` 通过 `from './FileUploadManager'` 引入
 *    `useFileUploadManager`。
 *
 * 新代码请直接：
 *   `import { useFileUploadManager } from '../hooks/useFileUploadManager';`
 *
 * @deprecated 请改用 `src/MarkdownInputField/hooks/useFileUploadManager`，
 * 本文件将在下一个大版本删除。
 */
export {
  useFileUploadManager,
  type FileUploadManagerProps,
  type FileUploadManagerReturn,
} from '../hooks/useFileUploadManager';
