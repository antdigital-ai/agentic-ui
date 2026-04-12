import type React from 'react';
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

export interface CharacterQueueOptions {
  /** 默认 3 */
  charsPerFrame?: number;
  /** 流式时默认合并为 false，需打字机时设 true */
  animate?: boolean;
  /** 仅对末尾 N 字做动画，前面内容立即展示 */
  animateTailChars?: number;
  /** 速度因子，默认 1.0 */
  speed?: number;
  flushOnComplete?: boolean;
  /** 默认 100ms */
  backgroundInterval?: number;
  /** 默认 10 */
  backgroundBatchMultiplier?: number;
}

export type { RendererPlugin } from '../MarkdownEditor/plugin';

export interface RendererBlockProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export type RenderMode = 'slate' | 'markdown';

export interface MarkdownRendererProps {
  content: string;
  streaming?: boolean;
  isFinished?: boolean;
  queueOptions?: CharacterQueueOptions;
  plugins?: MarkdownEditorPlugin[];
  remarkPlugins?: MarkdownRemarkPlugin[];
  htmlConfig?: MarkdownToHtmlConfig;
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
  /** 末段淡入动画，默认 false */
  streamingParagraphAnimation?: boolean;
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
