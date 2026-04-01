import type React from 'react';
import type {
  MarkdownRemarkPlugin,
  MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import type { AttachmentFile } from '../MarkdownInputField/AttachmentButton/types';
import type { FileMapViewProps } from '../MarkdownInputField/FileMapView';

/**
 * FileMapView 相关配置，透传给 agentic-ui-filemap 代码块渲染器，
 * 方便在 markdownRenderConfig 中统一配置图片回显行为。
 */
export interface FileMapConfig {
  /**
   * 预览文件回调，透传给 FileMapView.onPreview。
   * 对图片：点击缩略图时触发，传入则阻止 antd Image 内置灯箱；
   * 对视频：传入则阻止内置弹窗；对普通文件：传入则阻止默认 window.open。
   */
  onPreview?: (file: AttachmentFile) => void;
  /**
   * 自定义每个媒体条目（图片/视频）的渲染，透传给 FileMapView.itemRender，
   * 常用于回显场景。
   */
  itemRender?: FileMapViewProps['itemRender'];
  /**
   * 是否隐藏 agentic-ui-filemap 代码块的渲染。
   * 当消息外侧已通过 originData.fileMap + BubbleFileView 渲染文件列表时，
   * Bubble 内部会自动将此值设为 true 以避免重复显示。
   */
  hide?: boolean;
  /**
   * 自定义文件数据规范化函数，用于将 agentic-ui-filemap 代码块中的原始 JSON 条目
   * 转换为 AttachmentFile 对象。
   *
   * 适用于服务端返回的字段名与 AttachmentFile 不一致（如 fileUrl → url、
   * fileId → uuid）或需要在数据层补充额外字段的场景。
   *
   * @param raw - 代码块 JSON 中的原始文件对象（未经处理）
   * @param defaultFile - 由内置逻辑生成的默认 AttachmentFile，可在此基础上做局部覆盖
   * @returns 转换后的 AttachmentFile；返回 null 时该条目将被过滤掉
   *
   * @example
   * ```tsx
   * fileMapConfig={{
   *   normalizeFile: (raw, defaultFile) => ({
   *     ...defaultFile,
   *     url: raw.fileUrl as string,
   *     uuid: raw.fileId as string,
   *   }),
   * }}
   * ```
   */
  normalizeFile?: (
    raw: Record<string, unknown>,
    defaultFile: AttachmentFile,
  ) => AttachmentFile | null;
}


export interface MarkdownRendererEleProps {
  /** HTML tag name, e.g. 'p', 'h1', 'blockquote', 'pre' */
  tagName: string;
  /** The original hast node */
  node?: any;
  /** Rendered children */
  children?: React.ReactNode;
  [key: string]: any;
}

export interface CharacterQueueOptions {
  /** 每帧输出的最大字符数，默认 3 */
  charsPerFrame?: number;
  /**
   * 是否启用 CharacterQueue 逐字输出（RAF 驱动）。
   * MarkdownRenderer 流式默认合并为 `false`，避免每帧全量重解析导致整页闪动；需打字机时再设为 `true`。
   */
  animate?: boolean;
  /**
   * 仅对末尾 N 个字符做动画，前面内容立即展示。
   * 设为 50 时，每次 push 只对最后 50 字逐字输出，避免整段逐字动画。
   * 默认 undefined 表示整段动画（原有行为）。
   */
  animateTailChars?: number;
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
  /**
   * 流式时是否为生长中的末段启用淡入（AnimationText）。
   * 默认 false，避免重解析时整页闪动；需要段落入场效果时再设为 true。
   */
  streamingParagraphAnimation?: boolean;
  /** Apaasify / Schema 自定义渲染 */
  apaasify?: {
    enable?: boolean;
    /** 自定义渲染函数，接收解析后的 JSON value，返回 React 节点 */
    render?: (value: any) => React.ReactNode;
  };
  /**
   * FileMapView 配置，透传给 agentic-ui-filemap 代码块渲染器。
   * 可在 markdownRenderConfig 中统一配置图片 onPreview 和 itemRender。
   */
  fileMapConfig?: FileMapConfig;
  /**
   * 自定义元素渲染函数（markdown 渲染模式）
   * 与 Slate 模式的 eleItemRender 对应，允许拦截并替换任意块级/行内元素的渲染结果。
   * @param props - 元素属性（tagName、node、children 等）
   * @param defaultDom - 默认渲染结果
   * @returns 自定义渲染节点，或 undefined 时回退到 defaultDom
   */
  eleRender?: (
    props: MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
}

export interface MarkdownRendererRef {
  /** 获取渲染容器的 DOM 元素 */
  nativeElement: HTMLDivElement | null;
  /** 获取当前显示的内容 */
  getDisplayedContent: () => string;
}
