import { render } from '@testing-library/react';
import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { WarpCard } from '../../../editor/elements/Card';
import * as editorStore from '../../../editor/store';
import * as editorHooks from '../../../hooks/editor';

// Mock hooks
vi.mock('../../../hooks/editor');
vi.mock('../../../editor/store');

describe('WarpCard Element', () => {
  const createTestEditor = () => withReact(createEditor());

  const mockElement = {
    type: 'card',
    children: [{ text: 'Card content' }],
  };

  const mockAttributes = {
    'data-slate-node': 'element' as const,
    ref: null,
  };

  const renderCard = (
    element = mockElement,
    readonly = false,
    selected = false,
  ) => {
    const editor = createTestEditor();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({ readonly } as any);
    vi.mocked(editorHooks.useSelStatus).mockReturnValue([selected, [0]] as any);

    return render(
      <Slate editor={editor} initialValue={[element]}>
        <WarpCard attributes={mockAttributes} element={element}>
          <span>Card content</span>
        </WarpCard>
      </Slate>,
    );
  };

  it('应该渲染卡片组件', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv).toBeDefined();
  });

  it('应该在只读模式下渲染简化版本', () => {
    const { container } = renderCard(mockElement, true);

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv).toBeDefined();
    expect(cardDiv?.getAttribute('role')).toBe('button');
  });

  it('应该在编辑模式下包含可访问性属性', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('role')).toBe('button');
    expect(cardDiv?.getAttribute('tabIndex')).toBe('0');
    expect(cardDiv?.getAttribute('aria-label')).toBe('可选择的卡片元素');
  });

  it('应该在选中时设置 aria-selected', () => {
    const { container } = renderCard(mockElement, false, true);

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('aria-selected')).toBe('true');
  });

  it('应该应用 block 样式', () => {
    const blockElement = {
      ...mockElement,
      block: true,
    };

    const { container } = renderCard(blockElement);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.display).toBe('flex');
  });

  it('应该应用 inline-flex 样式当 block 为 false', () => {
    const inlineElement = {
      ...mockElement,
      block: false,
    };

    const { container } = renderCard(inlineElement);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.display).toBe('inline-flex');
  });

  it('应该应用自定义样式', () => {
    const styledElement = {
      ...mockElement,
      style: {
        backgroundColor: 'red',
        padding: '10px',
      },
    };

    const { container } = renderCard(styledElement);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.backgroundColor).toBe('red');
    expect(cardDiv.style.padding).toBe('10px');
  });

  it('应该渲染子元素', () => {
    const { getByText } = renderCard();

    expect(getByText('Card content')).toBeDefined();
  });

  it('应该传递 attributes', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('data-slate-node')).toBe('element');
  });

  it('应该在编辑模式下支持键盘导航', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('tabIndex')).toBe('0');
  });

  it('应该在只读模式下没有 tabIndex', () => {
    const { container } = renderCard(mockElement, true);

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('tabIndex')).toBeNull();
  });

  it('应该在编辑模式下有 outline: none 样式', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    // happy-dom 将 outline: none 解析为 'none none'（包含 outline-color 和 outline-style），
    // 使用 toContain 兼容 jsdom 和 happy-dom
    expect(cardDiv.style.outline).toContain('none');
  });

  it('应该有正确的 position 样式', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.position).toBe('relative');
  });

  it('应该有 max-content 宽度', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.width).toBe('max-content');
  });

  it('应该有 maxWidth 100%', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.maxWidth).toBe('100%');
  });

  it('应该有 flex-end 对齐', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.alignItems).toBe('flex-end');
  });

  it('应该在未选中时 aria-selected 为 false', () => {
    const { container } = renderCard(mockElement, false, false);

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('aria-selected')).toBe('false');
  });

  it('应该合并元素样式和默认样式', () => {
    const elementWithMultipleStyles = {
      ...mockElement,
      style: {
        backgroundColor: 'blue',
        color: 'white',
        padding: '20px',
      },
    };

    const { container } = renderCard(elementWithMultipleStyles);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.backgroundColor).toBe('blue');
    expect(cardDiv.style.color).toBe('white');
    expect(cardDiv.style.padding).toBe('20px');
    // 默认样式仍然存在
    expect(cardDiv.style.display).toBe('flex');
  });

  it('应该使用 React.useMemo 优化渲染', () => {
    const editor = createTestEditor();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      readonly: false,
    } as any);
    vi.mocked(editorHooks.useSelStatus).mockReturnValue([false, [0]] as any);

    const { rerender, container } = render(
      <Slate editor={editor} initialValue={[mockElement]}>
        <WarpCard attributes={mockAttributes} element={mockElement}>
          <span>Card content</span>
        </WarpCard>
      </Slate>,
    );

    const firstCardDiv = container.querySelector('[data-be="card"]');

    // 使用相同的 props 重新渲染
    rerender(
      <Slate editor={editor} initialValue={[mockElement]}>
        <WarpCard attributes={mockAttributes} element={mockElement}>
          <span>Card content</span>
        </WarpCard>
      </Slate>,
    );

    const secondCardDiv = container.querySelector('[data-be="card"]');
    expect(firstCardDiv).toBe(secondCardDiv);
  });

  it('应该处理没有 style 属性的元素', () => {
    const elementWithoutStyle = {
      type: 'card',
      children: [{ text: 'Card content' }],
    };

    const { container } = renderCard(elementWithoutStyle);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv).toBeDefined();
    expect(cardDiv.style.display).toBe('flex');
  });

  it('应该处理 block 为 undefined', () => {
    const elementWithUndefinedBlock = {
      type: 'card',
      children: [{ text: 'Card content' }],
      block: undefined,
    };

    const { container } = renderCard(elementWithUndefinedBlock);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.display).toBe('flex');
  });

  it('应该处理多个子元素', () => {
    const editor = createTestEditor();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      readonly: false,
    } as any);
    vi.mocked(editorHooks.useSelStatus).mockReturnValue([false, [0]] as any);

    const { container } = render(
      <Slate editor={editor} initialValue={[mockElement]}>
        <WarpCard attributes={mockAttributes} element={mockElement}>
          <span>First child</span>
          <span>Second child</span>
          <span>Third child</span>
        </WarpCard>
      </Slate>,
    );

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.children.length).toBe(3);
  });

  it('应该处理空的 children', () => {
    const editor = createTestEditor();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      readonly: false,
    } as any);
    vi.mocked(editorHooks.useSelStatus).mockReturnValue([false, [0]] as any);

    const { container } = render(
      <Slate editor={editor} initialValue={[mockElement]}>
        <WarpCard attributes={mockAttributes} element={mockElement}>
          {null}
        </WarpCard>
      </Slate>,
    );

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv).toBeDefined();
  });

  it('应该在 readonly 模式下简化渲染', () => {
    const { container } = renderCard(mockElement, true);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    // readonly 模式下不应该有 inline style
    expect(cardDiv.getAttribute('style')).toBeNull();
  });

  it('应该处理 block 为 null', () => {
    const elementWithNullBlock = {
      ...mockElement,
      block: null,
    };

    const { container } = renderCard(elementWithNullBlock);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.display).toBe('flex');
  });

  it('应该处理样式中的 0 值', () => {
    const elementWithZeroStyles = {
      ...mockElement,
      style: {
        padding: 0,
        margin: 0,
      },
    };

    const { container } = renderCard(elementWithZeroStyles);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.padding).toBe('0px');
    expect(cardDiv.style.margin).toBe('0px');
  });

  it('应该处理复杂的 CSS 单位', () => {
    const elementWithComplexUnits = {
      ...mockElement,
      style: {
        height: '5vh',
        padding: '2em',
        fontSize: '1.5rem',
      },
    };

    const { container } = renderCard(elementWithComplexUnits);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    // 注意：width 默认是 'max-content'，由组件设置
    expect(cardDiv.style.width).toBe('max-content');
    expect(cardDiv.style.height).toBe('5vh');
    expect(cardDiv.style.padding).toBe('2em');
    expect(cardDiv.style.fontSize).toBe('1.5rem');
  });

  it('应该处理 transform 等复杂 CSS 属性', () => {
    const elementWithTransform = {
      ...mockElement,
      style: {
        transform: 'rotate(45deg)',
        transition: 'all 0.3s ease',
      },
    };

    const { container } = renderCard(elementWithTransform);

    const cardDiv = container.querySelector('[data-be="card"]') as HTMLElement;
    expect(cardDiv.style.transform).toBe('rotate(45deg)');
    expect(cardDiv.style.transition).toBe('all 0.3s ease');
  });

  it('应该正确处理 role 属性', () => {
    const { container } = renderCard();

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('role')).toBe('button');
  });

  it('应该在只读模式下也有 role 属性', () => {
    const { container } = renderCard(mockElement, true);

    const cardDiv = container.querySelector('[data-be="card"]');
    expect(cardDiv?.getAttribute('role')).toBe('button');
  });
});
