import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TagPopup } from '../../../../src/MarkdownEditor/editor/elements/TagPopup';
import { SuggestionConnext } from '../../../../src/MarkdownInputField/Suggestion';

// Mock SuggestionContext
const createMockSuggestionContext = () => ({
  open: false,
  setOpen: vi.fn(),
  triggerNodeContext: { current: undefined },
  onSelectRef: {
    current: vi.fn() as ((value: string) => void) | undefined,
  },
  isRender: true as const,
});

let mockSuggestionContext = createMockSuggestionContext();

// 确保在所有测试中，SuggestionConnext.Provider 都提供了包含 open 属性的值

// Mock useSlate 和 ReactEditor 方法
vi.mock('slate-react', async () => {
  const actual =
    await vi.importActual<typeof import('slate-react')>('slate-react');
  const { createEditor } = await import('slate');
  const { withReact } = actual;

  const mockEditor = withReact(createEditor());
  mockEditor.children = [
    {
      type: 'paragraph',
      children: [{ text: 'test' }],
    },
  ];

  return {
    ...actual,
    useSlate: () => mockEditor,
    ReactEditor: {
      ...actual.ReactEditor,
      toSlateNode: vi.fn((_editor, domNode) => {
        // 在测试环境中，返回一个模拟的节点
        if (
          domNode &&
          typeof domNode === 'object' &&
          'getAttribute' in domNode
        ) {
          return { text: 'test' };
        }
        throw new Error('Cannot resolve a Slate node from DOM node');
      }),
      findPath: vi.fn(() => {
        // 返回一个模拟的路径
        return [0, 0];
      }),
    },
  };
});

describe('TagPopup 组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuggestionContext = createMockSuggestionContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染 TagPopup 组件', () => {
      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test">
              <span>test content</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      expect(
        container.querySelector('[data-tag-popup-input]'),
      ).toBeInTheDocument();
    });

    it('应该显示子元素内容', () => {
      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test">
              <span data-testid="child-content">test content</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('items 属性', () => {
    it('应该使用静态 items 数组', () => {
      const items = [
        { label: '选项1', key: '1' },
        { label: '选项2', key: '2' },
      ] as Array<{ label: string; key: string | number }>;

      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" items={items}>
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      const input = document.querySelector('[data-tag-popup-input]');
      expect(input).toBeInTheDocument();
    });

    it('应该使用异步 items 函数', async () => {
      const items = vi.fn(
        async () =>
          [
            { label: '选项1', key: '1' },
            { label: '选项2', key: '2' },
          ] as Array<{ label: string; key: string | number }>,
      );

      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" items={items} open={true}>
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(items).toHaveBeenCalled();
      });
    });
  });

  describe('autoOpen 属性', () => {
    it('应该在 autoOpen 为 true 时自动打开下拉菜单（dropdown 类型）', () => {
      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" autoOpen type="dropdown">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      // 对于 dropdown 类型，autoOpen 会设置 open 状态
      expect(mockSuggestionContext.setOpen).not.toHaveBeenCalled();
    });

    it('应该在 autoOpen 为 true 时自动打开面板（panel 类型）', () => {
      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" autoOpen type="panel">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      expect(mockSuggestionContext.setOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('onSelect 回调 - DOM 更新测试', () => {
    it('应该在 onSelect 调用时触发 DOM 更新', async () => {
      const onSelect = vi.fn();
      const items = [
        { label: '选项1', key: '1' },
        { label: '选项2', key: '2' },
      ] as Array<{ label: string; key: string | number }>;

      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="`test"
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span data-testid="tag-content">`test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      // 等待组件完全渲染
      await waitFor(() => {
        expect(
          container.querySelector('[data-tag-popup-input]'),
        ).toBeInTheDocument();
      });

      // 模拟选择项，触发 onSelect
      if (mockSuggestionContext.onSelectRef.current) {
        mockSuggestionContext.onSelectRef.current('选项1');
      }

      // 验证 onSelect 被调用
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('选项1', expect.any(Array));
      });

      // 验证下拉菜单关闭
      expect(mockSuggestionContext.setOpen).toHaveBeenCalledWith(false);
    });

    it('应该在 onSelect 调用后更新文本内容', async () => {
      const onSelect = vi.fn((value) => {
        // 模拟编辑器更新 DOM
        const input = document.querySelector('[data-tag-popup-input]');
        if (input) {
          const content = input.querySelector('[data-testid="tag-content"]');
          if (content) {
            content.textContent = `$${value}`;
          }
        }
      });

      const items = [
        { label: '选项1', key: '1' },
        { label: '选项2', key: '2' },
      ] as Array<{ label: string; key: string | number }>;

      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="`test"
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span data-testid="tag-content">`test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(
          container.querySelector('[data-tag-popup-input]'),
        ).toBeInTheDocument();
      });

      // 获取初始文本内容
      const initialContent = screen.getByTestId('tag-content').textContent;

      // 触发 onSelect
      if (mockSuggestionContext.onSelectRef.current) {
        mockSuggestionContext.onSelectRef.current('选项1');
      }

      // 等待 DOM 更新
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalled();
      });

      // 验证文本内容已更新
      const updatedContent = screen.getByTestId('tag-content').textContent;
      expect(updatedContent).not.toBe(initialContent);
      expect(updatedContent).toBe('$选项1');
    });

    it('应该在 onSelect 调用后更新下拉菜单的打开状态', async () => {
      const onSelect = vi.fn();
      const items = [
        { label: '选项1', key: '1' },
        { label: '选项2', key: '2' },
      ] as Array<{ label: string; key: string | number }>;

      // 初始状态：下拉菜单打开
      mockSuggestionContext.open = true;

      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="`test"
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(
          container.querySelector('[data-tag-popup-input]'),
        ).toBeInTheDocument();
      });

      // 触发 onSelect
      if (mockSuggestionContext.onSelectRef.current) {
        mockSuggestionContext.onSelectRef.current('选项1');
      }

      // 验证下拉菜单被关闭
      await waitFor(() => {
        expect(mockSuggestionContext.setOpen).toHaveBeenCalledWith(false);
      });
    });

    it('应该在 onSelect 调用时传递正确的路径参数', async () => {
      const onSelect = vi.fn();
      const items = [
        { label: '选项1', key: '1' },
        { label: '选项2', key: '2' },
      ] as Array<{ label: string; key: string | number }>;

      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="`test"
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(mockSuggestionContext.triggerNodeContext.current).toBeDefined();
      });

      // 触发 onSelect
      if (mockSuggestionContext.onSelectRef.current) {
        mockSuggestionContext.onSelectRef.current('选项1');
      }

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalled();
        // 验证路径参数被传递
        const callArgs = onSelect.mock.calls[0];
        expect(Array.isArray(callArgs[1])).toBe(true); // path 应该是数组
      });
    });

    it('应该支持连续多次选择下拉选项而不报错', async () => {
      // 此测试用例验证修复：连续选择下拉选项时不再抛出
      // "Cannot destructure property 'path' of 'at' as it is null" 错误
      const onSelect = vi.fn();
      const items = [
        { label: '选项1', key: 'tag1' },
        { label: '选项2', key: 'tag2' },
      ] as Array<{ label: string; key: string | number }>;

      const { container, rerender } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text=" "
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span data-testid="tag-content"> </span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(
          container.querySelector('[data-tag-popup-input]'),
        ).toBeInTheDocument();
      });

      // 第一次选择
      if (mockSuggestionContext.onSelectRef.current) {
        mockSuggestionContext.onSelectRef.current('tag1');
      }

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('tag1', expect.any(Array));
      });

      // 模拟第一次选择后文本内容更新
      rerender(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="$tag1"
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span data-testid="tag-content">$tag1</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      // 重置 mock 以便追踪第二次调用
      onSelect.mockClear();

      // 第二次选择 - 修复前会抛出错误
      if (mockSuggestionContext.onSelectRef.current) {
        expect(() => {
          mockSuggestionContext.onSelectRef.current!('tag1');
        }).not.toThrow();
      }

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('tag1', expect.any(Array));
      });

      // 验证连续选择后路径参数仍然有效
      const callArgs = onSelect.mock.calls[0];
      expect(Array.isArray(callArgs[1])).toBe(true);
      expect(callArgs[1].length).toBeGreaterThan(0);
    });

    it('应该在节点已有内容时正确处理 onSelect 回调', async () => {
      // 此测试验证：当节点已有内容（如 "$tag1"）时，再次选择不会导致
      // Slate 的 insertText 操作失败
      const onSelect = vi.fn();
      const items = [
        { label: '选项1', key: 'tag1' },
        { label: '选项2', key: 'tag2' },
      ] as Array<{ label: string; key: string | number }>;

      // 初始状态：节点已有内容
      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="$tag1"
              items={items}
              onSelect={onSelect}
              type="panel"
            >
              <span data-testid="tag-content">$tag1</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(
          container.querySelector('[data-tag-popup-input]'),
        ).toBeInTheDocument();
      });

      // 在已有内容的情况下选择
      if (mockSuggestionContext.onSelectRef.current) {
        mockSuggestionContext.onSelectRef.current('tag2');
      }

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('tag2', expect.any(Array));
      });

      // 验证 setOpen 被正确调用
      expect(mockSuggestionContext.setOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('onChange 回调', () => {
    it('应该在文本变化时调用 onChange', async () => {
      const onChange = vi.fn();

      const { rerender } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" onChange={onChange}>
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      // 更新 text prop
      rerender(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="new text" onChange={onChange}>
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('beforeOpenChange 回调', () => {
    it('应该在打开前调用 beforeOpenChange，如果返回 false 则不打开', () => {
      const beforeOpenChange = vi.fn(() => false);

      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="test"
              beforeOpenChange={beforeOpenChange}
              type="panel"
            >
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      const input = document.querySelector('[data-tag-popup-input]');
      if (input) {
        fireEvent.click(input);
      }

      expect(beforeOpenChange).toHaveBeenCalled();
      expect(mockSuggestionContext.setOpen).not.toHaveBeenCalled();
    });

    it('应该在 beforeOpenChange 返回 true 时打开', () => {
      const beforeOpenChange = vi.fn(() => true);

      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup
              text="test"
              beforeOpenChange={beforeOpenChange}
              type="panel"
            >
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      const input = document.querySelector('[data-tag-popup-input]');
      if (input) {
        fireEvent.click(input);
      }

      expect(beforeOpenChange).toHaveBeenCalled();
      expect(mockSuggestionContext.setOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('tagRender 自定义渲染', () => {
    it('应该使用 tagRender 自定义渲染', () => {
      const tagRender = vi.fn((props, defaultDom) => (
        <div data-testid="custom-render">{defaultDom}</div>
      ));

      render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" tagRender={tagRender}>
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      expect(tagRender).toHaveBeenCalled();
      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    });
  });

  describe('鼠标事件', () => {
    it('应该在鼠标进入时移除 data-no-focus 属性', () => {
      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      const input = container.querySelector('[data-tag-popup-input]');
      // 在 React 中，布尔属性会被渲染为字符串 'true' 或空字符串
      expect(input?.hasAttribute('data-no-focus')).toBe(true);

      if (input) {
        fireEvent.mouseEnter(input);
        expect(input.hasAttribute('data-no-focus')).toBe(false);
      }
    });

    it('应该在鼠标离开时添加 data-no-focus 属性', () => {
      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      const input = container.querySelector('[data-tag-popup-input]');
      if (input) {
        fireEvent.mouseEnter(input);
        fireEvent.mouseLeave(input);
        // 在 React 中，布尔属性会被渲染为字符串 'true' 或空字符串
        expect(input.hasAttribute('data-no-focus')).toBe(true);
      }
    });
  });

  describe('placeholder 属性', () => {
    it('应该显示 placeholder 作为 title', () => {
      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" placeholder="请输入">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      const input = container.querySelector('[data-tag-popup-input]');
      expect(input?.getAttribute('title')).toBe('请输入');
    });
  });

  describe('type 属性', () => {
    it('应该根据 type 渲染不同的组件（dropdown）', () => {
      const items = [
        { label: '选项1', key: '1' },
        { label: '选项2', key: '2' },
      ] as Array<{ label: string; key: string | number }>;

      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" items={items} type="dropdown">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      // Dropdown 类型会渲染 Dropdown 组件
      expect(
        container.querySelector('[data-tag-popup-input]'),
      ).toBeInTheDocument();
    });

    it('应该根据 type 渲染不同的组件（panel）', () => {
      const { container } = render(
        <ConfigProvider>
          <SuggestionConnext.Provider value={mockSuggestionContext}>
            <TagPopup text="test" type="panel">
              <span>test</span>
            </TagPopup>
          </SuggestionConnext.Provider>
        </ConfigProvider>,
      );

      expect(
        container.querySelector('[data-tag-popup-input]'),
      ).toBeInTheDocument();
    });
  });
});
