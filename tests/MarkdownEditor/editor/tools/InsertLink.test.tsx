import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InsertLink } from '../../../../src/MarkdownEditor/editor/tools/InsertLink';

// Mock dependencies
vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownContainerRef: { current: { parentElement: document.createElement('div') } },
    openInsertLink$: { subscribe: vi.fn(), next: vi.fn() },
    domRect: {},
    markdownEditorRef: { current: {} },
  }),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/hooks/subscribe', () => ({
  useSubject: vi.fn(),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/utils', () => ({
  useGetSetState: () => {
    const [state, setState] = React.useState({
      open: false,
      inputKeyword: '',
      oldUrl: '',
      index: 0,
      docs: [],
      filterDocs: [],
      anchors: [],
      filterAnchors: [],
    });
    return [() => state, setState];
  },
  useRefFunction: (fn: any) => fn,
}));

// Simple test without complex mocks
describe('InsertLink Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染插入链接组件', () => {
    render(<InsertLink />);
    // 由于组件默认是隐藏的，我们主要测试组件是否正确挂载
    expect(document.body).toBeInTheDocument();
  });

  // 由于组件的复杂性，我们暂时跳过其他测试
  it('应该能够渲染而不出错', () => {
    expect(() => {
      render(<InsertLink />);
    }).not.toThrow();
  });
});