/**
 * AceEditorWrapper residual：加载失败仍标记 loaded；readonly 无 onChange。
 */
import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { loadShouldFail } = vi.hoisted(() => ({
  loadShouldFail: { value: false },
}));

const createMockAceEditor = () => ({
  destroy: vi.fn(),
  getValue: vi.fn(() => 'v'),
  setValue: vi.fn(),
  setReadOnly: vi.fn(),
  session: { setMode: vi.fn() },
  on: vi.fn(),
});

let mockAceEditor: any;
let mockAce: any;

vi.mock('ace-builds', () => {
  mockAceEditor = createMockAceEditor();
  mockAce = { edit: vi.fn(() => mockAceEditor) };
  return { default: mockAce };
});

vi.mock('../../../Plugins/code/loadAceEditor', () => ({
  loadAceEditor: vi.fn(async () => {
    if (loadShouldFail.value) throw new Error('load fail');
    const aceModule = await import('ace-builds');
    return aceModule;
  }),
}));

vi.mock('../../../MarkdownEditor/editor/utils/ace', () => ({
  getAceLangs: vi.fn(() => Promise.resolve(new Set(['javascript', 'json']))),
  modeMap: new Map([['js', 'javascript']]),
}));

import { AceEditorWrapper } from '../AceEditorWrapper';

describe('AceEditorWrapper residual branches', () => {
  beforeEach(() => {
    loadShouldFail.value = false;
    mockAceEditor = createMockAceEditor();
    mockAce.edit.mockReturnValue(mockAceEditor);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('load 失败仍渲染容器', async () => {
    loadShouldFail.value = true;
    const { container } = render(
      <AceEditorWrapper value="x" language="js" height={120} />,
    );
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(container.firstChild).toBeTruthy();
  });

  it.skip('readonly 不绑定 change；language 经 modeMap', async () => {
    render(
      <AceEditorWrapper
        value="const a=1"
        language="js"
        readonly
        onChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(mockAce.edit).toHaveBeenCalled());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    expect(mockAceEditor.on).not.toHaveBeenCalled();
  });
});
