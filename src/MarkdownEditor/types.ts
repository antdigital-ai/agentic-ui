import type { Ace } from 'ace-builds';
import { AnchorProps, ImageProps } from 'antd';
import React from 'react';
import { BaseEditor, Selection } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor, RenderElementProps } from 'slate-react';
import { TagPopupProps } from './editor/elements/TagPopup';
import { EditorStore } from './editor/store';
import { InsertAutocompleteProps } from './editor/tools/InsertAutocomplete';
import type { MarkdownToHtmlOptions } from './editor/utils/markdownToHtml';
import { CustomLeaf, Elements } from './el';

/**
 * @typedef CommentDataType
 * @description 表示评论数据的类型。
 *
 * @property {Selection} selection - 用户选择的文本范围。
 * @property {number[]} path - 文档中选择路径的数组。
 * @property {number} anchorOffset - 选择范围的起始偏移量。
 * @property {number} focusOffset - 选择范围的结束偏移量。
 * @property {string} refContent - 参考内容。
 * @property {string} commentType - 评论的类型。
 * @property {string} content - 评论的内容。
 * @property {number} time - 评论的时间戳。
 * @property {string | number} id - 评论的唯一标识符。
 * @property {Object} [user] - 用户信息（可选）。
 * @property {string} user.name - 用户名。
 * @property {string} [user.avatar] - 用户头像（可选）。
 */
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

/**
 * 编辑器接口定义
 * @interface IEditor
 *
 * @property {IEditor[]} [children] - 子编辑器列表
 * @property {boolean} [expand] - 是否展开
 * @property {any[]} [schema] - 编辑器模式配置
 * @property {any} [history] - 编辑器历史记录
 */
export type IEditor = {
  children?: IEditor[];
  expand?: boolean;
};

/**
 * MarkdownEditor 实例
 */
export interface MarkdownEditorInstance {
  range?: any;
  store: EditorStore;
  markdownContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  markdownEditorRef: React.MutableRefObject<
    BaseEditor & ReactEditor & HistoryEditor
  >;
  exportHtml: (filename?: string) => void;
}

/**
 * MarkdownEditor 的 props
 * @param props
 */
export type MarkdownEditorProps = {
  /**
   * 自定义 CSS 类名
   * @description 用于为编辑器根容器添加自定义类名
   * @example "my-markdown-editor"
   */
  className?: string;
  /**
   * 编辑器宽度
   * @description 支持字符串（如 '100%', '500px'）或数字（像素值）
   * @example "100%" | 800
   */
  width?: string | number;
  /**
   * 编辑器高度
   * @description 支持字符串（如 '100%', '500px'）或数字（像素值）
   * @example "100%" | 600
   */
  height?: string | number;
  /**
   * 标签输入配置
   * @description 配置标签输入组件的显示和行为
   * @property {boolean} [enable] - 是否启用标签输入功能
   * @property {string} [placeholder] - 标签输入框的占位符文本
   * @property {'panel' | 'dropdown'} [type] - 标签输入组件的显示类型，'panel' 为面板模式，'dropdown' 为下拉模式
   * @example
   * ```tsx
   * tagInputProps={{
   *   enable: true,
   *   placeholder: '输入标签...',
   *   type: 'dropdown'
   * }}
   * ```
   */
  tagInputProps?: {
    enable?: boolean;
    placeholder?: string;
    type?: 'panel' | 'dropdown';
  } & TagPopupProps;

  /**
   * 编辑器样式
   * @description 自定义编辑器容器的内联样式
   * @example { padding: '10px', backgroundColor: '#f5f5f5' }
   */
  editorStyle?: React.CSSProperties;

  /**
   * 功能属性配置
   * @description 提供自定义渲染和事件处理的能力
   * @property {Function} render - 自定义节点渲染函数，用于覆盖默认的节点渲染逻辑
   * @property {Function} [onOriginUrlClick] - 点击原文链接时的回调函数
   * @property {Function} [onFootnoteDefinitionChange] - 脚注定义变更时的回调函数
   * @example
   * ```tsx
   * fncProps={{
   *   render: (props, defaultDom) => {
   *     // 自定义渲染逻辑
   *     return <CustomNode {...props} />;
   *   },
   *   onOriginUrlClick: (url) => {
   *     window.open(url);
   *   },
   *   onFootnoteDefinitionChange: (data) => {
   *     console.log('脚注定义变更:', data);
   *   }
   * }}
   * ```
   */
  fncProps?: {
    /**
     * 自定义节点渲染函数
     * @param props - 包含节点属性和子节点的对象
     * @param defaultDom - 默认的 DOM 渲染结果
     * @returns 自定义渲染的 React 节点
     */
    render: (
      props: CustomLeaf<Record<string, any>> & { children: React.ReactNode },
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
    /**
     * 点击原文链接的回调函数
     * @param url - 原文链接地址
     */
    onOriginUrlClick?: (url?: string) => void;
    /**
     * 脚注定义变更的回调函数
     * @param data - 脚注定义数据数组，包含 id、placeholder、origin_text、url、origin_url 等信息
     */
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
   * 代码编辑器配置
   *
   * 支持配置代码块的显示和编辑行为，基于 Ace Editor。
   *
   * @example
   * ```tsx
   * <MarkdownEditor
   *   codeProps={{
   *     theme: 'monokai', // 代码编辑器主题
   *     fontSize: 14,
   *     hideToolBar: false,
   *     Languages: ['javascript', 'python', 'typescript'],
   *     showLineNumbers: true,
   *     wrap: true,
   *     disableHtmlPreview: true, // 禁用 HTML 预览
   *     viewModeLabels: {
   *       preview: 'Preview', // 自定义预览标签
   *       code: 'Code', // 自定义代码标签
   *     },
   *   }}
   * />
   * ```
   *
   * @property {string[]} [Languages] - 支持的编程语言列表
   * @property {boolean} [hideToolBar] - 是否隐藏代码块工具栏
   * @property {boolean} [alwaysExpandedDeepThink] - 是否始终展开深度思考块
   * @property {boolean} [disableHtmlPreview] - 是否禁用 HTML 代码块的预览功能，禁用后只显示代码模式
   * @property {Object} [viewModeLabels] - 预览/代码切换按钮的标签配置
   * @property {string} [viewModeLabels.preview] - 预览模式的标签文本，默认为 '预览'
   * @property {string} [viewModeLabels.code] - 代码模式的标签文本，默认为 '代码'
   * @property {string} [theme] - 代码编辑器主题，如 'chrome', 'monokai', 'github', 'dracula' 等
   * @property {number} [fontSize] - 代码字体大小，默认 12
   * @property {number} [tabSize] - Tab 缩进大小，默认 4
   * @property {boolean} [showLineNumbers] - 是否显示行号，默认 true
   * @property {boolean} [showGutter] - 是否显示代码栏，默认 true
   * @property {boolean} [wrap] - 是否自动换行，默认 true
   */
  codeProps?: {
    Languages?: string[];
    hideToolBar?: boolean;
    alwaysExpandedDeepThink?: boolean;
    /** 是否禁用 HTML 代码块的预览功能，禁用后只显示代码模式 */
    disableHtmlPreview?: boolean;
    /** 预览/代码切换按钮的标签配置 */
    viewModeLabels?: {
      /** 预览模式的标签文本，默认为 '预览' */
      preview?: string;
      /** 代码模式的标签文本，默认为 '代码' */
      code?: string;
    };
  } & Partial<Ace.EditorOptions>;

  anchorProps?: AnchorProps;
  /**
   * 配置图片数据
   */
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
  /**
   * 只读模式
   */
  readonly?: boolean;
  /**
   * 懒加载渲染配置
   * 启用后，每个元素都会被包裹在一个使用 IntersectionObserver 的容器中
   * 只有当元素进入视口时才会真正渲染，以提升大型文档的性能
   *
   * @example
   * ```tsx
   * // 基本懒加载配置
   * lazy={{
   *   enable: true,
   *   placeholderHeight: 100,
   *   rootMargin: '200px'
   * }}
   *
   * // 自定义占位符渲染
   * lazy={{
   *   enable: true,
   *   placeholderHeight: 120,
   *   rootMargin: '300px',
   *   renderPlaceholder: ({ height, style, isIntersecting }) => (
   *     <div style={style}>
   *       <div>加载中... {isIntersecting ? '(即将显示)' : ''}</div>
   *     </div>
   *   )
   * }}
   * ```
   */
  lazy?: {
    /**
     * 是否启用懒加载，默认 false
     */
    enable?: boolean;
    /**
     * 占位符高度（单位：px），默认 25
     */
    placeholderHeight?: number;
    /**
     * 提前加载的距离，默认 '200px'
     * 支持所有 IntersectionObserver rootMargin 的值
     */
    rootMargin?: string;
    /**
     * 自定义占位符渲染函数
     * 允许开发者自定义懒加载时的占位符显示内容
     */
    renderPlaceholder?: (props: {
      /** 占位符高度 */
      height: number;
      /** 占位符样式 */
      style: React.CSSProperties;
      /** 元素是否即将进入视口 */
      isIntersecting: boolean;
      /** 元素在文档中的位置信息（可选） */
      elementInfo?: {
        /** 元素类型 */
        type: string;
        /** 元素在文档中的索引 */
        index: number;
        /** 元素总数量 */
        total: number;
      };
    }) => React.ReactNode;
  };
  /**
   * 样式
   */
  style?: React.CSSProperties;
  /**
   * 内容样式
   */
  contentStyle?: React.CSSProperties;
  /**
   * 工具栏配置
   */
  toolbarConfig?: {
    show?: boolean;
    items?: string[];
  };
  /**
   * 表格配置
   */
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
  };
  /**
   * 粘贴配置
   */
  pasteConfig?: {
    enabled?: boolean;
    allowedTypes?: string[];
  };
  /**
   * 插件配置
   */
  plugins?: any[];
  /**
   * 变更回调
   */
  onChange?: (value: string, schema: Elements[]) => void;
  /**
   * 选择变更回调
   * @param selection - Slate 选区对象
   * @param selectedMarkdown - 选中内容的 markdown 文本
   * @param selectedNodes - 选中的节点数组
   */
  onSelectionChange?: (
    selection: Selection | null,
    selectedMarkdown: string,
    selectedNodes: Elements[],
  ) => void;
  comment?: {
    /**
     * 是否启用评论功能
     */
    enable?: boolean;
    /**
     * 评论数据
     */
    commentList?: CommentDataType[];
    loadMentions?: (text: string) => Promise<{ name: string }[]>;
    /**
     * 添加评论的回调函数
     */
    onSubmit?: (id: string | number, comment: CommentDataType) => void;
    /**
     * 删除评论的回调函数
     */
    onDelete?: (id: string | number, comment: CommentDataType) => void;
    editorRender?: (dom: React.ReactNode) => React.ReactNode;
    onClick?: (id: string | number, comment: CommentDataType) => void;
    onEdit?: (id: string | number, comment: CommentDataType) => void;
    deleteConfirmText?: string;
    mentionsPlaceholder?: string;
    /**
     * 评论输入框占位符
     * @description 评论输入框的占位符文本，如果不提供则使用 titlePlaceholderContent
     */
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

  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;

  /**
   * 自定义 markdown 转 HTML 的 remark 插件配置，格式类似 Babel 插件数组
   */
  markdownToHtmlOptions?: MarkdownToHtmlOptions;

  linkConfig?: {
    /** 是否在新标签页打开链接 */
    openInNewTab?: boolean;
    /** 自定义链接渲染函数 */
    onClick?: (url?: string) => boolean | void;
  };

  /**
   * 依赖数组
   * @description 用于控制 MElement 组件是否刷新的依赖数组。当 deps 数组内容发生变化时，MElement 会重新渲染
   * @example ['user-id', 'theme', 'locale']
   */
  deps?: string[];

  /**
   * Apaasify 自定义渲染配置
   * @description 用于自定义渲染 apaasify 代码块的内容
   * @property {boolean} enable - 是否启用自定义渲染
   * @property {Function} render - 自定义渲染函数，接收 Schema 组件的 props 和 originData，返回 React 节点
   * @example
   * ```tsx
   * <MarkdownEditor
   *   apaasify={{
   *     enable: true,
   *     render: (props, originData) => {
   *       return <CustomSchemaRenderer schema={props.element.value} />;
   *     }
   *   }}
   * />
   * ```
   */
  apaasify?: {
    enable?: boolean;
    render?: (
      props: import('slate-react').RenderElementProps,
      originData?: import('../Bubble/type').MessageBubbleData,
    ) => React.ReactNode;
  };

  /**
   * Apassify 自定义渲染配置（兼容旧版本）
   * @description 与 apaasify 功能相同，用于向后兼容
   * @deprecated 请使用 apaasify 代替
   */
  apassify?: {
    enable?: boolean;
    render?: (
      props: import('slate-react').RenderElementProps,
      originData?: import('../Bubble/type').MessageBubbleData,
    ) => React.ReactNode;
  };

  children?: React.ReactNode;

  /**
   * 其他属性
   */
  [key: string]: any;
};
