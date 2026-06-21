import type React from 'react';
import type { FormulaConfig } from '../Config/formulaConfig';
import type {
  MarkdownRemarkPlugin,
  MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import type { AttachmentFile } from '../MarkdownInputField/AttachmentButton/types';
import type { FileMapViewProps } from '../MarkdownInputField/FileMapView';

/** 透传给 agentic-ui-filemap 代码块渲染器的配置 */
export interface FileMapConfig {
  /** 传入则阻止内置预览（灯箱/弹窗/window.open） */
  onPreview?: (file: AttachmentFile) => void;
  /** 自定义媒体条目渲染 */
  itemRender?: FileMapViewProps['itemRender'];
  /** 将原始 JSON 条目转为 AttachmentFile，返回 null 过滤该条目 */
  normalizeFile?: (
    raw: Record<string, unknown>,
    defaultFile: AttachmentFile,
  ) => AttachmentFile | null;
}

export interface MarkdownRendererEleProps {
  tagName: string;
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export type { RendererPlugin } from '../MarkdownEditor/plugin';

export interface RendererBlockProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export type RenderMode = 'slate' | 'markdown';

/** 流式内容限流：控制大段文本按帧顺序展示，避免一次性突变 */
export interface ContentThrottleOptions {
  /** 每帧最多推进字符数，默认 3 */
  charsPerFrame?: number;
  /** 速度倍率，默认 1 */
  speed?: number;
  /** 流式结束时是否立即展示剩余内容，默认 true */
  flushOnComplete?: boolean;
  /** 标签页不可见时的轮询间隔（ms），默认 100 */
  backgroundInterval?: number;
  /** 后台每批字符相对前台倍数，默认 10 */
  backgroundBatchMultiplier?: number;
  /** 为 false 时关闭限流，流式内容即时渲染 */
  enabled?: boolean;
  /** GPT 风格逐词淡入开关，默认 true；为 false 时流式内容即时显示（无淡入） */
  fade?: boolean;
}

export interface MarkdownRendererProps {
  content: string;
  streaming?: boolean;
  /** 流式是否已结束；为 true 时限流器立即 flush 剩余内容 */
  isFinished?: boolean;
  /**
   * 流式限流与展示配置；streaming 为 true 且未设 enabled: false 时默认开启限流。
   * GPT 风格逐词淡入由 `throttleOptions.fade` 控制（默认开启，传 false 关闭）。
   */
  throttleOptions?: ContentThrottleOptions;
  plugins?: MarkdownEditorPlugin[];
  remarkPlugins?: MarkdownRemarkPlugin[];
  htmlConfig?: MarkdownToHtmlConfig;
  /** 公式解析与 KaTeX 渲染配置；可通过 AgenticConfigProvide 全局设置 */
  formula?: FormulaConfig;
  className?: string;
  style?: React.CSSProperties;
  prefixCls?: string;
  codeProps?: MarkdownEditorProps['codeProps'];
  fncProps?: MarkdownEditorProps['fncProps'];
  linkConfig?: {
    /** 默认 true */
    openInNewTab?: boolean;
    /** 返回 false 阻止跳转 */
    onClick?: (url?: string) => boolean | void;
  };
  apaasify?: {
    enable?: boolean;
    render?: (value: any) => React.ReactNode;
  };
  fileMapConfig?: FileMapConfig;
  /** 返回 undefined 回退默认渲染 */
  eleRender?: (
    props: MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
}

export interface MarkdownRendererRef {
  nativeElement: HTMLDivElement | null;
  getDisplayedContent: () => string;
}
