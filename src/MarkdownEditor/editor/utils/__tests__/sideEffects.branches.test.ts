import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { download } from '../sideEffects';

describe('sideEffects download 分支覆盖', () => {
  const mockCreateObjectURL = vi.fn(() => 'blob:mock');
  const mockRevokeObjectURL = vi.fn();
  const mockClick = vi.fn();
  let link: HTMLAnchorElement;

  beforeEach(() => {
    link = {
      download: 'file',
      href: '',
      style: { visibility: '' },
      setAttribute: vi.fn(function (this: HTMLAnchorElement, key: string, val: string) {
        if (key === 'href') this.href = val;
        if (key === 'download') this.download = val;
      }),
      addEventListener: vi.fn(),
      click: mockClick,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(link);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => link);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => link);
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('download Uint8Array 转为 Blob 并触发下载', () => {
    download(new Uint8Array([1, 2, 3]), 'data.bin');
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockClick).toHaveBeenCalled();
  });

  it('download Blob 直接触发下载', () => {
    const blob = new Blob(['hello']);
    download(blob, 'hello.txt');
    expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
    expect(mockClick).toHaveBeenCalled();
  });
});

describe('sideEffects istanbul residual：download 属性缺失早退', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('link.download === undefined 时不触发 click', () => {
    // if (link.download !== undefined)
    const mockClick = vi.fn();
    const link = {
      download: undefined,
      href: '',
      style: { visibility: '' },
      setAttribute: vi.fn(),
      addEventListener: vi.fn(),
      click: mockClick,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(link);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => link);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => link);

    download(new Blob(['x']), 'x.txt');
    expect(mockClick).not.toHaveBeenCalled();
  });
});
