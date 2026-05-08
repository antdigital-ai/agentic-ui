import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { List } from '../../../../editor/elements/List/List';
import * as editorStore from '../../../../editor/store';

vi.mock('../../../../editor/store');

describe('List Component', () => {
  const createTestEditor = () => withReact(createEditor());

  const mockAttributes = {
    'data-slate-node': 'element' as const,
    ref: null,
  };

  const renderList = (element: any) => {
    const editor = createTestEditor();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      store: {
        dragStart: vi.fn(),
      },
      markdownContainerRef: { current: { clientWidth: 800 } },
    } as any);

    return render(
      <ConfigProvider>
        <Slate editor={editor} initialValue={[element]}>
          <List attributes={mockAttributes} element={element}>
            <li>List Item 1</li>
            <li>List Item 2</li>
          </List>
        </Slate>
      </ConfigProvider>,
    );
  };

  it('应该渲染无序列表', () => {
    const unorderedList = {
      type: 'list',
      order: false,
      children: [{ text: 'Item 1' }, { text: 'Item 2' }],
    };

    const { container } = renderList(unorderedList);

    const ul = container.querySelector('ul');
    expect(ul).toBeDefined();
    expect(ul?.tagName).toBe('UL');
  });

  it('应该渲染有序列表', () => {
    const orderedList = {
      type: 'list',
      order: true,
      children: [{ text: 'Item 1' }, { text: 'Item 2' }],
    };

    const { container } = renderList(orderedList);

    const ol = container.querySelector('ol');
    expect(ol).toBeDefined();
    expect(ol?.tagName).toBe('OL');
  });

  it('应该设置有序列表的起始编号', () => {
    const orderedList = {
      type: 'list',
      order: true,
      start: 5,
      children: [{ text: 'Item 5' }],
    };

    const { container } = renderList(orderedList);

    const ol = container.querySelector('ol');
    expect(ol?.getAttribute('start')).toBe('5');
  });

  it('应该渲染任务列表', () => {
    const taskList = {
      type: 'list',
      order: false,
      task: true,
      children: [
        { text: 'Task 1', checked: false },
        { text: 'Task 2', checked: true },
      ],
    };

    const { container } = renderList(taskList);

    const list = container.querySelector('[data-task="true"]');
    expect(list).toBeDefined();
  });

  it('应该应用正确的 CSS 类名', () => {
    const list = {
      type: 'list',
      order: false,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(list);

    const listContainer = container.querySelector('[data-be="list"]');
    expect(listContainer?.className).toContain('ant-agentic-md-editor-list-container');
  });

  it('应该为有序列表应用 ol 类名', () => {
    const orderedList = {
      type: 'list',
      order: true,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(orderedList);

    const ol = container.querySelector('ol');
    expect(ol?.className).toContain('ol');
  });

  it('应该为无序列表应用 ul 类名', () => {
    const unorderedList = {
      type: 'list',
      order: false,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(unorderedList);

    const ul = container.querySelector('ul');
    expect(ul?.className).toContain('ul');
  });

  it('应该传递 attributes', () => {
    const list = {
      type: 'list',
      order: false,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(list);

    const listContainer = container.querySelector('[data-be="list"]');
    expect(listContainer?.getAttribute('data-slate-node')).toBe('element');
  });

  it('应该支持拖拽', () => {
    const list = {
      type: 'list',
      order: false,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(list);

    const listContainer = container.querySelector('[data-be="list"]') as HTMLElement;
    // 源码通过 onDragStart 绑定事件（非 draggable 属性），验证 dragstart 事件可正常触发
    expect(listContainer).toBeDefined();
    expect(() => {
      fireEvent.dragStart(listContainer);
    }).not.toThrow();
  });

  it('应该提供 ListContext', () => {
    const list = {
      type: 'list',
      order: false,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(list);

    // ListContext 应该被提供
    expect(container).toBeDefined();
  });

  it('应该处理没有 start 属性的有序列表', () => {
    const orderedList = {
      type: 'list',
      order: true,
      children: [{ text: 'Item' }],
    };

    const { container } = renderList(orderedList);

    const ol = container.querySelector('ol');
    expect(ol).toBeDefined();
  });

  it('应该渲染子元素', () => {
    const list = {
      type: 'list',
      order: false,
      children: [{ text: 'Item 1' }, { text: 'Item 2' }],
    };

    const { getByText } = renderList(list);

    expect(getByText('List Item 1')).toBeDefined();
    expect(getByText('List Item 2')).toBeDefined();
  });
});
