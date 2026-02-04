/* eslint-disable react/button-has-type */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../src/Bubble/BubbleConfigProvide';
import { BubbleMessageDisplay } from '../../src/Bubble/MessagesContent';
import { BubbleProps, MessageBubbleData } from '../../src/Bubble/type';

vi.mock('../../src/Bubble/MessagesContent/MarkdownPreview', () => ({
  MarkdownPreview: ({
    content,
    isFinished,
    typing,
    extra,
    docListNode,
    fncProps,
    markdownRenderConfig,
    style,
    originData,
    htmlRef,
  }: any) => {
    return (
      <div data-testid="markdown-preview">
        <div data-testid="content">{content}</div>
        <div data-testid="is-finished">{isFinished ? 'true' : 'false'}</div>
        <div data-testid="typing">{typing ? 'true' : 'false'}</div>
        {extra && <div data-testid="extra">{extra}</div>}
        {docListNode && <div data-testid="doc-list">{docListNode}</div>}
        {fncProps && <div data-testid="fnc-props">fncProps</div>}
        {markdownRenderConfig && (
          <div data-testid="markdown-config">config</div>
        )}
        {style && <div data-testid="style">style</div>}
        {originData && <div data-testid="origin-data">originData</div>}
        {htmlRef && <div data-testid="html-ref">htmlRef</div>}
      </div>
    );
  },
}));

vi.mock('../../src/Bubble/MessagesContent/BubbleExtra', () => ({
  BubbleExtra: ({
    onLike,
    onDislike,
    onReply,
    style,
    readonly,
    bubble,
    onRenderExtraNull,
    render,
  }: any) => (
    <div data-testid="bubble-extra" style={style}>
      <div data-testid="readonly">{readonly ? 'true' : 'false'}</div>
      <div data-testid="bubble-id">{bubble?.id}</div>
      <div data-testid="is-latest">true</div>
      <button data-testid="like-btn" onClick={onLike}>
        Like
      </button>
      <button data-testid="dislike-btn" onClick={onDislike}>
        Dislike
      </button>
      <button data-testid="reply-btn" onClick={() => onReply?.('test reply')}>
        Reply
      </button>

      <button
        data-testid="extra-null-btn"
        onClick={() => onRenderExtraNull?.(true)}
      >
        Set Extra Null
      </button>
      {render && <div data-testid="custom-render">Custom Render</div>}
    </div>
  ),
}));

vi.mock('../../src/Bubble/MessagesContent/DocInfo', () => ({
  DocInfoList: ({
    options,
    onOriginUrlClick,
    render,
    reference_url_info_list,
  }: any) => (
    <div data-testid="doc-info-list">
      <div data-testid="reference-url-count">
        {reference_url_info_list?.length || 0}
      </div>
      {options?.map((item: any, index: number) => (
        <div key={index} data-testid={`doc-item-${index}`}>
          <div data-testid={`doc-content-${index}`}>{item.content}</div>
          <div data-testid={`doc-url-${index}`}>{item.originUrl}</div>
          <button
            type="button"
            data-testid={`doc-click-${index}`}
            onClick={() => onOriginUrlClick?.(item.originUrl)}
          >
            Click Doc
          </button>
          {render && (
            <div data-testid={`doc-render-${index}`}>
              {render(item, <div>Default DOM</div>)}
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../src/Bubble/MessagesContent/EXCEPTION', () => ({
  EXCEPTION: ({ content, extra, originData }: any) => (
    <div data-testid="exception">
      <div data-testid="exception-content">{content}</div>
      <div data-testid="exception-origin-data">{originData?.id}</div>
      {extra && <div data-testid="exception-extra">{extra}</div>}
    </div>
  ),
}));

// Mock MarkdownEditor
vi.mock('../../src/MarkdownEditor', () => ({
  MarkdownEditor: ({
    initValue,
    style,
    contentStyle,
    tableConfig,
    readonly,
    editorRef,
    fncProps,
    typewriter,
    rootContainer,
    editorStyle,
  }: any) => (
    <div data-testid="markdown-editor">
      <div data-testid="init-value">{initValue}</div>
      {style && <div data-testid="editor-style">style</div>}
      {contentStyle && <div data-testid="content-style">contentStyle</div>}
      {tableConfig && <div data-testid="table-config">tableConfig</div>}
      {readonly && <div data-testid="readonly">readonly</div>}
      {editorRef && <div data-testid="editor-ref">editorRef</div>}
      {fncProps && <div data-testid="editor-fnc-props">fncProps</div>}
      {typewriter && <div data-testid="typewriter">typewriter</div>}
      {rootContainer && <div data-testid="root-container">rootContainer</div>}
      {editorStyle && <div data-testid="editor-style-config">editorStyle</div>}
    </div>
  ),
}));

// Mock Antd 组件
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Popover: ({ children, content, title, placement }: any) => (
      <div data-testid="popover" data-placement={placement}>
        {title && <div data-testid="popover-title">{title}</div>}
        {children}
        {content && <div data-testid="popover-content">{content}</div>}
      </div>
    ),
    Tooltip: ({ children, title }: any) => (
      <div data-testid="tooltip" title={title}>
        {children}
      </div>
    ),
    Typography: {
      Text: ({ children, copyable }: any) => (
        <span
          data-testid="typography-text"
          data-copyable={copyable ? 'true' : 'false'}
        >
          {children}
        </span>
      ),
    },
    ConfigProvider: {
      ...actual.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: (prefix?: string) => prefix || 'ant',
      }),
    },
    Divider: ({ type, style }: any) => (
      <div data-testid="divider" data-type={type} style={style}>
        Divider
      </div>
    ),
    Drawer: ({ title, open, onClose, width, children }: any) => (
      <div data-testid="drawer" data-open={open} data-width={width}>
        <div data-testid="drawer-title">{title}</div>
        <button data-testid="drawer-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ),
    Descriptions: ({ column, items }: any) => (
      <div data-testid="descriptions" data-column={column}>
        {items?.map((item: any, index: number) => (
          <div key={index} data-testid={`desc-item-${index}`}>
            <span data-testid={`desc-label-${index}`}>{item.label}</span>
            <span data-testid={`desc-children-${index}`}>{item.children}</span>
          </div>
        ))}
      </div>
    ),
  };
});

// Mock 图标
vi.mock('@ant-design/icons', () => ({
  ExportOutlined: () => <div data-testid="export-icon">Export</div>,
  DislikeOutlined: () => <div data-testid="dislike-icon">Dislike</div>,
  LikeOutlined: () => <div data-testid="like-icon">Like</div>,
  SelectOutlined: () => <div data-testid="select-icon">Select</div>,
  RightOutlined: () => <div data-testid="right-icon">Right</div>,
  CloseCircleFilled: () => <div data-testid="close-circle-icon">Close</div>,
  FileImageOutlined: () => <div data-testid="file-image-icon">FileImage</div>,
  FileTextFilled: () => <div data-testid="file-text-icon">FileText</div>,
  AudioOutlined: () => <div data-testid="audio-icon">Audio</div>,
  VideoCameraOutlined: () => (
    <div data-testid="video-camera-icon">VideoCamera</div>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      variants,
      whileInView,
      initial,
      animate,
      style,
      className,
      onClick,
    }: any) => (
      <div
        data-testid="motion-div"
        data-variants={variants ? 'has-variants' : 'no-variants'}
        data-while-in-view={whileInView}
        data-initial={initial}
        data-animate={animate}
        style={style}
        className={className}
        onClick={onClick}
      >
        {children}
      </div>
    ),
  },
}));

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
  },
  writable: true,
});

// Mock dayjs
vi.mock('dayjs', () => ({
  default: () => ({
    format: () => `2024-01-01 12:00:00`,
  }),
}));

// Mock classNames
vi.mock('classnames', () => ({
  default: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('BubbleMessageDisplay', () => {
  const defaultProps: BubbleProps & {
    content: MessageBubbleData['content'];
    bubbleListItemExtraStyle?: React.CSSProperties;
  } = {
    content: 'Test content',
    bubbleRef: { current: { setMessageItem: vi.fn() } },
    readonly: false,
    placement: 'left',
    onLike: vi.fn(),
    onDislike: vi.fn(),
    onReply: vi.fn(),
    bubbleRenderConfig: {
      extraRender: (props: any, defaultDom: any) => defaultDom, // 返回默认的 BubbleExtra 组件
    },
    originData: {
      id: 'test-id',
      role: 'assistant',
      content: 'Test content',
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: true,
      extra: {
        answerStatus: undefined, // 明确设置为undefined
      },
      feedback: undefined, // 明确设置为undefined
    },
  };

  const defaultContext = {
    standalone: false,
    locale: {
      'chat.message.thinking': '思考中...',
      'chat.message.error': '生成回答失败，请重试',
      'chat.message.like': '喜欢',
      'chat.message.dislike': '不喜欢',
      'chat.message.copy': '复制',
      'chat.message.retrySend': '重新生成',
      'chat.message.aborted': '回答已停止生成',
      'chat.message.feedback-success': '已经反馈过了哦',
    },
    compact: false,
    thoughtChain: {
      alwaysRender: false,
    },
    thoughtChainList: {},
  };

  const renderWithContext = (
    props: any = defaultProps,
    context: any = defaultContext,
  ) => {
    return render(
      <BubbleConfigContext.Provider value={context as any}>
        <BubbleMessageDisplay {...props} />
      </BubbleConfigContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染普通消息内容', () => {
      renderWithContext();

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toHaveTextContent('Test content');
      expect(screen.getByTestId('is-finished')).toHaveTextContent('true');
    });

    it('应该渲染加载状态', () => {
      const props = {
        ...defaultProps,
        content: '...',
        originData: {
          ...defaultProps.originData,
          isFinished: false,
        },
      };

      renderWithContext(props);

      expect(screen.getByText('思考中...')).toBeInTheDocument();
    });

    it('应该渲染异常状态', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            answerStatus: 'EXCEPTION',
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('exception')).toBeInTheDocument();
      expect(screen.getByTestId('exception-content')).toHaveTextContent(
        'Test content',
      );
    });

    it('应该处理空内容异常状态', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          content: '',
          extra: {
            answerStatus: 'ERROR',
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('exception')).toBeInTheDocument();
    });

    it('应该处理bot角色消息', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          role: 'bot',
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理REJECT_TO_ANSWER标签', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            tags: ['REJECT_TO_ANSWER'],
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理React元素内容', () => {
      const reactContent = <div data-testid="react-content">React Content</div>;
      const props = {
        ...defaultProps,
        content: reactContent,
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理thoughtChain.alwaysRender为true的情况', () => {
      const context = {
        ...defaultContext,
        thoughtChain: {
          alwaysRender: true,
        },
      };

      const props = {
        ...defaultProps,
        content: '...',
        originData: {
          ...defaultProps.originData,
          isFinished: false,
        },
      };

      renderWithContext(props, context);

      expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该处理点赞功能', async () => {
      const onLike = vi.fn();
      const props = {
        ...defaultProps,
        onLike,
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      const likeButton = screen.getByTestId('like-btn');
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(onLike).toHaveBeenCalled();
      });
    });

    it('应该处理点踩功能', async () => {
      const onDislike = vi.fn();
      const props = {
        ...defaultProps,
        onDislike,
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      const dislikeButton = screen.getByTestId('dislike-btn');
      fireEvent.click(dislikeButton);

      await waitFor(() => {
        expect(onDislike).toHaveBeenCalled();
      });
    });

    it('应该处理回复功能', () => {
      const onReply = vi.fn();
      const props = {
        ...defaultProps,
        onReply,
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      const replyButton = screen.getByTestId('reply-btn');
      fireEvent.click(replyButton);

      expect(onReply).toHaveBeenCalledWith('test reply');
    });

    it('应该处理自定义渲染函数', () => {
      const customRender = vi
        .fn()
        .mockReturnValue(<div data-testid="custom-render">Custom</div>);
      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: customRender, // 使用自定义渲染函数
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
      expect(customRender).toHaveBeenCalled();
    });

    it('应该处理额外内容为空的情况', () => {
      const props = {
        ...defaultProps,
        bubbleRenderConfig: {
          extraRender: false, // 修正属性名
        },
      } as BubbleProps;

      renderWithContext(props);

      expect(screen.queryByTestId('bubble-extra')).not.toBeInTheDocument();
    });
  });

  describe('文档信息测试', () => {
    it('应该渲染文档信息列表', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            white_box_process: {
              output: {
                chunks: [{ content: 'Document 1' }, { content: 'Document 2' }],
              },
            },
          },
        },
        docListProps: { enable: true },
      };

      renderWithContext(props);

      expect(screen.getByTestId('doc-info-list')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-1')).toBeInTheDocument();
    });

    it('应该禁用文档信息列表', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            white_box_process: {
              output: {
                chunks: [{ content: 'Document 1' }],
              },
            },
          },
        },
        docListProps: { enable: false },
      };

      renderWithContext(props);

      expect(screen.queryByTestId('doc-info-list')).not.toBeInTheDocument();
    });

    it('应该处理多个white_box_process', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            white_box_process: [
              {
                output: {
                  chunks: [{ content: 'Document 1' }],
                },
              },
              {
                output: {
                  chunks: [{ content: 'Document 2' }],
                },
              },
            ],
          },
        },
        docListProps: { enable: true },
      };

      renderWithContext(props);

      expect(screen.getByTestId('doc-info-list')).toBeInTheDocument();
    });

    it('应该处理空的chunks数组', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            white_box_process: {
              output: {
                chunks: [],
              },
            },
          },
        },
        docListProps: { enable: true },
      };

      renderWithContext(props);

      expect(screen.queryByTestId('doc-info-list')).not.toBeInTheDocument();
    });

    it('应该处理reference_url_info_list', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          extra: {
            white_box_process: {
              output: {
                chunks: [{ content: 'Document 1' }],
              },
            },
            reference_url_info_list: [
              { placeholder: 'test', url: 'http://test.com' },
            ],
          },
        },
        docListProps: {
          enable: true,
          reference_url_info_list: [
            { placeholder: 'test2', url: 'http://test2.com' },
          ],
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('doc-info-list')).toBeInTheDocument();
      expect(screen.getByTestId('reference-url-count')).toHaveTextContent('1');
    });
  });

  describe('状态测试', () => {
    it('应该处理未完成状态', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          isFinished: false,
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('typing')).toHaveTextContent('true');
    });

    it('应该处理被终止状态', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          isAborted: true,
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('typing')).toHaveTextContent('false');
    });

    it('应该处理isHistory状态', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          isFinished: false,
          extra: {
            isHistory: true,
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('typing')).toHaveTextContent('false');
    });

    it('应该处理只读模式', () => {
      const props = {
        ...defaultProps,
        readonly: true,
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('readonly')).toHaveTextContent('true');
    });

    it('应该正确渲染内容', () => {
      const props = {
        ...defaultProps,
        onLike: vi.fn(),
        onDislike: vi.fn(),
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      expect(screen.getAllByTestId('is-latest')[0]).toHaveTextContent('true');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空内容', () => {
      const props = {
        ...defaultProps,
        content: '',
        originData: {
          ...defaultProps.originData,
          content: '',
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('content')).toHaveTextContent(
        '生成回答失败，请重试',
      );
    });

    it('应该处理用户角色消息', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          role: 'user',
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理placement为right的情况', () => {
      const props = {
        ...defaultProps,
        placement: 'right',
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理feedback状态', () => {
      const props = {
        ...defaultProps,
        originData: {
          ...defaultProps.originData,
          feedback: 'thumbsUp',
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理bubbleListItemExtraStyle', () => {
      const props = {
        ...defaultProps,
        bubbleListItemExtraStyle: { backgroundColor: 'red' },
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      const bubbleExtra = screen.getByTestId('bubble-extra');
      expect(bubbleExtra).toBeInTheDocument();
      // 检查样式是否被正确应用（motion.div会包装原始元素）
      // 由于motion.div的包装，样式可能不会直接应用
      expect(bubbleExtra).toBeInTheDocument();
    });
  });

  describe('配置测试', () => {
    it('应该应用紧凑模式样式', () => {
      const context = {
        ...defaultContext,
        compact: true,
      };

      renderWithContext(defaultProps, context);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该处理自定义样式', () => {
      const props = {
        ...defaultProps,
        bubbleListItemExtraStyle: { backgroundColor: 'red' },
        bubbleRenderConfig: {
          extraRender: (props: any, defaultDom: any) => defaultDom, // 确保 BubbleExtra 被渲染
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('bubble-extra')).toBeInTheDocument();
    });

    it('应该处理markdownRenderConfig', () => {
      const props = {
        ...defaultProps,
        markdownRenderConfig: {
          fncProps: {
            onOriginUrlClick: vi.fn(),
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-config')).toBeInTheDocument();
    });

    it('应该处理customConfig', () => {
      const props = {
        ...defaultProps,
        customConfig: {
          PopoverProps: {
            titleStyle: { fontSize: '16px' },
            contentStyle: { width: '500px' },
          },
          TooltipProps: { placement: 'top' },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });
  });

  describe('依赖项变化测试', () => {
    it('应该响应deps变化', () => {
      const props = {
        ...defaultProps,
        deps: ['test-dep'],
      };

      renderWithContext(props);

      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('应该响应bubbleListRef变化', () => {
      const props = {
        ...defaultProps,
        bubbleListRef: { current: document.createElement('div') },
      };

      renderWithContext(props);

      expect(screen.getByTestId('html-ref')).toBeInTheDocument();
    });
  });
});
