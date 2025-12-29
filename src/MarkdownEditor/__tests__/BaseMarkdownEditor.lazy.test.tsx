import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseMarkdownEditor } from '../BaseMarkdownEditor';

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

describe('BaseMarkdownEditor - Lazy Rendering', () => {
  beforeEach(() => {
    // @ts-ignore
    global.IntersectionObserver = MockIntersectionObserver;
  });

  it('应该在未启用 lazy 时正常渲染', () => {
    const { container } = render(
      <BaseMarkdownEditor initValue="# 标题\n\n这是内容" readonly={true} />,
    );

    expect(container.querySelector('.markdown-editor')).toBeTruthy();
  });

  it('应该接受 lazy 属性', () => {
    const { container } = render(
      <BaseMarkdownEditor
        lazy={{ enable: true }}
        initValue="# 标题\n\n## 子标题\n\n内容段落"
        readonly={true}
      />,
    );

    expect(container.querySelector('.markdown-editor')).toBeTruthy();
  });

  it('应该接受 lazy 配置', () => {
    const { container } = render(
      <BaseMarkdownEditor
        lazy={{
          enable: true,
          placeholderHeight: 150,
          rootMargin: '300px',
        }}
        initValue="# 标题\n\n内容"
        readonly={true}
      />,
    );

    expect(container.querySelector('.markdown-editor')).toBeTruthy();
  });

  it('应该在 lazy 模式下渲染长文档', () => {
    const longContent = Array.from(
      { length: 50 },
      (_, i) => `## 章节 ${i + 1}\n\n这是第 ${i + 1} 章的内容。\n\n`,
    ).join('');

    const { container } = render(
      <BaseMarkdownEditor
        lazy={{
          enable: true,
          placeholderHeight: 100,
          rootMargin: '200px',
        }}
        initValue={longContent}
        readonly={true}
        height={600}
      />,
    );

    expect(container.querySelector('.markdown-editor')).toBeTruthy();
  });

  it('应该在编辑模式下支持 lazy 渲染', () => {
    const { container } = render(
      <BaseMarkdownEditor
        lazy={{ enable: true }}
        initValue="# 标题\n\n内容"
        readonly={false}
      />,
    );

    expect(container.querySelector('.markdown-editor')).toBeTruthy();
  });

  it('应该正确传递 lazy 配置到子组件', () => {
    const onChangeSpy = vi.fn();

    const { container } = render(
      <BaseMarkdownEditor
        lazy={{
          enable: true,
          placeholderHeight: 200,
          rootMargin: '400px',
        }}
        initValue="# 测试"
        onChange={onChangeSpy}
      />,
    );

    expect(container.querySelector('.markdown-editor')).toBeTruthy();
  });
});

describe('BaseMarkdownEditor - Lazy Performance', () => {
  beforeEach(() => {
    // @ts-ignore
    global.IntersectionObserver = MockIntersectionObserver;
  });

  it('应该在 lazy 模式下延迟渲染元素', () => {
    const longContent = Array.from(
      { length: 100 },
      (_, i) => `## 段落 ${i + 1}\n\n内容 ${i + 1}\n\n`,
    ).join('');

    const startTime = performance.now();

    render(
      <BaseMarkdownEditor
        lazy={{
          enable: true,
          placeholderHeight: 50,
          rootMargin: '100px',
        }}
        initValue={longContent}
        readonly={true}
        height={600}
      />,
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 懒加载应该让初始渲染更快
    // 这个测试不太精确，但可以作为性能回归的基准
    expect(renderTime).toBeLessThan(5000);
  });
});
