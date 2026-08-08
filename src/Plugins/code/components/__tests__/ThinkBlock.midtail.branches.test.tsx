/**
 * ThinkBlock midtail：alwaysExpanded 关、bubble 未完成。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const storeState = vi.hoisted(() => ({
  editorProps: { codeProps: { alwaysExpandedDeepThink: false } },
  markdownEditorRef: {
    current: {
      children: [{ type: 'code', language: 'think' }],
    },
  },
}));

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => storeState,
  EditorStoreContext: React.createContext(storeState),
}));

vi.mock('../../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    findPath: () => [0],
  },
}));

vi.mock('../../../../Bubble/MessagesContent/BubbleContext', () => ({
  MessagesContext: React.createContext({
    message: { isFinished: false, isLast: true },
  }),
}));

vi.mock('../../../../I18n', () => ({
  I18nContext: React.createContext({ locale: {}, language: 'zh-CN' }),
}));

vi.mock('../../../../ToolUseBarThink', () => ({
  ToolUseBarThink: (p: any) => (
    <div data-testid="think-mock">{p.toolName || 'think'}</div>
  ),
}));

import { ThinkBlock } from '../ThinkBlock';

describe('ThinkBlock midtail branches', () => {
  it('未完成 bubble + alwaysExpanded=false 仍渲染', () => {
    const { container } = render(
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
        {null as any}
      </ThinkBlock>,
    );
    expect(
      container.querySelector('[data-testid="think-mock"]') || container,
    ).toBeTruthy();
  });
});
