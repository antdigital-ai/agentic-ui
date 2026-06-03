import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownInputField } from '../../MarkdownInputField';

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

describe('MarkdownInputField schedule prompt code block', () => {
  it('emits updated fenced markdown when editing the simple code block editor', async () => {
    const onChange = vi.fn();

    const { container } = render(
      <MarkdownInputField value={schedulePromptMd} onChange={onChange} />,
    );

    const textarea = await screen.findByTestId(
      'simple-code-block-editor',
      {},
      { timeout: 8000 },
    );

    expect(textarea).toHaveValue('任务内容');
    expect(container.querySelector('[data-be="code"]')).toBeInTheDocument();

    onChange.mockClear();

    fireEvent.change(textarea, { target: { value: '任务内容\n第二行' } });

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
        const markdown = onChange.mock.calls.at(-1)?.[0] as string;
        expect(markdown).toContain('```markdown');
        expect(markdown).toContain('任务内容\n第二行');
        expect(markdown).toContain('`${placeholder:任务名称}`');
        expect(markdown).toContain('`${placeholder:执行频率}`');
        expect(markdown).toContain('帮我生成合适的定时任务配置。');
      },
      { timeout: 3000 },
    );
  });
});
