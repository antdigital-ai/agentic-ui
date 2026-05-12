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
  type BaseStateProps,
  type BaseStyleProps,
  type BubbleMetaData,
  type FeedbackType,
  type MessageBubbleData,
  type MultiClassNameProps,
  type MultiStyleProps,
  type RoleType,
  type WithFalse,
} from './Types';

// ─── 布局组件 ────────────────────────────────────────────────────────────────
export { AgenticLayout, type AgenticLayoutProps } from './AgenticLayout';
export {
  File,
  FileTree,
  PreviewComponent,
  default as Workspace,
  getFileType,
  getFileTypeIcon,
  getFileTypeName,
  getGroupIcon,
  type BrowserProps,
  type CustomProps,
  type FileActionRef,
  type FileBuiltinActions,
  type FileNode,
  type FilePanelViewMode,
  type FileProps,
  type FileRenderContext,
  type FileTreeNode,
  type FileTreeProps,
  type FileTreeSwitchConfig,
  type FileType,
  type GroupNode,
  type HtmlPreviewProps,
  type PreviewComponentProps,
  type RealtimeProps,
  type TabConfiguration,
  type TabItem,
  type TaskProps,
  type WorkspacePanelType,
  type WorkspaceProps,
} from './Workspace';
export { type BrowserItem, type BrowserSuggestion } from './Workspace/types';

// ─── 聊天气泡 ────────────────────────────────────────────────────────────────
export {
  AIBubble,
  Bubble,
  BubbleConfigContext,
  MessagesContext,
  PureAIBubble,
  PureBubble,
  PureBubbleList,
  PureUserBubble,
  SchemaEditorBridgeManager,
  UserBubble,
  mapOllamaMessagesToMessageBubbleData,
  mapOpenAIMessagesToMessageBubbleData,
  mapOpenClawMessagesToMessageBubbleData,
  normalizeOllamaMessageToOpenAI,
  normalizeOllamaMessagesToOpenAI,
  normalizeOpenClawMessageToOpenAI,
  normalizeOpenClawMessagesToOpenAI,
  runRender,
  useOllamaMessageBubbleData,
  useOpenAIMessageBubbleData,
  useOpenClawMessageBubbleData,
  useSchemaEditorBridge,
  type BubbleClassNames,
  type BubbleHandler,
  type BubbleImperativeHandle,
  type BubbleItemStyleProps,
  type BubbleProps,
  type BubbleRenderConfig,
  type BubbleSlotClassNames,
  type BubbleSlotStyles,
  type BubbleStyleProps,
  type BubbleStyles,
  type ChatConfigType,
  type CustomConfig,
  type OllamaChatMessage,
  type OllamaMessagesMapOptions,
  type OllamaToolCall,
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
  type OpenClawChatMessage,
  type OpenClawChatMessageToolResult,
  type OpenClawChatMeta,
  type OpenClawMessagesMapOptions,
  type UseSchemaEditorBridgeResult,
} from './Bubble';
export { BubbleList, type BubbleListProps } from './Bubble/List';
export {
  type UseSpeechAdapter,
  type UseSpeechSynthesisOptions,
  type UseSpeechSynthesisResult,
} from './Bubble/MessagesContent/VoiceButton/types';
export { type DocInfoListProps } from './Bubble/types/DocInfo';

// ─── 聊天启动页 ──────────────────────────────────────────────────────────────
export {
  ButtonTab,
  ButtonTabGroup,
  CaseReply,
  Title,
  type ButtonTabGroupProps,
  type ButtonTabItem,
  type ButtonTabProps,
  type CaseReplyProps,
  type TitleProps,
} from './ChatBootPage';
export {
  ChatFlowHeader,
  ChatLayout,
  type ChatFlowHeaderProps,
  type ChatLayoutProps,
  type ChatLayoutRef,
  type ChatLayoutScrollState,
} from './ChatLayout';

// ─── 思维链 / 工具调用 ──────────────────────────────────────────────────────
export {
  ThoughtChainList,
  type Chunk,
  type DocMeta,
  type ThoughtChainListProps,
  type WhiteBoxProcessInterface,
} from './ThoughtChainList';
export {
  ToolUseBar,
  ToolUseBarItem,
  type ToolCall,
  type ToolUseBarItemProps,
} from './ToolUseBar';
export { ToolUseBarThink, type ToolUseBarThinkProps } from './ToolUseBarThink';

// ─── 任务相关 ────────────────────────────────────────────────────────────────
export {
  AGENT_RUN_BAR_TEST_ID,
  AgentRunBar,
  TASK_RUNNING_STATUS,
  TASK_STATUS,
  /** @deprecated 请使用 `AgentRunBar` */
  TaskRunning,
  TaskRunningStatusList,
  TaskStatusList,
} from './AgentRunBar';
export type {
  AgentRunBarActionsRender,
  AgentRunBarProps,
  AgentRunBarVariant,
  TaskRunningStatus as AgentTaskRunningStatus,
  // 重命名导出，避免与 ./TaskList 中同名 TaskStatus 冲突
  TaskStatus as AgentTaskStatus,
  TaskRunningActionsRender,
  TaskRunningProps,
  TaskRunningVariant,
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
  History,
  HistoryActionsBox,
  HistoryEmpty,
  HistoryItem,
  HistoryLoadMore,
  HistoryNewChat,
  HistoryRunningIcon,
  HistorySearch,
  TaskStatusData,
  formatTime,
  generateHistoryItems,
  groupByCategory,
  useHistory,
  type ActionsBoxProps,
  type HistoryActionsBoxProps,
  type HistoryChatType,
  type HistoryDataType,
  type HistoryProps,
  type HistoryRunningIconContainerProps,
  type HistoryRunningIconProps,
  type TaskStatusEnum,
} from './History';
export { type HistoryListConfig } from './History/types/HistoryList';

// ─── Markdown 渲染器（流式/只读轻量渲染，无 Slate 依赖） ─────────────────────
export {
  AgenticUiFileMapBlockRenderer,
  AgenticUiTaskBlockRenderer,
  AgenticUiToolUseBarBlockRenderer,
  AnimationText,
  CharacterQueue,
  ChartBlockRenderer,
  CodeBlockRenderer,
  MarkdownRenderer,
  MermaidBlockRenderer,
  SchemaBlockRenderer,
  markdownToReactSync,
  useMarkdownToReact,
  useStreaming,
  useStreamingMarkdownReact,
  type AnimationConfig,
  type AnimationTextProps,
  type CharacterQueueOptions,
  type FileMapConfig,
  type MarkdownRendererEleProps,
  type MarkdownRendererProps,
  type MarkdownRendererRef,
  type RenderMode,
  type RendererBlockProps,
  type UseMarkdownToReactOptions,
} from './MarkdownRenderer';

// ─── Markdown 编辑器 ─────────────────────────────────────────────────────────
export {
  BaseMarkdownEditor,
  Blockquote,
  Break,
  Code,
  EditorUtils,
  Head,
  Hr,
  InlineKatex,
  Katex,
  KeyboardTask,
  List,
  ListItem,
  MARKDOWN_EDITOR_EVENTS,
  MElement,
  MLeaf,
  MarkdownEditor,
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
  ReadonlyMarkdownEditorView,
  ReadonlyMedia,
  ReadonlyMermaid,
  ReadonlyParagraph,
  ReadonlySchema,
  ReadonlyTableComponent,
  Schema,
  calcPath,
  convertRemoteImages,
  copy,
  createDomRangeFromNodes,
  createSelectionFromNodes,
  debounce,
  download,
  dragStart,
  escapeRegExp,
  findByPathAndText,
  findLeafPath,
  getDefaultView,
  getPointStrOffset,
  getRelativePath,
  getRemoteMediaType,
  getSelectionFromDomSelection,
  hasEditableTarget,
  hasTarget,
  isDOMNode,
  isEventHandled,
  isLink,
  isMarkdown,
  isMix,
  isMod,
  isPath,
  isTargetInsideVoid,
  modal$,
  nid,
  normalizeMarkdownSearchText,
  parsePath,
  parserMdToSchema,
  parserSlateNodeToMarkdown,
  sanitizeEditorChromeStyle,
  toUnixPath,
  useDebounce,
  useGetSetState,
  useLocalState,
  useSystemKeyboard,
  type AttachNode,
  type BlockQuoteNode,
  type BreakNode,
  type BulletedListNode,
  type CardAfterNode,
  type CardBeforeNode,
  type CardNode,
  type ChartNode,
  type ChartTypeConfig,
  type CodeNode,
  type CommentDataType,
  type CustomLeaf,
  type DetailedSettings,
  type ElementProps,
  type Elements,
  type FootnoteDefinitionNode,
  type HeadNode,
  type HrNode,
  type IEditor,
  type InlineKatexNode,
  type JinjaConfig,
  type JinjaTemplateItem,
  type JinjaTemplatePanelConfig,
  type JinjaTemplatePanelItems,
  type LinkCardNode,
  type ListItemNode,
  type ListNode,
  type MapValue,
  type MarkdownEditorInstance,
  type MarkdownEditorProps,
  type MediaNode,
  type Methods,
  type NodeTypes,
  type NumberedListNode,
  type ParagraphNode,
  type SchemaNode,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from './MarkdownEditor';
export { useSelStatus } from './MarkdownEditor/hooks/editor';
export {
  PluginContext,
  type MarkdownEditorPlugin,
  type RendererPlugin,
} from './MarkdownEditor/plugin';
export {
  createJinjaPlugin,
  jinjaPlugin,
  type JinjaPluginOptions,
} from './MarkdownEditor/plugins/jinja';

// MarkdownEditor 内部工具（保持向后兼容，后续版本考虑收敛）
export {
  AvatarList,
  CommentList,
  ContributorAvatar,
  LazyElement,
  TextStyleTag,
  type LazyElementProps,
} from './MarkdownEditor/editor/components/index';
export { SlateTable } from './MarkdownEditor/editor/elements/Table/Table';
export {
  TablePropsContext,
  TablePropsProvider,
  type TableContextValue,
} from './MarkdownEditor/editor/elements/Table/TableContext';
export { partialParse } from './MarkdownEditor/editor/parser/json-parse';
export {
  MarkdownToSlateParser,
  clearParseCache,
  parserMarkdownToSlateNode,
  simpleHash,
  type ParserMarkdownToSlateNodeConfig,
} from './MarkdownEditor/editor/parser/parserMarkdownToSlateNode';
export {
  isMix as isMixDirect,
  parserSlateNodeToMarkdown as parserSlateNodeToMarkdownDirect,
} from './MarkdownEditor/editor/parser/parserSlateNodeToMarkdown';
export {
  EditorStore,
  EditorStoreContext,
  useEditorStore,
  type EditorStoreContextType,
} from './MarkdownEditor/editor/store';
export {
  TEXT_TAGS,
  docxDeserializer,
  extractTagsFromHtml,
  imagePastingListener,
  makeDeserializer,
} from './MarkdownEditor/editor/utils/docx/index';
export {
  batchHtmlToMarkdown,
  cleanHtml,
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
  type HtmlToMarkdownOptions,
} from './MarkdownEditor/editor/utils/htmlToMarkdown';
export {
  DEFAULT_MARKDOWN_REMARK_PLUGINS,
  REMARK_REHYPE_DIRECTIVE_HANDLERS,
  escapeHtml,
  markdownToHtml,
  markdownToHtmlSync,
  type MarkdownRemarkPlugin,
  type MarkdownToHtmlConfig,
  type MarkdownToHtmlOptions,
} from './MarkdownEditor/editor/utils/markdownToHtml';
export {
  NativeTableEditor,
  type CellElement,
  type Edge,
  type NodeEntryWithContext,
  type SelectionMode,
  type WithType,
} from './MarkdownEditor/utils/native-table/native-table-editor';

// ─── Markdown 输入框 ─────────────────────────────────────────────────────────
export {
  AttachmentButton,
  AttachmentButtonPopover,
  AttachmentSupportedFormatsContent,
  SupportedFileFormats,
  upLoadFileToServer,
  type AttachmentButtonPopoverProps,
  type AttachmentButtonProps,
  type AttachmentFile,
  type SupportedFormat,
  type UploadResponse,
} from './MarkdownInputField/AttachmentButton';
export {
  AttachmentFileList,
  type AttachmentFileListProps,
} from './MarkdownInputField/AttachmentButton/AttachmentFileList';
export { AttachmentFileListItem } from './MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileListItem';
export {
  getDeviceBrand,
  isAttachmentFileLoading,
  isFileMetaPlaceholderState,
  isImageFile,
  isMediaFile,
  isMobileDevice,
  isOppoDevice,
  isVideoFile,
  isVivoDevice,
  isVivoOrOppoDevice,
  isWeChat,
  kbToSize,
} from './MarkdownInputField/AttachmentButton/utils';
export { ActionItemContainer } from './MarkdownInputField/BeforeToolContainer/BeforeToolContainer';
export {
  FileMapView,
  type FileMapViewProps,
} from './MarkdownInputField/FileMapView';
export {
  MarkdownInputField,
  type ActionsSlotState,
  type MarkdownInputFieldProps,
  type SlotRenderState,
} from './MarkdownInputField/MarkdownInputField';
export { MARKDOWN_INPUT_FIELD_TEST_IDS } from './MarkdownInputField/testIds';
export {
  VoiceInputButton,
  type CreateRecognizer,
  type VoiceRecognizer,
} from './MarkdownInputField/VoiceInput';

// ─── Schema ──────────────────────────────────────────────────────────────────
export {
  SchemaEditor,
  SchemaForm,
  SchemaRenderer,
  SchemaValidator,
  TemplateEngine,
  validator,
  type LowCodeSchema,
  type SchemaEditorProps,
  type SchemaEditorRef,
  type SchemaFormProps,
} from './Schema';

// ─── 插件 ────────────────────────────────────────────────────────────────────
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BoxPlotChart,
  ChartAttrToolBar,
  ChartElement,
  ChartFilter,
  ChartRender,
  ChartStatistic,
  ChartToolBar,
  Column,
  DocCards,
  DocCardsDefaultFieldAliases,
  DonutChart,
  FunnelChart,
  HistogramChart,
  Line,
  LineChart,
  Pie,
  QuadrantChart,
  RadarChart,
  ScatterChart,
  chartDebounce,
  defaultColorList,
  downloadChart,
  formatDocCardsDisplayUrl,
  isDocCardsSafeHref,
  resolveDocCardsFields,
  splitDocCardsTags,
  stringFormatNumber,
  type AreaChartConfigItem,
  type AreaChartDataItem,
  type AreaChartProps,
  type BarChartConfigItem,
  type BarChartDataItem,
  type BarChartProps,
  type BoxPlotChartDataItem,
  type BoxPlotChartProps,
  type ChartClassNames,
  type ChartFilterProps,
  type ChartStatisticClassNames,
  type ChartStatisticProps,
  type ChartStatisticStyles,
  type ChartStyles,
  type ChartToolBarProps,
  type ClassNameType,
  type DocCardsField,
  type DocCardsFieldMap,
  type DocCardsProps,
  type DonutChartConfig,
  type DonutChartData,
  type DonutChartProps,
  type FilterOption,
  type FunnelChartDataItem,
  type FunnelChartProps,
  type HistogramChartDataItem,
  type HistogramChartProps,
  type LineChartConfigItem,
  type LineChartDataItem,
  type LineChartProps,
  type QuadrantChartProps,
  type RadarChartDataItem,
  type RegionOption,
  type ResolvedDocCardsFields,
  type ScatterChartDataItem,
  type ScatterChartProps,
} from './Plugins/chart';
export {
  AceEditor,
  AceEditorContainer,
  CodeContainer,
  CodeRenderer,
  CodeToolbar,
  HtmlPreview,
  LanguageSelector,
  LoadImage,
  ThinkBlock,
  ThinkBlockProvider,
  type CodeToolbarProps,
  type LanguageSelectorProps,
  type ThinkBlockContextType,
} from './Plugins/code/components';
export { MarkdownFormatter } from './Plugins/formatter';
export { MermaidElement } from './Plugins/mermaid';

// ─── 基础 UI 组件 ────────────────────────────────────────────────────────────
export { AILabel, type AILabelProps, type AILabelStatus } from './AILabel';
export { AnswerAlert, type AnswerAlertProps } from './AnswerAlert';
export { BackTo, type BackBottomProps, type BackTopProps } from './BackTo';
export { Quote } from './Quote';
export type { QuoteProps } from './Quote';
export {
  WelcomeMessage,
  type WelcomeMessageDescriptionAnimateProps,
  type WelcomeMessageProps,
  type WelcomeMessageTitleAnimateProps,
} from './WelcomeMessage';

// ─── 通用子组件 ──────────────────────────────────────────────────────────────
export {
  ActionIconBox,
  type ActionIconBoxProps,
} from './Components/ActionIconBox';
export { ActionItemBox } from './Components/ActionItemBox';
export {
  IconButton,
  SwitchButton,
  ToggleButton,
  type IconButtonProps,
  type SwitchButtonProps,
  type ToggleButtonProps,
} from './Components/Button';
export {
  GradientText,
  type GradientTextProps,
} from './Components/GradientText';
export {
  LayoutHeader,
  type LayoutHeaderConfig,
  type LayoutHeaderProps,
} from './Components/LayoutHeader';
export {
  CreativeRecommendationLoading,
  CreativeSparkLoading,
  Loading,
} from './Components/Loading';
export {
  CopyLottie,
  CreativeSparkLottie,
  DazingLottie,
  DislikeLottie,
  LikeLottie,
  LoadingLottie,
  MoreLottie,
  PlayLottie,
  QuoteLottie,
  RefreshLottie,
  ShareLottie,
  TextLoading,
  ThinkingLottie,
  ThreeThinkingLottie,
  useAsyncLottieData,
  type CopyLottieProps,
  type CreativeSparkLottieProps,
  type DazingLottieProps,
  type DislikeLottieProps,
  type LikeLottieProps,
  type LoadingLottieProps,
  type MoreLottieProps,
  type PlayLottieProps,
  type QuoteLottieProps,
  type RefreshLottieProps,
  type ShareLottieProps,
  type TextLoadingProps,
  type ThinkingLottieProps,
  type ThreeThinkingLottieProps,
} from './Components/lotties';
export {
  BlowingWindLottie,
  BouncingLottie,
  PeekLottie,
  default as Robot,
  type BlowingWindLottieProps,
  type BouncingLottieProps,
  type PeekLottieProps,
  type RobotProps,
  type RobotStatus,
} from './Components/Robot';
export {
  SuggestionList,
  type SuggestionItem,
  type SuggestionListProps,
} from './Components/SuggestionList';
export {
  TextAnimate,
  resolveSegments,
  type TextAnimateProps,
} from './Components/TextAnimate';
export { TextSwap, type TextSwapProps } from './Components/TextSwap';
export {
  TypingAnimation,
  type TypingAnimationProps,
} from './Components/TypingAnimation';
export {
  VisualList,
  type VisualListItem,
  type VisualListProps,
} from './Components/VisualList';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useAdaptiveTooltipProps } from './Hooks/useAdaptiveTooltipProps';
export { useAutoScroll } from './Hooks/useAutoScroll';
export { useLanguage } from './Hooks/useLanguage';
export { useNativeTitleTooltipFallback } from './Hooks/useNativeTitleTooltipFallback';
export { useRefFunction } from './Hooks/useRefFunction';
export {
  genComponentStyleHook,
  genStyleHooks,
  genSubStyleComponent,
  resetComponent,
  useEditorStyleRegister,
  type AgenticComponentTokenMap,
  type CSSInterpolation,
  type ChatTokenType,
  type FullToken,
  type GenStyleFn,
  type GenerateStyle,
} from './Hooks/useStyle';
export { useThrottleFn } from './Hooks/useThrottleFn';

export {
  adaptiveTooltipEnvironment,
  getAdaptiveTooltipProps,
  shouldUseInformationalTooltipClickTrigger,
  type AdaptiveTooltipKind,
} from './Utils/adaptiveTooltip';

// ─── 国际化 ──────────────────────────────────────────────────────────────────
export {
  I18nContext,
  I18nProvide,
  cnLabels,
  compileTemplate,
  detectUserLanguage,
  enLabels,
  getLocaleByLanguage,
  saveUserLanguage,
  useLocale,
  useMergedLocale,
  type LocalKeys,
} from './I18n';

// ─── 工具 / 沙箱 ────────────────────────────────────────────────────────────
export {
  DEFAULT_SANDBOX_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  ProxySandbox,
  SandboxHealthChecker,
  SecurityContextManager,
  createConfiguredSandbox,
  createSandbox,
  createSecurityContextManager,
  quickExecute,
  runInSandbox,
  runInSecureContext,
  safeMathEval,
  sandboxHealthChecker,
  type ExecutionContext,
  type MonitoringConfig,
  type PermissionConfig,
  type ResourceLimits,
  type SandboxConfig,
  type SandboxInstance,
  type SandboxResult,
  type SecurityContextConfig,
  type SecurityManager,
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
