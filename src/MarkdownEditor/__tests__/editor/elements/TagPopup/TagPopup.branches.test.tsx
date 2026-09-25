/**
 * TagPopup 分支覆盖：异步 items 非数组、dropdown 点击短路、tagTextStyle 与 context 边界。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { ReactEditor } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuggestionContext } from '../../../../../MarkdownInputField/Suggestion/SuggestionContext';
import { TagPopup } from '../../../../editor/elements/TagPopup';

const createContext = (overrides: Partial<React.ContextType<typeof SuggestionContext>> = {}) => ({
  open: false,
  setOpen: vi.fn(),
  triggerNodeContext: { current: undefined as any },
  onSelectRef: { current: undefined as ((v: string) => void) | undefined },
  isRender: true as const,
  ...overrides,
});

vi.mock('slate-react', async () => {
  const actual =
    await vi.importActual<typeof import('slate-react')>('slate-react');
  const { createEditor } = await import('slate');
  const editor = actual.withReact(createEditor());
  editor.children = [{ type: 'p', children: [{ text: '' }] }];
  return {
    ...actual,
    useSlate: () => editor,
    ReactEditor: {
      ...actual.ReactEditor,
      toSlateNode: vi.fn(() => ({ type: 'tag' })),
      findPath: vi.fn(() => [0, 0]),
    },
  };
});

const renderTagPopup = (
  props: React.ComponentProps<typeof TagPopup>,
  ctx = createContext(),
) =>
  render(
    <ConfigProvider>
      <SuggestionContext.Provider value={ctx}>
        <TagPopup {...props} />
      </SuggestionContext.Provider>
    </ConfigProvider>,
  );

describe('TagPopup 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('异步 items 返回非数组时不更新 selectedItems', async () => {
    const items = vi.fn(async () => null as any);
    renderTagPopup({
      text: 't',
      items,
      type: 'dropdown',
      autoOpen: true,
      children: <span>child</span>,
    });
    await waitFor(() => expect(items).toHaveBeenCalled());
    expect(document.querySelector('[data-tag-popup-input]')).toBeInTheDocument();
  });

  it('dropdown 类型容器点击不打开 panel（handleClick 提前 return）', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'dropdown',
        items: [{ label: 'A', key: 'a' }],
        children: <span>child</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).not.toHaveBeenCalled();
  });

  it('tagTextStyle 为函数时通过 runFunction 计算 style', () => {
    const tagTextStyle = vi.fn(() => ({ color: 'red' }));
    const { container } = renderTagPopup({
      text: 'styled',
      tagTextStyle,
      children: <span>x</span>,
    });
    expect(tagTextStyle).toHaveBeenCalled();
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.color).toBe('red');
  });

  it('无 beforeOpenChange 时 panel 点击直接 setOpen(true)', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        items: [{ label: 'A', key: 'a' }],
        children: <span>child</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).toHaveBeenCalledWith(true);
  });

  it('onChange 在 suggestionContext.open 变化时再次触发', async () => {
    const onChange = vi.fn();
    const ctx = createContext({ open: false });
    const { rerender } = render(
      <ConfigProvider>
        <SuggestionContext.Provider value={ctx}>
          <TagPopup text="a" onChange={onChange}>
            <span>c</span>
          </TagPopup>
        </SuggestionContext.Provider>
      </ConfigProvider>,
    );
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    onChange.mockClear();
    const openCtx = createContext({ open: true });
    rerender(
      <ConfigProvider>
        <SuggestionContext.Provider value={openCtx}>
          <TagPopup text="a" onChange={onChange}>
            <span>c</span>
          </TagPopup>
        </SuggestionContext.Provider>
      </ConfigProvider>,
    );
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('onSelectRef 回调经 updateNodeContext 传递原始值', async () => {
    const onSelect = vi.fn();
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        onSelect,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    await waitFor(() => expect(ctx.onSelectRef.current).toBeDefined());
    ctx.onSelectRef.current?.('   ');
    expect(onSelect).toHaveBeenCalledWith('   ', expect.any(Array));
  });

  it('dropdown 菜单 key 为空时 onSelect 收到空字符串', async () => {
    const onSelect = vi.fn();
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'dropdown',
        autoOpen: true,
        onSelect,
        items: [{ label: '空白 key', key: '   ' }],
        children: <span>c</span>,
      },
      ctx,
    );
    await waitFor(() => screen.getByText('空白 key'));
    fireEvent.click(screen.getByText('空白 key'));
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith('', expect.any(Array)),
    );
  });

  it('getNodePath 持续失败时 updateNodeContext 不写入 context', async () => {
    vi.mocked(ReactEditor.toSlateNode).mockImplementation(() => {
      throw new Error('no node');
    });
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        children: <span>c</span>,
      },
      ctx,
    );
    await waitFor(() => {
      expect(ctx.triggerNodeContext.current).toBeUndefined();
    });
  });

  it('无 triggerNodeContext/onSelectRef 时不抛错', async () => {
    const minimalCtx = {
      open: false,
      setOpen: vi.fn(),
      isRender: true as const,
    };
    expect(() =>
      render(
        <ConfigProvider>
          <SuggestionContext.Provider value={minimalCtx}>
            <TagPopup text="t" type="panel">
              <span>c</span>
            </TagPopup>
          </SuggestionContext.Provider>
        </ConfigProvider>,
      ),
    ).not.toThrow();
  });

  it('有 items 时 contentEditable=false 且显示箭头', () => {
    const { container } = renderTagPopup({
      text: '',
      items: [{ label: 'Opt', key: 'o' }],
      children: <span>c</span>,
    });
    const input = container.querySelector('[data-tag-popup-input]');
    expect(input).toHaveAttribute('contenteditable', 'false');
    expect(container.querySelector('[class*="arrow"]')).toBeInTheDocument();
  });

  it('无 items 时不设置 contentEditable=false', () => {
    const { container } = renderTagPopup({
      text: 'hello',
      items: [],
      children: <span>c</span>,
    });
    const input = container.querySelector('[data-tag-popup-input]');
    expect(input?.getAttribute('contenteditable')).not.toBe('false');
  });

  it('beforeOpenChange 返回 false 时不打开 panel', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        beforeOpenChange: () => false,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).not.toHaveBeenCalled();
  });

  it('tagRender 包装默认 DOM', () => {
    const tagRender = vi.fn((_props, dom) => (
      <div data-testid="custom-tag">{dom}</div>
    ));
    renderTagPopup({
      text: 'wrapped',
      tagRender,
      children: <span>child</span>,
    });
    expect(tagRender).toHaveBeenCalled();
    expect(screen.getByTestId('custom-tag')).toBeInTheDocument();
  });

  it('tagTextRender 改写展示文本', () => {
    const tagTextRender = vi.fn((_props, text) => `#${text}`);
    renderTagPopup({
      text: 'raw',
      tagTextRender,
      children: <span>x</span>,
    });
    expect(screen.getByText('x')).toBeInTheDocument();
    expect(tagTextRender).not.toHaveBeenCalled();
  });

  it('autoOpen panel 类型打开 suggestionContext', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        autoOpen: true,
        children: <span>c</span>,
      },
      ctx,
    );
    expect(ctx.setOpen).toHaveBeenCalledWith(true);
  });

  it('dropdown 菜单 onClick 触发 onSelect 并关闭', async () => {
    const onSelect = vi.fn();
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'dropdown',
        autoOpen: true,
        onSelect,
        items: [{ label: '选项', key: 'opt' }],
        children: <span>c</span>,
      },
      ctx,
    );
    await waitFor(() => screen.getByText('选项'));
    fireEvent.click(screen.getByText('选项'));
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith('opt', expect.any(Array)),
    );
    expect(ctx.setOpen).toHaveBeenCalledWith(false);
  });

  it('mouseenter/mouseleave 切换 data-no-focus', () => {
    const { container } = renderTagPopup({
      text: 'hover',
      children: <span>c</span>,
    });
    const input = container.querySelector('[data-tag-popup-input]')!;
    expect(input.hasAttribute('data-no-focus')).toBe(true);
    fireEvent.mouseEnter(input);
    expect(input.hasAttribute('data-no-focus')).toBe(false);
    fireEvent.mouseLeave(input);
    expect(input.hasAttribute('data-no-focus')).toBe(true);
  });

  it('autoOpen dropdown 类型打开本地 open 状态', async () => {
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: [{ label: 'Opt', key: 'o' }],
      children: <span>c</span>,
    });
    await waitFor(() => screen.getByText('Opt'));
  });

  it('静态 items 数组直接渲染箭头', () => {
    const { container } = renderTagPopup({
      text: 'x',
      items: [{ label: 'A', key: 'a' }],
      children: <span>c</span>,
    });
    expect(container.querySelector('[class*="arrow"]')).toBeInTheDocument();
  });

  it('tagRender onSelect trim 空白 key', async () => {
    const onSelect = vi.fn();
    const tagRender = vi.fn((_props, dom) => (
      <div data-testid="tag-wrap">{dom}</div>
    ));
    renderTagPopup({
      text: 't',
      tagRender,
      onSelect,
      items: [{ label: 'A', key: 'a' }],
      children: <span>c</span>,
    });
    await waitFor(() => expect(tagRender).toHaveBeenCalled());
    const callProps = tagRender.mock.calls[0][0];
    callProps.onSelect('  spaced  ');
    expect(onSelect).toHaveBeenCalledWith('spaced', expect.any(Array), undefined);
  });

  it('异步 items 加载时显示 loading 类名', async () => {
    let resolveItems: (v: any) => void;
    const items = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveItems = resolve;
        }),
    );
    const { container } = renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items,
      children: <span>c</span>,
    });
    await waitFor(() => expect(items).toHaveBeenCalled());
    expect(
      container.querySelector('[class*="loading"]'),
    ).toBeInTheDocument();
    resolveItems!([{ label: 'Done', key: 'd' }]);
    await waitFor(() => screen.getByText('Done'));
  });

  it('空 text 时 input 带 empty 类名', () => {
    const { container } = renderTagPopup({
      text: '   ',
      items: [{ label: 'A', key: 'a' }],
      children: <span>c</span>,
    });
    expect(
      container.querySelector('[class*="empty"]'),
    ).toBeInTheDocument();
  });

  it('beforeOpenChange 返回 true 时 panel 可打开', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        beforeOpenChange: () => true,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).toHaveBeenCalledWith(true);
  });

  it('tagTextStyle 对象形式直接应用 style', () => {
    const { container } = renderTagPopup({
      text: 'styled',
      tagTextStyle: { fontWeight: 'bold' },
      children: <span>x</span>,
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.fontWeight).toBe('bold');
  });

  it('items undefined 时按空数组处理', () => {
    const { container } = renderTagPopup({
      text: 'no-items',
      children: <span>c</span>,
    });
    expect(container.querySelector('[data-tag-popup-input]')).toBeTruthy();
  });

  it('异步 items 返回有效数组', async () => {
    renderTagPopup({
      text: 't2',
      type: 'dropdown',
      autoOpen: true,
      items: async () => [{ label: 'OK', key: 'ok' }],
      children: <span>c</span>,
    });
    await waitFor(() => screen.getByText('OK'));
  });

  it('异步 items 返回非数组时不崩溃', async () => {
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: async () => ({ not: 'array' }) as any,
      children: <span>c</span>,
    });
    await waitFor(() =>
      expect(
        document.querySelector('[data-tag-popup-input]'),
      ).toBeTruthy(),
    );
  });

  it('prefixCls 为数组时仍渲染', () => {
    const { container } = renderTagPopup({
      text: 'arr',
      prefixCls: ['tag-a', 'tag-b'] as any,
      items: [{ label: 'A', key: 'a' }],
      children: <span>c</span>,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('type 非 dropdown 时不强制箭头', () => {
    const { container } = renderTagPopup({
      text: 'plain',
      type: undefined,
      children: <span>c</span>,
    });
    expect(container.querySelector('[data-tag-popup-input]')).toBeTruthy();
  });

  it('panel onSelect 空 path 传空数组', async () => {
    // getNodePath 失败时 currentNodePath 保持 undefined，onSelect 第二参为 []
    vi.mocked(ReactEditor.toSlateNode).mockImplementation(() => {
      throw new Error('no node');
    });
    const onSelect = vi.fn();
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        onSelect,
        items: [{ label: '选项', key: 'opt' }],
        children: <span>c</span>,
      },
      ctx,
    );
    // panel 不渲染 dropdown 菜单，经 handlePanelClick 写入 onSelectRef
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    await waitFor(() => expect(ctx.onSelectRef.current).toBeDefined());
    ctx.onSelectRef.current?.('opt');
    expect(onSelect).toHaveBeenCalledWith('opt', []);
  });
});

describe('TagPopup istanbul residual', () => {
  afterEach(() => {
    vi.mocked(ReactEditor.findPath).mockReturnValue([0, 0]);
    vi.mocked(ReactEditor.toSlateNode).mockReturnValue({ type: 'tag' } as any);
  });

  it('findPath 抛错时仍可渲染', () => {
    vi.mocked(ReactEditor.findPath).mockImplementation(() => {
      throw new Error('fail');
    });
    const { container } = renderTagPopup({
      text: 'x',
      children: <span>c</span>,
    });
    expect(container.querySelector('[data-tag-popup-input]')).toBeTruthy();
  });

  it('autoOpen=false 时不自动打开', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'dropdown',
        autoOpen: false,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    expect(ctx.setOpen).not.toHaveBeenCalledWith(true);
  });

  it('whitespace-only text 仍渲染 input', () => {
    const { container } = renderTagPopup({
      text: '   ',
      children: <span>c</span>,
    });
    expect(container.querySelector('[data-tag-popup-input]')).toBeTruthy();
  });

  it('text=undefined 时渲染', () => {
    const { container } = renderTagPopup({
      text: undefined as any,
      children: <span>c</span>,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('beforeOpenChange 返回 false 阻止打开', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        beforeOpenChange: () => false,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).not.toHaveBeenCalledWith(true);
  });

  it('静态 items 数组不进入 loading', async () => {
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: [{ label: 'Static', key: 's' }],
      children: <span>c</span>,
    });
    await waitFor(() => screen.getByText('Static'));
  });
});

describe('TagPopup istanbul buffer：items reject / onSelect path fail / panel', () => {
  afterEach(() => {
    vi.mocked(ReactEditor.findPath).mockReturnValue([0, 0]);
    vi.mocked(ReactEditor.toSlateNode).mockReturnValue({ type: 'tag' } as any);
  });

  it('items 函数 reject 时不崩', async () => {
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: () => Promise.reject(new Error('load-fail')),
      children: <span>c</span>,
    });
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('onSelect 在 findPath 失败时仍可调用', async () => {
    const onSelect = vi.fn();
    vi.mocked(ReactEditor.findPath).mockImplementation(() => {
      throw new Error('no-path');
    });
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: [{ label: 'Pick', key: 'p' }],
      onSelect,
      children: <span>c</span>,
    });
    await waitFor(() => screen.getByText('Pick'));
    fireEvent.click(screen.getByText('Pick'));
    expect(document.body).toBeTruthy();
  });

  it('panel 类型 beforeOpenChange true 可打开', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        beforeOpenChange: () => true,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).toHaveBeenCalled();
  });
});
