import React from 'react';
import {
  Elements,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../../MarkdownEditor';
import type { AttachmentButtonProps } from '../AttachmentButton';
import type { SkillModeConfig } from '../SkillModeBar';
import type { CreateRecognizer } from '../VoiceInput';

/**
 * Markdown 输入字段的属性接口
 *
 * @interface MarkdownInputFieldProps
 * @property {string} [value] - 输入字段的当前文本值
 * @property {function} [onChange] - 当输入值改变时触发的回调函数
 * @property {string} [placeholder] - 输入字段的占位文本
 * @property {React.CSSProperties} [style] - 应用于输入字段的内联样式
 * @property {string} [className] - 应用于输入字段的 CSS 类名
 * @property {boolean} [disabled] - 是否禁用输入字段
 * @property {boolean} [typing] - 用户是否正在输入的状态标志
 * @property {'Enter'} [triggerSendKey] - 触发发送操作的键盘快捷键（Enter 发送，Shift+Enter 换行）
 * @property {function} [onSend] - 当内容发送时触发的异步回调函数
 */

export type MarkdownInputFieldProps = {
  /**
   * 当前的 markdown 文本值。
   * @example value="# Hello World"
   */
  value?: string;

  /**
   * 当输入值改变时触发的回调函数。
   * @param value The new markdown text value
   * @example onChange={(newValue) => setMarkdown(newValue)}
   */
  onChange?: (value: string) => void;

  /**
   * 输入字段的占位文本。
   * @example placeholder="Type markdown here..."
   */
  placeholder?: string;

  /**
   * 应用于输入字段的内联样式。
   * @example style={{ minHeight: '200px' }}
   */
  style?: React.CSSProperties;

  /**
   * 应用于输入字段的 CSS 类名。
   * @example className="custom-markdown-input"
   */
  className?: string;

  /**
   * 是否禁用输入字段。
   * @example disabled={isSubmitting}
   */
  disabled?: boolean;

  /**
   * 用户是否正在输入的状态标志。
   * @example typing={isComposing}
   */
  typing?: boolean;

  /**
   * 触发发送操作的键盘快捷键。
   * - 'Enter': 回车键触发发送，Shift+Enter 换行
   * @deprecated 此属性已废弃，现在固定使用 Enter 发送，Shift+Enter 换行
   * @example triggerSendKey="Enter"
   */
  triggerSendKey?: 'Enter';

  /**
   * 当内容发送时触发的异步回调函数。
   * 返回一个 Promise 对象，当发送成功后 resolve。
   * @param value The current markdown text value
   * @example onSend={async (text) => await submitMessage(text)}
   */
  onSend?: (value: string) => Promise<void>;

  /**
   * 正在输入中时点击发送按钮的回调函数。
   * @example onStop={() => console.log('Sending...')}
   */
  onStop?: () => void;

  /**
   * 当输入字段获得焦点时触发的回调函数。
   * @description 通过 markdownProps.onFocus 传递，当编辑器获得焦点时触发
   * @param value 当前的 markdown 文本值
   * @param schema 当前的编辑器 schema
   * @example onFocus={(value, schema) => console.log('Input focused:', value)}
   */
  onFocus?: (
    value: string,
    schema: Elements[],
    e: React.FocusEvent<HTMLDivElement, Element>,
  ) => void;

  /**
   * 当输入字段失去焦点时触发的回调函数。
   * @description 通过 markdownProps.onBlur 传递，当编辑器失去焦点时触发
   * @param value 当前的 markdown 文本值
   * @param schema 当前的编辑器 schema
   * @example onBlur={(value, schema) => console.log('Input blurred:', value)}
   */
  onBlur?: (
    value: string,
    schema: Elements[],
    e: React.MouseEvent<HTMLDivElement, Element>,
  ) => void;

  tagInputProps?: MarkdownEditorProps['tagInputProps'];
  /**
   * 背景颜色列表 - 用于生成渐变背景效果
   * @description 推荐使用 3-4 种颜色以获得最佳视觉效果
   * @default ['#CD36FF', '#FFD972', '#eff0f1']
   */
  bgColorList?: string[];
  borderRadius?: number;

  beforeToolsRender?: (
    props: MarkdownInputFieldProps & {
      isHover: boolean;
      isLoading: boolean;
    },
  ) => React.ReactNode;

  /**
   * 附件配置
   * @description 配置附件功能，可以启用或禁用附件上传，并自定义附件按钮的属性
   * @example
   * ```tsx
   * <BubbleChat
   *   attachment={{
   *     enable: true,
   *     accept: '.pdf,.doc,.docx',
   *     maxSize: 10 * 1024 * 1024, // 10MB
   *     onUpload: async (file) => {
   *       const url = await uploadFile(file);
   *       return { url };
   *     }
   *   }}
   * />
   * ```
   */
  attachment?: {
    enable?: boolean;
  } & AttachmentButtonProps;

  /**
   * 语音输入配置
   * @description 由外部提供语音转写实现，组件仅负责控制与UI，传空不展示语音输入按钮。
   *
   * onPartial `onPartial(text)` 为根据语音识别出的的最新片段。拿到后根据上一句起始位置替换
   */
  voiceRecognizer?: CreateRecognizer;

  /**
   * 自定义操作按钮渲染函数
   * @description 用于自定义渲染输入框右侧的操作按钮区域
   * @param {Object} props - 包含组件所有属性以及当前状态的对象
   * @param {boolean} props.isHover - 当前是否处于悬停状态
   * @param {boolean} props.isLoading - 当前是否处于加载状态
   * @param {'uploading' | 'done' | 'error'} props.fileUploadStatus - 文件上传状态
   * @param {React.ReactNode[]} defaultActions - 默认的操作按钮列表
   * @returns {React.ReactNode[]} 返回要渲染的操作按钮节点数组
   * @example
   * ```tsx
   * <MarkdownInputField
   *   actionsRender={(props, defaultActions) => [
   *     <CustomButton key="custom" />,
   *     ...defaultActions
   *   ]}
   * />
   * ```
   */
  actionsRender?: (
    props: MarkdownInputFieldProps &
      MarkdownInputFieldProps['attachment'] & {
        isHover: boolean;
        isLoading: boolean;
        collapseSendActions?: boolean;
        fileUploadStatus: 'uploading' | 'done' | 'error';
      },
    defaultActions: React.ReactNode[],
  ) => React.ReactNode[];

  /**
   * 自定义工具栏渲染函数
   * @description 用于自定义渲染输入框左侧的工具栏区域
   * @param {Object} props - 包含组件所有属性以及当前状态的对象
   * @param {boolean} props.isHover - 当前是否处于悬停状态
   * @param {boolean} props.isLoading - 当前是否处于加载状态
   * @param {'uploading' | 'done' | 'error'} props.fileUploadStatus - 文件上传状态
   * @returns {React.ReactNode[]} 返回要渲染的工具栏节点数组
   * @example
   * ```tsx
   * <MarkdownInputField
   *   toolsRender={(props) => [
   *     <FormatButton key="format" />,
   *     <EmojiPicker key="emoji" />
   *   ]}
   * />
   * ```
   */
  toolsRender?: (
    props: MarkdownInputFieldProps &
      MarkdownInputFieldProps['attachment'] & {
        isHover: boolean;
        isLoading: boolean;
        fileUploadStatus: 'uploading' | 'done' | 'error';
      },
  ) => React.ReactNode[];

  /**
   * 自定义右上操作按钮渲染函数
   * @description 在编辑区域右上角、贴靠右侧渲染一组操作按钮，组件会根据其宽度为编辑区域自动预留右侧内边距，避免遮挡文本。
   * @param {Object} props - 包含组件所有属性以及当前状态的对象
   * @param {boolean} props.isHover - 当前是否处于悬停状态
   * @param {boolean} props.isLoading - 当前是否处于加载状态
   * @param {'uploading' | 'done' | 'error'} props.fileUploadStatus - 文件上传状态
   * @returns {React.ReactNode[]} 返回要渲染的操作按钮节点数组
   * @example
   * ```tsx
   * <MarkdownInputField
   *   quickActionRender={(props) => [
   *     <MyQuickAction key="quick-action" />,
   *   ]}
   * />
   * ```
   */
  quickActionRender?: (
    props: MarkdownInputFieldProps &
      MarkdownInputFieldProps['attachment'] & {
        isHover: boolean;
        isLoading: boolean;
        fileUploadStatus: 'uploading' | 'done' | 'error';
      },
  ) => React.ReactNode[];

  /**
   * 提示词优化配置
   * @description 提示词优化功能，透传当前文本A，返回优化后的文本B。
   * enable=true 时展示；点击后调用 onRefine，将当前文本A传入，使用返回文本B替换输入框内容。
   */
  refinePrompt?: {
    enable: boolean;
    onRefine: (input: string) => Promise<string>;
  };
  /**
   * 放大功能配置
   * @description 仅保留对象形态：{ enable: boolean }
   * @default { enable: false }
   * @example
   * ```tsx
   * <MarkdownInputField enlargeable={{ enable: true }} />
   * ```
   */
  enlargeable?: {
    enable?: boolean;
    /** 放大状态下的目标高度（px），默认 980 */
    height?: number;
  };

  /**
   * Markdown 编辑器实例的引用
   * @description 用于获取编辑器实例，可以通过该实例调用编辑器的方法
   * @type {React.MutableRefObject<MarkdownEditorInstance | undefined>}
   * @example
   * ```tsx
   * const editorRef = useRef<MarkdownEditorInstance>();
   *
   * <MarkdownInputField
   *   inputRef={editorRef}
   * />
   *
   * // 使用编辑器实例
   * editorRef.current?.store?.clearContent();
   * ```
   */
  inputRef?: React.MutableRefObject<MarkdownEditorInstance | undefined>;

  /**
   * 自定义叶子节点渲染函数
   * @description 用于自定义文本节点的渲染方式，可以控制文本的样式和行为
   * @param props - 叶子节点渲染属性
   * @param defaultDom - 默认的叶子节点渲染结果
   * @returns 自定义的叶子节点渲染结果
   * @example
   * ```tsx
   * <MarkdownInputField
   *   leafRender={(props, defaultDom) => {
   *     if (props.leaf.bold) {
   *       return <strong style={{ color: 'red' }}>{props.children}</strong>;
   *     }
   *     return defaultDom;
   *   }}
   * />
   * ```
   */
  leafRender?: MarkdownEditorProps['leafRender'];

  /**
   * Markdown 编辑器的其他配置项
   */
  markdownProps?: MarkdownEditorProps;

  /**
   * 粘贴配置
   * @description 配置粘贴到编辑器时支持的内容类型
   * @example
   * ```tsx
   * <MarkdownInputField
   *   pasteConfig={{
   *     enabled: true,
   *     allowedTypes: ['text/plain', 'text/html', 'text/markdown']
   *   }}
   * />
   * ```
   */
  pasteConfig?: {
    /**
     * 是否启用粘贴功能
     * @default true
     */
    enabled?: boolean;
    /**
     * 允许的粘贴内容类型
     * @default ['application/x-slate-md-fragment', 'text/html', 'Files', 'text/markdown', 'text/plain']
     */
    allowedTypes?: Array<
      | 'application/x-slate-md-fragment'
      | 'text/html'
      | 'Files'
      | 'text/markdown'
      | 'text/plain'
    >;
  };

  /**
   * 技能模式配置
   * @description 配置技能模式的显示和行为，可以显示特定的技能或AI助手模式
   * @example
   * ```tsx
   * <MarkdownInputField
   *   skillMode={{
   *     open: skillModeEnabled,
   *     title: "AI助手模式",
   *     rightContent: [
   *       <Tag key="version">v2.0</Tag>,
   *       <Button key="settings" size="small">设置</Button>
   *     ],
   *     closable: true
   *   }}
   *   onSkillModeOpenChange={(open) => {
   *     console.log(`技能模式${open ? '打开' : '关闭'}`);
   *     setSkillModeEnabled(open);
   *   }}
   * />
   * ```
   */
  skillMode?: SkillModeConfig;

  /**
   * 技能模式开关状态变化时触发的回调函数
   * @description 监听技能模式 open 状态的所有变化，包括用户点击关闭按钮和外部直接修改状态
   * @param open 新的开关状态
   * @example onSkillModeOpenChange={(open) => {
   *   console.log(`技能模式${open ? '打开' : '关闭'}`);
   *   setSkillModeEnabled(open);
   * }}
   */
  onSkillModeOpenChange?: (open: boolean) => void;

  /**
   * 是否允许在内容为空时也触发发送
   * @description 默认情况下输入内容为空（且无附件、未录音）时点击发送按钮不会触发 onSend。开启该配置后即使内容为空字符串也会调用 onSend('')。
   * @default false
   * @example
   * <MarkdownInputField allowEmptySubmit onSend={(v) => submit(v)} /> // v 可能为 ''
   */
  allowEmptySubmit?: boolean;

  /**
   * 是否显示顶部操作区域
   * @description 控制是否渲染顶部操作区域组件
   * @default false
   * @example
   * <MarkdownInputField isShowTopOperatingArea={false} />
   */
  isShowTopOperatingArea?: boolean;

  /**
   * 顶部操作区域回到顶部/底部功能的目标元素引用
   * @description 传递给 TopOperatingArea 组件中 BackTo 功能的目标滚动容器引用，如果不传则默认为 window
   * @example
   * ```tsx
   * const scrollRef = useRef<HTMLDivElement>(null);
   *
   * <div ref={scrollRef} style={{ height: '400px', overflow: 'auto' }}>
   *   <MarkdownInputField targetRef={scrollRef} />
   * </div>
   * ```
   */
  targetRef?: React.RefObject<HTMLDivElement>;

  /**
   * 顶部操作区域自定义操作按钮渲染函数
   * @description 用于在顶部操作区域中央渲染自定义操作按钮
   * @returns 要渲染的操作按钮节点
   * @example
   * ```tsx
   * <MarkdownInputField
   *   operationBtnRender={() => (
   *     <>
   *       <Button>按钮1</Button>
   *       <Button>按钮2</Button>
   *     </>
   *   )}
   * />
   * ```
   */
  operationBtnRender?: () => React.ReactNode;

  /**
   * 是否在顶部操作区域显示回到顶部/底部按钮
   * @description 控制顶部操作区域右侧是否显示回到顶部和回到底部的按钮功能
   * - 当为 `true` 时，显示回到顶部和回到底部按钮
   * - 当为 `false` 时，隐藏这些按钮
   * - 按钮会根据滚动位置自动判断是否显示（需要滚动距离大于5px）
   * @default true
   * @example
   * ```tsx
   * <MarkdownInputField
   *   isShowTopOperatingArea={true}
   *   isShowBackTo={false} // 隐藏回到顶部/底部按钮
   *   targetRef={scrollRef}
   * />
   * ```
   */
  isShowBackTo?: boolean;

  /**
   * 输入框的最大高度（像素）
   * @description 设置输入框的最大高度，超出部分将显示滚动条。如果同时设置了 style.maxHeight，则以该属性优先
   * @example
   * ```tsx
   * <MarkdownInputField maxHeight={300} />
   * ```
   */
  maxHeight?: number | string;

  /**
   * 输入文本的最大字符数限制
   * @description 限制输入文本的最大字符数，超出限制后将无法继续输入
   * @example
   * ```tsx
   * <MarkdownInputField maxLength={500} />
   * ```
   */
  maxLength?: number;

  /**
   * 当输入达到最大长度限制时的回调函数
   * @description 当用户尝试输入超出最大长度限制的内容时触发
   * @example
   * ```tsx
   * <MarkdownInputField
   *   maxLength={100}
   *   onMaxLengthExceeded={() => {
   *     message.warning('已达到最大字数限制');
   *   }}
   * />
   * ```
   */
  onMaxLengthExceeded?: (value: string) => void;
};
