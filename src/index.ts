export type { RenderElementProps } from 'slate-react';
import './root.css';

// 统一类型导出 - 最优先导出，避免循环依赖
export * from './AgenticLayout';
export * from './AgentRunBar';
export * from './Bubble';
export * from './Bubble/List';
export * from './Bubble/type';
export * from './ChatBootPage';
export * from './ChatLayout';
export * from './Components/ActionIconBox';
export * from './Components/Button';
export * from './Components/LayoutHeader';
export * from './Components/Loading';
export * from './Components/lotties';
export * from './Components/SuggestionList';
export * from './Components/VisualList';
export * from './Hooks/useAutoScroll';
export { useLanguage } from './Hooks/useLanguage';
export * from './Hooks/useRefFunction';
export * from './Hooks/useStyle';
export * from './Hooks/useThrottleFn';
export * from './I18n';
export * from './MarkdownEditor';
export * from './MarkdownEditor/editor/components/index';
export * from './MarkdownEditor/editor/elements/Table/Table';
export * from './MarkdownEditor/editor/elements/Table/TableContext';
export * from './MarkdownEditor/editor/parser/json-parse';
export * from './MarkdownEditor/editor/parser/parserMarkdownToSlateNode';
export * from './MarkdownEditor/editor/parser/parserSlateNodeToMarkdown';
export * from './MarkdownEditor/editor/store';
export * from './MarkdownEditor/editor/utils';
export * from './MarkdownEditor/editor/utils/docx/index';
export * from './MarkdownEditor/editor/utils/markdownToHtml';
export * from './ToolUseBarThink';
export * from './Types';
export { default as Workspace } from './Workspace';
// HTML to Markdown conversion utilities
export * from './AILabel';
export * from './AnswerAlert';
export * from './BackTo';
export { ActionItemBox } from './Components/ActionItemBox';
export * from './History';
export * from './MarkdownEditor/editor/utils/htmlToMarkdown';
export * from './MarkdownEditor/el';
export { useSelStatus } from './MarkdownEditor/hooks/editor';
export * from './MarkdownEditor/plugin';
export * from './MarkdownInputField/AttachmentButton';
export { ActionItemContainer } from './MarkdownInputField/BeforeToolContainer/BeforeToolContainer';
export * from './MarkdownInputField/FileMapView';
export * from './MarkdownInputField/MarkdownInputField';
export * from './Plugins/formatter';
export * from './Schema';
export * from './TaskList';
export * from './ThoughtChainList';
export * from './ToolUseBar';
export * from './WelcomeMessage';
export * from './Workspace';
// Robot 组件
export * from './Components/Robot';
export { default as Robot } from './Components/Robot';

// Quote 组件导出
export { default as Quote } from './Quote';
export type { QuoteProps } from './Quote';

// 新增：图表插件对外导出
export * from './Plugins/chart';
export * from './Plugins/mermaid';

export * from './MarkdownEditor/types';

// Bubble 相关类型
export type {
  BubbleClassNames,
  BubbleItemStyleProps,
  BubbleRenderConfig,
  BubbleStyleProps,
  BubbleStyles,
  CustomConfig,
  WithFalse,
} from './Bubble/type';

// Bubble 额外类型
export type { CustomConfig as BubbleCustomConfig } from './Bubble/type';
export * from './Bubble/types/DocInfo';

export * from './ThoughtChainList/types';

// History 相关类型
export * from './History/types';
export * from './History/types/HistoryData';
export * from './History/types/HistoryList';

// Schema 相关类型
export * from './Schema/types';

// Workspace 相关类型
export * from './Workspace/types';

// AttachmentButton 相关类型
export * from './MarkdownInputField/AttachmentButton/types';

// ProxySandbox 相关类型
export * from './Utils/proxySandbox/ProxySandbox';
export * from './Utils/proxySandbox/SecurityContextManager';

// 代理沙箱相关类型别名
export * from './Utils/proxySandbox';

// 代码插件相关类型
export * from './Plugins/code/components';

// Slate Table 相关类型
export * from './MarkdownEditor/utils/native-table/native-table-editor';

// MarkdownEditor 元素类型
export * from './MarkdownEditor/el';

// 语音相关类型
export * from './Bubble/MessagesContent/VoiceButton/types';

// MarkdownInputField 语音识别相关类型
export * from './MarkdownInputField/VoiceInput';

// 模板引擎类
export * from './Schema/SchemaRenderer/templateEngine';

// Schema 验证器类
export * from './Schema/validator';

// 沙箱健康检查器
export * from './Utils/proxySandbox';

// 文字动画组件导出
export * from './Components/GradientText';
export * from './Components/TextAnimate';
export * from './Components/TypingAnimation';

export * from './MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileListItem';

export * from './MarkdownInputField/AttachmentButton/AttachmentFileList';
export * from './MarkdownInputField/AttachmentButton/utils';

/**
 * Schema Element Editor Chrome 插件底层 SDK
 * @description 原始 SDK 导出，一般用户无需直接使用
 */
export * from '@schema-element-editor/host-sdk';
