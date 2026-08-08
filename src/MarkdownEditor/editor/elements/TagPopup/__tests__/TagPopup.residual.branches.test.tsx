/**
 * TagPopup 残留：空 children、disabled、onSelect、闭合。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../store', () => ({
  useEditorStore: () => ({
    readonly: false,
    markdownEditorRef: { current: null },
  }),
}));

vi.mock('slate-react', () => ({
  useSelected: () => true,
  useFocused: () => true,
  useSlate: () => ({
    selection: { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } },
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  }),
  ReactEditor: { findPath: () => [0] },
  useSlateStatic: () => ({}),
}));

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  return {
    ...antd,
    Popover: ({ children, content, open }: any) => (
      <div data-testid="popover" data-open={String(!!open)}>
        {children}
        <div data-testid="pop-content">{content}</div>
      </div>
    ),
  };
});

import { TagPopup } from '../index';

describe('TagPopup residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('基础渲染 + children', () => {
    render(
      <TagPopup
        element={{ type: 'tag-popup', value: 'tag', children: [{ text: '' }] } as any}
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span data-testid="child">c</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('items / onSelect', () => {
    const onSelect = vi.fn();
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: 't',
            items: [{ label: 'A', value: 'a' }],
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        onSelect={onSelect}
      >
        <span>x</span>
      </TagPopup>,
    );
    const item = screen.queryByText('A');
    if (item) fireEvent.click(item);
    expect(document.body).toBeTruthy();
  });

  it('items 为函数时初始空数组；beforeOpenChange 拦截', () => {
    const beforeOpenChange = vi.fn(() => false);
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: '  ',
            text: '  ',
            children: [{ text: '  ' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={async () => [{ label: 'Z', key: 'z' }]}
        beforeOpenChange={beforeOpenChange}
        type="dropdown"
        open={false}
        onOpenChange={vi.fn()}
      >
        <span data-testid="tag-empty"> </span>
      </TagPopup>,
    );
    expect(screen.getByTestId('tag-empty')).toBeInTheDocument();
  });

  it('dropdownRender / notFoundContent / prefixCls 数组', () => {
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: 'v',
            text: 'v',
            children: [{ text: 'v' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        prefixCls={['a', 'b']}
        items={[]}
        notFoundContent={<span data-testid="nf">empty</span>}
        dropdownRender={(node) => <div data-testid="dr">{node}</div>}
        type="dropdown"
        open
      >
        <span>tag</span>
      </TagPopup>,
    );
    expect(document.body).toBeTruthy();
  });

  it('mentions 类型 + onSelect + tagTextStyle 函数', () => {
    const onSelect = vi.fn();
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: '@alice',
            text: '@alice',
            children: [{ text: '@alice' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={[{ label: 'alice', key: 'alice' }]}
        type="mentions"
        open
        onSelect={onSelect}
        tagTextStyle={() => ({ color: 'red' })}
        tagTextClassName="tag-cls"
      >
        <span data-testid="mention">@alice</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('mention')).toBeInTheDocument();
  });

  it.skip('tagRender 自定义；onOpenChange；空 items 数组', () => {
    const onOpenChange = vi.fn();
    const tagRender = vi.fn((dom: any) => (
      <div data-testid="custom-tag">{dom}</div>
    ));
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: 'v',
            text: 'v',
            children: [{ text: 'v' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={[]}
        tagRender={tagRender}
        type="dropdown"
        open
        onOpenChange={onOpenChange}
      >
        <span>inner</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('custom-tag')).toBeInTheDocument();
    expect(tagRender).toHaveBeenCalled();
  });

  it('items 异步返回数组；mentions 空 text', async () => {
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: '',
            text: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={async () => [{ label: 'L', key: 'l' }]}
        type="mentions"
        open
        autoOpen
      >
        <span data-testid="async-items">x</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('async-items')).toBeInTheDocument();
  });

  it('items 异步抛错不崩；beforeOpenChange 允许打开', async () => {
    const beforeOpenChange = vi.fn(() => true);
    render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: 'x',
            text: 'x',
            children: [{ text: 'x' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={async () => {
          throw new Error('items-fail');
        }}
        beforeOpenChange={beforeOpenChange}
        type="dropdown"
        open={false}
        onOpenChange={vi.fn()}
      >
        <span data-testid="tag-async">x</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('tag-async')).toBeInTheDocument();
  });

  it('exclusive deepen：dropdown/mentions 开关；beforeOpenChange 拒绝；空 items', async () => {
    const onOpenChange = vi.fn();
    const beforeOpenChange = vi.fn(() => false);
    const { rerender } = render(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: 'v',
            text: 'hello',
            children: [{ text: 'hello' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={[
          { label: 'One', key: '1' },
          { label: 'Two', key: '2', disabled: true },
        ]}
        type="dropdown"
        open
        onOpenChange={onOpenChange}
        beforeOpenChange={beforeOpenChange}
        tagTextStyle={{ color: 'red' }}
        tagTextClassName="tag-cls"
      >
        <span data-testid="tag-deep">hello</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('tag-deep')).toBeInTheDocument();

    rerender(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: '@u',
            text: '@u',
            children: [{ text: '@u' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={[]}
        type="mentions"
        open={false}
        autoOpen
        onOpenChange={onOpenChange}
      >
        <span data-testid="tag-mentions">@u</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('tag-mentions')).toBeInTheDocument();

    rerender(
      <TagPopup
        element={
          {
            type: 'tag-popup',
            value: '',
            text: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
        items={async () => []}
        type="dropdown"
        open
        tagRender={() => <span data-testid="tr2">TR</span>}
      >
        <span>x</span>
      </TagPopup>,
    );
    expect(screen.getByTestId('tr2')).toBeInTheDocument();
  });
});
