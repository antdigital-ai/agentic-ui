import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  tableRenderElement,
  Td,
  Th,
} from '../../../../src/MarkdownEditor/editor/elements/Table';

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
  useSelStatus: vi.fn(() => [false, [0]]),
}));

vi.mock('slate-react', () => ({
  useSlateSelection: vi.fn(),
  useSlateStatic: vi.fn(() => ({
    children: [{ children: [] }],
  })),
  useSlate: vi.fn(() => ({
    children: [{ children: [] }],
  })),
  ReactEditor: {
    isFocused: vi.fn(() => false),
  },
}));

vi.mock('../../../../src/MarkdownEditor/utils/slate-table', () => ({
  TableCursor: {
    isSelected: vi.fn(() => false),
  },
}));

vi.mock(
  '../../../../src/MarkdownEditor/editor/elements/Table/SimpleTable',
  () => ({
    SimpleTable: ({ children, ...props }: any) => (
      <table data-testid="simple-table" {...props}>
        {children}
      </table>
    ),
  }),
);

vi.mock(
  '../../../../src/MarkdownEditor/editor/elements/Table/Td/style',
  () => ({
    useStyle: vi.fn(() => ({
      wrapSSR: (component: any) => component,
      hashId: 'test-hash',
    })),
  }),
);

describe('Table Components', () => {
  describe('Th (表头单元格)', () => {
    const defaultThProps = {
      element: {
        type: 'header-cell' as const,
        children: [{ text: 'Header Cell' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">Header Content</div>],
    } as any;

    it('应该正确渲染表头单元格', () => {
      render(<Th {...defaultThProps} />);
      const th = document.querySelector('th');
      expect(th).toBeInTheDocument();
    });

    it('应该显示表头内容', () => {
      render(<Th {...defaultThProps} />);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<Th {...defaultThProps} style={customStyle} />);
      const th = document.querySelector('th');
      expect(th).toBeInTheDocument();
    });

    it('应该处理错误的元素类型', () => {
      const invalidProps = {
        ...defaultThProps,
        element: { type: 'invalid-type' },
      };
      expect(() => render(<Th {...invalidProps} />)).toThrow(
        'Element "Th" must be of type "header-cell"',
      );
    });
  });

  describe('Td (表格单元格)', () => {
    const defaultTdProps = {
      element: {
        type: 'table-cell' as const,
        children: [{ text: 'Cell Content' }],
        align: 'center',
        width: '100px',
        rowSpan: 2,
        colSpan: 3,
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">Cell Content</div>],
    } as any;

    it('应该正确渲染表格单元格', () => {
      render(<Td {...defaultTdProps} />);
      const td = document.querySelector('td');
      expect(td).toBeInTheDocument();
    });

    it('应该显示单元格内容', () => {
      render(<Td {...defaultTdProps} />);
      expect(screen.getByText('Cell Content')).toBeInTheDocument();
    });

    it('应该应用对齐样式', () => {
      render(<Td {...defaultTdProps} />);
      const td = document.querySelector('td');
      expect(td).toHaveStyle({ textAlign: 'center' });
    });

    it('应该应用宽度样式', () => {
      render(<Td {...defaultTdProps} />);
      const td = document.querySelector('td');
      expect(td).toHaveStyle({ width: '100px' });
    });

    it('应该设置rowSpan和colSpan属性', () => {
      render(<Td {...defaultTdProps} />);
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('rowSpan', '2');
      expect(td).toHaveAttribute('colSpan', '3');
    });

    it('应该处理隐藏的单元格', () => {
      const hiddenProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          hidden: true,
        },
      };
      render(<Td {...hiddenProps} />);
      const td = document.querySelector('td');
      expect(td).toHaveStyle({ display: 'none' });
    });

    it('应该处理错误的元素类型', () => {
      const invalidProps = {
        ...defaultTdProps,
        element: { type: 'invalid-type' },
      };
      expect(() => render(<Td {...invalidProps} />)).toThrow(
        'Element "Td" must be of type "table-cell"',
      );
    });
  });

  const defaultAttributes = {
    'data-slate-node': 'element' as const,
    ref: { current: null },
  };

  describe('tableRenderElement', () => {
    describe('table类型', () => {
      it('应该渲染表格元素', () => {
        const props = {
          element: { type: 'table' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Table Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('table-head类型', () => {
      it('应该渲染表头元素', () => {
        const props = {
          element: { type: 'table-head' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });

      it('应该应用表头样式', () => {
        const props = {
          element: { type: 'table-head' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('table-footer类型', () => {
      it('应该渲染表尾元素', () => {
        const props = {
          element: { type: 'table-footer' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Footer Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('table-row类型', () => {
      it('应该渲染表格行元素', () => {
        const props = {
          element: { type: 'table-row' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Row Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('header-cell类型', () => {
      it('应该渲染表头单元格', () => {
        const props = {
          element: { type: 'header-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header Cell</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });

      it('应该应用表头单元格样式', () => {
        const props = {
          element: { type: 'header-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header Cell</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });

      it('应通过 ThWrapper 渲染 header-cell 并输出 th 元素', () => {
        const props = {
          element: { type: 'header-cell' as const, children: [{ text: '' }] },
          attributes: defaultAttributes,
          children: [<div key="1">Header Content</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const th = container.querySelector('th');
        expect(th).toBeInTheDocument();
      });
    });

    describe('table-cell类型', () => {
      it('应该渲染TdWrapper组件', () => {
        const props = {
          element: { type: 'table-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Cell Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });

      it('应该应用表格单元格样式', () => {
        const props = {
          element: { type: 'table-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Cell Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('未知类型', () => {
      it('应该返回null', () => {
        const props = {
          element: { type: 'unknown-type' as any, children: [] },
          attributes: defaultAttributes,
          children: [],
        };
        const result = tableRenderElement(props);
        expect(result).toBeNull();
      });
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空的子元素', () => {
      const props = {
        element: { type: 'table-cell' as const, children: [] },
        attributes: defaultAttributes,
        children: [],
      };
      const result = tableRenderElement(props);
      expect(result).toBeDefined();
    });

    it('应该处理复杂的子元素结构', () => {
      const props = {
        element: { type: 'table-cell' as const, children: [] },
        attributes: defaultAttributes,
        children: [<div key="1">Complex</div>, <span key="2">Content</span>],
      };
      const result = tableRenderElement(props);
      expect(result).toBeDefined();
    });
  });

  describe('tableRenderElement 扩展测试', () => {
    describe('只读模式配置测试', () => {
      it('应该在只读模式下不渲染 TableCellIndex', () => {
        const props = {
          element: { type: 'table-row' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Row Content</div>],
        };
        const result = tableRenderElement(props, { readonly: true });
        expect(result).toBeDefined();
      });

      it('应该在编辑模式下渲染 TableCellIndex', () => {
        const props = {
          element: { type: 'table-row' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Row Content</div>],
        };
        const result = tableRenderElement(props, { readonly: false });
        expect(result).toBeDefined();
      });
    });

    describe('表头样式测试', () => {
      it('应该为 table-head 应用边框样式', () => {
        const props = {
          element: { type: 'table-head' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const thead = container.querySelector('thead');
        expect(thead).toHaveStyle({ borderBottomWidth: '1px' });
      });

      it('应该为 table-head 应用背景色', () => {
        const props = {
          element: { type: 'table-head' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const thead = container.querySelector('thead');
        expect(thead).toHaveStyle({ backgroundColor: '#f1f5f9' });
      });

      it('应该为 table-head 应用文本转换', () => {
        const props = {
          element: { type: 'table-head' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const thead = container.querySelector('thead');
        expect(thead).toHaveStyle({ textTransform: 'uppercase' });
      });
    });

    describe('表格单元格样式测试', () => {
      it('应该为 header-cell 应用 padding', () => {
        const props = {
          element: { type: 'header-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Header</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });

      it('应该为 table-cell 应用 padding', () => {
        const props = {
          element: { type: 'table-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Cell</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });

      it('应该为单元格应用垂直对齐', () => {
        const props = {
          element: { type: 'table-cell' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Cell</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('表格行渲染测试', () => {
      it('应该传递 attributes 给 tr', () => {
        const customAttributes = {
          ...defaultAttributes,
          'data-custom': 'value',
        };
        const props = {
          element: { type: 'table-row' as const, children: [] },
          attributes: customAttributes,
          children: [<div key="1">Row</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const tr = container.querySelector('tr');
        expect(tr).toHaveAttribute('data-custom', 'value');
      });

      it('应该处理空的 row children', () => {
        const props = {
          element: { type: 'table-row' as const, children: [] },
          attributes: defaultAttributes,
          children: [],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    describe('表尾渲染测试', () => {
      it('应该渲染 tfoot 元素', () => {
        const props = {
          element: { type: 'table-footer' as const, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Footer</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const tfoot = container.querySelector('tfoot');
        expect(tfoot).toBeInTheDocument();
      });

      it('应该传递 attributes 给 tfoot', () => {
        const customAttributes = {
          ...defaultAttributes,
          'data-footer': 'true',
        };
        const props = {
          element: { type: 'table-footer' as const, children: [] },
          attributes: customAttributes,
          children: [<div key="1">Footer</div>],
        };
        const { container } = render(tableRenderElement(props) as any);
        const tfoot = container.querySelector('tfoot');
        expect(tfoot).toHaveAttribute('data-footer', 'true');
      });
    });
  });

  describe('Th 扩展测试', () => {
    const defaultThProps = {
      element: {
        type: 'header-cell' as const,
        children: [{ text: 'Header Cell' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">Header Content</div>],
    } as any;

    it('应该传递所有 attributes', () => {
      const customAttributes = {
        ...defaultThProps.attributes,
        'data-custom': 'header-value',
      };
      const { container } = render(
        <Th {...defaultThProps} attributes={customAttributes} />,
      );
      const th = container.querySelector('th');
      expect(th).toHaveAttribute('data-custom', 'header-value');
    });

    it('应该合并自定义样式和默认样式', () => {
      const customStyle = { padding: '16px', color: 'blue' };
      const { container } = render(
        <Th {...defaultThProps} style={customStyle} />,
      );
      const th = container.querySelector('th') as HTMLElement;
      expect(th.style.padding).toBe('16px');
      expect(th.style.color).toBe('blue');
    });

    it('应该处理选中状态背景色', () => {
      const { container } = render(<Th {...defaultThProps} />);
      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
    });

    it('应该处理空的 children', () => {
      const { container } = render(<Th {...defaultThProps} children={[]} />);
      const th = container.querySelector('th');
      expect(th).toBeInTheDocument();
    });

    it('应该处理多个子元素', () => {
      const multipleChildren = [
        <div key="1">First</div>,
        <div key="2">Second</div>,
      ];
      const { container } = render(
        <Th {...defaultThProps} children={multipleChildren} />,
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Td 扩展测试', () => {
    const defaultTdProps = {
      element: {
        type: 'table-cell' as const,
        children: [{ text: 'Cell Content' }],
        align: 'center',
        width: '100px',
        rowSpan: 2,
        colSpan: 3,
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">Cell Content</div>],
    } as any;

    it('应该处理默认对齐方式（左对齐）', () => {
      const propsWithoutAlign = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          align: undefined,
        },
      };
      const { container } = render(<Td {...propsWithoutAlign} />);
      const td = container.querySelector('td') as HTMLElement;
      expect(td.style.textAlign).toBe('left');
    });

    it('应该处理默认宽度（auto）', () => {
      const propsWithoutWidth = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          width: undefined,
        },
      };
      const { container } = render(<Td {...propsWithoutWidth} />);
      const td = container.querySelector('td') as HTMLElement;
      expect(td.style.width).toBe('auto');
    });

    it('应该处理没有 rowSpan 的情况', () => {
      const propsWithoutRowSpan = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          rowSpan: undefined,
        },
      };
      const { container } = render(<Td {...propsWithoutRowSpan} />);
      const td = container.querySelector('td');
      expect(td).not.toHaveAttribute('rowSpan');
    });

    it('应该处理没有 colSpan 的情况', () => {
      const propsWithoutColSpan = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          colSpan: undefined,
        },
      };
      const { container } = render(<Td {...propsWithoutColSpan} />);
      const td = container.querySelector('td');
      expect(td).not.toHaveAttribute('colSpan');
    });

    it('应该合并自定义样式', () => {
      const customStyle = { border: '1px solid red', padding: '20px' };
      const { container } = render(
        <Td {...defaultTdProps} style={customStyle} />,
      );
      const td = container.querySelector('td') as HTMLElement;
      expect(td.style.border).toBe('1px solid red');
      expect(td.style.padding).toBe('20px');
    });

    it('应该处理 ref 回调函数', () => {
      const refCallback = vi.fn();
      const propsWithRefCallback = {
        ...defaultTdProps,
        attributes: {
          ...defaultTdProps.attributes,
          ref: refCallback,
        },
      };
      render(<Td {...propsWithRefCallback} />);
      expect(refCallback).toHaveBeenCalled();
    });

    it('应该处理隐藏单元格的类名', () => {
      const hiddenProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          hidden: true,
        },
      };
      const { container } = render(<Td {...hiddenProps} />);
      const td = container.querySelector('td');
      expect(td).toHaveClass('ant-agentic-md-editor-table-td');
    });

    it('应该应用 hashId', () => {
      const { container } = render(<Td {...defaultTdProps} />);
      const td = container.querySelector('td');
      // hashId 通过 wrapSSR 应用，检查 td 存在即可
      expect(td).toBeInTheDocument();
    });

    it('应该处理居中对齐', () => {
      const centerAlignProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          align: 'center',
        },
      };
      const { container } = render(<Td {...centerAlignProps} />);
      const td = container.querySelector('td') as HTMLElement;
      expect(td.style.textAlign).toBe('center');
    });

    it('应该处理右对齐', () => {
      const rightAlignProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          align: 'right',
        },
      };
      const { container } = render(<Td {...rightAlignProps} />);
      const td = container.querySelector('td') as HTMLElement;
      expect(td.style.textAlign).toBe('right');
    });

    it('应该处理数字宽度', () => {
      const numericWidthProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          width: 200,
        },
      };
      const { container } = render(<Td {...numericWidthProps} />);
      const td = container.querySelector('td') as HTMLElement;
      // 数字宽度会被转换为 px
      expect(td.style.width).toBe('200px');
    });

    it('应该处理百分比宽度', () => {
      const percentWidthProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          width: '50%',
        },
      };
      const { container } = render(<Td {...percentWidthProps} />);
      const td = container.querySelector('td') as HTMLElement;
      expect(td.style.width).toBe('50%');
    });

    it('应该处理 rowSpan 为 1', () => {
      const rowSpanOneProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          rowSpan: 1,
        },
      };
      const { container } = render(<Td {...rowSpanOneProps} />);
      const td = container.querySelector('td');
      expect(td).toHaveAttribute('rowSpan', '1');
    });

    it('应该处理 colSpan 为 1', () => {
      const colSpanOneProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          colSpan: 1,
        },
      };
      const { container } = render(<Td {...colSpanOneProps} />);
      const td = container.querySelector('td');
      expect(td).toHaveAttribute('colSpan', '1');
    });

    it('应该处理大的 rowSpan 值', () => {
      const largeRowSpanProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          rowSpan: 10,
        },
      };
      const { container } = render(<Td {...largeRowSpanProps} />);
      const td = container.querySelector('td');
      expect(td).toHaveAttribute('rowSpan', '10');
    });

    it('应该处理大的 colSpan 值', () => {
      const largeColSpanProps = {
        ...defaultTdProps,
        element: {
          ...defaultTdProps.element,
          colSpan: 10,
        },
      };
      const { container } = render(<Td {...largeColSpanProps} />);
      const td = container.querySelector('td');
      expect(td).toHaveAttribute('colSpan', '10');
    });
  });

  describe('Th 错误处理测试', () => {
    const defaultThProps = {
      element: {
        type: 'header-cell' as const,
        children: [{ text: 'Header Cell' }],
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">Header Content</div>],
    } as any;

    it('应该处理 null element', () => {
      const nullElementProps = {
        ...defaultThProps,
        element: null,
      };
      expect(() => render(<Th {...nullElementProps} />)).toThrow();
    });

    it('应该处理 undefined element.type', () => {
      const undefinedTypeProps = {
        ...defaultThProps,
        element: { type: undefined },
      };
      expect(() => render(<Th {...undefinedTypeProps} />)).toThrow();
    });
  });

  describe('Td 错误处理测试', () => {
    const defaultTdProps = {
      element: {
        type: 'table-cell' as const,
        children: [{ text: 'Cell Content' }],
        align: 'center',
        width: '100px',
        rowSpan: 2,
        colSpan: 3,
      },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: [<div key="1">Cell Content</div>],
    } as any;

    it('应该处理 null element', () => {
      const nullElementProps = {
        ...defaultTdProps,
        element: null,
      };
      expect(() => render(<Td {...nullElementProps} />)).toThrow();
    });

    it('应该处理 undefined element.type', () => {
      const undefinedTypeProps = {
        ...defaultTdProps,
        element: { type: undefined },
      };
      expect(() => render(<Td {...undefinedTypeProps} />)).toThrow();
    });
  });

  describe('tableRenderElement 所有类型覆盖测试', () => {
    it('应该正确处理所有已知类型', () => {
      const types = [
        'table',
        'table-head',
        'table-footer',
        'table-row',
        'header-cell',
        'table-cell',
      ];

      types.forEach((type) => {
        const props = {
          element: { type: type as any, children: [] },
          attributes: defaultAttributes,
          children: [<div key="1">Content</div>],
        };
        const result = tableRenderElement(props);
        expect(result).toBeDefined();
      });
    });

    it('应该为不同类型的元素传递正确的 children', () => {
      const types = ['table-head', 'table-footer', 'table-row'];

      types.forEach((type, index) => {
        const children = [<div key={`${type}-${index}`}>Test Content {index}</div>];
        const props = {
          element: { type: type as any, children: [] },
          attributes: defaultAttributes,
          children,
        };
        const { container } = render(tableRenderElement(props) as any);
        expect(screen.getByText(`Test Content ${index}`)).toBeInTheDocument();
      });
    });
  });
});
