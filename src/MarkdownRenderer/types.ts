import type React from 'react';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import type {
  MarkdownRemarkPlugin,
  MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';

export interface CharacterQueueOptions {
  /** 每帧输出的最大字符数，默认 3 */
  charsPerFrame?: number;
  /** 是否启用打字动画，默认 true（流式时） */
  animate?: boolean;
  /** 动画速度因子，1.0 为标准速度 */
  speed?: number;
  /** 内容完成后立即 flush 全部剩余 */
  flushOnComplete?: boolean;
  /** 后台 tick 间隔（ms），默认 100 */
  backgroundInterval?: number;
  /** 后台每次 tick 的字符数倍率，默认 10 */
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
  /** 完整的 markdown 内容（流式场景下持续增长） */
  content: string;
  /** 是否处于流式状态 */
  streaming?: boolean;
  /** 流式完成 */
  isFinished?: boolean;
  /** 字符队列配置 */
  queueOptions?: CharacterQueueOptions;
  /** 插件配置（用于自定义块渲染） */
  plugins?: MarkdownEditorPlugin[];
  /** markdownToHtml 的额外 remark/rehype 插件 */
  remarkPlugins?: MarkdownRemarkPlugin[];
  /** HTML 渲染配置 */
  htmlConfig?: MarkdownToHtmlConfig;
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
  /** 类名前缀 */
  prefixCls?: string;
  /** 代码块配置（传递给 CodeRenderer） */
  codeProps?: Record<string, any>;
  /** 脚注配置 */
  fncProps?: {
    render?: (
      props: Record<string, any> & { children: React.ReactNode },
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
    onFootnoteDefinitionChange?: (data: any[]) => void;
  };
  /** 链接配置 */
  linkConfig?: {
    /** 是否在新标签页打开链接，默认 true */
    openInNewTab?: boolean;
    /** 自定义链接点击处理，返回 false 可阻止默认跳转 */
    onClick?: (url?: string) => boolean | void;
  };
  /** Apaasify / Schema 自定义渲染 */
  apaasify?: {
    enable?: boolean;
    /** 自定义渲染函数，接收解析后的 JSON value，返回 React 节点 */
    render?: (value: any) => React.ReactNode;
  };
}

export interface MarkdownRendererRef {
  /** 获取渲染容器的 DOM 元素 */
  nativeElement: HTMLDivElement | null;
  /** 获取当前显示的内容 */
  getDisplayedContent: () => string;
}
