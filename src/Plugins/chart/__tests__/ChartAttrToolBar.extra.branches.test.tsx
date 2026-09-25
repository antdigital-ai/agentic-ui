/**
 * ChartAttrToolBar：remove 时 node falsy 早退。
 */
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChartAttrToolBar } from '../ChartAttrToolBar';

const deleteFn = vi.fn();

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
  ReactEditor: { focus: vi.fn() },
}));

vi.mock('../../../MarkdownEditor', () => ({
  EditorUtils: { findPath: vi.fn(() => [0]) },
}));

vi.mock('../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: { delete: '删除' },
    language: 'zh-CN',
  }),
}));

describe('ChartAttrToolBar extra branches', () => {
  it('node 为 falsy 时 remove 不调用 Transforms.delete', () => {
    deleteFn.mockClear();
    const { container } = render(
      <ConfigProvider>
        <ChartAttrToolBar title="t" node={null as any} />
      </ConfigProvider>,
    );
    const deleteIcon = container.querySelector('.anticon-delete');
    fireEvent.click(deleteIcon!);
    expect(deleteFn).not.toHaveBeenCalled();
  });
});
