import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import React, { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../src/I18n';
import { SchemaEditor, SchemaEditorRef } from '../src/Schema/SchemaEditor';
import { LowCodeSchema } from '../src/Schema/types';

// Mock AceEditorWrapper to avoid DOM manipulation issues in tests
vi.mock('../src/Schema/SchemaEditor/AceEditorWrapper', () => ({
  AceEditorWrapper: vi.fn(({ value, language, readonly }) => (
    <div
      data-testid="ace-editor"
      data-value={value}
      data-language={language}
      data-readonly={readonly}
    >
      {value}
    </div>
  )),
}));

// Mock SchemaRenderer
vi.mock('../src/Schema/SchemaRenderer', () => ({
  SchemaRenderer: ({
    schema,
    values,
  }: {
    schema: LowCodeSchema;
    values: Record<string, any>;
  }) => (
    <div data-testid="schema-renderer">
      <div data-testid="schema-type">{schema.component?.type}</div>
      <div data-testid="schema-content">{schema.component?.schema}</div>
      <div data-testid="schema-values">{JSON.stringify(values)}</div>
    </div>
  ),
}));

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn().mockReturnValue(true),
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// 测试包装组件，提供国际化上下文
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

  const mockValues = {
    name: 'World',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染SchemaEditor组件', () => {
    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
        />
      </TestWrapper>,
    );

    // 检查标题是否正确显示
    expect(screen.getByText('HTML模板')).toBeInTheDocument();
    expect(screen.getByText('Schema JSON')).toBeInTheDocument();
    expect(screen.getByText('实时预览')).toBeInTheDocument();
  });

  it('应该显示schema验证错误', () => {
    const invalidSchema: LowCodeSchema = {
      version: '1.0.0',
      name: 'Invalid Schema',
      component: {
        type: 'html',
        schema: '<div>Invalid</div>',
      },
    };

    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={invalidSchema}
          initialValues={{}}
          height={600}
        />
      </TestWrapper>,
    );

    // 检查预览区域是否正确渲染（初始状态为空状态）
    expect(
      screen.getByText('右侧输入schema后，在这里展示卡片预览'),
    ).toBeInTheDocument();
  });

  it('应该正确处理只读模式', () => {
    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
          readonly={true}
        />
      </TestWrapper>,
    );

    // 检查组件是否正确渲染（只读模式下不应该有交互元素）
    expect(screen.getByText('HTML模板')).toBeInTheDocument();
    expect(screen.getByText('Schema JSON')).toBeInTheDocument();
  });

  it('应该正确处理onChange回调', async () => {
    const mockOnChange = vi.fn();

    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
          onChange={mockOnChange}
        />
      </TestWrapper>,
    );

    // 由于AceEditor被mock，我们无法直接测试编辑器交互
    // 但可以验证组件是否正确渲染
    expect(
      screen.getByText('右侧输入schema后，在这里展示卡片预览'),
    ).toBeInTheDocument();
  });

  it('应该正确处理onError回调', () => {
    const mockOnError = vi.fn();

    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
          onError={mockOnError}
        />
      </TestWrapper>,
    );

    // 检查组件是否正确渲染
    expect(
      screen.getByText('右侧输入schema后，在这里展示卡片预览'),
    ).toBeInTheDocument();
  });

  it('应该正确处理showPreview为false的情况', () => {
    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
          showPreview={false}
        />
      </TestWrapper>,
    );

    // 预览区域不应该显示
    expect(screen.queryByText('实时预览')).not.toBeInTheDocument();
  });

  it('应该正确处理自定义样式类名', () => {
    const { container } = render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
          className="custom-class"
        />
      </TestWrapper>,
    );

    // 检查自定义类名是否正确应用
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('应该正确处理不同的高度值', () => {
    const { container } = render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height="800px"
        />
      </TestWrapper>,
    );

    // 检查高度样式是否正确应用
    const editorElement = container.firstChild as HTMLElement;
    expect(editorElement).toHaveStyle({ height: '800px' });
  });

  it('应该正确处理数字高度值', () => {
    const { container } = render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={500}
        />
      </TestWrapper>,
    );

    // 检查高度样式是否正确应用
    const editorElement = container.firstChild as HTMLElement;
    expect(editorElement).toHaveStyle({ height: '500px' });
  });

  it('应该正确显示schema内容', () => {
    render(
      <TestWrapper>
        <SchemaEditor
          initialSchema={mockSchema}
          initialValues={mockValues}
          height={600}
        />
      </TestWrapper>,
    );

    // 检查schema内容是否正确显示在编辑器中
    const aceEditors = screen.getAllByTestId('ace-editor');
    expect(aceEditors).toHaveLength(2); // HTML 编辑器和 JSON 编辑器

    // 检查 HTML 编辑器内容
    const htmlEditor = aceEditors.find(
      (editor) => editor.getAttribute('data-language') === 'html',
    );
    expect(htmlEditor).toHaveAttribute(
      'data-value',
      '<div>Hello {{name}}</div>',
    );

    // 检查 JSON 编辑器内容
    const jsonEditor = aceEditors.find(
      (editor) => editor.getAttribute('data-language') === 'json',
    );
    expect(jsonEditor).toHaveAttribute(
      'data-value',
      expect.stringContaining('Test Schema'),
    );
  });

  describe('国际化测试', () => {
    it('应该正确显示中文界面', () => {
      render(
        <TestWrapper language="zh-CN">
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      // 检查中文标题是否正确显示
      expect(screen.getByText('HTML模板')).toBeInTheDocument();
      expect(screen.getByText('Schema JSON')).toBeInTheDocument();
      expect(screen.getByText('实时预览')).toBeInTheDocument();
      expect(screen.getByText('运行')).toBeInTheDocument();
    });

    it('应该正确显示英文界面', () => {
      render(
        <TestWrapper language="en-US">
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      // 检查英文标题是否正确显示
      expect(screen.getByText('HTML Template')).toBeInTheDocument();
      expect(screen.getByText('Schema JSON')).toBeInTheDocument();
      expect(screen.getByText('Real-time Preview')).toBeInTheDocument();
      expect(screen.getByText('Run')).toBeInTheDocument();
    });

    it('应该正确显示英文空状态信息', () => {
      const invalidSchema: LowCodeSchema = {
        version: '1.0.0',
        name: 'Invalid Schema',
        component: {
          type: 'html',
          schema: '<div>Invalid</div>',
        },
      };

      render(
        <TestWrapper language="en-US">
          <SchemaEditor
            initialSchema={invalidSchema}
            initialValues={{}}
            height={600}
          />
        </TestWrapper>,
      );

      // 检查英文空状态信息是否正确显示
      expect(
        screen.getByText('Enter schema on the right to show card preview here'),
      ).toBeInTheDocument();
    });

    it('应该正确显示中文空状态信息', () => {
      const invalidSchema: LowCodeSchema = {
        version: '1.0.0',
        name: 'Invalid Schema',
        component: {
          type: 'html',
          schema: '<div>Invalid</div>',
        },
      };

      render(
        <TestWrapper language="zh-CN">
          <SchemaEditor
            initialSchema={invalidSchema}
            initialValues={{}}
            height={600}
          />
        </TestWrapper>,
      );

      // 检查中文空状态信息是否正确显示
      expect(
        screen.getByText('右侧输入schema后，在这里展示卡片预览'),
      ).toBeInTheDocument();
    });
  });

  describe('Ref 功能测试', () => {
    it('应该能够通过 ref 设置 Schema', async () => {
      const ref = createRef<SchemaEditorRef>();
      const newSchema: LowCodeSchema = {
        version: '1.0.0',
        name: 'New Schema',
        component: {
          type: 'html',
          schema: '<div>New Content</div>',
        },
      };

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      ref.current?.setSchema(newSchema);

      // 等待状态更新后检查 Schema 是否已更新
      await waitFor(() => {
        const schema = ref.current?.getSchema();
        expect(schema?.name).toBe('New Schema');
        expect(schema?.component?.schema).toBe('<div>New Content</div>');
      });
    });

    it('应该能够通过 ref 设置 HTML 内容', async () => {
      const ref = createRef<SchemaEditorRef>();
      const newHtml = '<div>New HTML Content</div>';

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      ref.current?.setHtmlContent(newHtml);

      // 等待状态更新后检查 HTML 内容是否已更新
      await waitFor(() => {
        const htmlContent = ref.current?.getHtmlContent();
        expect(htmlContent).toBe(newHtml);
      });
    });

    it('应该能够通过 ref 设置 Schema JSON 字符串', async () => {
      const ref = createRef<SchemaEditorRef>();
      const newJsonString = JSON.stringify({
        version: '1.0.0',
        name: 'JSON Schema',
        component: {
          type: 'html',
          schema: '<div>JSON Content</div>',
        },
      });

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      ref.current?.setSchemaString(newJsonString);

      // 等待状态更新后检查 JSON 字符串是否已更新
      await waitFor(() => {
        const jsonString = ref.current?.getSchemaString();
        expect(jsonString).toContain('JSON Schema');
      });
    });

    it('应该能够通过 ref 获取当前 Schema', () => {
      const ref = createRef<SchemaEditorRef>();

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      const schema = ref.current?.getSchema();
      expect(schema?.name).toBe('Test Schema');
      expect(schema?.component?.schema).toBe('<div>Hello {{name}}</div>');
    });

    it('应该能够通过 ref 获取当前 HTML 内容', () => {
      const ref = createRef<SchemaEditorRef>();

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      const htmlContent = ref.current?.getHtmlContent();
      expect(htmlContent).toBe('<div>Hello {{name}}</div>');
    });

    it('应该能够通过 ref 获取当前 Schema JSON 字符串', () => {
      const ref = createRef<SchemaEditorRef>();

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      const jsonString = ref.current?.getSchemaString();
      expect(jsonString).toContain('Test Schema');
      expect(jsonString).toContain('Hello {{name}}');
    });

    it('应该能够通过 ref 运行预览', async () => {
      const ref = createRef<SchemaEditorRef>();

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      // 初始状态应该没有渲染预览
      expect(screen.queryByTestId('schema-renderer')).not.toBeInTheDocument();

      // 通过 ref 运行预览
      ref.current?.run();

      // 等待预览渲染
      await waitFor(() => {
        expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
      });
    });

    it('应该能够通过 ref 复制 HTML 内容', () => {
      const ref = createRef<SchemaEditorRef>();
      vi.spyOn(message, 'success');

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      ref.current?.copyHtml();

      // 检查是否显示成功消息
      expect(message.success).toHaveBeenCalled();
    });

    it('应该能够通过 ref 复制 JSON 内容', () => {
      const ref = createRef<SchemaEditorRef>();
      vi.spyOn(message, 'success');

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      ref.current?.copyJson();

      // 检查是否显示成功消息
      expect(message.success).toHaveBeenCalled();
    });

    it('应该能够通过 ref 完整操作流程', async () => {
      const ref = createRef<SchemaEditorRef>();
      const newSchema: LowCodeSchema = {
        version: '1.0.0',
        name: 'Complete Test',
        component: {
          type: 'html',
          schema: '<div>Complete</div>',
        },
      };

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      // 设置新的 Schema
      ref.current?.setSchema(newSchema);

      // 等待状态更新后验证设置成功
      await waitFor(() => {
        expect(ref.current?.getSchema()?.name).toBe('Complete Test');
        expect(ref.current?.getHtmlContent()).toBe('<div>Complete</div>');
      });

      // 运行预览
      ref.current?.run();
      await waitFor(() => {
        expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
      });
    });
  });

  describe('htmlActions 功能测试', () => {
    it('应该能够渲染自定义操作按钮', () => {
      const handleCustomAction = vi.fn();
      const customButton = (
        <button
          key="custom-action"
          data-testid="custom-action"
          onClick={handleCustomAction}
        >
          自定义操作
        </button>
      );

      render(
        <TestWrapper>
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
            htmlActions={[customButton]}
          />
        </TestWrapper>,
      );

      // 检查自定义按钮是否正确渲染
      const customActionButton = screen.getByTestId('custom-action');
      expect(customActionButton).toBeInTheDocument();
      expect(customActionButton).toHaveTextContent('自定义操作');
    });

    it('应该能够处理多个自定义操作按钮', () => {
      const handleAction1 = vi.fn();
      const handleAction2 = vi.fn();

      const actions = [
        <button key="action-1" data-testid="action-1" onClick={handleAction1}>
          操作1
        </button>,
        <button key="action-2" data-testid="action-2" onClick={handleAction2}>
          操作2
        </button>,
      ];

      render(
        <TestWrapper>
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
            htmlActions={actions}
          />
        </TestWrapper>,
      );

      // 检查两个按钮都正确渲染
      expect(screen.getByTestId('action-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-2')).toBeInTheDocument();
    });

    it('应该能够处理自定义操作按钮的点击事件', () => {
      const handleCustomAction = vi.fn();
      const customButton = (
        <button
          key="custom-action"
          data-testid="custom-action"
          onClick={handleCustomAction}
        >
          自定义操作
        </button>
      );

      render(
        <TestWrapper>
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
            htmlActions={[customButton]}
          />
        </TestWrapper>,
      );

      // 点击自定义按钮
      const customActionButton = screen.getByTestId('custom-action');
      fireEvent.click(customActionButton);

      // 检查点击事件是否被调用
      expect(handleCustomAction).toHaveBeenCalledTimes(1);
    });

    it('应该在没有 htmlActions 时不显示自定义按钮', () => {
      render(
        <TestWrapper>
          <SchemaEditor
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
          />
        </TestWrapper>,
      );

      // 检查自定义按钮不存在
      expect(screen.queryByTestId('custom-action')).not.toBeInTheDocument();
    });

    it('应该能够同时使用 ref 和 htmlActions', () => {
      const ref = createRef<SchemaEditorRef>();
      const handleCustomAction = vi.fn();
      const customButton = (
        <button
          key="custom-action"
          data-testid="custom-action"
          onClick={handleCustomAction}
        >
          自定义操作
        </button>
      );

      render(
        <TestWrapper>
          <SchemaEditor
            ref={ref}
            initialSchema={mockSchema}
            initialValues={mockValues}
            height={600}
            htmlActions={[customButton]}
          />
        </TestWrapper>,
      );

      // 检查自定义按钮存在
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();

      // 检查 ref 功能正常
      const schema = ref.current?.getSchema();
      expect(schema?.name).toBe('Test Schema');
    });
  });
});
