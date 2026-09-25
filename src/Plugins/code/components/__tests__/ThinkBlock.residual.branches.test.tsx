/**
 * ThinkBlock 残留：alwaysExpandedDeepThink、bubble finished、!isLastNode。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const storeState = vi.hoisted(() => ({
  editorProps: { codeProps: { alwaysExpandedDeepThink: true } },
  markdownEditorRef: {
    current: {
      children: [{ type: 'paragraph' }, { type: 'code' }],
    },
  },
}));

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => storeState,
  EditorStoreContext: React.createContext(storeState),
}));

vi.mock('../../../../MarkdownEditor/utils', () => ({
  EditorUtils: {
    findPath: () => [0],
  },
}));

vi.mock('../../../Bubble/MessagesContent/BubbleContext', () => ({
  MessagesContext: React.createContext({
    message: { isFinished: true, isLast: false },
  }),
}));

vi.mock('../../../../I18n', () => ({
  I18nContext: React.createContext({ locale: {}, language: 'zh-CN' }),
  useLocale: () => ({}),
  useMergedLocale: (override?: Record<string, string>) => override || {},
}));

import { ThinkBlock } from '../ThinkBlock';

describe('ThinkBlock residual branches', () => {
  it.skip('alwaysExpandedDeepThink + finished bubble 仍渲染 children', () => {
    render(
      <ThinkBlock
        element={
          {
            type: 'code',
            language: 'think',
            value: 'thinking...',
            children: [{ text: 'thinking...' }],
          } as any
        }
        attributes={{} as any}
      >
        <span data-testid="think-body">body</span>
      </ThinkBlock>,
    );
    expect(screen.getByTestId('think-body')).toBeInTheDocument();
  });
});
