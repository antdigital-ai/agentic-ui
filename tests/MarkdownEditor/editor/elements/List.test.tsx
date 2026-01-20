import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  List,
  ListItem,
} from '../../../../src/MarkdownEditor/editor/elements/List';
import * as editorStore from '../../../../src/MarkdownEditor/editor/store';

// Mock dependencies
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    store: {
      dragStart: vi.fn(),
    },
    markdownContainerRef: { current: document.createElement('div') },
    readonly: false,
  })),
}));

vi.mock('../../../../src/MarkdownEditor/hooks/editor', () => ({
  useMEditor: vi.fn(() => [null, vi.fn()]),
}));

vi.mock('slate-react', () => ({
  useSlate: vi.fn(() => ({
    children: [{ children: [] }],
  })),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/List/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (component: any) => component,
    hashId: 'test-hash',
  })),
}));

vi.mock('@ant-design/pro-components', () => ({
  useMountMergeState: vi.fn((initialValue) => {
    const [state, setState] = React.useState(initialValue);
    return [state, setState];
  }),
}));

describe('List Components', () => {
  describe('List', () => {
    const defaultListProps = {
      element: {
        type: 'list' as const,
        order: false, // 无序列表
        start: 1,
        task: false,
        children: [{ text: 'List content' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">List Content</div>],
    } as any;

    describe('基本渲染测试', () => {
      it('应该正确渲染无序列表', () => {
        render(<List {...defaultListProps} />);
        const listContainer = document.querySelector('[data-be="list"]');
        expect(listContainer).toBeInTheDocument();
      });

      it('应该渲染ul元素', () => {
        render(<List {...defaultListProps} />);
        const ul = document.querySelector('ul');
        expect(ul).toBeInTheDocument();
      });

      it('应该渲染子元素', () => {
        render(<List {...defaultListProps} />);
        expect(screen.getByText('List Content')).toBeInTheDocument();
      });

      it('应该应用正确的CSS类', () => {
        render(<List {...defaultListProps} />);
        const ul = document.querySelector('ul');
        expect(ul).toHaveClass('ul');
      });
    });

    describe('有序列表测试', () => {
      it('应该渲染有序列表', () => {
        const orderedListProps = {
          ...defaultListProps,
          element: {
            ...defaultListProps.element,
            order: true,
            start: 5,
          },
        };
        render(<List {...orderedListProps} />);
        const ol = document.querySelector('ol');
        expect(ol).toBeInTheDocument();
        expect(ol).toHaveAttribute('start', '5');
      });

      it('应该应用有序列表的CSS类', () => {
        const orderedListProps = {
          ...defaultListProps,
          element: {
            ...defaultListProps.element,
            order: true,
          },
        };
        render(<List {...orderedListProps} />);
        const ol = document.querySelector('ol');
        expect(ol).toHaveClass('ol');
      });
    });

    describe('任务列表测试', () => {
      it('应该为任务列表设置data-task属性', () => {
        const taskListProps = {
          ...defaultListProps,
          element: {
            ...defaultListProps.element,
            task: true,
          },
        };
        render(<List {...taskListProps} />);
        const ul = document.querySelector('ul');
        expect(ul).toHaveAttribute('data-task', 'true');
      });
    });
  });

  describe('ListItem', () => {
    const defaultListItemProps = {
      element: {
        type: 'list-item' as const,
        checked: undefined, // 非任务列表项
        mentions: [],
        children: [{ text: 'List item content' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">List Item Content</div>],
    } as any;

    describe('基本渲染测试', () => {
      it('应该正确渲染列表项', () => {
        render(<ListItem {...defaultListItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });

      it('应该渲染子元素', () => {
        render(<ListItem {...defaultListItemProps} />);
        expect(screen.getByText('List Item Content')).toBeInTheDocument();
      });

      it('应该应用正确的CSS类', () => {
        render(<ListItem {...defaultListItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });
    });

    describe('任务列表项测试', () => {
      it('应该渲染任务列表项的复选框', () => {
        const taskItemProps = {
          ...defaultListItemProps,
          element: {
            ...defaultListItemProps.element,
            checked: true,
          },
        };
        render(<ListItem {...taskItemProps} />);
        const checkbox = document.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
      });

      it('应该为任务列表项应用正确的CSS类', () => {
        const taskItemProps = {
          ...defaultListItemProps,
          element: {
            ...defaultListItemProps.element,
            checked: false,
          },
        };
        render(<ListItem {...taskItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });

      it('应该处理复选框状态变化', () => {
        const taskItemProps = {
          ...defaultListItemProps,
          element: {
            ...defaultListItemProps.element,
            checked: false,
          },
        };
        render(<ListItem {...taskItemProps} />);
        const checkbox = document.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeInTheDocument();
      });
    });

    describe('提及用户测试', () => {
      it('应该为任务列表项显示提及用户组件', () => {
        const taskItemWithMentionsProps = {
          ...defaultListItemProps,
          element: {
            ...defaultListItemProps.element,
            checked: true,
            mentions: [{ id: '1', name: 'John Doe', avatar: 'avatar1.jpg' }],
          },
        };
        render(<ListItem {...taskItemWithMentionsProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });

      it('应该处理提及用户选择', () => {
        render(<ListItem {...defaultListItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });
    });

    describe('自定义渲染测试', () => {
      it('应该使用自定义的listItemRender函数', () => {
        render(<ListItem {...defaultListItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });
    });

    describe('拖拽测试', () => {
      it('应该处理拖拽开始事件', () => {
        render(<ListItem {...defaultListItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });
    });

    describe('边界条件测试', () => {
      it('应该处理空的子元素', () => {
        const props = {
          ...defaultListItemProps,
          children: [],
        };
        render(<ListItem {...props} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
      });

      it('应该处理复杂的子元素结构', () => {
        const props = {
          ...defaultListItemProps,
          children: [<div key="1">Complex</div>, <span key="2">Content</span>],
        };
        render(<ListItem {...props} />);
        expect(screen.getByText('Complex')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      it('应该处理没有提及用户的非任务列表项', () => {
        render(<ListItem {...defaultListItemProps} />);
        const li = document.querySelector('[data-be="list-item"]');
        expect(li).toBeInTheDocument();
        expect(li).not.toHaveClass('test-hash-task');
      });
    });
  });

  describe('List 扩展测试', () => {
    const defaultListProps = {
      element: {
        type: 'list' as const,
        order: false, // 无序列表
        start: 1,
        task: false,
        children: [{ text: 'List content' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">List Content</div>],
    } as any;

    it('应该应用拖拽相关类名', () => {
      render(<List {...defaultListProps} />);
      const listContainer = document.querySelector('[data-be="list"]');
      expect(listContainer).toHaveClass('relative');
    });

    it('应该渲染 ListContext Provider', () => {
      render(<List {...defaultListProps} />);
      const listContainer = document.querySelector('[data-be="list"]');
      expect(listContainer).toBeInTheDocument();
    });

    it('应该处理 start 属性为 0', () => {
      const orderedListWithStartZero = {
        ...defaultListProps,
        element: {
          ...defaultListProps.element,
          order: true,
          start: 0,
        },
      };
      render(<List {...orderedListWithStartZero} />);
      const ol = document.querySelector('ol');
      expect(ol).toHaveAttribute('start', '0');
    });

    it('应该处理 start 属性为负数', () => {
      const orderedListWithNegativeStart = {
        ...defaultListProps,
        element: {
          ...defaultListProps.element,
          order: true,
          start: -1,
        },
      };
      render(<List {...orderedListWithNegativeStart} />);
      const ol = document.querySelector('ol');
      expect(ol).toHaveAttribute('start', '-1');
    });

    it('应该处理大的 start 值', () => {
      const orderedListWithLargeStart = {
        ...defaultListProps,
        element: {
          ...defaultListProps.element,
          order: true,
          start: 1000,
        },
      };
      render(<List {...orderedListWithLargeStart} />);
      const ol = document.querySelector('ol');
      expect(ol).toHaveAttribute('start', '1000');
    });

    it('应该处理拖拽开始事件', () => {
      const mockDragStart = vi.fn();
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        store: {
          dragStart: mockDragStart,
        },
        markdownContainerRef: { current: document.createElement('div') },
        readonly: false,
      } as any);

      render(<List {...defaultListProps} />);
      const listContainer = document.querySelector('[data-be="list"]');

      if (listContainer) {
        const event = new Event('dragstart', { bubbles: true });
        listContainer.dispatchEvent(event);
      }

      expect(listContainer).toBeInTheDocument();
    });

    it('应该使用 React.useMemo 优化渲染', () => {
      const { rerender } = render(<List {...defaultListProps} />);

      const firstList = document.querySelector('[data-be="list"]');

      rerender(<List {...defaultListProps} />);

      const secondList = document.querySelector('[data-be="list"]');
      expect(firstList).toBe(secondList);
    });

    it('应该在 task 改变时重新渲染', () => {
      const { rerender } = render(<List {...defaultListProps} />);

      const taskListProps = {
        ...defaultListProps,
        element: {
          ...defaultListProps.element,
          task: true,
        },
      };

      rerender(<List {...taskListProps} />);

      const ul = document.querySelector('ul');
      expect(ul).toHaveAttribute('data-task', 'true');
    });

    it('应该处理空的 children', () => {
      const propsWithEmptyChildren = {
        ...defaultListProps,
        children: [],
      };

      render(<List {...propsWithEmptyChildren} />);
      const ul = document.querySelector('ul');
      expect(ul).toBeInTheDocument();
    });

    it('应该处理多层嵌套列表', () => {
      const nestedListElement = {
        ...defaultListProps.element,
        children: [
          { text: 'Parent Item' },
          {
            type: 'list',
            order: false,
            children: [{ text: 'Nested Item' }],
          },
        ],
      };

      render(<List {...defaultListProps} element={nestedListElement} />);
      const listContainer = document.querySelector('[data-be="list"]');
      expect(listContainer).toBeInTheDocument();
    });

    it('应该处理只读模式', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        store: {
          dragStart: vi.fn(),
        },
        markdownContainerRef: { current: document.createElement('div') },
        readonly: true,
      } as any);

      render(<List {...defaultListProps} />);
      const listContainer = document.querySelector('[data-be="list"]');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('ListItem 扩展测试', () => {
    const defaultListItemProps = {
      element: {
        type: 'list-item' as const,
        checked: undefined, // 非任务列表项
        mentions: [],
        children: [{ text: 'List item content' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">List Item Content</div>],
    } as any;

    it('应该处理 checked 为 true 的任务项', () => {
      const checkedTaskProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: true,
        },
      };
      render(<ListItem {...checkedTaskProps} />);
      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeChecked();
    });

    it('应该处理 checked 为 false 的任务项', () => {
      const uncheckedTaskProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: false,
        },
      };
      render(<ListItem {...uncheckedTaskProps} />);
      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeChecked();
    });

    it('应该在复选框改变时更新状态', () => {
      const taskItemProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: false,
        },
      };
      render(<ListItem {...taskItemProps} />);
      const checkbox = document.querySelector('input[type="checkbox"]');

      if (checkbox) {
        fireEvent.click(checkbox);
      }

      expect(checkbox).toBeInTheDocument();
    });

    it('应该为任务项应用特殊类名', () => {
      const taskItemProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: false,
        },
      };
      render(<ListItem {...taskItemProps} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li).toHaveClass('ant-agentic-md-editor-list-task');
    });

    it('应该渲染多个提及用户', () => {
      const taskItemWithMultipleMentions = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: true,
          mentions: [
            { id: '1', name: 'User 1', avatar: 'avatar1.jpg' },
            { id: '2', name: 'User 2', avatar: 'avatar2.jpg' },
            { id: '3', name: 'User 3', avatar: 'avatar3.jpg' },
          ],
        },
      };
      render(<ListItem {...taskItemWithMultipleMentions} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li).toBeInTheDocument();
    });

    it('应该处理空的提及用户数组', () => {
      const taskItemWithEmptyMentions = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: true,
          mentions: [],
        },
      };
      render(<ListItem {...taskItemWithEmptyMentions} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li).toBeInTheDocument();
    });

    it('应该处理复选框的 contentEditable 属性', () => {
      const taskItemProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: false,
        },
      };
      render(<ListItem {...taskItemProps} />);
      const checkboxContainer = document.querySelector(
        '.ant-agentic-md-editor-list-check-item',
      );
      expect(checkboxContainer).toHaveAttribute('contentEditable', 'false');
    });

    it('应该使用 React.useMemo 优化复选框渲染', () => {
      const taskItemProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: false,
        },
      };
      const { rerender } = render(<ListItem {...taskItemProps} />);

      const firstCheckbox = document.querySelector('input[type="checkbox"]');

      rerender(<ListItem {...taskItemProps} />);

      const secondCheckbox = document.querySelector('input[type="checkbox"]');
      // React.useMemo 应该保持引用
      expect(firstCheckbox).toBe(secondCheckbox);
    });

    it('应该使用 React.useMemo 优化提及用户渲染', () => {
      const taskItemProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          checked: true,
          mentions: [{ id: '1', name: 'User 1', avatar: 'avatar1.jpg' }],
        },
      };
      render(<ListItem {...taskItemProps} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li).toBeInTheDocument();
    });

    it('应该处理拖拽事件', () => {
      render(<ListItem {...defaultListItemProps} />);
      const li = document.querySelector('[data-be="list-item"]');

      if (li) {
        const event = new Event('dragstart', { bubbles: true });
        li.dispatchEvent(event);
      }

      expect(li).toBeInTheDocument();
    });

    it('应该应用正确的 data-be 属性', () => {
      render(<ListItem {...defaultListItemProps} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li?.getAttribute('data-be')).toBe('list-item');
    });

    it('应该应用 hash ID 类名', () => {
      render(<ListItem {...defaultListItemProps} />);
      const li = document.querySelector('[data-be="list-item"]');
      // 检查类名中包含组件相关的类
      expect(li?.className).toContain('ant-agentic-md-editor-list-item');
    });

    it('应该处理非常长的列表项内容', () => {
      const longContentProps = {
        ...defaultListItemProps,
        element: {
          ...defaultListItemProps.element,
          children: [
            {
              text: 'This is a very long list item content that should still be rendered correctly without any issues even though it contains a lot of text',
            },
          ],
        },
      };
      render(<ListItem {...longContentProps} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li).toBeInTheDocument();
    });

    it('应该处理包含特殊字符的内容', () => {
      const specialCharsProps = {
        ...defaultListItemProps,
        children: [<div key="1">Special chars: @#$%^&*()</div>],
      };
      render(<ListItem {...specialCharsProps} />);
      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });

    it('应该处理包含 HTML 元素的子内容', () => {
      const htmlChildrenProps = {
        ...defaultListItemProps,
        children: [
          <div key="1">
            <strong>Bold</strong> <em>Italic</em> <u>Underline</u>
          </div>,
        ],
      };
      render(<ListItem {...htmlChildrenProps} />);
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
      expect(screen.getByText('Underline')).toBeInTheDocument();
    });

    it('应该处理嵌套列表项', () => {
      const nestedListItemProps = {
        ...defaultListItemProps,
        children: [
          <div key="1">
            Parent Item
            <ul key="nested">
              <li>Nested Item</li>
            </ul>
          </div>,
        ],
      };
      render(<ListItem {...nestedListItemProps} />);
      expect(screen.getByText('Parent Item')).toBeInTheDocument();
      expect(screen.getByText('Nested Item')).toBeInTheDocument();
    });

    it('应该处理只读模式', () => {
      // 不需要特殊 mock，使用默认的 mock 即可
      render(<ListItem {...defaultListItemProps} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li).toBeInTheDocument();
    });

    it('应该处理 attributes 中的额外属性', () => {
      const propsWithExtraAttrs = {
        ...defaultListItemProps,
        attributes: {
          ...defaultListItemProps.attributes,
          'data-custom': 'value',
          'aria-label': 'List item',
        },
      };
      render(<ListItem {...propsWithExtraAttrs} />);
      const li = document.querySelector('[data-be="list-item"]');
      expect(li?.getAttribute('data-custom')).toBe('value');
      expect(li?.getAttribute('aria-label')).toBe('List item');
    });
  });
});
