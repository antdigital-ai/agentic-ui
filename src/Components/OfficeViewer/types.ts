import type React from 'react';

/** Office Open XML 可预览格式（不含旧版二进制 .doc/.xls/.ppt） */
export type OfficeFileType = 'docx' | 'xlsx' | 'pptx';

export type OfficeViewerStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error'
  | 'missing-dependency';

export interface OfficeViewerProps {
  /** 文件源：远程 URL、本地 File/Blob，或已读入的 ArrayBuffer */
  file?: File | Blob | string | ArrayBuffer;
  /** 显式指定格式；缺省时按 `fileName` / URL / File.name 扩展名推断 */
  fileType?: OfficeFileType;
  /** 用于扩展名推断的文件名（当 `file` 为 ArrayBuffer 或无扩展名 URL 时必传） */
  fileName?: string;
  /**
   * WASM 解析器地址（覆盖默认 CDN）
   * 未传时按格式指向 jsDelivr 上的 `@silurus/ooxml` 资产
   */
  wasmUrl?: string | URL;
  /** 自定义类名 */
  className?: string;
  /** 自定义内联样式 */
  style?: React.CSSProperties;
  /** 容器高度 */
  height?: number | string;
  /** 自定义加载中渲染 */
  loadingRender?: React.ReactNode;
  /** 文档加载完成回调 */
  onLoad?: () => void;
  /** 加载或渲染失败回调 */
  onError?: (error: Error) => void;
  /** 未安装 `@silurus/ooxml` 时的自定义降级内容 */
  missingDependencyRender?: React.ReactNode;
  /** PPTX 是否启用左侧缩略图侧栏（默认开启；关闭后 PPTX 走连续滚动视图） */
  enableSlideRail?: boolean;
}
