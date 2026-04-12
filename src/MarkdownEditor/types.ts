import type { Ace } from 'ace-builds';
import { AnchorProps, ImageProps } from 'antd';
import React from 'react';
import { BaseEditor, Editor, Selection } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor, RenderElementProps } from 'slate-react';
import type {
  CharacterQueueOptions,
  RenderMode,
} from '../MarkdownRenderer/types';
import { TagPopupProps } from './editor/elements/TagPopup';
import { EditorStore } from './editor/store';
import { InsertAutocompleteProps } from './editor/tools/InsertAutocomplete';
import type { MarkdownToHtmlOptions } from './editor/utils/markdownToHtml';
import { CustomLeaf, Elements } from './el';

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
  markdownEditorRef: React.MutableRefObject<
    BaseEditor & ReactEditor & HistoryEditor
  >;
  exportHtml: (filename?: string) => void;
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
  fncProps?: {
    render: (
      props: CustomLeaf<Record<string, any>> & { children: React.ReactNode },
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
    onOriginUrlClick?: (url?: string) => void;
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
  initValue?: string;
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
  };

  jinja?: JinjaConfig;
  plugins?: any[];
  onChange?: (value: string, schema: Elements[]) => void;
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

  /** 字符队列配置（仅 renderMode: 'markdown'），默认关闭逐字 RAF */
  queueOptions?: CharacterQueueOptions;
  /** 末段淡入动画（仅 renderMode: 'markdown'），默认 false */
  streamingParagraphAnimation?: boolean;
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
    hideTools?: (
      | 'bold'
      | 'italic'
      | 'underline'
      | 'strikethrough'
      | 'code'
      | 'heading'
      | 'link'
      | 'color'
      | 'clearFormat'
      | 'undo'
      | 'redo'
      | string
    )[];
    extra?: React.ReactNode[];
  };
  id?: string;
  /** 直接传入 Slate schema，优先级高于 initValue */
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
  textAreaProps?: { enable?: boolean; placeholder?: string };
  titlePlaceholderContent?: string;
  markdown?: { matchLeaf?: boolean; matchInputToNode?: boolean };
  drag?: { enable?: boolean };
  compact?: boolean;
  attachment?: Record<string, unknown>;

  /**
   * 只读渲染模式，默认 'slate'
   * - 'slate': Slate 编辑器渲染（向后兼容）
   * - 'markdown': 轻量 MarkdownRenderer（无 Slate 实例）
   */
  renderMode?: RenderMode;
  /** renderMode 的别名，同时传入时 renderMode 优先 */
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
