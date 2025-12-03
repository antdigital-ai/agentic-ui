/**
 * @fileoverview 思考块组件
 * 只读模式下渲染思考类型的代码块
 */

import React, { useContext } from 'react';
import { I18nContext } from '../../../I18n';
import { EditorStoreContext } from '../../../MarkdownEditor/editor/store';
import { CodeNode } from '../../../MarkdownEditor/el';
import { ToolUseBarThink } from '../../../ToolUseBarThink';

interface ThinkBlockProps {
  element: CodeNode;
}

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

export function ThinkBlock({ element }: ThinkBlockProps) {
  const { locale } = useContext(I18nContext);
  const { editorProps } = useContext(EditorStoreContext) || {};

  const rawContent =
    element?.value !== null && element?.value !== undefined
      ? String(element.value).trim()
      : '';

  // 恢复内容中被转义的代码块
  const content = restoreCodeBlocks(rawContent);

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
        },
      }}
      expanded={
        editorProps?.codeProps?.alwaysExpandedDeepThink ? true : undefined
      }
      toolName={toolNameText}
      thinkContent={content}
      status={isLoading ? 'loading' : 'success'}
    />
  );
}
