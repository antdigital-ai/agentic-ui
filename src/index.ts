/**
 * @ant-design/agentic-ui 公共 API 入口
 *
 * 导出规则：
 *   1. 每个组件仅通过其 index 导出，不深入引用内部子模块
 *   2. 需要向外暴露的内部工具 / 类型，先在各组件 index 中 re-export，再由此处统一引用
 *   3. 第三方类型不直接 re-export，使用自定义类型包装
 *   4. 按功能分区，便于维护
 *   5. 使用具名导出替代 export * from，便于 bundler tree-shaking
 */

// ─── Slate 类型 re-export（唯一的第三方类型例外） ───────────────────────────
export type { RenderElementProps } from 'slate-react';

// ─── 通用类型 ────────────────────────────────────────────────────────────────
export {
  type BaseStyleProps,
  type MultiStyleProps,
  type MultiClassNameProps,
  type WithFalse,
  type RoleType,
  type FeedbackType,
  type BaseStateProps,
  type BubbleMetaData,
  type MessageBubbleData,
} from './Types';

// ─── 布局组件 ────────────────────────────────────────────────────────────────
export { AgenticLayout, type AgenticLayoutProps } from './AgenticLayout';
export { default as Workspace } from './Workspace';
export { type BrowserItem, type BrowserSuggestion } from './Workspace/types';
export {
  type FileActionRef,
  File,
  FileTree,
  PreviewComponent,
  type PreviewComponentProps,
  getFileTypeName,
  type FileBuiltinActions,
  type FileNode,
  type FileProps,
  type FileRenderContext,
  type FileTreeNode,
  type FileTreeProps,
  type FileType,
  type GroupNode,
  getFileTypeIcon,
  getGroupIcon,
  type HtmlPreviewProps,
  type BrowserProps,
  type CustomProps,
  type RealtimeProps,
  type TabConfiguration,
  type TabItem,
  type TaskProps,
  type WorkspacePanelType,
  type WorkspaceProps,
} from './Workspace';

// ─── 聊天气泡 ────────────────────────────────────────────────────────────────
export {
  AIBubble,
  runRender,
  Bubble,
  type ChatConfigType,
  BubbleConfigContext,
  PureBubbleList,
  PureAIBubble,
  PureBubble,
  PureUserBubble,
  MessagesContext,
  type BubbleImperativeHandle,
  type BubbleStyleProps,
  type BubbleSlotStyles,
  type BubbleSlotClassNames,
  type BubbleStyles,
  type BubbleClassNames,
  type BubbleItemStyleProps,
  type CustomConfig,
  type BubbleRenderConfig,
  type BubbleProps,
  UserBubble,
  SchemaEditorBridgeManager,
  type BubbleHandler,
  useSchemaEditorBridge,
  type UseSchemaEditorBridgeResult,
  mapOllamaMessagesToMessageBubbleData,
  mapOpenAIMessagesToMessageBubbleData,
  mapOpenClawMessagesToMessageBubbleData,
  normalizeOllamaMessageToOpenAI,
  normalizeOllamaMessagesToOpenAI,
  normalizeOpenClawMessageToOpenAI,
  normalizeOpenClawMessagesToOpenAI,
  type OllamaChatMessage,
  type OllamaMessagesMapOptions,
  type OllamaToolCall,
  type OpenClawChatMessage,
  type OpenClawChatMessageToolResult,
  type OpenClawChatMeta,
  type OpenClawMessagesMapOptions,
  type OpenAIChatContentPart,
  type OpenAIChatContentPartFallback,
  type OpenAIChatMessage,
  type OpenAIChatMessageAssistant,
  type OpenAIChatMessageFunction,
  type OpenAIChatMessageSystem,
  type OpenAIChatMessageTool,
  type OpenAIChatMessageUser,
  type OpenAIChatRefusalPart,
  type OpenAIChatTextPart,
  type OpenAIMessagesMapMessage,
  type OpenAIMessagesMapOptions,
  useOllamaMessageBubbleData,
  useOpenAIMessageBubbleData,
  useOpenClawMessageBubbleData,
} from './Bubble';
export { BubbleList, type BubbleListProps } from './Bubble/List';
export {
  type UseSpeechSynthesisOptions,
  type UseSpeechSynthesisResult,
  type UseSpeechAdapter,
} from './Bubble/MessagesContent/VoiceButton/types';
export { type DocInfoListProps } from './Bubble/types/DocInfo';

// ─── 聊天启动页 ──────────────────────────────────────────────────────────────
export {
  Title,
  type TitleProps,
  CaseReply,
  type CaseReplyProps,
  ButtonTab,
  type ButtonTabProps,
  ButtonTabGroup,
  type ButtonTabGroupProps,
  type ButtonTabItem,
} from './ChatBootPage';
export {
  ChatLayout,
  ChatFlowHeader,
  type ChatFlowHeaderProps,
  type ChatLayoutProps,
  type ChatLayoutRef,
} from './ChatLayout';

// ─── 思维链 / 工具调用 ──────────────────────────────────────────────────────
export {
  type Chunk,
  type DocMeta,
  type ThoughtChainListProps,
  type WhiteBoxProcessInterface,
  ThoughtChainList,
} from './ThoughtChainList';
export { ToolUseBarItem, type ToolCall, type ToolUseBarItemProps, ToolUseBar } from './ToolUseBar';
export { ToolUseBarThink, type ToolUseBarThinkProps } from './ToolUseBarThink';

// ─── 任务相关 ────────────────────────────────────────────────────────────────
export {
  type TaskRunningVariant,
  type TaskRunningActionsRender,
  type TaskRunningProps,
  TASK_STATUS,
  TASK_RUNNING_STATUS,
  TaskRunning,
} from './AgentRunBar';
export {
  TaskList,
  type TaskItem,
  type TaskListProps,
  type TaskListVariant,
  type TaskStatus,
  type ThoughtChainProps,
} from './TaskList';

// ─── 历史记录 ────────────────────────────────────────────────────────────────
export {
  HistoryActionsBox,
  HistoryItem,
  generateHistoryItems,
  HistoryRunningIcon,
  type HistoryRunningIconContainerProps,
  type HistoryRunningIconProps,
  HistoryEmpty,
  HistoryLoadMore,
  HistoryNewChat,
  HistorySearch,
  useHistory,
  type HistoryProps,
  type HistoryActionsBoxProps,
  type ActionsBoxProps,
  type TaskStatusEnum,
  TaskStatusData,
  type HistoryDataType,
  type HistoryChatType,
  formatTime,
  groupByCategory,
  History,
} from './History';
export { type HistoryListConfig } from './History/types/HistoryList';

// ─── Markdown 渲染器（流式/只读轻量渲染，无 Slate 依赖） ─────────────────────
export {
  AnimationText,
  type AnimationConfig,
  type AnimationTextProps,
  CharacterQueue,
  type UseMarkdownToReactOptions,
  MarkdownRenderer,
  AgenticUiFileMapBlockRenderer,
  AgenticUiTaskBlockRenderer,
  AgenticUiToolUseBarBlockRenderer,
  ChartBlockRenderer,
  CodeBlockRenderer,
  MermaidBlockRenderer,
  SchemaBlockRenderer,
  useStreamingMarkdownReact,
  type CharacterQueueOptions,
  type FileMapConfig,
  type MarkdownRendererEleProps,
  type MarkdownRendererProps,
  type MarkdownRendererRef,
  type RenderMode,
  type RendererBlockProps,
  markdownToReactSync,
  useMarkdownToReact,
  useStreaming,
} from './MarkdownRenderer';

// ─── Markdown 编辑器 ─────────────────────────────────────────────────────────
export {
  EditorUtils,
  parserMdToSchema,
  sanitizeEditorChromeStyle,
  dragStart,
  MElement,
  MLeaf,
  Blockquote,
  Break,
  Code,
  Head,
  Hr,
  InlineKatex,
  Katex,
  List,
  ListItem,
  Media,
  Mermaid,
  Paragraph,
  ReadonlyBlockquote,
  ReadonlyBreak,
  ReadonlyCard,
  ReadonlyCode,
  ReadonlyEditorImage,
  ReadonlyFootnoteDefinition,
  ReadonlyFootnoteReference,
  ReadonlyHead,
  ReadonlyHr,
  ReadonlyInlineKatex,
  ReadonlyKatex,
  ReadonlyLinkCard,
  ReadonlyList,
  ReadonlyListItem,
  ReadonlyMedia,
  ReadonlyMermaid,
  ReadonlyParagraph,
  ReadonlySchema,
  ReadonlyTableComponent,
  Schema,
  nid,
  copy,
  isMod,
  download,
  modal$,
  isMarkdown,
  debounce,
  useDebounce,
  useGetSetState,
  MARKDOWN_EDITOR_EVENTS,
  parserSlateNodeToMarkdown,
  isMix,
  getDefaultView,
  isDOMNode,
  isEventHandled,
  hasTarget,
  isTargetInsideVoid,
  createSelectionFromNodes,
  createDomRangeFromNodes,
  getSelectionFromDomSelection,
  hasEditableTarget,
  getPointStrOffset,
  getRelativePath,
  calcPath,
  isPath,
  findLeafPath,
  escapeRegExp,
  normalizeMarkdownSearchText,
  findByPathAndText,
  type Methods,
  KeyboardTask,
  useSystemKeyboard,
  getRemoteMediaType,
  convertRemoteImages,
  isLink,
  parsePath,
  toUnixPath,
  useLocalState,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
  type DetailedSettings,
  type CodeNode,
  type ParagraphNode,
  type FootnoteDefinitionNode,
  type CardNode,
  type CardBeforeNode,
  type CardAfterNode,
  type BlockQuoteNode,
  type BulletedListNode,
  type NumberedListNode,
  type ListNode,
  type ChartTypeConfig,
  type ChartNode,
  type ListItemNode,
  type HeadNode,
  type HrNode,
  type BreakNode,
  type MediaNode,
  type LinkCardNode,
  type AttachNode,
  type SchemaNode,
  type Elements,
  type CustomLeaf,
  type NodeTypes,
  type MapValue,
  type InlineKatexNode,
  type ElementProps,
  type CommentDataType,
  type JinjaTemplateItem,
  type JinjaTemplatePanelItems,
  type JinjaTemplatePanelConfig,
  type JinjaConfig,
  type IEditor,
  type MarkdownEditorInstance,
  type MarkdownEditorProps,
  ReadonlyMarkdownEditorView,
  BaseMarkdownEditor,
  MarkdownEditor,
} from './MarkdownEditor';
export { useSelStatus } from './MarkdownEditor/hooks/editor';
export { type RendererPlugin, type MarkdownEditorPlugin, PluginContext } from './MarkdownEditor/plugin';
export {
  createJinjaPlugin,
  jinjaPlugin,
  type JinjaPluginOptions,
} from './MarkdownEditor/plugins/jinja';

// MarkdownEditor 内部工具（保持向后兼容，后续版本考虑收敛）
export { CommentList, ContributorAvatar, AvatarList, TextStyleTag, type LazyElementProps, LazyElement } from './MarkdownEditor/editor/components/index';
export { SlateTable } from './MarkdownEditor/editor/elements/Table/Table';
export { type TableContextValue, TablePropsContext, TablePropsProvider } from './MarkdownEditor/editor/elements/Table/TableContext';
export { partialParse } from './MarkdownEditor/editor/parser/json-parse';
export { clearParseCache, simpleHash, type ParserMarkdownToSlateNodeConfig, MarkdownToSlateParser, parserMarkdownToSlateNode } from './MarkdownEditor/editor/parser/parserMarkdownToSlateNode';
export { parserSlateNodeToMarkdown as parserSlateNodeToMarkdownDirect, isMix as isMixDirect } from './MarkdownEditor/editor/parser/parserSlateNodeToMarkdown';
export { type EditorStoreContextType, EditorStoreContext, useEditorStore, EditorStore } from './MarkdownEditor/editor/store';
export {
  type HtmlToMarkdownOptions,
  htmlToMarkdown,
  cleanHtml,
  isHtml,
  extractTextFromHtml,
  batchHtmlToMarkdown,
} from './MarkdownEditor/editor/utils/htmlToMarkdown';
export {
  type MarkdownRemarkPlugin,
  type MarkdownToHtmlOptions,
  type MarkdownToHtmlConfig,
  escapeHtml,
  REMARK_REHYPE_DIRECTIVE_HANDLERS,
  DEFAULT_MARKDOWN_REMARK_PLUGINS,
  markdownToHtml,
  markdownToHtmlSync,
} from './MarkdownEditor/editor/utils/markdownToHtml';
export {
  docxDeserializer,
  TEXT_TAGS,
  makeDeserializer,
  imagePastingListener,
  extractTagsFromHtml,
} from './MarkdownEditor/editor/utils/docx/index';
export {
  type CellElement,
  type Edge,
  type NodeEntryWithContext,
  type SelectionMode,
  type WithType,
  NativeTableEditor,
} from './MarkdownEditor/utils/native-table/native-table-editor';

// ─── Markdown 输入框 ─────────────────────────────────────────────────────────
export {
  SupportedFileFormats,
  type SupportedFormat,
  AttachmentSupportedFormatsContent,
  type AttachmentButtonPopoverProps,
  AttachmentButtonPopover,
  type AttachmentFile,
  type UploadResponse,
  type AttachmentButtonProps,
  upLoadFileToServer,
  AttachmentButton,
} from './MarkdownInputField/AttachmentButton';
export { AttachmentFileList, type AttachmentFileListProps } from './MarkdownInputField/AttachmentButton/AttachmentFileList';
export { AttachmentFileListItem } from './MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileListItem';
export {
  kbToSize,
  isImageFile,
  isVideoFile,
  isMediaFile,
  isAttachmentFileLoading,
  isFileMetaPlaceholderState,
  getDeviceBrand,
  isVivoDevice,
  isOppoDevice,
  isVivoOrOppoDevice,
  isMobileDevice,
  isWeChat,
} from './MarkdownInputField/AttachmentButton/utils';
export { ActionItemContainer } from './MarkdownInputField/BeforeToolContainer/BeforeToolContainer';
export { FileMapView, type FileMapViewProps } from './MarkdownInputField/FileMapView';
export { type MarkdownInputFieldProps, MarkdownInputField } from './MarkdownInputField/MarkdownInputField';
export { MARKDOWN_INPUT_FIELD_TEST_IDS } from './MarkdownInputField/testIds';
export { VoiceInputButton, type VoiceRecognizer, type CreateRecognizer } from './MarkdownInputField/VoiceInput';

// ─── Schema ──────────────────────────────────────────────────────────────────
export {
  type LowCodeSchema,
  type SchemaEditorProps,
  type SchemaEditorRef,
  type SchemaFormProps,
  SchemaEditor,
  SchemaForm,
  SchemaRenderer,
  SchemaValidator,
  TemplateEngine,
  validator,
} from './Schema';

// ─── 插件 ────────────────────────────────────────────────────────────────────
export {
  ChartAttrToolBar,
  Area,
  Bar,
  Column,
  Line,
  Pie,
  ChartRender,
  AreaChart,
  BarChart,
  BoxPlotChart,
  ChartStatistic,
  DonutChart,
  FunnelChart,
  HistogramChart,
  LineChart,
  RadarChart,
  ScatterChart,
  type AreaChartConfigItem,
  type AreaChartDataItem,
  type AreaChartProps,
  type BarChartConfigItem,
  type BarChartDataItem,
  type BarChartProps,
  type BoxPlotChartDataItem,
  type BoxPlotChartProps,
  type ChartStatisticClassNames,
  type ChartStatisticProps,
  type ChartStatisticStyles,
  type DonutChartConfig,
  type DonutChartData,
  type DonutChartProps,
  type FunnelChartDataItem,
  type FunnelChartProps,
  type HistogramChartDataItem,
  type HistogramChartProps,
  type LineChartConfigItem,
  type LineChartDataItem,
  type LineChartProps,
  type RadarChartDataItem,
  type ScatterChartDataItem,
  type ScatterChartProps,
  defaultColorList,
  chartDebounce,
  stringFormatNumber,
  type ChartClassNames,
  type ChartStyles,
  type ClassNameType,
  ChartFilter,
  ChartToolBar,
  downloadChart,
  type ChartFilterProps,
  type ChartToolBarProps,
  type FilterOption,
  type RegionOption,
  ChartElement,
} from './Plugins/chart';
export {
  AceEditor,
  AceEditorContainer,
  CodeContainer,
  CodeRenderer,
  CodeToolbar,
  type CodeToolbarProps,
  HtmlPreview,
  LanguageSelector,
  type LanguageSelectorProps,
  LoadImage,
  ThinkBlock,
  type ThinkBlockContextType,
  ThinkBlockProvider,
} from './Plugins/code/components';
export { MarkdownFormatter } from './Plugins/formatter';
export { MermaidElement } from './Plugins/mermaid';

// ─── 基础 UI 组件 ────────────────────────────────────────────────────────────
export { AILabel, type AILabelStatus, type AILabelProps } from './AILabel';
export { AnswerAlert, type AnswerAlertProps } from './AnswerAlert';
export { type BackBottomProps, type BackTopProps, BackTo } from './BackTo';
export { default as Quote } from './Quote';
export type { QuoteProps } from './Quote';
export {
  WelcomeMessage,
  type WelcomeMessageTitleAnimateProps,
  type WelcomeMessageDescriptionAnimateProps,
  type WelcomeMessageProps,
} from './WelcomeMessage';

// ─── 通用子组件 ──────────────────────────────────────────────────────────────
export { ActionIconBox, type ActionIconBoxProps } from './Components/ActionIconBox';
export { ActionItemBox } from './Components/ActionItemBox';
export { IconButton, type IconButtonProps, SwitchButton, type SwitchButtonProps, ToggleButton, type ToggleButtonProps } from './Components/Button';
export { GradientText, type GradientTextProps } from './Components/GradientText';
export { type LayoutHeaderConfig, type LayoutHeaderProps, LayoutHeader } from './Components/LayoutHeader';
export { CreativeRecommendationLoading, CreativeSparkLoading, Loading } from './Components/Loading';
export {
  CopyLottie, type CopyLottieProps,
  DislikeLottie, type DislikeLottieProps,
  LikeLottie, type LikeLottieProps,
  MoreLottie, type MoreLottieProps,
  PlayLottie, type PlayLottieProps,
  QuoteLottie, type QuoteLottieProps,
  RefreshLottie, type RefreshLottieProps,
  ShareLottie, type ShareLottieProps,
  useAsyncLottieData,
  CreativeSparkLottie, type CreativeSparkLottieProps,
  DazingLottie, type DazingLottieProps,
  LoadingLottie, type LoadingLottieProps,
  TextLoading, type TextLoadingProps,
  ThinkingLottie, type ThinkingLottieProps,
  ThreeThinkingLottie, type ThreeThinkingLottieProps,
} from './Components/lotties';
export {
  BlowingWindLottie, type BlowingWindLottieProps,
  BouncingLottie, type BouncingLottieProps,
  PeekLottie, type PeekLottieProps,
  type RobotStatus,
  type RobotProps,
} from './Components/Robot';
export { default as Robot } from './Components/Robot';
export { SuggestionList, type SuggestionItem, type SuggestionListProps } from './Components/SuggestionList';
export { resolveSegments, TextAnimate, type TextAnimateProps } from './Components/TextAnimate';
export { TypingAnimation, type TypingAnimationProps } from './Components/TypingAnimation';
export { VisualList, type VisualListItem, type VisualListProps } from './Components/VisualList';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useAutoScroll } from './Hooks/useAutoScroll';
export { useLanguage } from './Hooks/useLanguage';
export { useRefFunction } from './Hooks/useRefFunction';
export { type CSSInterpolation, type GenerateStyle, type ChatTokenType, resetComponent, useEditorStyleRegister } from './Hooks/useStyle';
export { useThrottleFn } from './Hooks/useThrottleFn';

// ─── 国际化 ──────────────────────────────────────────────────────────────────
export {
  cnLabels,
  enLabels,
  type LocalKeys,
  detectUserLanguage,
  getLocaleByLanguage,
  saveUserLanguage,
  I18nContext,
  useLocale,
  useMergedLocale,
  I18nProvide,
  compileTemplate,
} from './I18n';

// ─── 工具 / 沙箱 ────────────────────────────────────────────────────────────
export {
  ProxySandbox,
  createSandbox,
  runInSandbox,
  type SandboxConfig,
  type SandboxResult,
  SecurityContextManager,
  createSecurityContextManager,
  runInSecureContext,
  type ExecutionContext,
  type MonitoringConfig,
  type PermissionConfig,
  type ResourceLimits,
  type SecurityContextConfig,
  type SandboxInstance,
  type SecurityManager,
  DEFAULT_SANDBOX_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  createConfiguredSandbox,
  quickExecute,
  safeMathEval,
  SandboxHealthChecker,
  sandboxHealthChecker,
} from './Utils/proxySandbox';

// ─── 第三方 SDK re-export（向后兼容，后续版本考虑移除） ───────────────────────
/**
 * Schema Element Editor Chrome 插件底层 SDK
 * @description 原始 SDK 导出，一般用户无需直接使用
 * @deprecated @since 2.30.0 建议直接从 @schema-element-editor/host-sdk 导入
 */
export {
  createSchemaElementEditorBridge,
  useSchemaElementEditor,
  type MethodLevelConfig,
  type PostMessageSourceConfig,
  type PostMessageTypeConfig,
  type ReactSchemaElementEditorConfig,
  type SchemaElementEditorBridge,
  type SchemaElementEditorConfig,
  type SchemaElementEditorRecording,
  type SchemaValue,
} from '@schema-element-editor/host-sdk';