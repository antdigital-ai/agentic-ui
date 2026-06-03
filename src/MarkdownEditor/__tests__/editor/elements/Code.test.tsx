import { render, screen } from '@testing-library/react';
import React from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { Code } from '../../../editor/elements/Code';
import { withCodeBlockPlugin } from '../../../editor/plugins/withCodeBlockPlugin';

vi.mock('../../../editor/store', () => ({
  useEditorStore: () => ({ readonly: false }),
}));

const mockAttributes = {
  'data-slate-node': 'element' as const,
  ref: null,
};

function renderCodeBlock(element: Record<string, unknown>) {
  const codeNode = { type: 'code', ...element } as Descendant;
  const initial: Descendant[] = [codeNode];
  const editor = withCodeBlockPlugin(withReact(createEditor()));
  editor.children = initial;

  return render(
    <Slate editor={editor} initialValue={initial}>
      <Editable
        renderElement={(props) =>
          props.element.type === 'code' ? (
            <Code {...props} />
          ) : (
            <div {...props.attributes}>{props.children}</div>
          )
        }
      />
    </Slate>,
  );
}

describe('Code Element', () => {
  it('应该渲染基本代码块', () => {
    const { container } = renderCodeBlock({
      value: 'console.log("Hello World");',
      children: [{ text: 'console.log("Hello World");' }],
    });

    expect(container.firstChild).toBeDefined();
    expect(screen.getByTestId('simple-code-block-editor')).toHaveValue(
      'console.log("Hello World");',
    );
  });

  it('应该渲染 HTML 语言的代码', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<div>Test</div>',
      children: [{ text: '<div>Test</div>' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element as any}>
        <span>&lt;div&gt;Test&lt;/div&gt;</span>
      </Code>,
    );

    expect(container.firstChild).toBeDefined();
  });

  it('应该隐藏配置类型的 HTML 代码', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<config>test</config>',
      otherProps: {
        isConfig: true,
      },
      children: [{ text: '' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element as any}>
        <span></span>
      </Code>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.display).toBe('none');
  });

  it('应该显示非配置类型的 HTML 代码', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<div>Content</div>',
      otherProps: {
        isConfig: false,
      },
      children: [{ text: '<div>Content</div>' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element as any}>
        <span>&lt;div&gt;Content&lt;/div&gt;</span>
      </Code>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.display).toBe('block');
  });

  it('应该对 HTML 内容进行清理', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<script>alert("xss")</script>',
      children: [{ text: '' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element as any}>
        <span></span>
      </Code>,
    );

    expect(container.innerHTML).not.toContain('<script>');
  });

  it('应该渲染非 HTML 语言的代码块并应用默认样式', () => {
    const { container } = renderCodeBlock({
      language: 'javascript',
      value: 'const x = 10;',
      children: [{ text: 'const x = 10;' }],
    });

    const div = container.querySelector('[data-be="code"]') as HTMLElement;
    expect(div.style.height).toBe('240px');
    expect(div.style.minWidth).toBe('398px');
  });

  it('应该处理空值', () => {
    renderCodeBlock({
      value: '',
      children: [{ text: 'fallback content' }],
    });

    expect(screen.getByTestId('simple-code-block-editor')).toHaveValue(
      'fallback content',
    );
  });

  it('应该使用 getCodeBlockPlainText 作为 textarea 展示来源', () => {
    renderCodeBlock({
      value: '  \n  code with spaces  \n  ',
      children: [{ text: 'code with spaces' }],
    });

    expect(screen.getByTestId('simple-code-block-editor')).toHaveValue(
      '  \n  code with spaces  \n  ',
    );
  });

  it('应该传递 attributes 到渲染的 div', () => {
    renderCodeBlock({
      value: 'test',
      children: [{ text: 'test' }],
    });

    const div = document.querySelector('[data-be="code"]') as HTMLElement;
    expect(div).toBeTruthy();
    expect(div.getAttribute('data-slate-node')).toBe('element');
  });

  it('应该处理没有 language 属性的元素', () => {
    renderCodeBlock({
      value: 'plain code',
      children: [{ text: 'plain code' }],
    });

    expect(screen.getByTestId('simple-code-block-editor')).toHaveValue(
      'plain code',
    );
  });

  it('应该处理没有 otherProps 的 HTML 元素', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<p>Hello</p>',
      children: [{ text: '<p>Hello</p>' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element as any}>
        <span>&lt;p&gt;Hello&lt;/p&gt;</span>
      </Code>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.display).toBe('block');
  });
});
