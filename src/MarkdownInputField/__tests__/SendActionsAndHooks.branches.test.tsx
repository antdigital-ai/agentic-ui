/**
 * useEnlargeAndContainerHandler / useFileUploadManager / SendActions residual branches
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { SendActions } from '../SendActions';
import { useEnlargeAndContainerHandler } from '../hooks/useEnlargeAndContainerHandler';
import { useFileUploadManager } from '../hooks/useFileUploadManager';

vi.mock('../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('slate', () => ({
  Editor: { end: vi.fn(() => ({ path: [0, 0], offset: 0 })) },
  Transforms: { select: vi.fn() },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    isFocused: vi.fn(() => false),
  },
}));

vi.mock('../AttachmentButton', () => ({
  AttachmentButton: ({ title, disabled }: any) => (
    <button type="button" data-testid="attachment-btn" title={title} disabled={disabled}>
      attach
    </button>
  ),
}));

vi.mock('../VoiceInput', () => ({
  VoiceInputButton: ({ title, disabled }: any) => (
    <button type="button" data-testid="voice-btn" title={title} disabled={disabled}>
      voice
    </button>
  ),
}));

vi.mock('../SendButton', () => ({
  resolveSendDisabled: (props: any, status: string) =>
    props?.disabled ?? status === 'error',
  SendButton: ({ onClick, typing, isSendable }: any) => (
    <button
      type="button"
      data-testid="send-btn"
      data-typing={String(!!typing)}
      data-sendable={String(!!isSendable)}
      onClick={onClick}
    >
      send
    </button>
  ),
}));

vi.mock('../AttachmentButton/utils', () => ({
  isMobileDevice: vi.fn(() => false),
  isVivoOrOppoDevice: vi.fn(() => false),
  isWeChat: vi.fn(() => false),
}));

vi.mock('../utils/uploadFile', () => ({
  upLoadFileToServer: vi.fn().mockResolvedValue(undefined),
}));

describe('useEnlargeAndContainerHandler istanbul residual', () => {
  it('toggle enlarge / disabled / typing / missing editor early returns', () => {
    const setIsEnlarged = vi.fn();
    const input = document.createElement('div');
    const { result } = renderHook(() =>
      useEnlargeAndContainerHandler({
        props: { disabled: false, typing: false },
        markdownEditorRef: { current: undefined },
        inputRef: { current: input },
        isEnlarged: false,
        setIsEnlarged,
      }),
    );
    result.current.handleEnlargeClick();
    expect(setIsEnlarged).toHaveBeenCalledWith(true);

    result.current.handleContainerClick({
      target: document.createElement('div'),
    } as any);

    const { result: disabledResult } = renderHook(() =>
      useEnlargeAndContainerHandler({
        props: { disabled: true, typing: false },
        markdownEditorRef: {
          current: {
            markdownEditorRef: { current: { children: [] } },
          },
        } as any,
        inputRef: { current: input },
        isEnlarged: false,
        setIsEnlarged,
      }),
    );
    disabledResult.current.handleContainerClick({
      target: document.createElement('div'),
    } as any);

    const { result: typingResult } = renderHook(() =>
      useEnlargeAndContainerHandler({
        props: { disabled: false, typing: true },
        markdownEditorRef: {
          current: {
            markdownEditorRef: { current: { children: [] } },
          },
        } as any,
        inputRef: { current: input },
        isEnlarged: false,
        setIsEnlarged,
      }),
    );
    typingResult.current.handleContainerClick({
      target: document.createElement('div'),
    } as any);
  });

  it('interactive target / focus / activeInput null ref', async () => {
    const { ReactEditor } = await import('slate-react');
    const { EditorUtils } = await import(
      '../../MarkdownEditor/editor/utils/editorUtils'
    );
    vi.mocked(ReactEditor.isFocused).mockReturnValue(false);
    const editor = { children: [] };
    const input = document.createElement('div');
    const { result } = renderHook(() =>
      useEnlargeAndContainerHandler({
        props: { disabled: false, typing: false },
        markdownEditorRef: {
          current: { markdownEditorRef: { current: editor } },
        } as any,
        inputRef: { current: input },
        isEnlarged: true,
        setIsEnlarged: vi.fn(),
      }),
    );

    const button = document.createElement('button');
    result.current.handleContainerClick({ target: button } as any);
    expect(EditorUtils.focus).not.toHaveBeenCalled();

    const div = document.createElement('div');
    result.current.handleContainerClick({ target: div } as any);
    expect(EditorUtils.focus).toHaveBeenCalled();

    result.current.activeInput(true);
    expect(input.tabIndex).toBe(1);
    expect(input.classList.contains('active')).toBe(true);
    result.current.activeInput(false);
    expect(input.tabIndex).toBe(-1);

    const { result: nullRef } = renderHook(() =>
      useEnlargeAndContainerHandler({
        props: {},
        markdownEditorRef: { current: undefined },
        inputRef: { current: null },
        isEnlarged: false,
        setIsEnlarged: vi.fn(),
      }),
    );
    expect(() => nullRef.current.activeInput(true)).not.toThrow();
  });

  it('isFocused true / throws 早退', async () => {
    const { ReactEditor } = await import('slate-react');
    vi.mocked(ReactEditor.isFocused).mockReturnValue(true);
    const { EditorUtils } = await import(
      '../../MarkdownEditor/editor/utils/editorUtils'
    );
    vi.mocked(EditorUtils.focus).mockClear();
    const { result } = renderHook(() =>
      useEnlargeAndContainerHandler({
        props: {},
        markdownEditorRef: {
          current: { markdownEditorRef: { current: {} } },
        } as any,
        inputRef: { current: document.createElement('div') },
        isEnlarged: false,
        setIsEnlarged: vi.fn(),
      }),
    );
    result.current.handleContainerClick({
      target: document.createElement('div'),
    } as any);
    expect(EditorUtils.focus).not.toHaveBeenCalled();

    vi.mocked(ReactEditor.isFocused).mockImplementation(() => {
      throw new Error('no focus');
    });
    result.current.handleContainerClick({
      target: document.createElement('div'),
    } as any);
    expect(EditorUtils.focus).toHaveBeenCalled();
  });
});

describe('useFileUploadManager istanbul residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('空 map / uploading / error 状态矩阵', () => {
    const { result: empty } = renderHook(() =>
      useFileUploadManager({ fileMap: new Map() }),
    );
    expect(empty.current.fileUploadDone).toBe(true);
    expect(empty.current.fileUploadStatus).toBe('done');

    const uploading = new Map([
      ['a', { uuid: 'a', status: 'uploading', name: 'a.png' } as any],
    ]);
    const { result: up } = renderHook(() =>
      useFileUploadManager({ fileMap: uploading }),
    );
    expect(up.current.fileUploadStatus).toBe('uploading');
    expect(up.current.fileUploadDone).toBe(false);

    const errored = new Map([
      ['a', { uuid: 'a', status: 'error', name: 'a.png' } as any],
      ['b', { uuid: 'b', status: 'uploading', name: 'b.png' } as any],
    ]);
    const { result: err } = renderHook(() =>
      useFileUploadManager({ fileMap: errored }),
    );
    expect(err.current.fileUploadStatus).toBe('error');
  });

  it('supportedFormat null 回退默认 image；update 无 onFileMapChange', () => {
    const { result } = renderHook(() =>
      useFileUploadManager({
        attachment: { supportedFormat: null as any },
        fileMap: undefined,
      }),
    );
    expect(result.current.supportedFormat).toBeTruthy();
    expect(() => result.current.updateAttachmentFiles(undefined)).not.toThrow();
  });

  it('uploadImage 有 uploading 文件时早退', async () => {
    const map = new Map([
      ['a', { uuid: 'a', status: 'uploading', name: 'a.png' } as any],
    ]);
    const { result } = renderHook(() =>
      useFileUploadManager({ fileMap: map, attachment: { enable: true } }),
    );
    await act(async () => {
      await result.current.uploadImage();
    });
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it('getAcceptValue 扩展名列表与 gallery', async () => {
    const { isMobileDevice, isWeChat, isVivoOrOppoDevice } = await import(
      '../AttachmentButton/utils'
    );
    vi.mocked(isMobileDevice).mockReturnValue(false);
    vi.mocked(isWeChat).mockReturnValue(false);
    vi.mocked(isVivoOrOppoDevice).mockReturnValue(false);
    const { result } = renderHook(() =>
      useFileUploadManager({
        attachment: {
          enable: true,
          supportedFormat: { extensions: ['png', 'jpg'] } as any,
        },
        fileMap: new Map(),
      }),
    );
    await act(async () => {
      await result.current.uploadImage(true);
    });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input?.accept).toBe('image/*');
  });

  it('handleFileRemoval 无 onDelete / 无 uuid', async () => {
    const onFileMapChange = vi.fn();
    const map = new Map([
      ['a', { uuid: 'a', status: 'done', name: 'a.png' } as any],
      ['b', { name: 'no-uuid.png', status: 'done' } as any],
    ]);
    const { result } = renderHook(() =>
      useFileUploadManager({
        fileMap: map,
        onFileMapChange,
        attachment: {},
      }),
    );
    await act(async () => {
      await result.current.handleFileRemoval(map.get('a')!);
    });
    expect(onFileMapChange).toHaveBeenCalled();
    await act(async () => {
      await result.current.handleFileRemoval({ name: 'x' } as any);
    });
  });
});

describe('SendActions istanbul residual', () => {
  const wrap = (ui: React.ReactElement) =>
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        {ui}
      </I18nContext.Provider>,
    );

  it('fileUploadDone=false 默认 status uploading', () => {
    wrap(
      <SendActions
        fileUploadDone={false}
        value="hi"
        onSend={vi.fn()}
      />,
    );
    expect(screen.getByTestId('send-btn')).toBeInTheDocument();
  });

  it('仅 attachment / 仅 voice / 两者 / 都无', () => {
    const { unmount } = wrap(
      <SendActions attachment={{ enable: true }} value="a" />,
    );
    expect(screen.getByTestId('attachment-btn')).toBeInTheDocument();
    unmount();
    wrap(
      <SendActions voiceRecognizer={vi.fn() as any} value="a" />,
    );
    expect(screen.getByTestId('voice-btn')).toBeInTheDocument();
  });

  it('collapse + 三按钮时 title fallback；省略回调不抛错', () => {
    let capturedTitles: Array<React.ReactNode> = [];
    wrap(
      <SendActions
        attachment={{ enable: true }}
        voiceRecognizer={vi.fn() as any}
        collapseSendActions
        value="hi"
        fileUploadDone
        actionsRender={(_state, defaults) => {
          capturedTitles = defaults
            .filter(React.isValidElement)
            .map((el) => (el as React.ReactElement<any>).props?.title)
            .filter(Boolean);
          return defaults;
        }}
      />,
    );
    expect(capturedTitles).toEqual(
      expect.arrayContaining(['文件上传', '语音输入']),
    );
    expect(
      screen.getByTestId('markdown-input-field-more-actions'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('send-btn'));
  });

  it('whitespace value 不可发送；fileMap 非空可发送', () => {
    const map = new Map([['f', { name: 'a.png' } as any]]);
    wrap(
      <SendActions
        value="   "
        attachment={{ enable: true, fileMap: map }}
      />,
    );
    expect(screen.getByTestId('send-btn')).toHaveAttribute(
      'data-sendable',
      'true',
    );
  });

  it('typing 时点击触发 onStop', () => {
    const onStop = vi.fn();
    wrap(<SendActions value="x" typing onStop={onStop} />);
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(onStop).toHaveBeenCalled();
  });

  it('actionsRender 返回自定义列表', () => {
    wrap(
      <SendActions
        value="x"
        actionsRender={() => [
          <button key="custom" type="button" data-testid="custom-action">
            c
          </button>,
        ]}
      />,
    );
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
});
