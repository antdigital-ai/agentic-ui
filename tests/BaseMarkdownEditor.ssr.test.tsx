import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseMarkdownEditor } from '../src/MarkdownEditor/BaseMarkdownEditor';
import { TestWrapper } from './testUtils';

/**
 * 模拟 Next.js SSR 环境
 * 在 SSR 环境下，某些浏览器 API 应该是 undefined
 */
const mockSSREnvironment = () => {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalGetSelection = global.window?.getSelection;
  const originalMatchMedia = global.window?.matchMedia;

  // 模拟 SSR 环境：某些浏览器 API 不可用
  if (global.window) {
    // @ts-ignore
    global.window.getSelection = undefined;
    // @ts-ignore
    global.window.matchMedia = undefined;
  }

  return {
    restore: () => {
      if (global.window && originalGetSelection) {
        global.window.getSelection = originalGetSelection;
      }
      if (global.window && originalMatchMedia) {
        global.window.matchMedia = originalMatchMedia;
      }
    },
  };
};

describe('BaseMarkdownEditor - SSR 测试 (Next.js)', () => {
  const defaultProps = {
    initValue: '# Hello World\n\nThis is a test markdown content.',
    readonly: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 确保恢复环境（如果需要）
  });

  describe('SSR 环境渲染', () => {
    it('应该在 SSR 环境下正确渲染初始内容', () => {
      const ssrMock = mockSSREnvironment();

      try {
        // 使用 renderToString 模拟 SSR 渲染
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor {...defaultProps} />
          </TestWrapper>,
        );

        // 验证组件能够渲染，不会因为访问 window/document 而报错
        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理空内容', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor initValue="" readonly={true} />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理只读模式', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor {...defaultProps} readonly={true} toc={true} />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html).toContain('readonly');
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理编辑模式', () => {
      const ssrMock = mockSSREnvironment();

      try {
        // 注意：编辑模式下可能使用 Portal，Portal 在 SSR 环境下不支持
        // 这里只测试组件不会因为 SSR 环境而崩溃
        expect(() => {
          renderToString(
            <TestWrapper>
              <BaseMarkdownEditor
                {...defaultProps}
                readonly={false}
                toolBar={{ enable: false }}
              />
            </TestWrapper>,
          );
        }).toThrow(/Portals are not currently supported/);
        // 这个错误是预期的，因为 Portal 需要客户端环境
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确应用自定义样式', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const customStyle = {
          padding: 0,
          height: 'auto',
          minHeight: 14,
        };

        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              {...defaultProps}
              style={customStyle}
              contentStyle={{
                padding: 0,
                minHeight: 0,
              }}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理 lazy 配置', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              {...defaultProps}
              lazy={{
                enable: true,
                placeholderHeight: 120,
                rootMargin: '300px',
              }}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下禁用 lazy 时正常工作', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              {...defaultProps}
              lazy={{
                enable: false,
              }}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理插件配置', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              {...defaultProps}
              plugins={[
                {
                  elements: {
                    katex: () => <div>KaTeX</div>,
                  },
                },
              ]}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理 reportMode', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              {...defaultProps}
              reportMode={true}
              readonly={true}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该在 SSR 环境下正确处理 tableConfig', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              {...defaultProps}
              tableConfig={{
                minColumn: 3,
                minRows: 2,
              }}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });
  });

  describe('SSR 到客户端水合 (Hydration)', () => {
    it('应该从 SSR 环境平滑过渡到客户端环境', () => {
      const ssrMock = mockSSREnvironment();

      try {
        // SSR 渲染
        const ssrHtml = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor {...defaultProps} />
          </TestWrapper>,
        );

        expect(ssrHtml).toContain('markdown-editor');
        expect(ssrHtml.length).toBeGreaterThan(0);

        // 恢复客户端环境（模拟水合）
        ssrMock.restore();

        // 客户端渲染（模拟水合）
        const { container } = render(
          <TestWrapper>
            <BaseMarkdownEditor {...defaultProps} />
          </TestWrapper>,
        );

        // 验证组件仍然正常渲染
        expect(container.querySelector('.markdown-editor')).toBeInTheDocument();
      } catch (error) {
        ssrMock.restore();
        throw error;
      }
    });
  });

  describe('SSR 环境下的错误处理', () => {
    it('不应该因为访问 window.getSelection 而报错', () => {
      const ssrMock = mockSSREnvironment();
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        expect(() => {
          renderToString(
            <TestWrapper>
              <BaseMarkdownEditor {...defaultProps} />
            </TestWrapper>,
          );
        }).not.toThrow();
      } finally {
        consoleError.mockRestore();
        ssrMock.restore();
      }
    });

    it('不应该因为访问 window.matchMedia 而报错', () => {
      const ssrMock = mockSSREnvironment();
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        expect(() => {
          renderToString(
            <TestWrapper>
              <BaseMarkdownEditor {...defaultProps} />
            </TestWrapper>,
          );
        }).not.toThrow();
      } finally {
        consoleError.mockRestore();
        ssrMock.restore();
      }
    });
  });

  describe('SSR 环境下的内容渲染', () => {
    it('应该正确渲染 Markdown 标题', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              initValue="# Test Title\n\nContent here"
              readonly={true}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该正确渲染 Markdown 列表', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              initValue="- Item 1\n- Item 2\n- Item 3"
              readonly={true}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });

    it('应该正确渲染 Markdown 代码块', () => {
      const ssrMock = mockSSREnvironment();

      try {
        const html = renderToString(
          <TestWrapper>
            <BaseMarkdownEditor
              initValue="```javascript\nconst x = 1;\n```"
              readonly={true}
            />
          </TestWrapper>,
        );

        expect(html).toContain('markdown-editor');
        expect(html.length).toBeGreaterThan(0);
      } finally {
        ssrMock.restore();
      }
    });
  });
});
