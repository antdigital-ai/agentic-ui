import { fireEvent, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

/**
 * linkConfig 测试工具函数
 * 用于统一测试图片/媒体组件加载失败时的 linkConfig 行为
 */

export interface LinkConfigTestOptions {
  /** 获取失败链接元素的方法 */
  getErrorLink: () => Promise<HTMLElement | null>;
  /** 触发错误的函数（如 fireEvent.error） */
  triggerError?: () => void;
  /** 测试用的 URL */
  testUrl: string;
  /** mock 的 window.open 函数 */
  mockWindowOpen: ReturnType<typeof vi.fn>;
  /** 更新 editorStore mock 的函数 */
  updateEditorStore: (linkConfig: {
    onClick?: (url: string) => boolean | void;
    openInNewTab?: boolean;
  }) => Promise<void>;
}

/**
 * 创建 linkConfig 标准测试套件
 * 在 describe 块中调用此函数来添加所有标准测试
 */
export function createLinkConfigTestSuite(options: LinkConfigTestOptions) {
  const {
    getErrorLink,
    triggerError,
    testUrl,
    mockWindowOpen,
    updateEditorStore,
  } = options;

  // beforeEach 需要在外部 describe 块中定义，这里不重复定义

  it('应该调用 linkConfig.onClick 当点击失败链接时', async () => {
    const onClick = vi.fn();
    await updateEditorStore({
      onClick,
    });

    if (triggerError) {
      triggerError();
    }

    const link = await waitFor(async () => {
      const element = await getErrorLink();
      if (!element) {
        throw new Error('链接元素未找到');
      }
      return element;
    });

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledWith(testUrl);
  });

  it('当 linkConfig.onClick 返回 false 时应该阻止默认行为', async () => {
    const onClick = vi.fn().mockReturnValue(false);
    await updateEditorStore({
      onClick,
    });

    if (triggerError) {
      triggerError();
    }

    const link = await waitFor(async () => {
      const element = await getErrorLink();
      if (!element) {
        throw new Error('链接元素未找到');
      }
      return element;
    });

    fireEvent.click(link, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(onClick).toHaveBeenCalledWith(testUrl);
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('当 linkConfig.onClick 返回非 false 时应该执行默认行为', async () => {
    const onClick = vi.fn().mockReturnValue(undefined);
    await updateEditorStore({
      onClick,
      openInNewTab: true,
    });

    if (triggerError) {
      triggerError();
    }

    const link = await waitFor(async () => {
      const element = await getErrorLink();
      if (!element) {
        throw new Error('链接元素未找到');
      }
      return element;
    });

    fireEvent.click(link, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(onClick).toHaveBeenCalledWith(testUrl);
    expect(mockWindowOpen).toHaveBeenCalledWith(testUrl, '_blank');
  });

  it('应该根据 linkConfig.openInNewTab 控制打开方式（新标签页）', async () => {
    await updateEditorStore({
      openInNewTab: true,
    });

    if (triggerError) {
      triggerError();
    }

    const link = await waitFor(async () => {
      const element = await getErrorLink();
      if (!element) {
        throw new Error('链接元素未找到');
      }
      return element;
    });

    fireEvent.click(link, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(mockWindowOpen).toHaveBeenCalledWith(testUrl, '_blank');
  });

  it('应该根据 linkConfig.openInNewTab 控制打开方式（当前标签页）', async () => {
    await updateEditorStore({
      openInNewTab: false,
    });

    if (triggerError) {
      triggerError();
    }

    const link = await waitFor(async () => {
      const element = await getErrorLink();
      if (!element) {
        throw new Error('链接元素未找到');
      }
      return element;
    });

    fireEvent.click(link, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(mockWindowOpen).toHaveBeenCalledWith(testUrl, '_self');
  });

  it('默认情况下应该在新标签页打开链接', async () => {
    await updateEditorStore({});

    if (triggerError) {
      triggerError();
    }

    const link = await waitFor(async () => {
      const element = await getErrorLink();
      if (!element) {
        throw new Error('链接元素未找到');
      }
      return element;
    });

    fireEvent.click(link, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    // 默认应该在新标签页打开（openInNewTab 未设置时默认为 true）
    expect(mockWindowOpen).toHaveBeenCalledWith(testUrl, '_blank');
  });
}
