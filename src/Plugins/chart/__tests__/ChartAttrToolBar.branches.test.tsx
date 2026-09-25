/**
 * ChartAttrToolBar 分支：readonly、options 有无 title、删除、空 icon、无 node。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartAttrToolBar } from '../ChartAttrToolBar';

const deleteFn = vi.fn();
const focusFn = vi.fn();
const findPathFn = vi.fn(() => [0]);

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: { current: {} },
    readonly: false,
  })),
}));

vi.mock('slate', () => ({
  Transforms: { delete: (...args: any[]) => deleteFn(...args) },
}));

vi.mock('slate-react', () => ({
  ReactEditor: { focus: (...args: any[]) => focusFn(...args) },
}));

vi.mock('../../../MarkdownEditor', () => ({
  EditorUtils: { findPath: (...args: any[]) => findPathFn(...args) },
}));

vi.mock('../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: { delete: '删除' },
    language: 'zh-CN',
  }),
}));

import { useEditorStore } from '../../../MarkdownEditor/editor/store';

const node = [{ type: 'chart' }, [0]] as any;

describe('ChartAttrToolBar 分支覆盖', () => {
  beforeEach(() => {
    deleteFn.mockClear();
    focusFn.mockClear();
    (useEditorStore as any).mockReturnValue({
      markdownEditorRef: { current: {} },
      readonly: false,
    });
  });

  it('渲染 title 与带/不带 Tooltip 的 option', () => {
    const onClick = vi.fn();
    render(
      <ConfigProvider>
        <ChartAttrToolBar
          title="图表"
          node={node}
          options={[
            { icon: <span>cfg</span>, title: '设置', onClick },
            { icon: <span>plain</span>, style: { color: 'red' }, onClick },
            { icon: null as any, title: 'skip' },
          ]}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('chart-attr-toolbar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('cfg'));
    fireEvent.click(screen.getByText('plain'));
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('skip')).not.toBeInTheDocument();
  });

  it('非只读时点击删除触发 Transforms.delete', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartAttrToolBar title="图表" node={node} />
      </ConfigProvider>,
    );
    const deleteIcon = container.querySelector('.anticon-delete');
    expect(deleteIcon).toBeTruthy();
    fireEvent.click(deleteIcon!);
    expect(deleteFn).toHaveBeenCalled();
    expect(focusFn).toHaveBeenCalled();
  });

  it('readonly 时不渲染删除按钮', () => {
    (useEditorStore as any).mockReturnValue({
      markdownEditorRef: { current: {} },
      readonly: true,
    });
    const { container } = render(
      <ConfigProvider>
        <ChartAttrToolBar title="只读" node={node} options={[]} />
      </ConfigProvider>,
    );
    expect(screen.getByText('只读')).toBeInTheDocument();
    expect(container.querySelector('.anticon-delete')).toBeNull();
  });

  it('点击容器 stopPropagation', () => {
    const parentClick = vi.fn();
    render(
      <ConfigProvider>
        <div onClick={parentClick}>
          <ChartAttrToolBar title="t" node={node} />
        </div>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('chart-attr-toolbar'));
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('node 缺失时 remove 早退', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartAttrToolBar title="t" node={undefined as any} />
      </ConfigProvider>,
    );
    const deleteIcon = container.querySelector('.anticon-delete');
    fireEvent.click(deleteIcon!);
    expect(deleteFn).not.toHaveBeenCalled();
  });
});