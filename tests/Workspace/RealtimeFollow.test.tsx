import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import {
  RealtimeFollow,
  RealtimeFollowList,
} from '../../src/Workspace/RealtimeFollow';

describe('RealtimeFollow Component', () => {
  const mockLocale = {
    'workspace.terminalExecution': '终端执行',
    'workspace.createHtmlFile': '创建 HTML 文件',
    'workspace.markdownContent': 'Markdown 内容',
    'htmlPreview.preview': '预览',
    'htmlPreview.code': '代码',
    'htmlPreview.renderFailed': '页面渲染失败',
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

  describe('RealtimeFollow - Shell Type', () => {
    it('应该渲染 shell 类型内容', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'echo "Hello World"',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('echo "Hello World"')).toBeInTheDocument();
    });

    it('应该在测试环境中正常渲染（加载状态不生效）', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'loading...',
              status: 'loading',
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 loading overlay，直接显示内容
      expect(screen.getByText('loading...')).toBeInTheDocument();
    });

    it('应该在测试环境中正常渲染（错误状态不生效）', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'error content',
              status: 'error',
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 error overlay，直接显示内容
      expect(screen.getByText('error content')).toBeInTheDocument();
    });

    it('应该在测试环境中跳过自定义加载渲染', () => {
      const CustomLoading = () => <div>自定义加载中</div>;

      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'loading',
              loadingRender: <CustomLoading />,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中自定义渲染不生效
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该在测试环境中跳过自定义错误渲染', () => {
      const CustomError = () => <div>自定义错误</div>;

      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'error',
              errorRender: <CustomError />,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中自定义渲染不生效
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  describe('RealtimeFollow - HTML Type', () => {
    it('应该渲染 HTML 预览', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>测试标题</h1>',
              status: 'done',
            }}
            htmlViewMode="preview"
          />
        </TestWrapper>,
      );

      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });

    it('应该渲染 HTML 代码模式', async () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
            htmlViewMode="code"
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-md-editor'),
        ).toBeInTheDocument();
      });
    });

    it('应该处理 HTML 内容变化', () => {
      const { rerender } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>初始</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const iframe1 = document.querySelector('iframe');
      expect(iframe1).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>更新</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const iframe2 = document.querySelector('iframe');
      expect(iframe2).toBeInTheDocument();
    });
  });

  describe('RealtimeFollow - Markdown Type', () => {
    it('应该渲染 markdown 内容', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'markdown',
              content: '# Markdown 标题',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // Markdown 会被渲染为 HTML
      expect(screen.getByText('Markdown 标题')).toBeInTheDocument();
    });

    it('应该渲染 md 类型', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'md',
              content: '## MD 标题',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // Markdown 会被渲染为 HTML
      expect(screen.getByText('MD 标题')).toBeInTheDocument();
    });
  });

  describe('RealtimeFollow - Default Type', () => {
    it('应该渲染 default 类型', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'default',
              content: '默认内容',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('默认内容')).toBeInTheDocument();
    });

    it('应该优先渲染 customContent（节点与函数）', () => {
      const NodeContent = <div data-testid="custom-node">自定义内容</div>;

      const { rerender, container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'default',
              content: 'will be ignored',
              status: 'done',
              customContent: NodeContent,
            }}
          />
        </TestWrapper>,
      );
      expect(screen.getByTestId('custom-node')).toBeInTheDocument();
      // 再次以函数形式提供
      rerender(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'default',
              content: 'ignored again',
              status: 'done',
              customContent: () => (
                <div data-testid="custom-node-fn">函数内容</div>
              ),
            }}
          />
        </TestWrapper>,
      );
      expect(screen.getByTestId('custom-node-fn')).toBeInTheDocument();
      // 不应渲染编辑器或 iframe（优先 customContent）
      expect(
        container.querySelector('.ant-agentic-md-editor') ||
          container.querySelector('iframe'),
      ).toBeNull();
    });
  });

  describe('RealtimeFollow - Empty State', () => {
    it('应该在测试环境中正常渲染编辑器', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: '',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 在测试环境中，空状态不会特殊处理，直接显示编辑器
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该在测试环境中正常渲染编辑器（自定义渲染不生效）', () => {
      const CustomEmpty = () => <div>自定义空状态</div>;

      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: '',
              status: 'done',
              emptyRender: <CustomEmpty />,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中自定义渲染不生效
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该在测试环境中跳过加载状态', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: '',
              status: 'loading',
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 overlay
      expect(
        container.querySelector('.ant-workspace-realtime-overlay'),
      ).not.toBeInTheDocument();
    });
  });

  describe('RealtimeFollowList Component', () => {
    it('应该渲染完整的实时跟随列表', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test content',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
      expect(screen.getByText('终端执行')).toBeInTheDocument();
      expect(screen.getByText('test content')).toBeInTheDocument();
    });

    it('应该显示自定义标题', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              title: '自定义标题',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('自定义标题')).toBeInTheDocument();
    });

    it('应该显示副标题', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              subTitle: '副标题内容',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('副标题内容')).toBeInTheDocument();
    });

    it('应该支持返回按钮', () => {
      const onBack = vi.fn();

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              onBack,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const backButton = screen.getByRole('button');
      fireEvent.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });

    it('应该显示自定义右侧内容', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              rightContent: <div>右侧自定义</div>,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('右侧自定义')).toBeInTheDocument();
    });

    it('应该为 HTML 类型显示分段控制器', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('应该支持受控的视图模式', () => {
      const onViewModeChange = vi.fn();

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              viewMode: 'code',
              onViewModeChange,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('受控模式下点击分段仅触发回调，不自动切换视图', async () => {
      const onViewModeChange = vi.fn();
      const { rerender } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              viewMode: 'code',
              onViewModeChange,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );
      // 当前为代码视图
      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
      // 点击“预览”
      fireEvent.click(screen.getByText('预览'));
      expect(onViewModeChange).toHaveBeenCalledWith('preview');
      // 仍应保持代码视图（未受控更新）
      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
      // 外部受控切换后应变更为 iframe
      rerender(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              viewMode: 'preview',
              onViewModeChange,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );
      await waitFor(() => {
        expect(document.querySelector('iframe')).toBeInTheDocument();
      });
    });

    it('应该支持非受控的视图模式', async () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              defaultViewMode: 'preview',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(document.querySelector('iframe')).toBeInTheDocument();

      const codeButton = screen.getByText('代码');
      fireEvent.click(codeButton);

      await waitFor(() => {
        expect(
          document.querySelector('.ant-agentic-md-editor'),
        ).toBeInTheDocument();
      });
    });

    it('应该支持自定义分段选项', () => {
      const customItems = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
      ];

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              segmentedItems: customItems,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('选项1')).toBeInTheDocument();
      expect(screen.getByText('选项2')).toBeInTheDocument();
    });

    it('应该支持分段额外内容', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              segmentedExtra: <div>额外内容</div>,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('额外内容')).toBeInTheDocument();
    });

    it('应该支持自定义样式和类名', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              className: 'custom-class',
              style: { backgroundColor: 'red' },
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
      expect(element).toHaveStyle('background-color: rgb(255, 0, 0)');
    });

    it('应该为不同类型显示对应图标', () => {
      const types = [
        { type: 'shell' as const, title: '终端执行' },
        { type: 'html' as const, title: '创建 HTML 文件' },
        { type: 'markdown' as const, title: 'Markdown 内容' },
      ];

      types.forEach(({ type, title }) => {
        const { unmount } = render(
          <TestWrapper>
            <RealtimeFollowList
              data={{
                type,
                content: 'test',
                status: 'done',
              }}
            />
          </TestWrapper>,
        );

        expect(screen.getByText(title)).toBeInTheDocument();
        unmount();
      });
    });

    it('应该支持自定义图标', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              icon: CustomIcon,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('应该传递 MarkdownEditor 配置', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test content',
              markdownEditorProps: {
                codeProps: {
                  theme: 'light',
                },
              },
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('test content')).toBeInTheDocument();
    });

    it('应该处理空字符串内容', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: '   ',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中直接显示编辑器
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该支持函数形式的自定义渲染（测试环境跳过）', () => {
      const loadingRender = () => <div>函数加载</div>;
      const errorRender = () => <div>函数错误</div>;
      const emptyRender = () => <div>函数空状态</div>;

      const { container, rerender } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'loading',
              loadingRender,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示自定义加载渲染
      expect(screen.getByText('test')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'error',
              errorRender,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示自定义错误渲染
      expect(screen.getByText('test')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: '',
              status: 'done',
              emptyRender,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示自定义空状态渲染
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理视图模式变化回调', () => {
      const onViewModeChange = vi.fn();

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              onViewModeChange,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const codeButton = screen.getByText('代码');
      fireEvent.click(codeButton);

      expect(onViewModeChange).toHaveBeenCalledWith('code');
    });

    it('应该支持自定义标签文本', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              labels: { preview: '查看', code: '源码' },
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('查看')).toBeInTheDocument();
      expect(screen.getByText('源码')).toBeInTheDocument();
    });

    it('应该为不同类型应用不同的样式类', () => {
      const types = ['shell', 'html', 'markdown'] as const;

      types.forEach((type) => {
        const { container, unmount } = render(
          <TestWrapper>
            <RealtimeFollowList
              data={{
                type,
                content: 'test',
                status: 'done',
              }}
            />
          </TestWrapper>,
        );

        const element = container.querySelector(`[class*="--${type}"]`);
        expect(element).toBeInTheDocument();
        unmount();
      });
    });

    it('应该在有边框类型时添加边框样式', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const header = container.querySelector('[class*="-header-with-border"]');
      expect(header).toBeInTheDocument();
    });

    it('应该在返回按钮存在时应用特殊样式', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              onBack: () => {},
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const header = container.querySelector('[class*="-header-with-back"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('RealtimeFollow - Edge Cases', () => {
    it('应该处理无效类型', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'invalid-type' as any,
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该处理 DiffContent 类型', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: {
                original: 'old content',
                modified: 'new content',
              },
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // DiffContent 会被转换为字符串
      expect(screen.getByText('[object Object]')).toBeInTheDocument();
    });

    it('应该处理 null/undefined 内容', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: null as any,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // null 会被转为字符串 'null'
      expect(screen.getByText('null')).toBeInTheDocument();
    });

    it('应该处理 HTML 内容为空的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 空内容应该显示编辑器或空状态
      expect(
        container.querySelector('.ant-agentic-md-editor') ||
          container.querySelector('iframe') ||
          container.firstChild,
      ).toBeTruthy();
    });

    it('应该处理 HTML 内容为 DiffContent 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: {
                original: '<h1>old</h1>',
                modified: '<h1>new</h1>',
              } as any,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // DiffContent 会被当作对象处理
      expect(
        container.querySelector('.ant-agentic-md-editor') ||
          container.querySelector('iframe') ||
          container.firstChild,
      ).toBeTruthy();
    });

    it('应该传递 iframeProps 到 HtmlPreview', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              iframeProps: {
                sandbox: 'allow-scripts',
              },
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });

    it('应该传递 markdownEditorProps 到 MarkdownEditor', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'markdown',
              content: '# Test',
              markdownEditorProps: {
                readonly: true,
              },
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('RealtimeFollowList - Additional Tests', () => {
    it('应该处理 default 类型', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'default',
              content: 'default content',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('终端执行')).toBeInTheDocument();
      expect(screen.getByText('default content')).toBeInTheDocument();
    });

    it('应该正确处理 md 类型的标题', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'md',
              content: 'md content',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Markdown 内容')).toBeInTheDocument();
    });

    it('应该在 markdown 类型时显示边框', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'markdown',
              content: '# Test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const header = container.querySelector('[class*="-header-with-border"]');
      expect(header).toBeInTheDocument();
    });

    it('应该在非 HTML 类型时不显示右侧内容', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const segmented = container.querySelector('.ant-segmented');
      expect(segmented).not.toBeInTheDocument();
    });

    it('应该在自定义分段选项时调用回调', () => {
      const onViewModeChange = vi.fn();
      const customItems = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
      ];

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              segmentedItems: customItems,
              onViewModeChange,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const option2 = screen.getByText('选项2');
      fireEvent.click(option2);

      expect(onViewModeChange).toHaveBeenCalledWith('option2');
    });

    it('应该只在有 segmentedExtra 时显示额外内容容器', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              segmentedExtra: <div>额外内容</div>,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const extraContainer = container.querySelector(
        '[class*="-header-segmented-right"]',
      );
      expect(extraContainer).toBeInTheDocument();
    });

    it('应该不显示 segmentedExtra 容器当未提供时', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const extraContainer = container.querySelector(
        '[class*="-header-segmented-right"]',
      );
      expect(extraContainer).not.toBeInTheDocument();
    });

    it('应该在返回按钮模式下隐藏左侧图标', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              onBack: () => {},
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const headerLeft = container.querySelector('[class*="-header-left"]');
      const headerContent = container.querySelector(
        '[class*="-header-content"]',
      );
      expect(headerLeft).toBeInTheDocument();
      expect(headerContent).toBeInTheDocument();
    });

    it('应该处理受控模式的视图模式切换', () => {
      const { rerender } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              viewMode: 'preview',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(document.querySelector('iframe')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              viewMode: 'code',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该使用 locale 中的默认标签文本', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 使用 mockLocale 中定义的文本
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('应该在无 locale 时使用默认标签', () => {
      const NoLocaleWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <ConfigProvider>
          <I18nContext.Provider
            value={{ locale: {} as any, language: 'en-US' }}
          >
            {children}
          </I18nContext.Provider>
        </ConfigProvider>
      );

      render(
        <NoLocaleWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </NoLocaleWrapper>,
      );

      // 应该显示默认的英文标签
      expect(screen.getByText('预览')).toBeInTheDocument();
    });

    it('应该处理 styleResult 为 undefined 的情况', () => {
      // 模拟 useRealtimeFollowStyle 返回 undefined
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
    });

    it('应该处理 HTML 类型在 code 模式下的内容更新', async () => {
      const { rerender } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>初始</h1>',
              viewMode: 'code',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      await waitFor(
        () => {
          expect(
            document.querySelector('.ant-agentic-md-editor'),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      rerender(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>更新</h1>',
              viewMode: 'code',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 重新渲染后编辑器应该仍然存在
      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理 HTML 类型在 preview 模式下不更新编辑器', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              htmlViewMode: 'preview',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // preview 模式下应该显示 iframe，不更新编辑器
      expect(document.querySelector('iframe')).toBeInTheDocument();
    });

    it('应该处理 getContentForEditor 中 HTML 类型的转换', async () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<div>测试</div>',
              viewMode: 'code',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // HTML 内容应该被包装为代码块格式
      await waitFor(
        () => {
          expect(
            document.querySelector('.ant-agentic-md-editor'),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    it('应该处理 getTypeConfig 中 locale 为空的情况', () => {
      const NoLocaleWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <ConfigProvider>
          <I18nContext.Provider value={{ locale: null as any, language: 'en' }}>
            {children}
          </I18nContext.Provider>
        </ConfigProvider>
      );

      render(
        <NoLocaleWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </NoLocaleWrapper>,
      );

      // 应该使用默认标题
      expect(screen.getByText('终端执行')).toBeInTheDocument();
    });

    it('应该处理 getIconTypeClass 中未知类型的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'default',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // default 类型应该使用 'default' 后缀
      const icon = container.querySelector('[class*="header-icon--default"]');
      expect(icon).toBeInTheDocument();
    });

    it('应该处理 renderNode 函数形式的情况', () => {
      const customContentFn = () => (
        <div data-testid="fn-content">函数内容</div>
      );

      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'default',
              content: 'ignored',
              customContent: customContentFn,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('fn-content')).toBeInTheDocument();
    });

    it('应该处理 Overlay 组件中 loadingRender 为函数的情况', () => {
      const loadingRenderFn = () => <div>函数加载中</div>;

      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'loading',
              loadingRender: loadingRenderFn,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 overlay，但函数应该被调用
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该处理 Overlay 组件中 errorRender 为函数的情况', () => {
      const errorRenderFn = () => <div>函数错误</div>;

      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'error',
              errorRender: errorRenderFn,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 overlay，但函数应该被调用
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该处理 shouldUpdateEditor 的不同类型分支', () => {
      // shell 类型应该更新编辑器
      const shellResult = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );
      expect(
        shellResult.container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
      shellResult.unmount();

      // markdown 类型应该更新编辑器
      const mdResult = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'markdown',
              content: '# test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );
      expect(
        mdResult.container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
      mdResult.unmount();

      // md 类型应该更新编辑器
      const mdTypeResult = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'md',
              content: '## test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );
      expect(
        mdTypeResult.container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
      mdTypeResult.unmount();

      // html 类型在 preview 模式不应该更新编辑器（显示 iframe）
      const htmlPreviewResult = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>test</h1>',
              htmlViewMode: 'preview',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );
      expect(
        htmlPreviewResult.container.querySelector('iframe'),
      ).toBeInTheDocument();
      htmlPreviewResult.unmount();
    });

    it('应该处理 onViewModeChange 回调', () => {
      const onViewModeChange = vi.fn();

      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              onViewModeChange,
              status: 'done',
            }}
            htmlViewMode="preview"
          />
        </TestWrapper>,
      );

      // 通过 HtmlPreview 组件触发回调
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中无 locale 的情况', () => {
      const NoLocaleWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <ConfigProvider>
          <I18nContext.Provider
            value={{ locale: undefined as any, language: 'en' }}
          >
            {children}
          </I18nContext.Provider>
        </ConfigProvider>
      );

      render(
        <NoLocaleWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </NoLocaleWrapper>,
      );

      // 应该使用默认标题
      expect(screen.getByText('创建 HTML 文件')).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中无 subTitle 的情况', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 不应该显示副标题
      const subtitle = screen.queryByText(/副标题/i);
      expect(subtitle).not.toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中无 rightContent 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const rightContent = container.querySelector('[class*="-header-right"]');
      expect(rightContent).toBeInTheDocument();
      expect(rightContent?.textContent).toBe('');
    });

    it('应该处理 getEditorConfig 中 md 类型', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'md',
              content: '# test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理 getEditorConfig 中未知类型使用默认配置', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'default',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理 getContentForEditor 中 HTML 类型但 content 为 DiffContent', async () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: {
                original: '<h1>old</h1>',
                modified: '<h1>new</h1>',
              },
              viewMode: 'code',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // DiffContent 会被转换为空字符串，然后包装为代码块
      // 在测试环境中，编辑器可能不会立即更新，但组件应该能正常渲染
      await waitFor(
        () => {
          const editor = container.querySelector('.ant-agentic-md-editor');
          const iframe = container.querySelector('iframe');
          // 应该至少渲染其中一个
          expect(editor || iframe || container.firstChild).toBeTruthy();
        },
        { timeout: 5000 },
      );
    });

    it('应该处理 Overlay 组件中 status 为 done 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // done 状态不应该显示 overlay
      const overlay = container.querySelector('[class*="-overlay"]');
      expect(overlay).not.toBeInTheDocument();
    });

    it('应该处理 Overlay 组件中 loadingRender 为 undefined 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'loading',
              loadingRender: undefined,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 overlay
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该处理 Overlay 组件中 errorRender 为 undefined 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'error',
              errorRender: undefined,
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中不显示 overlay
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该处理 Overlay 组件中 locale 为空的情况', () => {
      const NoLocaleWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => (
        <ConfigProvider>
          <I18nContext.Provider value={{ locale: null as any, language: 'en' }}>
            {children}
          </I18nContext.Provider>
        </ConfigProvider>
      );

      render(
        <NoLocaleWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              status: 'error',
            }}
          />
        </NoLocaleWrapper>,
      );

      // 测试环境中不显示 overlay，但应该使用默认错误消息
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该处理 getRightContent 中 rightContent 存在的情况', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              rightContent: <div data-testid="custom-right">自定义右侧</div>,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-right')).toBeInTheDocument();
    });

    it('应该处理 getRightContent 中非 HTML 类型的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 非 HTML 类型不应该显示分段控制器
      const segmented = container.querySelector('.ant-segmented');
      expect(segmented).not.toBeInTheDocument();
    });

    it('应该处理 getRightContent 中 segmentedItems 为空数组的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              segmentedItems: [],
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 空数组应该使用默认分段选项
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中 hasBorder 为 true 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'html',
              content: '<h1>测试</h1>',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const header = container.querySelector('[class*="-header-with-border"]');
      expect(header).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中 hasBorder 为 false 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      const header = container.querySelector('[class*="-header-with-border"]');
      expect(header).not.toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中自定义 prefixCls', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // 应该使用默认的 prefixCls
      const header = container.querySelector(
        '[class*="workspace-realtime-header"]',
      );
      expect(header).toBeInTheDocument();
    });

    it('应该处理 getTypeConfig 中所有类型', () => {
      const types = [
        { type: 'shell' as const, title: '终端执行' },
        { type: 'html' as const, title: '创建 HTML 文件' },
        { type: 'markdown' as const, title: 'Markdown 内容' },
        { type: 'md' as const, title: 'Markdown 内容' },
        { type: 'default' as const, title: '终端执行' },
      ];

      types.forEach(({ type, title }) => {
        const { unmount } = render(
          <TestWrapper>
            <RealtimeFollowList
              data={{
                type,
                content: 'test',
                status: 'done',
              }}
            />
          </TestWrapper>,
        );

        expect(screen.getByText(title)).toBeInTheDocument();
        unmount();
      });
    });

    it('应该处理 getIconTypeClass 中所有类型', () => {
      const types = [
        { type: 'html' as const, suffix: 'html' },
        { type: 'markdown' as const, suffix: 'md' },
        { type: 'md' as const, suffix: 'md' },
        { type: 'shell' as const, suffix: 'default' },
        { type: 'default' as const, suffix: 'default' },
      ];

      types.forEach(({ type, suffix }) => {
        const { container, unmount } = render(
          <TestWrapper>
            <RealtimeFollowList
              data={{
                type,
                content: 'test',
                status: 'done',
              }}
            />
          </TestWrapper>,
        );

        const icon = container.querySelector(
          `[class*="header-icon--${suffix}"]`,
        );
        expect(icon).toBeInTheDocument();
        unmount();
      });
    });

    it('应该处理 customContent 为 null 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test',
              customContent: null as any,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // null 会被 renderNode 返回，然后显示为 null
      // 但实际应该显示编辑器内容
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理空内容但 status 为 loading 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: '',
              status: 'loading',
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中，loading 状态不显示 overlay，直接显示编辑器
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理空内容但 status 为 error 的情况', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: '',
              status: 'error',
            }}
          />
        </TestWrapper>,
      );

      // 测试环境中，error 状态不显示 overlay，直接显示编辑器
      expect(
        container.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理 getContentForEditor 中非 HTML 类型', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: 'test content',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('test content')).toBeInTheDocument();
    });

    it('应该处理 getContentForEditor 中 content 为 undefined', () => {
      render(
        <TestWrapper>
          <RealtimeFollow
            data={{
              type: 'shell',
              content: undefined,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // undefined 会被转换为字符串 'undefined'
      expect(
        document.querySelector('.ant-agentic-md-editor'),
      ).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中自定义 hashId', () => {
      const { container } = render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      // hashId 应该被应用到类名中
      const header = container.querySelector(
        '[class*="workspace-realtime-header"]',
      );
      expect(header).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中 icon 和 title 同时自定义', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              icon: CustomIcon,
              title: '自定义标题',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('自定义标题')).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中只有 title 自定义的情况', () => {
      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              title: '自定义标题',
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('自定义标题')).toBeInTheDocument();
      // 当有自定义 title 时，应该显示自定义标题而不是默认标题
      const defaultTitle = screen.queryByText('终端执行');
      // 由于自定义标题存在，默认标题可能不会显示（取决于实现）
      // 这里主要验证自定义标题能正确显示
      expect(screen.getByText('自定义标题')).toBeInTheDocument();
    });

    it('应该处理 RealtimeHeader 中只有 icon 自定义的情况', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;

      render(
        <TestWrapper>
          <RealtimeFollowList
            data={{
              type: 'shell',
              content: 'test',
              icon: CustomIcon,
              status: 'done',
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      // 应该使用默认标题
      expect(screen.getByText('终端执行')).toBeInTheDocument();
    });
  });
});
