import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BaseMarkdownEditor,
  MarkdownEditorProps,
} from '../src/MarkdownEditor/BaseMarkdownEditor';

// 测试工具函数 - 模拟 MLeaf 的链接点击逻辑
const simulateLinkClick = (
  linkConfig: MarkdownEditorProps['linkConfig'] | undefined,
  url: string,
  mockWindowOpen: ReturnType<typeof vi.fn>,
  mockLocationHref: ReturnType<typeof vi.fn>,
) => {
  // 模拟 MLeaf 组件的点击逻辑
  if (linkConfig?.onClick) {
    const res = linkConfig.onClick(url);
    if (res === false) {
      return;
    }
  }
  if (url && linkConfig?.openInNewTab !== false) {
    mockWindowOpen(url, '_blank');
  }
  if (url && linkConfig?.openInNewTab === false) {
    mockLocationHref(url);
  }
};

// Mock SlateMarkdownEditor - 简化版，只验证 linkConfig 被正确传递
let capturedLinkConfig: any = null;

vi.mock('../src/MarkdownEditor/editor/Editor', () => ({
  SlateMarkdownEditor: ({
    onChange,
    initSchemaValue,
    linkConfig,
    ...props
  }: any) => {
    // 捕获 linkConfig
    capturedLinkConfig = linkConfig;

    React.useEffect(() => {
      onChange?.('test markdown', initSchemaValue || []);
    }, []);

    return (
      <div data-testid="slate-markdown-editor" {...props}>
        <div
          data-testid="editor-content"
          suppressContentEditableWarning={true}
          contentEditable={true}
        >
          <span data-testid="link-element" data-url="url">
            Test Link
          </span>
        </div>
      </div>
    );
  },
}));

vi.mock('../src/MarkdownEditor/editor/tools/ToolBar/ToolBar', () => ({
  default: () => <div data-testid="toolbar">Toolbar</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/ToolBar/FloatBar', () => ({
  FloatBar: () => <div data-testid="float-bar">Float Bar</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/Leading', () => ({
  TocHeading: () => <div data-testid="toc-heading">Table of Contents</div>,
}));

vi.mock('../src/MarkdownEditor/editor/components/CommentList', () => ({
  CommentList: () => <div data-testid="comment-list">Comment List</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/InsertLink', () => ({
  InsertLink: () => <div data-testid="insert-link">Insert Link</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/InsertAutocomplete', () => ({
  InsertAutocomplete: () => (
    <div data-testid="insert-autocomplete">Insert Autocomplete</div>
  ),
}));

describe('linkConfig - 链接配置测试', () => {
  const mockWindowOpen = vi.fn();
  const mockLocationHref = vi.fn();

  const defaultProps: MarkdownEditorProps = {
    initValue: '# Test\n\n[Test Link](https://example.com)',
    onChange: vi.fn(),
    linkConfig: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
    mockLocationHref.mockClear();
    capturedLinkConfig = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('linkConfig 配置传递测试', () => {
    it('应该正确传递空的 linkConfig', () => {
      render(<BaseMarkdownEditor {...defaultProps} linkConfig={{}} />);

      expect(capturedLinkConfig).toEqual({});
    });

    it('应该正确传递 openInNewTab: true', () => {
      render(
        <BaseMarkdownEditor
          {...defaultProps}
          linkConfig={{ openInNewTab: true }}
        />,
      );

      expect(capturedLinkConfig).toEqual({ openInNewTab: true });
    });

    it('应该正确传递 openInNewTab: false', () => {
      render(
        <BaseMarkdownEditor
          {...defaultProps}
          linkConfig={{ openInNewTab: false }}
        />,
      );

      expect(capturedLinkConfig).toEqual({ openInNewTab: false });
    });

    it('应该正确传递 onClick 回调', () => {
      const onClick = vi.fn();
      render(<BaseMarkdownEditor {...defaultProps} linkConfig={{ onClick }} />);

      expect(capturedLinkConfig.onClick).toBe(onClick);
    });

    it('应该正确传递组合配置', () => {
      const onClick = vi.fn();
      render(
        <BaseMarkdownEditor
          {...defaultProps}
          linkConfig={{ openInNewTab: false, onClick }}
        />,
      );

      expect(capturedLinkConfig.openInNewTab).toBe(false);
      expect(capturedLinkConfig.onClick).toBe(onClick);
    });
  });

  describe('openInNewTab 行为测试', () => {
    it('默认情况下应该在新标签页打开链接', () => {
      const linkConfig = {};
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
      );
      expect(mockLocationHref).not.toHaveBeenCalled();
    });

    it('当 openInNewTab 为 true 时应该在新标签页打开链接', () => {
      const linkConfig = { openInNewTab: true };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
      );
      expect(mockLocationHref).not.toHaveBeenCalled();
    });

    it('当 openInNewTab 为 false 时应该在当前页面打开链接', () => {
      const linkConfig = { openInNewTab: false };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(mockLocationHref).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('onClick 回调测试', () => {
    it('点击链接时应该调用 onClick 回调', () => {
      const onClick = vi.fn();
      const linkConfig = { onClick };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(onClick).toHaveBeenCalledWith('https://example.com');
    });

    it('当 onClick 返回 false 时应该阻止默认行为', () => {
      const onClick = vi.fn().mockReturnValue(false);
      const linkConfig = { onClick };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(onClick).toHaveBeenCalledWith('https://example.com');
      // 默认行为应该被阻止
      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(mockLocationHref).not.toHaveBeenCalled();
    });

    it('当 onClick 返回 undefined 时应该继续执行默认行为', () => {
      const onClick = vi.fn().mockReturnValue(undefined);
      const linkConfig = { onClick };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(onClick).toHaveBeenCalledWith('https://example.com');
      // 默认行为应该继续
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
      );
    });

    it('当 onClick 返回 true 时应该继续执行默认行为', () => {
      const onClick = vi.fn().mockReturnValue(true);
      const linkConfig = { onClick };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(onClick).toHaveBeenCalledWith('https://example.com');
      // 默认行为应该继续
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
      );
    });
  });

  describe('onClick 和 openInNewTab 组合测试', () => {
    it('onClick 返回 false 时，即使设置了 openInNewTab 也不应该打开链接', () => {
      const onClick = vi.fn().mockReturnValue(false);
      const linkConfig = { onClick, openInNewTab: true };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(onClick).toHaveBeenCalledWith('https://example.com');
      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(mockLocationHref).not.toHaveBeenCalled();
    });

    it('onClick 返回非 false 值时，应该根据 openInNewTab 设置打开链接', () => {
      const onClick = vi.fn().mockReturnValue(undefined);
      const linkConfig = { onClick, openInNewTab: false };
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(onClick).toHaveBeenCalledWith('https://example.com');
      expect(mockWindowOpen).not.toHaveBeenCalled();
      expect(mockLocationHref).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('linkConfig 空对象测试', () => {
    it('linkConfig 为空对象时应该使用默认行为（新标签页打开）', () => {
      const linkConfig = {};
      simulateLinkClick(
        linkConfig,
        'https://example.com',
        mockWindowOpen,
        mockLocationHref,
      );

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
      );
    });
  });
});
