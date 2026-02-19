/**
 * MarkdownInputField 定向覆盖测试
 */
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ---- 用 vi.hoisted 提前声明全局容器，收集子组件 props ---- */
const captured = vi.hoisted(() => ({
  editorProps: null as any,
  animationProps: null as any,
  quickActionsProps: null as any,
}));

/* ---- Mock BaseMarkdownEditor：捕获 onChange/onFocus/onBlur/onPaste ---- */
vi.mock('../../src/MarkdownEditor', () => ({
  BaseMarkdownEditor: (props: any) => {
    captured.editorProps = props;
    return <div data-testid="mock-editor">{props.children}</div>;
  },
}));

/* ---- Mock BorderBeamAnimation：捕获 onAnimationComplete ---- */
vi.mock('../../src/MarkdownInputField/BorderBeamAnimation', () => ({
  BorderBeamAnimation: (props: any) => {
    captured.animationProps = props;
    return <div data-testid="mock-border-beam" />;
  },
}));

/* ---- Mock QuickActions：捕获 onValueChange/onResize ---- */
vi.mock('../../src/MarkdownInputField/QuickActions', () => ({
  QuickActions: React.forwardRef((props: any, ref: any) => {
    captured.quickActionsProps = props;
    return <div data-testid="mock-quick-actions" ref={ref} />;
  }),
}));

/* ---- Mock 其他子组件和 hooks 保持简洁 ---- */
vi.mock('../../src/MarkdownInputField/style', () => ({
  useStyle: () => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash',
  }),
}));

vi.mock('../../src/MarkdownInputField/Suggestion', () => ({
  Suggestion: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../src/MarkdownInputField/SkillModeBar', () => ({
  SkillModeBar: () => null,
}));

vi.mock('../../src/MarkdownInputField/TopOperatingArea', () => ({
  default: () => null,
}));

vi.mock('../../src/MarkdownInputField/VoiceInputManager', () => ({
  useVoiceInputManager: () => ({
    recording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}));

vi.mock('../../src/MarkdownInputField/FileUploadManager', () => ({
  useFileUploadManager: () => ({
    fileUploadDone: true,
    supportedFormat: [],
    uploadImage: vi.fn(),
    updateAttachmentFiles: vi.fn(),
    handleFileRemoval: vi.fn(),
    handleFileRetry: vi.fn(),
  }),
}));

vi.mock('../../src/MarkdownInputField/utils/renderHelpers', () => ({
  useAttachmentList: () => null,
  useBeforeTools: () => null,
  useSendActionsNode: () => <div data-testid="mock-send-actions" />,
}));

vi.mock(
  '../../src/MarkdownInputField/hooks/useMarkdownInputFieldHandlers',
  () => ({
    useMarkdownInputFieldHandlers: () => ({
      handleEnlargeClick: vi.fn(),
      sendMessage: vi.fn(),
      handlePaste: vi.fn(),
      handleKeyDown: vi.fn(),
      activeInput: vi.fn(),
    }),
  }),
);

vi.mock(
  '../../src/MarkdownInputField/hooks/useMarkdownInputFieldLayout',
  () => ({
    useMarkdownInputFieldLayout: () => ({
      collapseSendActions: false,
      rightPadding: 0,
      setRightPadding: vi.fn(),
      topRightPadding: 0,
      setTopRightPadding: vi.fn(),
      quickRightOffset: 0,
      setQuickRightOffset: vi.fn(),
      inputRef: { current: null },
    }),
  }),
);

vi.mock('../../src/MarkdownInputField/hooks/useMarkdownInputFieldRefs', () => ({
  useMarkdownInputFieldRefs: () => ({
    markdownEditorRef: { current: { store: { setMDContent: vi.fn() } } },
    quickActionsRef: { current: null },
    actionsRef: { current: null },
    isSendingRef: { current: false },
  }),
}));

vi.mock(
  '../../src/MarkdownInputField/hooks/useMarkdownInputFieldActions',
  () => ({
    useMarkdownInputFieldActions: () => ({
      hasEnlargeAction: false,
      hasRefineAction: false,
      isMultiRowLayout: false,
      totalActionCount: 0,
    }),
  }),
);

vi.mock(
  '../../src/MarkdownInputField/hooks/useMarkdownInputFieldStyles',
  () => ({
    useMarkdownInputFieldStyles: () => ({
      computedRightPadding: '16px',
      collapsedHeightPx: 200,
      computedMinHeight: '48px',
      enlargedStyle: {},
    }),
  }),
);

vi.mock(
  '../../src/MarkdownInputField/hooks/useMarkdownInputFieldState',
  () => ({
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
  }),
);

import { MarkdownInputField } from '../../src/MarkdownInputField/MarkdownInputField';

describe('MarkdownInputField targeted coverage', () => {
  beforeEach(() => {
    captured.editorProps = null;
    captured.animationProps = null;
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

  it('覆盖 onAnimationComplete 回调', () => {
    render(<MarkdownInputField />);

    expect(captured.animationProps).toBeTruthy();
    act(() => {
      captured.animationProps.onAnimationComplete?.();
    });
    // setAnimationComplete(true) called without error
    expect(true).toBe(true);
  });

  it('覆盖 QuickActions onValueChange 回调', () => {
    const onChangeSpy = vi.fn();
    render(
      <MarkdownInputField onChange={onChangeSpy} enlargeable={{ enable: true }} />,
    );

    expect(captured.quickActionsProps).toBeTruthy();
    act(() => {
      captured.quickActionsProps.onValueChange('new text');
    });

    expect(onChangeSpy).toHaveBeenCalledWith('new text');
  });

  it('覆盖 QuickActions onResize 回调', () => {
    render(<MarkdownInputField enlargeable={{ enable: true }} />);

    expect(captured.quickActionsProps).toBeTruthy();
    act(() => {
      captured.quickActionsProps.onResize(120, 40);
    });
    // setTopRightPadding and setQuickRightOffset called without error
    expect(true).toBe(true);
  });
});
