import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Code } from '../../../editor/elements/Code';

describe('Code Element', () => {
  const mockAttributes = {
    'data-slate-node': 'element' as const,
    ref: null,
  };

  it('应该渲染基本代码块', () => {
    const element = {
      type: 'code',
      value: 'console.log("Hello World");',
      children: [{ text: 'console.log("Hello World");' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
        <span>console.log(&quot;Hello World&quot;);</span>
      </Code>,
    );

    expect(container.firstChild).toBeDefined();
    expect(container.textContent).toContain('console.log');
  });

  it('应该渲染 HTML 语言的代码', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<div>Test</div>',
      children: [{ text: '<div>Test</div>' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
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
      <Code attributes={mockAttributes} element={element}>
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
      <Code attributes={mockAttributes} element={element}>
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
      <Code attributes={mockAttributes} element={element}>
        <span></span>
      </Code>,
    );

    // DOMPurify 应该移除危险的脚本
    expect(container.innerHTML).not.toContain('<script>');
  });

  it('应该渲染非 HTML 语言的代码块并应用默认样式', () => {
    const element = {
      type: 'code',
      language: 'javascript',
      value: 'const x = 10;',
      children: [{ text: 'const x = 10;' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
        <span>const x = 10;</span>
      </Code>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.height).toBe('240px');
    expect(div.style.minWidth).toBe('398px');
  });

  it('应该处理空值', () => {
    const element = {
      type: 'code',
      value: '',
      children: [{ text: 'fallback content' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
        <span>fallback content</span>
      </Code>,
    );

    expect(container.textContent).toContain('fallback content');
  });

  it('应该修剪代码值的空白', () => {
    const element = {
      type: 'code',
      value: '  \n  code with spaces  \n  ',
      children: [{ text: 'code with spaces' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
        <span>code with spaces</span>
      </Code>,
    );

    expect(container.textContent).toBe('code with spaces');
  });

  it('应该传递 attributes 到渲染的 div', () => {
    const customAttributes = {
      'data-slate-node': 'element' as const,
      'data-test-id': 'custom-code',
      ref: null,
    };

    const element = {
      type: 'code',
      value: 'test',
      children: [{ text: 'test' }],
    };

    const { container } = render(
      <Code attributes={customAttributes} element={element}>
        <span>test</span>
      </Code>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.getAttribute('data-test-id')).toBe('custom-code');
  });

  it('应该处理没有 language 属性的元素', () => {
    const element = {
      type: 'code',
      value: 'plain code',
      children: [{ text: 'plain code' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
        <span>plain code</span>
      </Code>,
    );

    expect(container.firstChild).toBeDefined();
    expect(container.textContent).toContain('plain code');
  });

  it('应该处理没有 otherProps 的 HTML 元素', () => {
    const element = {
      type: 'code',
      language: 'html',
      value: '<p>Hello</p>',
      children: [{ text: '<p>Hello</p>' }],
    };

    const { container } = render(
      <Code attributes={mockAttributes} element={element}>
        <span>&lt;p&gt;Hello&lt;/p&gt;</span>
      </Code>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.display).toBe('block');
  });
});
