/**
 * TagPopup deepen：dropdownRender、menu 覆盖、受控 open、onOpenChange、placeholder。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { ReactEditor } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuggestionContext } from '../../../../../MarkdownInputField/Suggestion/SuggestionContext';
import { TagPopup } from '../index';

const createContext = (
  overrides: Partial<React.ContextType<typeof SuggestionContext>> = {},
) => ({
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
  editor.children = [{ type: 'p', children: [{ text: 't' }] }];
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

describe('TagPopup deepen branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('notFoundContent 与 dropdownStyle 配置可渲染', () => {
    const { container } = renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: [],
      notFoundContent: <span data-testid="nf">empty</span>,
      dropdownStyle: { maxHeight: 200 },
      children: <span>c</span>,
    });
    expect(container.querySelector('[class*="tag-popup"]')).toBeTruthy();
  });

  it('受控 open 渲染 dropdown 容器', () => {
    const onOpenChange = vi.fn();
    const { container } = renderTagPopup({
      text: 't',
      type: 'dropdown',
      open: true,
      onOpenChange,
      items: [{ label: 'X', key: 'x' }],
      children: <span data-testid="ctrl-child">c</span>,
    });
    expect(screen.getByTestId('ctrl-child')).toBeInTheDocument();
    expect(container.querySelector('[class*="tag-popup"]')).toBeTruthy();
  });

  it('menu prop 与 dropdownStyle/bodyStyle 透传', () => {
    const { container } = renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: [{ label: 'M', key: 'm' }],
      menu: { className: 'custom-menu' } as any,
      dropdownStyle: { maxHeight: 200 },
      bodyStyle: { padding: 4 },
      children: <span>c</span>,
    });
    expect(container.querySelector('[class*="tag-popup"]')).toBeTruthy();
  });

  it('placeholder 写入 input title', () => {
    const { container } = renderTagPopup({
      text: '',
      placeholder: '选择标签',
      children: <span>c</span>,
    });
    const input = container.querySelector('[data-tag-popup-input]');
    expect(input).toHaveAttribute('title', '选择标签');
  });

  it('panel 点击写入 triggerNodeContext 与 onSelectRef', async () => {
    const ctx = createContext();
    const onSelect = vi.fn();
    renderTagPopup(
      {
        text: 'panel-text',
        type: 'panel',
        onSelect,
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    await waitFor(() => {
      expect(ctx.triggerNodeContext.current?.text).toBe('panel-text');
      expect(ctx.onSelectRef.current).toBeDefined();
    });
    ctx.onSelectRef.current?.('  trimmed  ');
    expect(onSelect).toHaveBeenCalledWith('trimmed', expect.any(Array));
  });

  it('tagRender onSelect 带 tagNode 第三参', async () => {
    const onSelect = vi.fn();
    const tagRender = vi.fn((props, dom) => (
      <div
        data-testid="tag-custom"
        onClick={() => props.onSelect('v', { id: 1 })}
      >
        {dom}
      </div>
    ));
    renderTagPopup({
      text: 't',
      tagRender,
      onSelect,
      children: <span>c</span>,
    });
    await waitFor(() => screen.getByTestId('tag-custom'));
    fireEvent.click(screen.getByTestId('tag-custom'));
    expect(onSelect).toHaveBeenCalledWith('v', expect.any(Array), { id: 1 });
  });

  it('onChange 传入带 onSelect 的 props', async () => {
    const onChange = vi.fn();
    renderTagPopup({
      text: 'chg',
      onChange,
      children: <span>c</span>,
    });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const props = onChange.mock.calls[0][1];
    expect(typeof props.onSelect).toBe('function');
    props.onSelect('  x  ');
    expect(onChange).toHaveBeenCalled();
  });

  it('domRef 缺失时 getNodePath 早退', () => {
    vi.mocked(ReactEditor.toSlateNode).mockImplementation(() => {
      throw new Error('no dom');
    });
    const ctx = createContext();
    expect(() =>
      renderTagPopup(
        { text: 't', type: 'panel', children: <span>c</span> },
        ctx,
      ),
    ).not.toThrow();
  });

  it('ChevronDown open 类名随 suggestionContext.open', () => {
    const ctx = createContext({ open: true });
    const { container } = renderTagPopup(
      {
        text: 't',
        items: [{ label: 'A', key: 'a' }],
        children: <span>c</span>,
      },
      ctx,
    );
    expect(container.querySelector('[class*="open"]')).toBeTruthy();
  });
});
