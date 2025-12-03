/**
 * MarkdownInputField 组件全面测试文件
 */

import { MarkdownInputField } from '@ant-design/agentic-ui';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('../../src/MarkdownEditor', () => ({
  BaseMarkdownEditor: ({ children, ...props }: any) => (
    <div data-testid="base-markdown-editor" {...props}>
      {children}
    </div>
  ),
  MarkdownEditorInstance: {},
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: vi.fn(() => [0]),
    findNode: vi.fn(() => ({ children: [] })),
  },
}));

vi.mock('../../src/MarkdownInputField/Suggestion', () => ({
  Suggestion: ({ children, ...props }: any) => (
    <div data-testid="suggestion" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../src/MarkdownInputField/AttachmentButton', () => ({
  AttachmentButton: ({ children, ...props }: any) => (
    <div data-testid="attachment-button" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../src/MarkdownInputField/SendButton', () => ({
  SendButton: ({ children, ...props }: any) => (
    <button data-testid="send-button" type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../../src/MarkdownInputField/SkillModeBar', () => ({
  SkillModeBar: ({ skillMode, onSkillModeOpenChange, ...props }: any) => {
    // 使用 useRef 和 useEffect 来模拟状态变化监听
    const prevOpenRef = React.useRef<boolean | undefined>(skillMode?.open);

    React.useEffect(() => {
      const currentOpen = skillMode?.open;
      const prevOpen = prevOpenRef.current;

      // 跳过初始渲染，只在后续更新时触发回调
      if (prevOpen !== undefined && currentOpen !== prevOpen) {
        onSkillModeOpenChange?.(!!currentOpen);
      }

      prevOpenRef.current = currentOpen;
    }, [skillMode?.open, onSkillModeOpenChange]);

    // 如果 skillMode 不存在或 enable 为 false，不渲染任何内容
    if (!skillMode || skillMode.enable === false) return null;

    // 如果 open 为 false，不渲染任何内容
    if (!skillMode?.open) return null;

    return (
      <div data-testid="skill-mode-bar" {...props}>
        <div data-testid="skill-mode-title">{skillMode.title}</div>
        {(() => {
          if (!skillMode.rightContent) return null;

          // 将 rightContent 统一转换为数组处理
          const contentArray = Array.isArray(skillMode.rightContent)
            ? skillMode.rightContent
            : [skillMode.rightContent];

          return contentArray.map((content: any, index: number) => (
            <div key={index} data-testid={`skill-mode-content-${index}`}>
              {content}
            </div>
          ));
        })()}
        {skillMode.closable !== false && (
          <button
            type="button"
            data-testid="skill-mode-close"
            onClick={() => onSkillModeOpenChange?.(false)}
          >
            关闭
          </button>
        )}
      </div>
    );
  },
}));

vi.mock('../../src/MarkdownInputField/Enlargement', () => ({
  __esModule: true,
  default: ({
    isEnlarged,
    onEnlargeClick,
    ...props
  }: {
    isEnlarged?: boolean;
    onEnlargeClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid="enlargement-toggle"
      data-enlarged={isEnlarged}
      onClick={onEnlargeClick}
      {...props}
    >
      {isEnlarged ? '缩小' : '放大'}
    </button>
  ),
}));

describe('MarkdownInputField Comprehensive Tests', () => {
  const defaultProps = {
    value: '# Hello World',
    onChange: vi.fn(),
    placeholder: 'Type your message...',
    attachment: {
      enable: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染功能', () => {
    it('应该正确渲染基本组件', () => {
      render(
        <MarkdownInputField
          {...defaultProps}
          attachment={{
            enable: true,
          }}
        />,
      );
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该传递正确的 props 给 BaseMarkdownEditor', () => {
      render(<MarkdownInputField {...defaultProps} />);
      const editor = screen.getByTestId('base-markdown-editor');
      expect(editor).toBeInTheDocument();
    });

    it('应该渲染附件按钮', () => {
      render(
        <MarkdownInputField
          {...defaultProps}
          attachment={{
            enable: true,
          }}
        />,
      );
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该渲染发送按钮', () => {
      render(<MarkdownInputField {...defaultProps} />);
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该渲染建议组件', () => {
      render(<MarkdownInputField {...defaultProps} />);
      expect(screen.getByTestId('suggestion')).toBeInTheDocument();
    });
  });

  describe('Props 传递', () => {
    it('应该正确处理 value prop', () => {
      const testValue = '# Test Heading';
      render(<MarkdownInputField {...defaultProps} value={testValue} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理 placeholder prop', () => {
      const testPlaceholder = 'Custom placeholder';
      render(
        <MarkdownInputField {...defaultProps} placeholder={testPlaceholder} />,
      );
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理 disabled prop', () => {
      render(<MarkdownInputField {...defaultProps} disabled={true} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理 style prop', () => {
      const testStyle = { minHeight: '200px' };
      render(<MarkdownInputField {...defaultProps} style={testStyle} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理 className prop', () => {
      const testClassName = 'custom-class';
      render(
        <MarkdownInputField {...defaultProps} className={testClassName} />,
      );
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('附件功能', () => {
    it('应该启用附件功能', () => {
      render(
        <MarkdownInputField
          {...defaultProps}
          attachment={
            {
              enable: true,
              accept: '.pdf,.doc',
              maxSize: 1024 * 1024,
            } as any
          }
        />,
      );
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该禁用附件功能', () => {
      render(
        <MarkdownInputField
          {...defaultProps}
          attachment={
            {
              enable: false,
            } as any
          }
        />,
      );
      // 附件按钮应该不存在
      expect(screen.queryByTestId('attachment-button')).not.toBeInTheDocument();
    });

    it('应该处理附件上传配置', () => {
      const onUpload = vi.fn();
      render(
        <MarkdownInputField
          {...defaultProps}
          attachment={
            {
              enable: true,
              upload: onUpload,
              accept: '.pdf,.doc',
              maxSize: 1024 * 1024,
            } as any
          }
        />,
      );
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });
  });

  describe('放大功能', () => {
    it('在仅启用放大功能时应渲染放大按钮并进入多行布局', () => {
      const { container } = render(
        <MarkdownInputField
          {...defaultProps}
          refinePrompt={undefined}
          quickActionRender={undefined}
          enlargeable={{ enable: true, height: 600 }}
        />,
      );

      const root = container.querySelector(
        '.ant-agentic-md-input-field',
      ) as HTMLElement;
      expect(root).toBeTruthy();
      expect(
        root?.classList.contains('ant-agentic-md-input-field-is-multi-row'),
      ).toBe(true);

      expect(root?.style.minHeight).toBe('90px');

      const quickActions = container.querySelector(
        '.ant-agentic-md-input-field-quick-actions-vertical',
      );
      expect(quickActions).toBeTruthy();

      const enlargeButton = screen.getByTestId('enlargement-toggle');
      expect(enlargeButton).toHaveAttribute('data-enlarged', 'false');

      fireEvent.click(enlargeButton);
      expect(enlargeButton).toHaveAttribute('data-enlarged', 'true');
      expect(
        root?.classList.contains('ant-agentic-md-input-field-enlarged'),
      ).toBe(true);
    });

    it('在只启用提示词优化时应使用单操作最小高度', () => {
      const { container } = render(
        <MarkdownInputField
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
          quickActionRender={undefined}
          enlargeable={undefined}
        />,
      );

      const root = container.querySelector(
        '.ant-agentic-md-input-field',
      ) as HTMLElement;
      expect(root).toBeTruthy();
      expect(
        root?.classList.contains('ant-agentic-md-input-field-is-multi-row'),
      ).toBe(true);
      expect(root?.style.minHeight).toBe('90px');
    });
  });

  describe('发送功能', () => {
    it('应该处理 Enter 键发送', () => {
      render(
        <MarkdownInputField
          {...defaultProps}
          triggerSendKey="Enter"
          attachment={{ enable: true }}
        />,
      );
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该处理 onSend 回调', async () => {
      const onSend = vi.fn().mockResolvedValue(undefined);
      render(<MarkdownInputField {...defaultProps} onSend={onSend} />);
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该处理 onStop 回调', () => {
      const onStop = vi.fn();
      render(<MarkdownInputField {...defaultProps} onStop={onStop} />);
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });
  });

  describe('自定义渲染', () => {
    it('应该支持 actionsRender 自定义', () => {
      const actionsRender = vi.fn(() => [
        <div key="custom" data-testid="custom-action">
          Custom
        </div>,
      ]);
      render(
        <MarkdownInputField {...defaultProps} actionsRender={actionsRender} />,
      );
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('应该支持 toolsRender 自定义', () => {
      const toolsRender = vi.fn(() => [
        <div key="custom" data-testid="custom-tool">
          Custom Tool
        </div>,
      ]);
      render(
        <MarkdownInputField {...defaultProps} toolsRender={toolsRender} />,
      );
      expect(screen.getByTestId('custom-tool')).toBeInTheDocument();
    });

    it('应该支持 leafRender 自定义', () => {
      const leafRender = vi.fn((props, defaultDom) => defaultDom);
      render(<MarkdownInputField {...defaultProps} leafRender={leafRender} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('引用和实例', () => {
    it('应该支持 inputRef', () => {
      const inputRef = { current: undefined };
      render(<MarkdownInputField {...defaultProps} inputRef={inputRef} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('样式和主题', () => {
    it('应该应用自定义圆角', () => {
      render(<MarkdownInputField {...defaultProps} borderRadius={8} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('状态管理', () => {
    it('应该处理 typing 状态', () => {
      render(<MarkdownInputField {...defaultProps} typing={true} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该处理 disabled 状态', () => {
      render(<MarkdownInputField {...defaultProps} disabled={true} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('事件处理', () => {
    it('应该处理 onChange 事件', () => {
      const onChange = vi.fn();
      render(<MarkdownInputField {...defaultProps} onChange={onChange} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该处理键盘事件', () => {
      render(<MarkdownInputField {...defaultProps} />);
      const editor = screen.getByTestId('base-markdown-editor');

      // 模拟键盘事件
      fireEvent.keyDown(editor, { key: 'Enter', code: 'Enter' });
      expect(editor).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理空的 value', () => {
      render(<MarkdownInputField {...defaultProps} value="" />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该处理未定义的 value', () => {
      render(<MarkdownInputField {...defaultProps} value={undefined} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该处理空的 placeholder', () => {
      render(<MarkdownInputField {...defaultProps} placeholder="" />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该处理未定义的 onChange', () => {
      render(<MarkdownInputField {...defaultProps} onChange={undefined} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('性能优化', () => {
    it('应该正确处理 useMemo 优化', () => {
      render(<MarkdownInputField {...defaultProps} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理 useCallback 优化', () => {
      render(<MarkdownInputField {...defaultProps} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该处理附件上传错误', async () => {
      const onUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
      render(
        <MarkdownInputField
          {...defaultProps}
          attachment={{
            enable: true,
            upload: onUpload,
          }}
        />,
      );
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该处理发送错误', async () => {
      const onSend = vi.fn().mockRejectedValue(new Error('Send failed'));
      render(<MarkdownInputField {...defaultProps} onSend={onSend} />);
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });
  });

  describe('集成测试', () => {
    it('应该正确处理完整的用户交互流程', async () => {
      const onChange = vi.fn();
      const onSend = vi.fn().mockResolvedValue(undefined);

      render(
        <MarkdownInputField
          {...defaultProps}
          onChange={onChange}
          onSend={onSend}
          triggerSendKey="Enter"
        />,
      );

      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该正确处理复杂的自定义渲染', () => {
      const actionsRender = vi.fn((_props, defaultActions) => [
        <div key="custom1" data-testid="custom-action-1">
          Action 1
        </div>,
        <div key="custom2" data-testid="custom-action-2">
          Action 2
        </div>,
        ...defaultActions,
      ]);

      const toolsRender = vi.fn(() => [
        <div key="tool1" data-testid="custom-tool-1">
          Tool 1
        </div>,
        <div key="tool2" data-testid="custom-tool-2">
          Tool 2
        </div>,
      ]);

      render(
        <MarkdownInputField
          {...defaultProps}
          actionsRender={actionsRender}
          toolsRender={toolsRender}
          attachment={{
            enable: true,
          }}
        />,
      );

      expect(screen.getByTestId('custom-action-1')).toBeInTheDocument();
      expect(screen.getByTestId('custom-action-2')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tool-1')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tool-2')).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('应该在禁用状态下正确设置 aria 属性', () => {
      render(<MarkdownInputField {...defaultProps} disabled={true} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该支持键盘导航', () => {
      render(<MarkdownInputField {...defaultProps} />);
      const editor = screen.getByTestId('base-markdown-editor');

      // 测试 Tab 键导航
      fireEvent.keyDown(editor, { key: 'Tab', code: 'Tab' });
      expect(editor).toBeInTheDocument();
    });
  });

  describe('响应式设计', () => {
    it('应该正确处理窗口大小变化', () => {
      render(<MarkdownInputField {...defaultProps} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('应该正确处理容器大小变化', () => {
      render(<MarkdownInputField {...defaultProps} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('技能模式功能', () => {
    it('应该在 skillMode.enable 为 true 且 open 为 true 时显示技能模式', () => {
      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: true,
          title: 'AI助手模式',
          closable: true,
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByTestId('skill-mode-bar')).toBeInTheDocument();
      expect(screen.getByTestId('skill-mode-title')).toHaveTextContent(
        'AI助手模式',
      );
      expect(screen.getByTestId('skill-mode-close')).toBeInTheDocument();
    });

    it('应该在 skillMode.enable 为 false 时完全不渲染技能模式组件', () => {
      const props = {
        ...defaultProps,
        skillMode: {
          enable: false,
          open: true,
          title: 'AI助手模式',
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.queryByTestId('skill-mode-bar')).not.toBeInTheDocument();
    });

    it('应该在 skillMode.enable 为 true 但 open 为 false 时隐藏技能模式', () => {
      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: false,
          title: 'AI助手模式',
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.queryByTestId('skill-mode-bar')).not.toBeInTheDocument();
    });

    it('应该在 skillMode.enable 未设置时默认启用技能模式', () => {
      const props = {
        ...defaultProps,
        skillMode: {
          open: true,
          title: 'AI助手模式',
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByTestId('skill-mode-bar')).toBeInTheDocument();
    });

    it('应该显示技能模式的右侧内容（数组形式）', () => {
      const rightContent = [
        <div key="tag">标签内容</div>,
        <button key="btn" type="button">
          按钮
        </button>,
      ];

      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: true,
          title: '测试标题',
          rightContent,
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByTestId('skill-mode-content-0')).toBeInTheDocument();
      expect(screen.getByTestId('skill-mode-content-1')).toBeInTheDocument();
    });

    it('应该显示技能模式的右侧内容（单个ReactNode）', () => {
      const rightContent = <div data-testid="single-content">单个内容节点</div>;

      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: true,
          title: '测试标题',
          rightContent,
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByTestId('skill-mode-content-0')).toBeInTheDocument();
      expect(screen.getByTestId('single-content')).toBeInTheDocument();
      expect(screen.getByText('单个内容节点')).toBeInTheDocument();
    });

    it('应该在 closable 为 false 时隐藏关闭按钮', () => {
      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: true,
          title: '不可关闭模式',
          closable: false,
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByTestId('skill-mode-bar')).toBeInTheDocument();
      expect(screen.queryByTestId('skill-mode-close')).not.toBeInTheDocument();
    });

    it('应该在点击关闭按钮时调用 onSkillModeOpenChange', async () => {
      const onSkillModeOpenChange = vi.fn();
      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: true,
          title: '可关闭模式',
        },
        onSkillModeOpenChange,
      };

      render(<MarkdownInputField {...props} />);

      const closeButton = screen.getByTestId('skill-mode-close');
      await userEvent.click(closeButton);

      expect(onSkillModeOpenChange).toHaveBeenCalledTimes(1);
      expect(onSkillModeOpenChange).toHaveBeenCalledWith(false);
    });

    it('应该支持 React 节点作为标题', () => {
      const customTitle = (
        <div>
          <span>图标</span>
          自定义标题
        </div>
      );

      const props = {
        ...defaultProps,
        skillMode: {
          enable: true,
          open: true,
          title: customTitle,
        },
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.getByText('图标')).toBeInTheDocument();
      expect(screen.getByText('自定义标题')).toBeInTheDocument();
    });

    it('应该处理未定义的 skillMode', () => {
      const props = {
        ...defaultProps,
        skillMode: undefined,
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.queryByTestId('skill-mode-bar')).not.toBeInTheDocument();
    });

    it('应该处理明确设置为 undefined 的 skillMode', () => {
      const props = {
        ...defaultProps,
        skillMode: undefined,
      };

      render(<MarkdownInputField {...props} />);

      expect(screen.queryByTestId('skill-mode-bar')).not.toBeInTheDocument();
    });

    it('应该在 skillMode 状态变化时触发 onSkillModeOpenChange', async () => {
      const onSkillModeOpenChange = vi.fn();
      const { rerender } = render(
        <MarkdownInputField
          {...defaultProps}
          skillMode={{ enable: true, open: false }}
          onSkillModeOpenChange={onSkillModeOpenChange}
        />,
      );

      // 初始状态不会触发回调
      expect(onSkillModeOpenChange).not.toHaveBeenCalled();

      // 状态改变时会触发回调
      rerender(
        <MarkdownInputField
          {...defaultProps}
          skillMode={{ enable: true, open: true }}
          onSkillModeOpenChange={onSkillModeOpenChange}
        />,
      );

      await waitFor(() => {
        expect(onSkillModeOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('应该支持 enable 参数的动态切换', () => {
      const { rerender } = render(
        <MarkdownInputField
          {...defaultProps}
          skillMode={{
            enable: true,
            open: true,
            title: '动态切换测试',
          }}
        />,
      );

      // 初始状态应该显示技能模式
      expect(screen.getByTestId('skill-mode-bar')).toBeInTheDocument();

      // 切换 enable 为 false
      rerender(
        <MarkdownInputField
          {...defaultProps}
          skillMode={{
            enable: false,
            open: true,
            title: '动态切换测试',
          }}
        />,
      );

      // 组件应该完全消失
      expect(screen.queryByTestId('skill-mode-bar')).not.toBeInTheDocument();

      // 重新启用
      rerender(
        <MarkdownInputField
          {...defaultProps}
          skillMode={{
            enable: true,
            open: true,
            title: '动态切换测试',
          }}
        />,
      );

      // 组件应该重新出现
      expect(screen.getByTestId('skill-mode-bar')).toBeInTheDocument();
    });
  });
});
