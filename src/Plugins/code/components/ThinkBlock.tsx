/**
 * @fileoverview 思考块组件
 * 只读模式下渲染思考类型的代码块
 */

import { useMergedState } from 'rc-util';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { MessagesContext } from '../../../Bubble/MessagesContent/BubbleContext';
import { I18nContext } from '../../../I18n';
import {
  EditorStoreContext,
  useEditorStore,
} from '../../../MarkdownEditor/editor/store';
import { EditorUtils } from '../../../MarkdownEditor/editor/utils/editorUtils';
import { CodeNode, ElementProps } from '../../../MarkdownEditor/el';
import { ToolUseBarThink } from '../../../ToolUseBarThink';

type ThinkBlockProps = ElementProps<CodeNode>;

/**
 * ThinkBlock Context 类型定义
 */
export interface ThinkBlockContextType {
  /** 受控的展开状态 */
  expanded?: boolean;
  /** 展开状态变更回调 */
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * ThinkBlock Context
 */
export const ThinkBlockContext = createContext<ThinkBlockContextType | null>(
  null,
);

/**
 * ThinkBlock Provider 组件
 *
 * 用于全局控制所有 ThinkBlock 实例的展开/收起状态
 *
 * @example
 * ```tsx
 * <ThinkBlockProvider expanded={isExpanded} onExpandedChange={setIsExpanded}>
 *   <MarkdownEditor ... />
 * </ThinkBlockProvider>
 * ```
 */
export const ThinkBlockProvider: React.FC<
  ThinkBlockContextType & { children: React.ReactNode }
> = ({ expanded, onExpandedChange, children }) => {
  return (
    <ThinkBlockContext.Provider value={{ expanded, onExpandedChange }}>
      {children}
    </ThinkBlockContext.Provider>
  );
};

/**
 * 将特殊标记恢复为代码块格式
 * @param content - 包含特殊标记的内容
 * @returns 恢复后的内容
 */
const restoreCodeBlocks = (content: string): string => {
  const marker = '\u200B'; // 零宽空格

  // 将格式：【CODE_BLOCK:lang】code【/CODE_BLOCK】
  // 恢复为：```lang\ncode\n```
  return content.replace(
    new RegExp(
      `${marker}【CODE_BLOCK:([\\w]*)】\\n?([\\s\\S]*?)\\n?【/CODE_BLOCK】${marker}`,
      'g',
    ),
    (_: string, lang: string, code: string) => {
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    },
  );
};

export function ThinkBlock(props: ThinkBlockProps) {
  const { element } = props;
  const { locale } = useContext(I18nContext);
  const { editorProps } = useContext(EditorStoreContext) || {};
  const { message } = useContext(MessagesContext);
  const { markdownEditorRef } = useEditorStore();
  const thinkBlockContext = useContext(ThinkBlockContext);

  // 获取当前 Bubble 的 isFinished 状态
  const bubbleIsFinished = message?.isFinished;

  // 获取当前元素的 path
  const elementPath = useMemo(() => {
    if (!markdownEditorRef.current) {
      return null;
    }
    try {
      return EditorUtils.findPath(markdownEditorRef.current, element);
    } catch (error) {
      console.error('Error finding element path:', error);
      return null;
    }
  }, [markdownEditorRef.current, element]);

  // 判断是否是最后一个节点
  const isLastNode = useMemo(() => {
    if (!markdownEditorRef.current || !elementPath) {
      return false;
    }
    try {
      return EditorUtils.checkSelEnd(markdownEditorRef.current, elementPath);
    } catch (error) {
      console.error('Error checking if last node:', error);
      return false;
    }
  }, [markdownEditorRef.current, elementPath]);

  // 状态优先级（从高到低）：
  // 1. Context 提供的 expanded（受控模式）
  // 2. editorProps?.codeProps?.alwaysExpandedDeepThink
  // 3. 默认值（false）
  const [expanded, setExpanded] = useMergedState(
    editorProps?.codeProps?.alwaysExpandedDeepThink ?? true,
    {
      value: editorProps?.codeProps?.alwaysExpandedDeepThink
        ? true
        : (thinkBlockContext?.expanded ?? undefined),
      defaultValue: true,
      onChange: thinkBlockContext?.onExpandedChange,
    },
  );

  // 当 bubble 完成时，自动展开
  useEffect(() => {
    if (bubbleIsFinished) {
      setExpanded(false);
    }
  }, [bubbleIsFinished]);

  // 如果不是最后一个节点，自动收起
  useEffect(() => {
    if (!isLastNode) {
      setExpanded(false);
    }
  }, [isLastNode]);

  // 跟踪 thinkBlockContext?.expanded 的之前值
  const prevExpandedRef = useRef<boolean | undefined>(
    thinkBlockContext?.expanded,
  );

  // 当 thinkBlockContext?.expanded 从其他值变成 undefined 时，自动收起
  useEffect(() => {
    const prevExpanded = prevExpandedRef.current;
    const currentExpanded = thinkBlockContext?.expanded;

    // 如果之前有值（true 或 false），现在变成 undefined，则收起
    if (prevExpanded !== undefined && currentExpanded === undefined) {
      setExpanded(false);
    }

    // 更新之前的值
    prevExpandedRef.current = currentExpanded;
  }, [thinkBlockContext?.expanded]);

  const rawContent =
    element?.value !== null && element?.value !== undefined
      ? String(element.value).trim()
      : '';

  // 恢复内容中被转义的代码块
  const content = restoreCodeBlocks(rawContent);

  // 判断是否正在加载：内容以...结尾 或者 bubble 还未完成
  const isLoading = content.endsWith('...');
  const toolNameText = isLoading
    ? locale?.['think.deepThinkingInProgress'] || '深度思考...'
    : locale?.['think.deepThinking'] || '深度思考';

  return (
    <ToolUseBarThink
      testId="think-block"
      styles={{
        root: {
          boxSizing: 'border-box',
          maxWidth: '680px',
          marginTop: 8,
        },
      }}
      expanded={expanded}
      onExpandedChange={setExpanded}
      toolName={toolNameText}
      thinkContent={content}
      status={isLoading ? 'loading' : 'success'}
    />
  );
}
