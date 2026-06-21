import type { Ace } from 'ace-builds';
import { AnchorProps, ImageProps } from 'antd';
import React from 'react';
import { BaseEditor, Editor, Selection } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor, RenderElementProps } from 'slate-react';
import type { FormulaConfig } from '../Config/formulaConfig';
import type {
  ContentThrottleOptions,
  RenderMode,
} from '../MarkdownRenderer/types';
import { TagPopupProps } from './editor/elements/TagPopup';
import type { EditorStore } from './editor/store';
import { InsertAutocompleteProps } from './editor/tools/InsertAutocomplete';
import type { ToolsKeyType } from './editor/tools/ToolBar/config/toolsConfig';
import type { MarkdownToHtmlOptions } from './editor/utils/markdownToHtml';
import { CustomLeaf, Elements, FootnoteDefinitionNode } from './el';

export type CommentDataType = {
  selection: Selection;
  path: number[];
  updateTime?: number;
  anchorOffset: number;
  focusOffset: number;
  refContent: string;
  commentType: string;
  content: string;
  time: number | string;
  id: string | number;
  user?: {
    name: string;
    avatar?: string;
  };
};

/** Jinja 模板项，与 agent-ui-pc JinjaTemplateData 一致 */
export type JinjaTemplateItem = {
  title: string;
  description?: string;
  template: string;
};

/** 模板列表：静态数组或异步加载 */
export type JinjaTemplatePanelItems =
  | JinjaTemplateItem[]
  | ((params?: { editor?: Editor }) => Promise<JinjaTemplateItem[]>);

export interface JinjaTemplatePanelConfig {
  /** 默认 true */
  enable?: boolean;
  /** 触发符，默认 '{}' */
  trigger?: string;
  /** 不传时使用内置 JINJA_TEMPLATE_DATA */
  items?: JinjaTemplatePanelItems;
  notFoundContent?: React.ReactNode;
}

export interface JinjaConfig {
  /** 总开关：语法高亮 + 模板面板 */
  enable: boolean;
  /** 使用说明链接 */
  docLink?: string;
  templatePanel?: boolean | JinjaTemplatePanelConfig;
}

export type IEditor = {
  children?: IEditor[];
  expand?: boolean;
};

export interface MarkdownEditorInstance {
  range?: any;
  store: EditorStore;
  markdownContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  markdownEditorRef:
    | React.MutableRefObject<BaseEditor & ReactEditor & HistoryEditor>
    | React.MutableRefObject<null>;
  exportHtml: (filename?: string) => void;
  /** renderMode=markdown 时可用 */
  getDisplayedContent?: () => string;
}

export type MarkdownEditorProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  tagInputProps?: {
    enable?: boolean;
    placeholder?: string;
    type?: 'panel' | 'dropdown';
  } & TagPopupProps;
  editorStyle?: React.CSSProperties;
  /** 脚注引用（fnc）与脚注定义列表（`onFootnoteDefinitionChange`）的配置 */
  fncProps?: {
    /** 自定义脚注角标渲染；未传时使用默认 `FncLeaf` */
    render?: (
      props: CustomLeaf<Record<string, any>> & { children: React.ReactNode },
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
    /** 移动端点击脚注角标时 Modal 内容；未传时使用脚注定义与来源链接 */
    renderMobileModal?: (props: {
      identifier?: string;
      displayLabel: string;
      definition?: FootnoteDefinitionNode;
      defaultContent: React.ReactNode;
    }) => React.ReactNode;
    onOriginUrlClick?: (identifier?: string) => void;
    onFootnoteDefinitionChange?: (
      data: {
        id: any;
        placeholder: any;
        origin_text: any;
        url: any;
        origin_url: any;
      }[],
    ) => void;
  };
  /**
   * 代码块配置，基于 Ace Editor
   *
   * `render` 返回 `undefined` 时回退到默认渲染；返回 `null` 时不渲染。
   */
  codeProps?: {
    render?: (
      props: CustomLeaf<Record<string, any>> & { children: React.ReactNode },
      defaultDom: React.ReactNode,
      codeProps?: MarkdownEditorProps['codeProps'],
    ) => React.ReactNode;
    Languages?: string[];
    hideToolBar?: boolean;
    alwaysExpandedDeepThink?: boolean;
    /**
     * 深度思考块展开时是否将组件滚动到视窗内。
     * 传入 `true` 时使用默认参数 `{ behavior: 'smooth', block: 'nearest' }`，
     * 也可直接传入 `ScrollIntoViewOptions` 自定义滚动行为。
     */
    scrollDeepThinkIntoViewOnExpand?: boolean | ScrollIntoViewOptions;
    disableHtmlPreview?: boolean;
    viewModeLabels?: {
      /** 默认 '预览' */
      preview?: string;
      /** 默认 '代码' */
      code?: string;
    };
  } & Partial<Ace.EditorOptions>;

  anchorProps?: AnchorProps;
  image?: {
    upload?: (file: File[] | string[]) => Promise<string[] | string>;
    render?: (
      props: ImageProps,
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
  };

  insertAutocompleteProps?: InsertAutocompleteProps;
  eleItemRender?: (
    ele: RenderElementProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
  /**
   * 初始 Markdown 字符串。Slate 模式下为**非受控**初始值：仅在挂载时解析一次。
   * 挂载后更新正文请使用 `editorRef.current.store.setMDContent(markdown)`，或 remount（例如变更 `key`），勿仅依赖改此 prop 同步编辑器。
   */
  initValue?: string;
  /**
   * 只读时是否仍挂载完整 Slate 取决于 `renderMode`：
   * - 与 `renderMode: 'markdown'` 联用：走轻量 `MarkdownRenderer`，不加载 Slate（首包与运行时最小）
   * - 默认或 `renderMode: 'slate'`：只读仍以 Slate 渲染（可选中、与编辑态 DOM 一致），但会包含 Slate 与相关依赖
   */
  readonly?: boolean;

  /** 懒加载，只有进入视口才渲染 */
  lazy?: {
    enable?: boolean;
    /** 单位 px，默认 25 */
    placeholderHeight?: number;
    /** IntersectionObserver rootMargin，默认 '200px' */
    rootMargin?: string;
    renderPlaceholder?: (props: {
      height: number;
      style: React.CSSProperties;
      isIntersecting: boolean;
      elementInfo?: { type: string; index: number; total: number };
    }) => React.ReactNode;
  };

  /**
   * 支持 CSS 变量自定义表格样式：
   * `--agentic-ui-table-border-radius`、`--agentic-ui-table-border-color`、
   * `--agentic-ui-table-header-bg`、`--agentic-ui-table-hover-bg` 等
   */
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;

  toolbarConfig?: {
    show?: boolean;
    items?: string[];
  };
  tableConfig?: {
    minColumn?: number;
    minRows?: number;
    actions?: {
      fullScreen?: 'modal' | 'drawer';
      download?: 'csv';
      copy?: 'md' | 'html' | 'csv';
    };
    pure?: boolean;
    previewTitle?: string;
    cssVariables?: Record<`--${string}`, string>;
  };
  pasteConfig?: {
    enabled?: boolean;
    allowedTypes?: string[];
    /** @default false */
    plainTextOnly?: boolean;
    /**
     * 粘 text/plain 时是否启发式识别 markdown 并解析。
     * 默认 true（保留旧行为）；关掉后含 `**bold**` `[x](y)` 等的纯文本会原样插入。
     */
    parseMarkdownInPlainText?: boolean;
    /**
     * text/html 单次粘贴体积上限（字节）。超过时降级为 text/plain，避免主线程被巨型
     * Word/Excel 文档卡死。默认 1MB；设为 0 关闭限制。
     * @default 1_048_576
     */
    htmlMaxBytes?: number;
    /**
     * 检测到 Word / Office 系列 HTML 时，先把 HTML 转成 markdown 再走 markdown 解析
     * 流水线（更稳定的格式映射），失败时回退到 insertParsedHtmlNodes。
     * 默认 true；设为 false 走旧的 docxDeserializer 路径。
     * @default true
     */
    convertWordToMarkdown?: boolean;
  };

  jinja?: JinjaConfig;
  /** 公式解析与 KaTeX 渲染配置；可通过 AgenticConfigProvide 全局设置 */
  formula?: FormulaConfig;
  /**
   * 扩展插件。运行时变更会同步 Store 解析配置；`withEditor` 栈变化时会重建 Slate 编辑器并 remount（保留当前文档）。
   * 若仅替换函数引用但栈形状不变，不会 remount。
   */
  plugins?: any[];
  onChange?: (value: string, schema: Elements[]) => void;
  /**
   * onChange 去抖等待毫秒数。连续输入会合并为一次回调，默认 150ms。
   * 设为 0 时仍会去掉同帧重复（rAF 级别）；设大值可进一步降低 setState 频率。
   */
  onChangeDebounceWait?: number;
  onSelectionChange?: (
    selection: Selection | null,
    selectedMarkdown: string,
    selectedNodes: Elements[],
  ) => void;
  comment?: {
    enable?: boolean;
    commentList?: CommentDataType[];
    loadMentions?: (text: string) => Promise<{ name: string }[]>;
    onSubmit?: (id: string | number, comment: CommentDataType) => void;
    onDelete?: (id: string | number, comment: CommentDataType) => void;
    editorRender?: (dom: React.ReactNode) => React.ReactNode;
    onClick?: (id: string | number, comment: CommentDataType) => void;
    onEdit?: (id: string | number, comment: CommentDataType) => void;
    deleteConfirmText?: string;
    mentionsPlaceholder?: string;
    /** 未提供时回退到 titlePlaceholderContent */
    placeholder?: string;
    listItemRender?: (
      defaultDom: {
        checkbox: React.JSX.Element | null;
        mentionsUser: React.JSX.Element | null;
        children: any;
      },
      comment: {
        element: Elements;
        children: React.ReactNode;
        attributes: any;
      },
    ) => React.ReactNode;
  };

  onFocus?: (
    value: string,
    schema: Elements[],
    e: React.FocusEvent<HTMLDivElement, Element>,
  ) => void;
  onBlur?: (
    value: string,
    schema: Elements[],
    e: React.MouseEvent<HTMLDivElement, Element>,
  ) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => boolean | void;

  /** 自定义 remark 插件，格式同 Babel 插件数组 */
  markdownToHtmlOptions?: MarkdownToHtmlOptions;

  linkConfig?: {
    openInNewTab?: boolean;
    onClick?: (url?: string) => boolean | void;
  };

  /**
   * 流式限流与展示配置（仅 renderMode: 'markdown'），默认 streaming 时开启限流。
   * GPT 风格逐词淡入由 `throttleOptions.fade` 控制（默认开启，传 false 关闭）。
   */
  throttleOptions?: ContentThrottleOptions;

  /** MElement 刷新依赖 */
  deps?: string[];

  apaasify?: {
    enable?: boolean;
    render?: (
      props: import('slate-react').RenderElementProps,
      originData?: import('../Bubble/type').MessageBubbleData,
    ) => React.ReactNode;
  };
  /** @deprecated 请使用 apaasify */
  apassify?: {
    enable?: boolean;
    render?: (
      props: import('slate-react').RenderElementProps,
      originData?: import('../Bubble/type').MessageBubbleData,
    ) => React.ReactNode;
  };

  children?: React.ReactNode;
  editorRef?: React.Ref<MarkdownEditorInstance | undefined>;
  reportMode?: boolean;
  /** @default false */
  toc?: boolean;
  toolBar?: {
    enable?: boolean;
    min?: boolean;
    /** 需要隐藏的工具栏选项，键名见 toolsConfig.tsx 中的 ToolsKeyType */
    hideTools?: ToolsKeyType[];
    extra?: React.ReactNode[];
  };
  id?: string;
  /**
   * 直接传入 Slate schema，优先级高于 `initValue`；同样仅在挂载时作为初始文档，运行时更新请用 `setMDContent` 或 remount
   */
  initSchemaValue?: Elements[];
  leafRender?: (
    props: Record<string, any> & { children: React.ReactNode },
    defaultDom: React.ReactNode,
  ) => React.ReactNode;

  /** 流式输出模式，同时传入时优先于 typewriter */
  streaming?: boolean;
  /** 流式是否完成（仅 renderMode: 'markdown'），未传入时回退到 !streaming */
  isFinished?: boolean;
  /**
   * streaming 的别名，向下兼容
   * @deprecated 请使用 streaming
   */
  typewriter?: boolean;

  rootContainer?: React.MutableRefObject<HTMLDivElement | undefined>;
  slideMode?: boolean;
  containerClassName?: string;
  floatBar?: { enable?: boolean };
  /** 编辑器空态占位文案；优先级高于 textAreaProps.placeholder 与 titlePlaceholderContent */
  placeholder?: string;
  textAreaProps?: { enable?: boolean; placeholder?: string };
  /**
   * 编辑器空态占位文案（向下兼容）
   * @deprecated 请使用 `placeholder`
   */
  titlePlaceholderContent?: string;
  /** IME 组合开始/结束时回调，用于关闭与 `/`、`@` 冲突的浮动面板 */
  onCompositionActiveChange?: (active: boolean) => void;

  markdown?: {
    matchLeaf?: boolean;
    matchInputToNode?: boolean;
    /**
     * 输入 `/` 时是否打开「插入元素」菜单（含表格等）。
     * 聊天输入框等场景应设为 `false`，避免与 `/` 快捷命令冲突。
     * @default true
     */
    enableInsertCompletion?: boolean;
  };
  drag?: { enable?: boolean };
  compact?: boolean;
  attachment?: Record<string, unknown>;

  /**
   * 只读渲染模式，默认 `'slate'`。仅在 `readonly` 为 true 时与只读分支强相关。
   * - `'slate'`：Slate 文档树（与编辑态一致，体积含 Slate）
   * - `'markdown'`：仅 `Markdown → hast → React`，无 Slate，仅当 `readonly` 时生效
   */
  renderMode?: RenderMode;
  /**
   * `renderMode` 的别名，同时传入时以 `renderMode` 为准。
   */
  renderType?: RenderMode;
  /**
   * 自定义元素渲染（仅 renderMode: 'markdown'），返回 undefined 回退默认渲染
   */
  eleRender?: (
    props: import('../MarkdownRenderer/types').MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
  /** FileMapView 配置（仅 renderMode: 'markdown'） */
  fileMapConfig?: import('../MarkdownRenderer/types').FileMapConfig;
};
