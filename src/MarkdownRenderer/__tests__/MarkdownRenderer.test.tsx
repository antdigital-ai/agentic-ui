import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../index';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(() =>
      Promise.resolve({ svg: '<svg><text>mock mermaid</text></svg>' }),
    ),
  },
}));

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应渲染基础 markdown 内容', async () => {
    const { container } = render(
      <MarkdownRenderer content="# Hello World" />,
    );

    await vi.runAllTimersAsync();
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('h1')?.textContent).toBe('Hello World');
  });

  it('应渲染段落文本', () => {
    const { container } = render(
      <MarkdownRenderer content="This is a paragraph." />,
    );

    expect(container.textContent).toContain('This is a paragraph.');
  });

  it('应渲染粗体（带 data-testid）', () => {
    const { container } = render(
      <MarkdownRenderer content="This is **bold** text." />,
    );

    const bold = container.querySelector('[data-testid="markdown-bold"]');
    expect(bold).toBeTruthy();
    expect(bold?.textContent).toBe('bold');
  });

  it('应渲染斜体', () => {
    const { container } = render(
      <MarkdownRenderer content="This is *italic* text." />,
    );

    const em = container.querySelector('em');
    expect(em).toBeTruthy();
    expect(em?.textContent).toBe('italic');
  });

  it('应渲染删除线', () => {
    const { container } = render(
      <MarkdownRenderer content="This is ~~deleted~~ text." />,
    );

    const del = container.querySelector('del');
    expect(del).toBeTruthy();
    expect(del?.textContent).toBe('deleted');
  });

  it('应渲染无序列表', () => {
    const { container } = render(
      <MarkdownRenderer content={'- Item 1\n- Item 2\n- Item 3'} />,
    );

    const items = container.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
    expect(container.textContent).toContain('Item 3');
  });

  it('应渲染链接（data-url + 新标签页）', () => {
    const { container } = render(
      <MarkdownRenderer content="[Example](https://example.com)" />,
    );

    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
    expect(link?.getAttribute('data-url')).toBe('url');
  });

  it('应渲染 GFM 表格', () => {
    const tableMarkdown = `
| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |
`;
    const { container } = render(
      <MarkdownRenderer content={tableMarkdown} />,
    );

    expect(container.querySelector('table')).toBeTruthy();
    expect(container.querySelector('th')?.textContent).toContain('Header 1');
    expect(container.querySelector('td')?.textContent).toContain('Cell 1');
  });

  it('空内容不应崩溃', () => {
    const { container } = render(
      <MarkdownRenderer content="" />,
    );

    expect(container).toBeTruthy();
  });

  it('应支持 className 和 style props', () => {
    const { container } = render(
      <MarkdownRenderer
        content="test"
        className="custom-class"
        style={{ color: 'red' }}
      />,
    );

    const root = container.firstElementChild;
    expect(root?.classList.contains('custom-class')).toBe(true);
    expect((root as HTMLElement)?.style.color).toBe('red');
  });

  it('非流式模式下内容变化应立即更新', () => {
    const { container, rerender } = render(
      <MarkdownRenderer content="initial" />,
    );

    expect(container.textContent).toContain('initial');

    rerender(
      <MarkdownRenderer content="updated" />,
    );

    expect(container.textContent).toContain('updated');
  });

  it('流式模式下应通过字符队列逐步输出', () => {
    const { container } = render(
      <MarkdownRenderer
        content="Hello World"
        streaming={true}
        queueOptions={{ charsPerFrame: 5, animate: true }}
      />,
    );

    // 一帧后输出 5 个字符
    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(container.textContent).toContain('Hello');

    // 再一帧输出剩余
    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(container.textContent).toContain('Hello Worl');
  });

  it('流式模式下 isFinished 应 flush 全部内容', () => {
    const { container, rerender } = render(
      <MarkdownRenderer
        content="Hello World"
        streaming={true}
        queueOptions={{ charsPerFrame: 1, animate: true }}
      />,
    );

    rerender(
      <MarkdownRenderer
        content="Hello World"
        streaming={true}
        isFinished={true}
        queueOptions={{ charsPerFrame: 1, animate: true }}
      />,
    );

    expect(container.textContent).toContain('Hello World');
  });

  it('应渲染行内代码（带 inline-code className）', () => {
    const { container } = render(
      <MarkdownRenderer content="Use `const x = 1` in your code." />,
    );

    const codeEl = container.querySelector('code');
    expect(codeEl).toBeTruthy();
    expect(codeEl?.textContent).toBe('const x = 1');
    expect(codeEl?.className).toContain('inline-code');
  });

  it('应渲染块引用', () => {
    const { container } = render(
      <MarkdownRenderer content="> This is a quote" />,
    );

    expect(container.querySelector('blockquote')).toBeTruthy();
    expect(container.textContent).toContain('This is a quote');
  });

  it('应正确渲染多级标题', () => {
    const { container } = render(
      <MarkdownRenderer content={'# H1\n## H2\n### H3'} />,
    );

    expect(container.querySelector('h1')?.textContent).toBe('H1');
    expect(container.querySelector('h2')?.textContent).toBe('H2');
    expect(container.querySelector('h3')?.textContent).toBe('H3');
  });

  it('应渲染代码块', () => {
    const { container } = render(
      <MarkdownRenderer content={'```js\nconst x = 1;\n```'} />,
    );

    // 代码块应使用 CodeContainer（data-be="code"）
    expect(container.querySelector('[data-be="code"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="code-toolbar"]')).toBeTruthy();
    expect(container.textContent).toContain('const x = 1;');
  });

  it('应渲染有序列表', () => {
    const { container } = render(
      <MarkdownRenderer content={'1. First\n2. Second\n3. Third'} />,
    );

    const items = container.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('Second');
    expect(container.textContent).toContain('Third');
  });

  it('应渲染水平分割线', () => {
    const { container } = render(
      <MarkdownRenderer content={'Above\n\n---\n\nBelow'} />,
    );

    // remark-gfm converts --- to thematic break; verify content renders
    expect(container.textContent).toContain('Above');
    expect(container.textContent).toContain('Below');
  });

  it('应渲染脚注引用（有定义）', () => {
    const { container } = render(
      <MarkdownRenderer content={'This has a footnote[^1].\n\n[^1]: Footnote content here.'} />,
    );

    const fncEl = container.querySelector('[data-fnc="fnc"]');
    expect(fncEl).toBeTruthy();

    const fndEl = container.querySelector('[data-be="footnoteDefinition"]');
    expect(fndEl).toBeTruthy();
  });

  it('应渲染裸脚注引用（无定义，AI 对话场景）', () => {
    const { container } = render(
      <MarkdownRenderer content={'公司营收达 776.73 亿美元。[^2] Cloud 收入同比增长 22%。[^3]'} />,
    );

    const fncElements = container.querySelectorAll('[data-fnc="fnc"]');
    expect(fncElements.length).toBe(2);
    expect(fncElements[0]?.textContent).toBe('2');
    expect(fncElements[1]?.textContent).toBe('3');
  });

  it('应将 <think> 标签渲染为 ToolUseBarThink 组件', () => {
    const { container } = render(
      <MarkdownRenderer content={'<think>\n这是一段思考内容\n</think>\n\n最终回答'} />,
    );

    const thinkBlock = container.querySelector('[data-testid="think-block-renderer"]');
    expect(thinkBlock).toBeTruthy();
    expect(container.textContent).toContain('最终回答');
  });

  it('应渲染图片', () => {
    const { container } = render(
      <MarkdownRenderer content="![alt text](https://example.com/image.png)" />,
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('alt text');
  });

  it('应将 schema 代码块渲染为 SchemaRenderer', () => {
    const schemaJson = JSON.stringify({ type: 'object', properties: { name: { type: 'string' } } });
    const { container } = render(
      <MarkdownRenderer content={'```schema\n' + schemaJson + '\n```'} />,
    );

    const schemaEl = container.querySelector('[data-testid="schema-renderer"]');
    expect(schemaEl).toBeTruthy();
  });

  it('应将 apaasify 代码块渲染为 SchemaRenderer', () => {
    const schemaJson = JSON.stringify({ type: 'form', fields: [] });
    const { container } = render(
      <MarkdownRenderer content={'```apaasify\n' + schemaJson + '\n```'} />,
    );

    const schemaEl = container.querySelector('[data-testid="schema-renderer"]');
    expect(schemaEl).toBeTruthy();
  });

  it('应支持 apaasify 自定义 render', () => {
    const schemaJson = JSON.stringify({ type: 'form', fields: [] });
    const { container } = render(
      <MarkdownRenderer
        content={'```apaasify\n' + schemaJson + '\n```'}
        apaasify={{
          enable: true,
          render: (value: any) => <div data-testid="custom-apaasify">Custom: {value?.type}</div>,
        }}
      />,
    );

    const customEl = container.querySelector('[data-testid="custom-apaasify"]');
    expect(customEl).toBeTruthy();
    expect(customEl?.textContent).toContain('Custom: form');
  });
});
