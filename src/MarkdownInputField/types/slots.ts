import type { AttachmentConfig, AttachmentFile } from './attachment';
import type { FileUploadStatus, FileUploadSummary } from './shared';

/**
 * Slot 渲染状态（共享基础）
 *
 * 4 个 slot（`actionsRender` / `toolsRender` / `quickActionRender` /
 * `beforeToolsRender`）入参的稳定派生子集。**取代**历史「上帝接口」类型
 * `MarkdownInputFieldProps & MarkdownInputFieldProps['attachment'] & {...}`：
 * 1. 不再随 `MarkdownInputFieldProps` 字段增减而被动扩张；
 * 2. 不再交叉展开 `attachment`，下游通过 `state.attachment.xxx` 显式访问；
 * 3. 字段集合就是渲染层实际需要的全部状态，零冗余。
 *
 * Breaking change：旧的 `(props: MarkdownInputFieldProps & ...)` 签名已移除。
 * 请将 `props.xxx` 改为 `state.xxx`，`props.upload`（来自 attachment）改为
 * `state.attachment?.upload`。
 *
 * @since 2.32.0
 */
export interface SlotRenderState {
  /** 当前编辑器文本值 */
  value?: string;
  /** 是否处于鼠标悬停状态 */
  isHover: boolean;
  /** 是否处于发送加载中（onSend Promise 未结束） */
  isLoading: boolean;
  /** 当前附件文件映射 */
  fileMap?: Map<string, AttachmentFile>;
  /** 修改附件文件映射的回调 */
  onFileMapChange?: (fileMap?: Map<string, AttachmentFile>) => void;
  /** 文件上传聚合状态 */
  fileUploadStatus: FileUploadStatus;
  /** 文件上传统计快照 */
  fileUploadSummary?: FileUploadSummary;
  /** 当前 attachment 配置（含 enable / upload / supportedFormat 等） */
  attachment?: AttachmentConfig;
  /** 输入框是否被 props 显式禁用 */
  disabled?: boolean;
  /** 是否处于 AI typing 状态（输入区只读） */
  typing?: boolean;
}

/**
 * `actionsRender` 专属渲染状态。
 *
 * 在 {@link SlotRenderState} 基础上扩展 `collapseSendActions`：当输入框宽度
 * 不足以平铺所有发送区按钮时，由几何层（`useInputFieldGeometry`）置 true，
 * 通知 slot 渲染折叠态（如把次要按钮收进 Popover 的 EllipsisVertical 菜单）。
 *
 * @since 2.32.0
 */
export interface ActionsSlotState extends SlotRenderState {
  /**
   * 发送区是否处于折叠态（宽度不足以平铺所有按钮）。
   * 折叠时建议把次要按钮收进 Popover，仅保留发送按钮在外部。
   */
  collapseSendActions?: boolean;
}
