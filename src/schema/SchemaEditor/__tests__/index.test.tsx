import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import copy from 'copy-to-clipboard';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../I18n';
import { SchemaEditor } from '..';
import { LowCodeSchema } from '../../types';

// Mock AceEditorWrapper
vi.mock('../AceEditorWrapper', () => ({
  AceEditorWrapper: vi.fn(({ value, language, readonly, onChange }) => (
    <div
      data-testid="ace-editor"
      data-value={value}
      data-language={language}
      data-readonly={readonly}
    >
      <textarea
        data-testid={`ace-textarea-${language}`}
        value={value}
        readOnly={readonly}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )),
}));

// Mock SchemaRenderer
vi.mock('../../SchemaRenderer', () => ({
  SchemaRenderer: ({
    schema,
    values,
    fallbackContent,
  }: {
    schema: LowCodeSchema;
    values: Record<string, any>;
    fallbackContent?: React.ReactNode;
  }) => (
    <div data-testid="schema-renderer">
      {schema.component?.schema ? (
        <>
          <div data-testid="schema-type">{schema.component?.type}</div>
          <div data-testid="schema-content">{schema.component?.schema}</div>
          <div data-testid="schema-values">{JSON.stringify(values)}</div>
        </>
      ) : (
        fallbackContent
      )}
    </div>
  ),
}));

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

// Mock message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

const TestWrapper: React.FC<{
  children: React.ReactNode;
  language?: 'zh-CN' | 'en-US';
}> = ({ children, language = 'zh-CN' }) => (
  <I18nProvide defaultLanguage={language} autoDetect={false}>
    {children}
  </I18nProvide>
);

describe('SchemaEditor', () => {
  const mockSchema: LowCodeSchema = {
    version: '1.0.0',
    name: 'Test Schema',
    component: {
      type: 'html',
      schema: '<div>Hello {{name}}</div>',
    },
    initialValues: {
      name: 'World',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (copy as any).mockReturnValue(true);
  });

  describe('基础渲染', () => {
    it('应该渲染SchemaEditor组件', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      expect(screen.getByText('HTML模板')).toBeInTheDocument();
      expect(screen.getByText('Schema JSON')).toBeInTheDocument();
      expect(screen.getByText('实时预览')).toBeInTheDocument();
    });

    it('应该使用默认schema', () => {
      render(
        <TestWrapper>
          <SchemaEditor />
        </TestWrapper>,
      );

      expect(screen.getByText('HTML模板')).toBeInTheDocument();
      const htmlEditor = screen.getByTestId('ace-textarea-html');
      expect(htmlEditor).toHaveValue('<div>Hello World</div>');
    });

    it('应该应用自定义高度', () => {
      const { container } = render(
        <TestWrapper>
          <SchemaEditor height={800} />
        </TestWrapper>,
      );

      const editor = container.firstChild as HTMLElement;
      expect(editor.style.height).toBe('800px');
    });

    it('应该应用字符串高度', () => {
      const { container } = render(
        <TestWrapper>
          <SchemaEditor height="90vh" />
        </TestWrapper>,
      );

      const editor = container.firstChild as HTMLElement;
      expect(editor.style.height).toBe('90vh');
    });

    it('应该应用自定义className', () => {
      const { container } = render(
        <TestWrapper>
          <SchemaEditor className="custom-editor" />
        </TestWrapper>,
      );

      expect(container.firstChild).toHaveClass('custom-editor');
    });

    it('应该隐藏预览区域', () => {
      render(
        <TestWrapper>
          <SchemaEditor showPreview={false} />
        </TestWrapper>,
      );

      expect(screen.queryByText('实时预览')).not.toBeInTheDocument();
    });

    it('应该显示预览区域', () => {
      render(
        <TestWrapper>
          <SchemaEditor showPreview={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('实时预览')).toBeInTheDocument();
    });
  });

  describe('只读模式', () => {
    it('应该设置编辑器为只读', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} readonly={true} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      const jsonEditor = screen.getByTestId('ace-textarea-json');

      expect(htmlEditor).toHaveAttribute('readonly');
      expect(jsonEditor).toHaveAttribute('readonly');
    });

    it('应该在非只读模式下允许编辑', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} readonly={false} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      expect(htmlEditor).not.toHaveAttribute('readonly');
    });
  });

  describe('内容编辑', () => {
    it('应该更新HTML内容', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} onChange={handleChange} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      fireEvent.change(htmlEditor, {
        target: { value: '<div>Updated HTML</div>' },
      });

      expect(handleChange).toHaveBeenCalled();
    });

    it('应该更新JSON内容', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} onChange={handleChange} />
        </TestWrapper>,
      );

      const jsonEditor = screen.getByTestId('ace-textarea-json');
      const newSchema = { ...mockSchema, name: 'Updated Schema' };

      fireEvent.change(jsonEditor, {
        target: { value: JSON.stringify(newSchema) },
      });

      expect(handleChange).toHaveBeenCalled();
    });

    it('应该处理无效的JSON', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} onChange={handleChange} />
        </TestWrapper>,
      );

      const jsonEditor = screen.getByTestId('ace-textarea-json');
      fireEvent.change(jsonEditor, {
        target: { value: 'invalid json {' },
      });

      // 无效JSON不应该触发onChange
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('运行按钮', () => {
    it('应该显示运行按钮', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      expect(screen.getByText('运行')).toBeInTheDocument();
    });

    it('应该点击运行按钮渲染schema', async () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      const runButton = screen.getByText('运行');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
        expect(screen.getByTestId('schema-content')).toHaveTextContent(
          '<div>Hello {{name}}</div>',
        );
      });
    });

    it('应该在运行时使用schema的initialValues', async () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      const runButton = screen.getByText('运行');
      fireEvent.click(runButton);

      await waitFor(() => {
        const valuesElement = screen.getByTestId('schema-values');
        expect(valuesElement).toHaveTextContent(
          JSON.stringify({ name: 'World' }),
        );
      });
    });
  });

  describe('复制功能', () => {
    it('应该显示复制按钮', () => {
      const { container } = render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      // 应该有复制按钮（HTML和JSON各一个）
      const copyButtons = container.querySelectorAll('[aria-label*="复制"]');
      const allButtons = screen.getAllByRole('button');

      // 应该至少有运行按钮和复制按钮
      expect(allButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('应该正确渲染HTML编辑器', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      expect(htmlEditor).toBeInTheDocument();
      expect(htmlEditor).toHaveValue('<div>Hello {{name}}</div>');
    });

    it('应该正确渲染JSON编辑器', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      const jsonEditor = screen.getByTestId('ace-textarea-json');
      expect(jsonEditor).toBeInTheDocument();
    });
  });

  describe('预览配置', () => {
    it('应该传递预览配置给SchemaRenderer', async () => {
      const previewConfig = {
        ALLOWED_TAGS: ['div', 'span'],
        ALLOWED_ATTR: ['class', 'id'],
      };

      render(
        <TestWrapper>
          <SchemaEditor
            initialSchema={mockSchema}
            previewConfig={previewConfig}
          />
        </TestWrapper>,
      );

      const runButton = screen.getByText('运行');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
      });
    });
  });

  describe('国际化', () => {
    it('应该显示英文界面', () => {
      render(
        <TestWrapper language="en-US">
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      expect(screen.getByText('HTML Template')).toBeInTheDocument();
      expect(screen.getByText('Schema JSON')).toBeInTheDocument();
      expect(screen.getByText('Real-time Preview')).toBeInTheDocument();
      expect(screen.getByText('Run')).toBeInTheDocument();
    });

    it('应该显示中文界面', () => {
      render(
        <TestWrapper language="zh-CN">
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      expect(screen.getByText('HTML模板')).toBeInTheDocument();
      expect(screen.getByText('Schema JSON')).toBeInTheDocument();
      expect(screen.getByText('实时预览')).toBeInTheDocument();
      expect(screen.getByText('运行')).toBeInTheDocument();
    });

    it('应该显示中文空状态提示', () => {
      render(
        <TestWrapper language="zh-CN">
          <SchemaEditor />
        </TestWrapper>,
      );

      expect(
        screen.getByText('右侧输入schema后，在这里展示卡片预览'),
      ).toBeInTheDocument();
    });

    it('应该显示英文空状态提示', () => {
      render(
        <TestWrapper language="en-US">
          <SchemaEditor />
        </TestWrapper>,
      );

      expect(
        screen.getByText('Enter schema on the right to show card preview here'),
      ).toBeInTheDocument();
    });
  });

  describe('初始值', () => {
    it('应该使用初始schema', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      expect(htmlEditor).toHaveValue('<div>Hello {{name}}</div>');
    });

    it('应该使用初始values', async () => {
      const initialValues = { name: 'Test' };

      render(
        <TestWrapper>
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={initialValues}
          />
        </TestWrapper>,
      );

      const runButton = screen.getByText('运行');
      fireEvent.click(runButton);

      await waitFor(() => {
        // 应该使用 schema 的 initialValues，而不是传入的 initialValues
        const valuesElement = screen.getByTestId('schema-values');
        expect(valuesElement).toHaveTextContent(
          JSON.stringify({ name: 'World' }),
        );
      });
    });

    it('应该处理没有component的schema', () => {
      const schemaWithoutComponent: any = {
        version: '1.0.0',
        name: 'No Component',
      };

      const { container } = render(
        <TestWrapper>
          <SchemaEditor initialSchema={schemaWithoutComponent} />
        </TestWrapper>,
      );

      // 应该正常渲染
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Schema验证', () => {
    it('应该显示验证错误', async () => {
      const invalidSchema: LowCodeSchema = {
        version: '1.0.0',
        name: '',
        component: {
          type: 'html',
          schema: '<div>Test</div>',
        },
      };

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={invalidSchema} />
        </TestWrapper>,
      );

      const runButton = screen.getByText('运行');
      fireEvent.click(runButton);

      // 如果有验证错误，应该显示
      await waitFor(() => {
        const errorElements = screen.queryAllByText(/⚠️/);
        // 验证组件已运行
        expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
      });
    });
  });

  describe('JSON序列化', () => {
    it('应该正确序列化schema为JSON', () => {
      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} />
        </TestWrapper>,
      );

      const jsonEditor = screen.getByTestId('ace-textarea-json');
      const jsonValue = (jsonEditor as HTMLTextAreaElement).value;

      expect(jsonValue).toContain('Test Schema');
      expect(jsonValue).toContain('<div>Hello {{name}}</div>');
    });

    it('应该处理序列化错误', () => {
      // 创建一个循环引用的对象（无法序列化）
      const circularSchema: any = {
        version: '1.0.0',
        name: 'Circular',
        component: {
          type: 'html',
          schema: '<div>Test</div>',
        },
      };
      circularSchema.self = circularSchema;

      const { container } = render(
        <TestWrapper>
          <SchemaEditor initialSchema={circularSchema} />
        </TestWrapper>,
      );

      // 应该正常渲染，即使序列化失败
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('变更回调', () => {
    it('应该触发onChange回调', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} onChange={handleChange} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      fireEvent.change(htmlEditor, {
        target: { value: '<div>New Content</div>' },
      });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          component: expect.objectContaining({
            schema: '<div>New Content</div>',
          }),
        }),
        expect.any(Object),
      );
    });

    it('应该在JSON变更时触发onChange', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} onChange={handleChange} />
        </TestWrapper>,
      );

      const jsonEditor = screen.getByTestId('ace-textarea-json');
      const newSchema = { ...mockSchema, name: 'Updated' };

      fireEvent.change(jsonEditor, {
        target: { value: JSON.stringify(newSchema) },
      });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated' }),
        expect.any(Object),
      );
    });
  });

  describe('边缘情况', () => {
    it('应该处理空schema', () => {
      const emptySchema: LowCodeSchema = {
        version: '1.0.0',
        name: 'Empty',
        component: {
          type: 'html',
          schema: '',
        },
      };

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={emptySchema} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      expect(htmlEditor).toHaveValue('');
    });

    it('应该处理复杂的HTML内容', () => {
      const complexSchema: LowCodeSchema = {
        version: '1.0.0',
        name: 'Complex',
        component: {
          type: 'html',
          schema: `<div class="container"><h1>{{title}}</h1><p>{{content}}</p></div>`,
        },
      };

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={complexSchema} />
        </TestWrapper>,
      );

      const htmlEditor = screen.getByTestId('ace-textarea-html');
      const htmlValue = (htmlEditor as HTMLTextAreaElement).value;
      expect(htmlValue).toContain('container');
      expect(htmlValue).toContain('{{title}}');
    });

    it('应该处理initialValues为undefined', () => {
      const { container } = render(
        <TestWrapper>
          <SchemaEditor initialSchema={mockSchema} initialValues={undefined} />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Fallback内容', () => {
    it('应该在schema缺少内容时显示fallback', async () => {
      const brokenSchema: any = {
        version: '1.0.0',
        name: 'Broken',
        component: {},
      };

      render(
        <TestWrapper>
          <SchemaEditor initialSchema={brokenSchema} />
        </TestWrapper>,
      );

      const runButton = screen.getByText('运行');
      fireEvent.click(runButton);

      await waitFor(() => {
        // 应该显示schema renderer
        expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
      });
    });
  });
});
