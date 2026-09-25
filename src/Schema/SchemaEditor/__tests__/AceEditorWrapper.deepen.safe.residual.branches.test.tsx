/**
 * AceEditorWrapper deepen safe：module 无 default；change 同值早退。
 * 保持 fake timers；勿 useRealTimers。
 */
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState } = vi.hoisted(() => {
  const handlers: Record<string, (...args: any[]) => any> = {};
  const editor = {
    destroy: vi.fn(),
    getValue: vi.fn(() => 'same'),
    setValue: vi.fn(),
    setReadOnly: vi.fn(),
    session: { setMode: vi.fn() },
    on: vi.fn((ev: string, fn: (...args: any[]) => any) => {
      handlers[ev] = fn;
    }),
    __handlers: handlers,
  };
  const ace = { edit: vi.fn(() => editor) };
  return { mockState: { editor, ace, handlers } };
});

vi.mock('ace-builds', () => ({
  default: mockState.ace,
}));

vi.mock('../../../Plugins/code/loadAceEditor', () => ({
  loadAceEditor: vi.fn(async () => mockState.ace),
}));

vi.mock('../../../MarkdownEditor/editor/utils/ace', () => ({
  getAceLangs: vi.fn(() => Promise.resolve(new Set(['javascript', 'text']))),
  modeMap: new Map([['js', 'javascript']]),
}));

import { AceEditorWrapper } from '../AceEditorWrapper';

describe('AceEditorWrapper deepen safe residual branches', () => {
  beforeEach(() => {
    mockState.editor.getValue.mockReturnValue('same');
    mockState.ace.edit.mockClear();
    mockState.ace.edit.mockReturnValue(mockState.editor);
    Object.keys(mockState.handlers).forEach((k) => delete mockState.handlers[k]);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ace 模块无 default；change 同值不触发 onChange', async () => {
    const onChange = vi.fn();
    render(
      <AceEditorWrapper
        value="same"
        language="text"
        onChange={onChange}
        height={80}
      />,
    );
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(40);
    });
    expect(mockState.ace.edit).toHaveBeenCalled();

    mockState.editor.getValue.mockReturnValue('same');
    mockState.handlers.change?.();
    expect(onChange).not.toHaveBeenCalled();

    mockState.editor.getValue.mockReturnValue('changed');
    mockState.handlers.change?.();
    expect(onChange).toHaveBeenCalledWith('changed');
  });
});
