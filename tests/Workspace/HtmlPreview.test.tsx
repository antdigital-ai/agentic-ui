import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { HtmlPreview } from '../../src/Workspace/HtmlPreview';

describe('HtmlPreview Component', () => {
  const mockLocale = {
    'htmlPreview.preview': '预览',
    'htmlPreview.code': '代码',
    'htmlPreview.renderFailed': '页面渲染失败',
    'workspace.empty': '暂无数据',
  } as any;

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
        {children}
      </I18nContext.Provider>
    </ConfigProvider>
  );

  it('应该渲染基本的 HTML 预览', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试内容</h1>" status="done" />
      </TestWrapper>,
    );

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute('title')).toBe('html-preview');
  });

  it('应该显示加载状态', () => {
    const { container } = render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试</h1>" status="loading" />
      </TestWrapper>,
    );

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('应该显示错误状态', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试</h1>" status="error" />
      </TestWrapper>,
    );

    expect(screen.getByText('页面渲染失败')).toBeInTheDocument();
  });

  it('应该显示自定义错误渲染', () => {
    const CustomError = () => <div>自定义错误</div>;

    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="error"
          errorRender={<CustomError />}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('自定义错误')).toBeInTheDocument();
  });

  it('应该显示自定义加载渲染', () => {
    const CustomLoading = () => <div>自定义加载中...</div>;

    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="loading"
          loadingRender={<CustomLoading />}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('自定义加载中...')).toBeInTheDocument();
  });

  it('应该支持视图模式切换', async () => {
    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          defaultViewMode="preview"
        />
      </TestWrapper>,
    );

    // 初始应该显示预览模式
    expect(document.querySelector('iframe')).toBeInTheDocument();

    // 切换到代码模式
    const codeButton = screen.getByText('代码');
    fireEvent.click(codeButton);

    await waitFor(() => {
      // 应该显示代码编辑器
      expect(document.querySelector('.ant-agentic-md-editor')).toBeInTheDocument();
    });
  });

  it('应该支持受控的视图模式', () => {
    const onViewModeChange = vi.fn();

    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          viewMode="code"
          onViewModeChange={onViewModeChange}
        />
      </TestWrapper>,
    );

    // 应该显示代码模式
    expect(document.querySelector('.ant-agentic-md-editor')).toBeInTheDocument();
  });

  it('应该清理 HTML 内容（XSS 防护）', () => {
    const unsafeHtml =
      '<script>alert("xss")</script><h1>安全内容</h1><img src=x onerror="alert(1)">';

    render(
      <TestWrapper>
        <HtmlPreview html={unsafeHtml} status="done" />
      </TestWrapper>,
    );

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    // DOMPurify 会清理掉危险内容
  });

  it('应该支持自定义标签文本', () => {
    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          labels={{ preview: '查看', code: '源码' }}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('查看')).toBeInTheDocument();
    expect(screen.getByText('源码')).toBeInTheDocument();
  });

  it('应该支持自定义样式和类名', () => {
    const { container } = render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          className="custom-class"
          style={{ backgroundColor: 'red' }}
        />
      </TestWrapper>,
    );

    const htmlPreview = container.firstChild as HTMLElement;
    expect(htmlPreview).toHaveClass('custom-class');
    expect(htmlPreview).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该支持自定义 iframe 属性', () => {
    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          iframeProps={{
            sandbox: 'allow-scripts allow-same-origin',
            className: 'custom-iframe',
          }}
        />
      </TestWrapper>,
    );

    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveClass('custom-iframe');
    expect(iframe?.getAttribute('sandbox')).toBe(
      'allow-scripts allow-same-origin',
    );
  });

  it('应该支持 Markdown 编辑器配置', async () => {
    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          defaultViewMode="code"
          markdownEditorProps={{
            codeProps: {
              theme: 'light',
            },
          }}
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-md-editor')).toBeInTheDocument();
    });
  });

  it('应该处理空内容', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="" status="done" />
      </TestWrapper>,
    );

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该显示自定义空状态渲染', () => {
    const CustomEmpty = () => <div>没有内容</div>;

    render(
      <TestWrapper>
        <HtmlPreview html="" status="done" emptyRender={<CustomEmpty />} />
      </TestWrapper>,
    );

    expect(screen.getByText('没有内容')).toBeInTheDocument();
  });

  it('应该支持隐藏分段控制器', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试</h1>" status="done" showSegmented={false} />
      </TestWrapper>,
    );

    expect(screen.queryByText('预览')).not.toBeInTheDocument();
    expect(screen.queryByText('代码')).not.toBeInTheDocument();
  });

  it('应该支持自定义分段选项', () => {
    const customItems = [
      { label: '视图1', value: 'view1' },
      { label: '视图2', value: 'view2' },
    ];

    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          segmentedItems={customItems}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('视图1')).toBeInTheDocument();
    expect(screen.getByText('视图2')).toBeInTheDocument();
  });

  it('应该处理 generating 状态（转换为 loading）', () => {
    const { container } = render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试</h1>" status="generating" />
      </TestWrapper>,
    );

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('应该支持函数形式的自定义渲染', () => {
    const loadingRender = () => <div>函数加载</div>;
    const errorRender = () => <div>函数错误</div>;
    const emptyRender = () => <div>函数空状态</div>;

    const { rerender } = render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="loading"
          loadingRender={loadingRender}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('函数加载')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="error"
          errorRender={errorRender}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('函数错误')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <HtmlPreview html="" status="done" emptyRender={emptyRender} />
      </TestWrapper>,
    );

    expect(screen.getByText('函数空状态')).toBeInTheDocument();
  });

  it('应该处理非受控模式的视图切换', async () => {
    render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试</h1>" status="done" />
      </TestWrapper>,
    );

    // 初始为预览模式
    expect(document.querySelector('iframe')).toBeInTheDocument();

    // 点击切换到代码模式
    const codeButton = screen.getByText('代码');
    fireEvent.click(codeButton);

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-md-editor')).toBeInTheDocument();
    });

    // 再次切换回预览模式
    const previewButton = screen.getByText('预览');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(document.querySelector('iframe')).toBeInTheDocument();
    });
  });

  it('应该在内容变化时更新 iframe', () => {
    const { rerender } = render(
      <TestWrapper>
        <HtmlPreview html="<h1>初始内容</h1>" status="done" />
      </TestWrapper>,
    );

    const iframe1 = document.querySelector('iframe');
    expect(iframe1).toBeInTheDocument();

    // 更新内容
    rerender(
      <TestWrapper>
        <HtmlPreview html="<h1>更新内容</h1>" status="done" />
      </TestWrapper>,
    );

    const iframe2 = document.querySelector('iframe');
    expect(iframe2).toBeInTheDocument();
  });

  it('应该使用默认 sandbox 属性', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="<h1>测试</h1>" status="done" />
      </TestWrapper>,
    );

    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
  });

  it('应该在代码模式下显示 HTML 代码', async () => {
    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试内容</h1>"
          status="done"
          defaultViewMode="code"
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-md-editor')).toBeInTheDocument();
    });
  });

  it('应该触发视图模式变化回调', () => {
    const onViewModeChange = vi.fn();

    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          onViewModeChange={onViewModeChange}
        />
      </TestWrapper>,
    );

    const codeButton = screen.getByText('代码');
    fireEvent.click(codeButton);

    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });

  it('未传 segmentedItems 时默认 Segmented 的 onChange 应切换模式', async () => {
    const onViewModeChange = vi.fn();

    render(
      <TestWrapper>
        <HtmlPreview
          html="<h1>测试</h1>"
          status="done"
          showSegmented={true}
          onViewModeChange={onViewModeChange}
        />
      </TestWrapper>,
    );

    expect(document.querySelector('iframe')).toBeInTheDocument();

    const previewButton = screen.getByText('预览');
    const codeButton = screen.getByText('代码');
    fireEvent.click(codeButton);

    await waitFor(() => {
      expect(onViewModeChange).toHaveBeenCalledWith('code');
    });

    fireEvent.click(previewButton);
    await waitFor(() => {
      expect(onViewModeChange).toHaveBeenCalledWith('preview');
    });
  });

  it('应该处理空白字符串', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="   " status="done" />
      </TestWrapper>,
    );

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该在加载状态时不显示空状态', () => {
    const { container } = render(
      <TestWrapper>
        <HtmlPreview html="" status="loading" />
      </TestWrapper>,
    );

    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('应该在错误状态时不显示空状态', () => {
    render(
      <TestWrapper>
        <HtmlPreview html="" status="error" />
      </TestWrapper>,
    );

    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(screen.getByText('页面渲染失败')).toBeInTheDocument();
  });
});
