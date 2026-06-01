/**
 * usePasteHandler Hook 单元测试
 * 由原 useMarkdownInputFieldHandlers.test.ts 中 handlePaste 段拆分而来。
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePasteHandler } from '../usePasteHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

const mockUpLoadFileToServer = vi.fn();
vi.mock('../../AttachmentButton', () => ({
  upLoadFileToServer: (...args: any[]) => mockUpLoadFileToServer(...args),
}));

const mockGetFileListFromDataTransferItems = vi.fn();
vi.mock('../../FilePaste', () => ({
  getFileListFromDataTransferItems: (...args: any[]) =>
    mockGetFileListFromDataTransferItems(...args),
}));

function createDefaultParams(overrides: Record<string, any> = {}) {
  return {
    props: {
      attachment: undefined as any,
      markdownProps: undefined as any,
    },
    fileMap: new Map(),
    setFileMap: vi.fn(),
    ...overrides,
  };
}

describe('usePasteHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('使用 markdownProps.attachment 当 props.attachment 为空', async () => {
    const params = createDefaultParams();
    params.props.markdownProps = {
      attachment: { enable: true, upload: vi.fn() },
    };
    mockGetFileListFromDataTransferItems.mockResolvedValue([
      { type: 'image/png', name: 'a.png' },
    ]);
    const { result } = renderHook(() => usePasteHandler(params));
    const e = { clipboardData: { items: [] } } as any;
    await result.current.handlePaste(e);
    // 源码现在传的是 e.clipboardData，而非整个事件对象（与 DOM API 签名一致）。
    expect(mockGetFileListFromDataTransferItems).toHaveBeenCalledWith(
      e.clipboardData,
    );
    expect(mockUpLoadFileToServer).toHaveBeenCalled();
  });

  it('attachment.enable 为 false 或未设置时不进行粘贴上传', async () => {
    const params = createDefaultParams();
    params.props.attachment = { enable: false, upload: vi.fn() };
    mockGetFileListFromDataTransferItems.mockResolvedValue([
      { type: 'image/png', name: 'a.png' },
    ]);
    const { result } = renderHook(() => usePasteHandler(params));
    await result.current.handlePaste({ clipboardData: { items: [] } } as any);
    expect(mockGetFileListFromDataTransferItems).not.toHaveBeenCalled();
    expect(mockUpLoadFileToServer).not.toHaveBeenCalled();
  });

  it('无 upload 且无 uploadWithResponse 时直接 return', async () => {
    const params = createDefaultParams();
    params.props.attachment = { enable: true };
    const { result } = renderHook(() => usePasteHandler(params));
    await result.current.handlePaste({ clipboardData: { items: [] } } as any);
    expect(mockUpLoadFileToServer).not.toHaveBeenCalled();
  });

  it('粘贴内容中无图片时直接 return', async () => {
    const params = createDefaultParams();
    params.props.attachment = { enable: true, upload: vi.fn() };
    mockGetFileListFromDataTransferItems.mockResolvedValue([
      { type: 'text/plain', name: 'a.txt' },
    ]);
    const { result } = renderHook(() => usePasteHandler(params));
    await result.current.handlePaste({ clipboardData: { items: [] } } as any);
    expect(mockUpLoadFileToServer).not.toHaveBeenCalled();
  });

  it('粘贴含图片时调用 upLoadFileToServer', async () => {
    const params = createDefaultParams();
    params.props.attachment = { enable: true, upload: vi.fn() };
    mockGetFileListFromDataTransferItems.mockResolvedValue([
      { type: 'image/png', name: 'p.png' },
    ]);
    const { result } = renderHook(() => usePasteHandler(params));
    const e = { clipboardData: { items: [] } } as any;
    await result.current.handlePaste(e);
    expect(mockUpLoadFileToServer).toHaveBeenCalledWith(
      [{ type: 'image/png', name: 'p.png' }],
      expect.objectContaining({
        upload: expect.any(Function),
        fileMap: params.fileMap,
        onFileMapChange: params.setFileMap,
      }),
    );
  });
});
