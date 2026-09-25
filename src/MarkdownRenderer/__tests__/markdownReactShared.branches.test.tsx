/**
 * markdownReactShared 分支覆盖：createHastProcessor / buildEditorAlignedComponents 路径。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import * as markdownReactShared from '../markdownReactShared';
import { markdownToReactSync } from '../useMarkdownToReact';

// markdownReactShared 从 src/ToolUseBarThink 导入；测试文件在 __tests__/ 下需 ../../
vi.mock('../../ToolUseBarThink', () => ({
  ToolUseBarThink: ({
    toolName,
    status,
    thinkContent,
    testId,
  }: {
    toolName?: string;
    status?: string;
    thinkContent?: string;
    testId?: string;
  }) => (
    <div
      data-testid={testId || 'think'}
      data-status={status}
      data-name={toolName}
    >
      {thinkContent}
    </div>
  ),
}));

describe('markdownReactShared branches', () => {
  it('空内容返回 null', () => {
    expect(markdownToReactSync('')).toBeNull();
  });

  it('标题 h1-h6 各级渲染', () => {
    const md = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    expect(markdownToReactSync(md)).toBeTruthy();
  });

  it('blockquote 与列表渲染', () => {
    expect(markdownToReactSync('> quote\n\n- a\n- b\n\n1. x')).toBeTruthy();
  });

  it('task list 渲染', () => {
    expect(markdownToReactSync('- [x] done\n- [ ] todo')).toBeTruthy();
  });

  it('表格渲染', () => {
    expect(markdownToReactSync('| A | B |\n| - | - |\n| 1 | 2 |')).toBeTruthy();
  });

  it('链接与图片渲染', () => {
    expect(
      markdownToReactSync(
        '[link](https://example.com)\n\n![alt](https://img.png)',
      ),
    ).toBeTruthy();
  });

  it('inline code 与 code block', () => {
    expect(
      markdownToReactSync('`inline`\n\n```js\nconst x = 1;\n```'),
    ).toBeTruthy();
  });

  it('自定义 components 覆盖默认映射', () => {
    const result = markdownToReactSync('**bold**', {
      strong: ({ children }: { children?: React.ReactNode }) =>
        React.createElement('b', { 'data-testid': 'custom-strong' }, children),
    });
    expect(result).toBeTruthy();
  });

  it('htmlConfig allowDangerousHtml 分支', () => {
    expect(
      markdownToReactSync('<div>html</div>', undefined, undefined, {
        allowDangerousHtml: false,
      }),
    ).toBeTruthy();
  });

  it('processor 异常时返回 null', () => {
    vi.spyOn(markdownReactShared, 'createHastProcessor').mockImplementation(
      () => {
        throw new Error('boom');
      },
    );
    expect(markdownToReactSync('# x')).toBeNull();
    vi.restoreAllMocks();
  });

  it('buildEditorAlignedComponents 可被单独调用', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents(
      'prefix',
      {},
      true,
      { openInNewTab: true, onClick: () => false },
      { jumpToFootnote: vi.fn() } as any,
      (props, dom) => (props.tagName === 'p' ? dom : dom),
    );
    expect(comps.p).toBeTypeOf('function');
    expect(comps.h1).toBeTypeOf('function');
    expect(comps.img).toBeTypeOf('function');
  });

  it('think 加载态与完成态', () => {
    const loading = markdownReactShared.buildEditorAlignedComponents(
      'p',
      {},
      false,
    );
    const Loading = loading.think as React.FC<any>;
    const { rerender } = render(<Loading>thinking...</Loading>);
    expect(screen.getByTestId('think-block-renderer')).toHaveAttribute(
      'data-status',
      'loading',
    );
    rerender(<Loading>done</Loading>);
    expect(screen.getByTestId('think-block-renderer')).toHaveAttribute(
      'data-status',
      'success',
    );
  });

  it('eleRender 返回值优先；undefined 回退 defaultDom', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents(
      'p',
      {},
      false,
      undefined,
      undefined,
      (props, _dom) =>
        props.tagName === 'p' ? (
          <div data-testid="ele-p">custom</div>
        ) : undefined,
    );
    const P = comps.p as React.FC<any>;
    const H1 = comps.h1 as React.FC<any>;
    render(
      <>
        <P>para</P>
        <H1>title</H1>
      </>,
    );
    expect(screen.getByTestId('ele-p')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-heading-1')).toBeInTheDocument();
  });

  it('不安全链接渲染为纯文本', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents(
      'p',
      {},
      false,
      { openInNewTab: true },
    );
    const A = comps.a as React.FC<any>;
    render(<A href="javascript:alert(1)">bad</A>);
    // 不安全 URL 展示的是 href 本身，不是锚点文案
    expect(
      screen.getByTestId('markdown-unsafe-url-plain-text'),
    ).toHaveTextContent('javascript:alert(1)');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('openInNewTab false 不设置 target', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents(
      'p',
      {},
      false,
      { openInNewTab: false },
    );
    const A = comps.a as React.FC<any>;
    render(<A href="https://safe.example">ok</A>);
    const link = screen.getByRole('link');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('linkConfig.onClick 返回 false 阻止默认', () => {
    const onClick = vi.fn(() => false);
    const comps = markdownReactShared.buildEditorAlignedComponents(
      'p',
      {},
      false,
      { openInNewTab: true, onClick },
    );
    const A = comps.a as React.FC<any>;
    render(<A href="https://safe.example">click</A>);
    screen.getByRole('link').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('thinking 别名与 think 相同', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents('p', {});
    expect(comps.thinking).toBe(comps.think);
  });

  it('脚注 section className footnotes', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents(
      'p',
      {},
      false,
      undefined,
      { render: () => <span data-testid="fnc">fn</span> } as any,
    );
    const Section = comps.section as React.FC<any>;
    render(
      <Section className="footnotes" data-footnotes="">
        notes
      </Section>,
    );
    expect(screen.getByTestId('markdown-footnote-section')).toBeInTheDocument();
  });

  it('不安全图片 src 渲染为纯文本', () => {
    const comps = markdownReactShared.buildEditorAlignedComponents('p', {});
    const Img = comps.img as React.FC<any>;
    render(<Img src="javascript:alert(1)" alt="unsafe" />);
    // 不安全图片展示的是 src，不是 alt
    expect(
      screen.getByTestId('markdown-unsafe-url-plain-text'),
    ).toHaveTextContent('javascript:alert(1)');
  });
});
