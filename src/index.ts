/**
 * @ant-design/agentic-ui 公共 API 入口
 *
 * 导出规则：
 *   1. 每个组件仅通过其 index 导出，不深入引用内部子模块
 *   2. 需要向外暴露的内部工具 / 类型，先在各组件 index 中 re-export，再由此处统一引用
 *   3. 第三方类型不直接 re-export，使用自定义类型包装
 *   4. 按功能分区，便于维护
 */

import './root.css';

// ─── Slate 类型 re-export（唯一的第三方类型例外） ───────────────────────────
export type { RenderElementProps } from 'slate-react';

// ─── 通用类型 ────────────────────────────────────────────────────────────────
export * from './Types';

// ─── 布局组件 ────────────────────────────────────────────────────────────────
export * from './AgenticLayout';
export { default as Workspace } from './Workspace';
export * from './Workspace';
export * from './Workspace/types';

// ─── 聊天气泡 ────────────────────────────────────────────────────────────────
export * from './Bubble';
export * from './Bubble/List';
export * from './Bubble/type';
export * from './Bubble/types/DocInfo';
export * from './Bubble/MessagesContent/VoiceButton/types';

// ─── 聊天启动页 ──────────────────────────────────────────────────────────────
export * from './ChatBootPage';
export * from './ChatLayout';

// ─── 思维链 / 工具调用 ──────────────────────────────────────────────────────
export * from './ThoughtChainList';
export * from './ThoughtChainList/types';
export * from './ToolUseBar';
export * from './ToolUseBarThink';

// ─── 任务相关 ────────────────────────────────────────────────────────────────
export * from './AgentRunBar';
export * from './TaskList';

// ─── 历史记录 ────────────────────────────────────────────────────────────────
export * from './History';
export * from './History/types';
export * from './History/types/HistoryData';
export * from './History/types/HistoryList';

// ─── Markdown 编辑器 ─────────────────────────────────────────────────────────
export * from './MarkdownEditor';
export * from './MarkdownEditor/types';
export * from './MarkdownEditor/el';
export * from './MarkdownEditor/plugin';
export { useSelStatus } from './MarkdownEditor/hooks/editor';

// MarkdownEditor 内部工具（保持向后兼容，后续版本考虑收敛）
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
export * from './MarkdownEditor/editor/utils/htmlToMarkdown';
export * from './MarkdownEditor/utils/native-table/native-table-editor';

// ─── Markdown 输入框 ─────────────────────────────────────────────────────────
export * from './MarkdownInputField/MarkdownInputField';
export * from './MarkdownInputField/AttachmentButton';
export * from './MarkdownInputField/AttachmentButton/types';
export * from './MarkdownInputField/AttachmentButton/AttachmentFileList';
export * from './MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileListItem';
export * from './MarkdownInputField/AttachmentButton/utils';
export * from './MarkdownInputField/FileMapView';
export * from './MarkdownInputField/VoiceInput';
export { ActionItemContainer } from './MarkdownInputField/BeforeToolContainer/BeforeToolContainer';

// ─── Schema ──────────────────────────────────────────────────────────────────
export * from './Schema';
export * from './Schema/types';
export * from './Schema/SchemaRenderer/templateEngine';
export * from './Schema/validator';

// ─── 插件 ────────────────────────────────────────────────────────────────────
export * from './Plugins/formatter';
export * from './Plugins/chart';
export * from './Plugins/mermaid';
export * from './Plugins/code/components';

// ─── 基础 UI 组件 ────────────────────────────────────────────────────────────
export * from './AILabel';
export * from './AnswerAlert';
export * from './BackTo';
export * from './WelcomeMessage';
export { default as Quote } from './Quote';
export type { QuoteProps } from './Quote';

// ─── 通用子组件 ──────────────────────────────────────────────────────────────
export * from './Components/ActionIconBox';
export { ActionItemBox } from './Components/ActionItemBox';
export * from './Components/Button';
export * from './Components/LayoutHeader';
export * from './Components/Loading';
export * from './Components/lotties';
export * from './Components/SuggestionList';
export * from './Components/VisualList';
export * from './Components/Robot';
export { default as Robot } from './Components/Robot';
export * from './Components/GradientText';
export * from './Components/TextAnimate';
export * from './Components/TypingAnimation';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export * from './Hooks/useAutoScroll';
export { useLanguage } from './Hooks/useLanguage';
export * from './Hooks/useRefFunction';
export * from './Hooks/useStyle';
export * from './Hooks/useThrottleFn';

// ─── 国际化 ──────────────────────────────────────────────────────────────────
export * from './I18n';

// ─── 工具 / 沙箱 ────────────────────────────────────────────────────────────
export * from './Utils/proxySandbox';
export * from './Utils/proxySandbox/ProxySandbox';
export * from './Utils/proxySandbox/SecurityContextManager';

// ─── 第三方 SDK re-export（向后兼容，后续版本考虑移除） ───────────────────────
/**
 * Schema Element Editor Chrome 插件底层 SDK
 * @description 原始 SDK 导出，一般用户无需直接使用
 * @deprecated @since 2.30.0 建议直接从 @schema-element-editor/host-sdk 导入
 */
export * from '@schema-element-editor/host-sdk';
