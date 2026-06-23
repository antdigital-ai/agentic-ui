/**
 * 定时任务模板 + BaseMarkdownEditor（无 standardPlugins，同 MarkdownInputField）：
 * 编辑 void 代码块应触发 onChange 且 markdown 含新正文。
 */

(globalThis as any).ace = {
  define: () => {},
  require: () => {},
};

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BaseMarkdownEditor } from '../../BaseMarkdownEditor';
import { parserSlateNodeToMarkdown } from '../../editor/parser/parserSlateNodeToMarkdown';
import type { MarkdownEditorInstance } from '../../types';

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

describe('schedule prompt code block onChange', () => {
  it('editing simple code textarea emits updated markdown', async () => {
    const onChange = vi.fn();
    const editorRef = createRef<MarkdownEditorInstance>();

    render(
      <BaseMarkdownEditor
        editorRef={editorRef}
        initValue={schedulePromptMd}
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
        tagInputProps={{ enable: true, type: 'dropdown' }}
        onChange={onChange}
      />,
    );

    const textarea = await screen.findByTestId(
      'simple-code-block-editor',
      {},
      { timeout: 8000 },
    );

    onChange.mockClear();

    fireEvent.change(textarea, { target: { value: '任务内容\n第二行' } });

    await waitFor(
      () => {
        const editor = editorRef.current?.markdownEditorRef?.current;
        const code = editor?.children?.find(
          (n: { type?: string }) => n.type === 'code',
        ) as { value?: string } | undefined;
        expect(code?.value).toContain('第二行');
        const mdNow = parserSlateNodeToMarkdown(editor?.children ?? []);
        expect(mdNow).toContain('第二行');
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
        const md = onChange.mock.calls.at(-1)?.[0] as string;
        expect(md).toContain('第二行');
        expect(md).toContain('```markdown');
      },
      { timeout: 3000 },
    );
  });
});
