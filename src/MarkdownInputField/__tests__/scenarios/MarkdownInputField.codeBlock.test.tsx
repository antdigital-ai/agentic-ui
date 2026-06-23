/**
 * MarkdownInputField should exercise BaseMarkdownEditor without mocks here:
 * schedule-style prompts rely on editable void code blocks and exact markdown
 * serialization when users update the code body.
 */

(globalThis as any).ace = {
  define: () => {},
  require: () => {},
};

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownInputField } from '../../MarkdownInputField';

const inputCodeBlockHeight = '120px';

const schedulePromptMd = [
  '帮我创建一个定时任务。请根据我的描述: `${placeholder:任务名称}` 、 `${placeholder:执行频率}` ，内容如下：',
  '```markdown',
  '任务内容',
  '```',
  '帮我生成合适的定时任务配置。',
].join('\n');

vi.mock('ace-builds', () => {
  const mockEditor = {
    setTheme: vi.fn(),
    setValue: vi.fn(),
    getValue: vi.fn(() => ''),
    clearSelection: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    selection: { on: vi.fn(), clearSelection: vi.fn() },
    session: { setMode: vi.fn() },
    commands: { addCommand: vi.fn() },
    getCursorPosition: vi.fn(() => ({ row: 0, column: 0 })),
    focus: vi.fn(),
    renderer: { scroller: document.createElement('div') },
  };

  return {
    default: {
      edit: vi.fn(() => mockEditor),
      config: { set: vi.fn(), loadModule: vi.fn() },
    },
    Ace: {},
  };
});

vi.mock('ace-builds/src-noconflict/theme-chaos', () => ({}));
vi.mock('ace-builds/src-noconflict/theme-github', () => ({}));
vi.mock('ace-builds/src-noconflict/ext-modelist', () => ({
  default: { modes: [] },
}));

describe('MarkdownInputField code block editing', () => {
  it('renders editable fenced code blocks and forwards updated markdown', async () => {
    const onChange = vi.fn();

    render(<MarkdownInputField value={schedulePromptMd} onChange={onChange} />);

    const textarea = await screen.findByTestId(
      'simple-code-block-editor',
      {},
      { timeout: 8000 },
    );
    const codeBlock = textarea.closest('[data-be="code"]');

    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveStyle({
      height: inputCodeBlockHeight,
      minHeight: inputCodeBlockHeight,
      maxHeight: inputCodeBlockHeight,
    });
    expect(textarea).toHaveValue('任务内容');

    onChange.mockClear();
    fireEvent.change(textarea, { target: { value: '任务内容\n第二行' } });

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
        const latestMarkdown = onChange.mock.calls.at(-1)?.[0] as string;
        expect(latestMarkdown).toContain('第二行');
        expect(latestMarkdown).toContain('```markdown');
        expect(latestMarkdown).toContain('${placeholder:任务名称}');
        expect(latestMarkdown).toContain('帮我生成合适的定时任务配置。');
      },
      { timeout: 3000 },
    );
  });
});
