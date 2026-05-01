/**
 * MarkdownInputField 内部共享类型
 *
 * 仅供 src/MarkdownInputField 子模块之间复用，避免在多个文件里重复内联同一份
 * 字面量结构。**不通过 src/index.ts 对外导出**，对外的公开 API 类型契约保持不变。
 */

/**
 * 文件上传聚合状态
 *
 * - `uploading`：至少有一个文件处于上传中
 * - `done`：全部完成或当前没有文件
 * - `error`：至少有一个文件上传失败
 */
export type FileUploadStatus = 'uploading' | 'done' | 'error';

/**
 * 文件上传统计快照
 *
 * 用于在父级（FileUploadManager）汇总后透传给 SendActions / QuickActions /
 * renderHelpers 等渲染层，避免下游再次遍历 `fileMap`。
 */
export interface FileUploadSummary {
  /** 文件总数 */
  totalCount: number;
  /** 已完成上传的文件数 */
  doneCount: number;
  /** 正在上传的文件数 */
  uploadingCount: number;
  /** 上传失败的文件数 */
  errorCount: number;
}
