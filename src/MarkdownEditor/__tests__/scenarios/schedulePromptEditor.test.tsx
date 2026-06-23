/**
 * 定时任务模板：含 `${placeholder:…}` 与 ```markdown 围栏，应能挂载编辑器不白屏。
 */

(globalThis as any).ace = {
  define: () => {},
  require: () => {},
};

import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownEditor } from '../../..';

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

vi.mock('../../../MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map([['markdown', 'markdown']]),
  getAceLangs: vi.fn(() =>
    Promise.resolve(new Set(['markdown', 'javascript'])),
  ),
}));

describe('schedule prompt MarkdownEditor mount', () => {
  it('renders editable input with placeholders and markdown code fence', async () => {
    const { container } = render(
      <MarkdownEditor
        initValue={schedulePromptMd}
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
        tagInputProps={{ enable: true, type: 'dropdown' }}
      />,
    );

    await waitFor(
      () => {
        expect(container.querySelector('[data-be="code"]')).toBeInTheDocument();
      },
      { timeout: 8000 },
    );
  });
});
