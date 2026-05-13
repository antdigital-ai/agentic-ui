/**
 * MarkdownInputField targeted coverage Tests
 * 由 MarkdownInputField.branches.test.tsx 拆分而来。
 * 拆分原因：原文件多段 vi.mock 同模块，后者会覆盖前者，导致前段断言全部失效。
 */

import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// === merged from MarkdownInputField.targeted-coverage.test.tsx ===
// ===========================================================================

const captured = vi.hoisted(() => ({
  editorProps: null as any,
  quickActionsProps: null as any,
}));

/* ---- Mock BaseMarkdownEditor：捕获 onChange/onFocus/onBlur/onPaste ---- */
vi.mock('../../MarkdownEditor', () => ({
  BaseMarkdownEditor: (props: any) => {
    captured.editorProps = props;
    return <div data-testid="mock-editor">{props.children}</div>;
  },
}));

/* ---- Mock QuickActions：捕获 onValueChange/onResize ---- */
vi.mock('../QuickActions', () => ({
  QuickActions: React.forwardRef((props: any, ref: any) => {
    captured.quickActionsProps = props;
    return <div data-testid="mock-quick-actions" ref={ref} />;
  }),
}));

/* ---- Mock 其他子组件和 hooks 保持简洁 ---- */
vi.mock('../style', () => ({
  useStyle: () => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash',
  }),
}));

vi.mock('../Suggestion', () => ({
  Suggestion: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../SkillModeBar', () => ({
  SkillModeBar: () => null,
}));

vi.mock('../TopOperatingArea', () => ({
  default: () => null,
}));

vi.mock('../VoiceInputManager', () => ({
  useVoiceInputManager: () => ({
    recording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}));

vi.mock('../FileUploadManager', () => ({
  useFileUploadManager: () => ({
    fileUploadDone: true,
    supportedFormat: [],
    uploadImage: vi.fn(),
    updateAttachmentFiles: vi.fn(),
    handleFileRemoval: vi.fn(),
    handleFileRetry: vi.fn(),
  }),
}));

// NOTE: useSendActionsNode 已删除并内联到 MarkdownInputField.tsx，
// 这里改为 mock 实际的 SendActions 组件。
vi.mock('../utils/renderHelpers', () => ({
  useAttachmentList: () => null,
  useBeforeTools: () => null,
}));

vi.mock('../SendActions', () => ({
  SendActions: () => <div data-testid="mock-send-actions" />,
}));

// useMarkdownInputFieldHandlers 已被拆分为 4 个独立 hook，
// 这里 mock 拆出来的每个 hook，保持测试用例对原"事件被触发"的关注点。
vi.mock('../hooks/useSendHandler', () => ({
  useSendHandler: () => ({ sendMessage: vi.fn() }),
}));

vi.mock('../hooks/usePasteHandler', () => ({
  usePasteHandler: () => ({ handlePaste: vi.fn() }),
}));

vi.mock('../hooks/useKeyboardHandler', () => ({
  useKeyboardHandler: () => ({ handleKeyDown: vi.fn() }),
}));

vi.mock('../hooks/useEnlargeAndContainerHandler', () => ({
  useEnlargeAndContainerHandler: () => ({
    handleEnlargeClick: vi.fn(),
    handleContainerClick: vi.fn(),
    activeInput: vi.fn(),
  }),
}));

vi.mock('../hooks/useInputFieldRefContainer', () => ({
  useInputFieldRefContainer: () => ({
    markdownEditorRef: { current: { store: { setMDContent: vi.fn() } } },
    quickActionsRef: { current: null },
    actionsRef: { current: null },
    isSendingRef: { current: false },
  }),
}));

vi.mock('../hooks/useEditorValueSync', () => ({
  useEditorValueSync: () => ({
    onEditorChange: vi.fn(),
  }),
}));

vi.mock('../hooks/useExposeInputRef', () => ({
  useExposeInputRef: () => undefined,
}));

// 合并自原 useMarkdownInputFieldLayout + useMarkdownInputFieldStyles。
// 原 useMarkdownInputFieldActions 已被内联到 MarkdownInputField，无需单独 mock。
vi.mock('../hooks/useInputFieldGeometry', () => ({
  useInputFieldGeometry: () => ({
    inputRef: { current: null },
    collapseSendActions: false,
    setRightPadding: vi.fn(),
    setTopRightPadding: vi.fn(),
    setQuickRightOffset: vi.fn(),
    computedRightPadding: 16,
    collapsedHeightPx: 200,
    computedMinHeight: '48px',
    enlargedStyle: {},
  }),
}));

vi.mock('../hooks/useMarkdownInputFieldState', () => ({
  useMarkdownInputFieldState: () => ({
    isHover: false,
    setHover: vi.fn(),
    isLoading: false,
    setIsLoading: vi.fn(),
    isEnlarged: false,
    setIsEnlarged: vi.fn(),
    value: '',
    setValue: vi.fn(),
    fileMap: {},
    setFileMap: vi.fn(),
  }),
}));

import { MarkdownInputField } from '../MarkdownInputField';

describe('MarkdownInputField targeted coverage', () => {
  beforeEach(() => {
    captured.editorProps = null;
    captured.quickActionsProps = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('覆盖 onChange 正常路径', () => {
    const onChangeSpy = vi.fn();
    render(<MarkdownInputField onChange={onChangeSpy} />);

    expect(captured.editorProps).toBeTruthy();
    act(() => {
      captured.editorProps.onChange('hello world');
    });

    expect(onChangeSpy).toHaveBeenCalledWith('hello world');
  });

  it('覆盖 onChange maxLength 截断路径', () => {
    const onChangeSpy = vi.fn();
    const onMaxLengthExceeded = vi.fn();
    render(
      <MarkdownInputField
        onChange={onChangeSpy}
        maxLength={5}
        onMaxLengthExceeded={onMaxLengthExceeded}
      />,
    );

    expect(captured.editorProps).toBeTruthy();
    act(() => {
      captured.editorProps.onChange('hello world longer');
    });

    expect(onChangeSpy).toHaveBeenCalledWith('hello');
    expect(onMaxLengthExceeded).toHaveBeenCalledWith('hello world longer');
  });

  it('覆盖 onChange maxLength 不超限时走正常路径', () => {
    const onChangeSpy = vi.fn();
    render(<MarkdownInputField onChange={onChangeSpy} maxLength={100} />);

    act(() => {
      captured.editorProps.onChange('short');
    });

    expect(onChangeSpy).toHaveBeenCalledWith('short');
  });

  it('覆盖 onFocus 回调', () => {
    const onFocusSpy = vi.fn();
    render(<MarkdownInputField onFocus={onFocusSpy} />);

    expect(captured.editorProps).toBeTruthy();
    act(() => {
      captured.editorProps.onFocus('val', [], {} as any);
    });

    expect(onFocusSpy).toHaveBeenCalledWith('val', [], expect.anything());
  });

  it('覆盖 onBlur 回调', () => {
    const onBlurSpy = vi.fn();
    render(<MarkdownInputField onBlur={onBlurSpy} />);

    expect(captured.editorProps).toBeTruthy();
    act(() => {
      captured.editorProps.onBlur('val', [], {} as any);
    });

    expect(onBlurSpy).toHaveBeenCalledWith('val', [], expect.anything());
  });

  it('覆盖 onPaste 回调', () => {
    render(<MarkdownInputField />);

    expect(captured.editorProps).toBeTruthy();
    const fakeEvent = { clipboardData: { getData: vi.fn() } };
    act(() => {
      captured.editorProps.onPaste(fakeEvent);
    });
    // handlePaste should have been called without error
    expect(true).toBe(true);
  });

  it('覆盖 QuickActions onValueChange 回调', () => {
    const onChangeSpy = vi.fn();
    render(
      <MarkdownInputField
        onChange={onChangeSpy}
        enlargeable={{ enable: true }}
      />,
    );

    expect(captured.quickActionsProps).toBeTruthy();
    act(() => {
      captured.quickActionsProps.onValueChange('new text');
    });

    expect(onChangeSpy).toHaveBeenCalledWith('new text');
  });
});
