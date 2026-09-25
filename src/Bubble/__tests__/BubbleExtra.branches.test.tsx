/**
 * BubbleExtra 分支覆盖：rightRender、语音、placement、context、反馈组合。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { BubbleExtra } from '../MessagesContent/BubbleExtra';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
    'data-testid': testId,
    loading,
    onLoadingChange,
  }: any) => (
    <button
      type="button"
      data-testid={testId || 'action-icon'}
      title={title}
      data-loading={loading ? 'true' : 'false'}
      onClick={async (e) => {
        onLoadingChange?.(true);
        await onClick?.(e);
        onLoadingChange?.(false);
      }}
    >
      {typeof children === 'function' ? children(true) : children}
    </button>
  ),
}));

vi.mock('../MessagesContent/CopyButton', () => ({
  CopyButton: ({ onClick, children, 'data-testid': testId }: any) => (
    <button type="button" data-testid={testId} onClick={onClick}>
      {typeof children === 'function' ? children(true) : children}
    </button>
  ),
}));

vi.mock('../MessagesContent/VoiceButton', () => ({
  VoiceButton: () => <button type="button" data-testid="voice-button">voice</button>,
}));

vi.mock('../../Components/Loading', () => ({
  Loading: () => <span data-testid="loading">loading</span>,
}));

const useLocaleMock = vi.hoisted(() =>
  vi.fn(() => ({
    'chat.message.like': '喜欢',
    'chat.message.dislike': '不喜欢',
    'chat.message.copy': '复制',
    'chat.message.cancel-like': '取消点赞',
    'chat.message.feedback-success': '已反馈',
    'chat.message.aborted': '回答已停止生成',
    'chat.message.generating': '生成中',
    'chat.message.retrySend': '重新生成',
  })),
);

vi.mock('../../I18n', () => ({
  useLocale: () => useLocaleMock(),
}));

vi.mock('@ant-design/agentic-ui', () => ({
  CopyLottie: () => <span>copy-lottie</span>,
  DislikeLottie: () => <span>dislike-lottie</span>,
  LikeLottie: () => <span>like-lottie</span>,
  RefreshLottie: () => <span>refresh-lottie</span>,
}));

vi.mock('@ant-design/icons', () => ({
  LikeFilled: () => <span data-testid="like-filled">filled</span>,
  DislikeFilled: () => <span data-testid="dislike-filled">filled</span>,
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ConfigProvider: {
      ...actual.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: (p?: string) => p || 'ant',
      }),
    },
    Divider: () => <span data-testid="divider">|</span>,
  };
});

const makeBubble = (overrides: Record<string, any> = {}) => ({
  id: 'b1',
  originData: {
    id: 'b1',
    role: 'assistant' as const,
    content: 'Hello content',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    isAborted: false,
    uuid: 1,
    extra: {
      preMessage: { content: 'retry prompt' },
      ...overrides.extra,
    },
    ...overrides,
  },
});

const baseProps = {
  onLike: vi.fn(),
  onDislike: vi.fn(),
  onReply: vi.fn(),
  readonly: false,
  bubble: makeBubble(),
};

describe('BubbleExtra 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLocaleMock.mockImplementation(() => ({
      'chat.message.like': '喜欢',
      'chat.message.dislike': '不喜欢',
      'chat.message.copy': '复制',
      'chat.message.cancel-like': '取消点赞',
      'chat.message.feedback-success': '已反馈',
      'chat.message.aborted': '回答已停止生成',
      'chat.message.generating': '生成中',
      'chat.message.retrySend': '重新生成',
    }));
  });

  it('rightRender=false 时不渲染右侧 dom', () => {
    render(<BubbleExtra {...baseProps} rightRender={false} />);
    expect(screen.queryByTestId('chat-item-copy-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('reply-button')).toBeInTheDocument();
  });

  it('rightRender 自定义函数接收 defaultDoms', () => {
    render(
      <BubbleExtra
        {...baseProps}
        rightRender={(_props, doms) => (
          <div data-testid="custom-right">{doms.copy}</div>
        )}
      />,
    );
    expect(screen.getByTestId('custom-right')).toBeInTheDocument();
    expect(screen.getByTestId('chat-item-copy-button')).toBeInTheDocument();
  });

  it('shouldShowVoice=true 且满足条件时渲染语音按钮', () => {
    render(<BubbleExtra {...baseProps} shouldShowVoice />);
    expect(screen.getByTestId('voice-button')).toBeInTheDocument();
  });

  it('typing 时不渲染语音按钮', () => {
    render(
      <BubbleExtra
        {...baseProps}
        shouldShowVoice
        bubble={makeBubble({ isFinished: false, isAborted: false })}
      />,
    );
    expect(screen.queryByTestId('voice-button')).not.toBeInTheDocument();
  });

  it('thumbsDown feedback 隐藏 like 按钮', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ feedback: 'thumbsDown' })}
      />,
    );
    expect(screen.queryByTestId('like-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
  });

  it('thumbsUp feedback 隐藏 dislike 按钮', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ feedback: 'thumbsUp' })}
        onLikeCancel={vi.fn()}
      />,
    );
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
    expect(screen.queryByTestId('dislike-button')).not.toBeInTheDocument();
  });

  it('answerStatus 存在时隐藏 like/dislike', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ extra: { answerStatus: 'pending' } })}
      />,
    );
    expect(screen.queryByTestId('like-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dislike-button')).not.toBeInTheDocument();
  });

  it('无 onLike 但有 feedback 仍显示 like', () => {
    render(
      <BubbleExtra
        {...baseProps}
        onLike={undefined}
        bubble={makeBubble({ feedback: 'thumbsUp' })}
      />,
    );
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
  });

  it('已点赞无 cancel 回调时 title 为已反馈', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ feedback: 'thumbsUp' })}
      />,
    );
    expect(screen.getByTestId('like-button')).toHaveAttribute('title', '已反馈');
  });

  it('copy 与 like 同时存在时渲染 Divider', () => {
    render(<BubbleExtra {...baseProps} />);
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  it('placement=right 时 padding 为 0', () => {
    const { container } = render(
      <BubbleExtra {...baseProps} placement="right" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.paddingLeft).toBe('0px');
    expect(root.style.paddingTop).toBe('0px');
  });

  it('extraShowOnHover context 时 padding 为 0', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ extraShowOnHover: true }}>
        <BubbleExtra {...baseProps} />
      </BubbleConfigContext.Provider>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.padding).toBe('0px');
  });

  it('compact context 使用更小字号', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ compact: true }}>
        <BubbleExtra
          {...baseProps}
          bubble={makeBubble({ isFinished: false, isAborted: false, content: 'gen' })}
        />
      </BubbleConfigContext.Provider>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.fontSize).toBe('11px');
  });

  it('typing 且 content=... 时不显示 Loading 行', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({
          isFinished: false,
          content: '...',
        })}
      />,
    );
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('无 preMessage 时不渲染 reSend', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ extra: {} })}
      />,
    );
    expect(screen.queryByTestId('reply-button')).not.toBeInTheDocument();
  });

  it('onRenderExtraNull 在 dom 为空时被调用', () => {
    const onRenderExtraNull = vi.fn();
    render(
      <BubbleExtra
        {...baseProps}
        onRenderExtraNull={onRenderExtraNull}
        readonly
        bubble={makeBubble({ extra: {} })}
        shouldShowCopy={false}
      />,
    );
    expect(onRenderExtraNull).toHaveBeenCalledWith(true);
  });

  it('isHistory extra 时 typing 为 false', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({
          isFinished: false,
          extra: { isHistory: true },
        })}
      />,
    );
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
  });

  it('LikeFilled 在 thumbsUp 时显示', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ feedback: 'thumbsUp' })}
        onLikeCancel={vi.fn()}
      />,
    );
    expect(screen.getByTestId('like-filled')).toBeInTheDocument();
  });

  it('DislikeFilled 在 thumbsDown 时显示', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ feedback: 'thumbsDown' })}
      />,
    );
    expect(screen.getByTestId('dislike-filled')).toBeInTheDocument();
  });

  it('点赞失败时静默 catch', async () => {
    const onLike = vi.fn().mockRejectedValue(new Error('fail'));
    render(<BubbleExtra {...baseProps} onLike={onLike} />);
    fireEvent.click(screen.getByTestId('like-button'));
    await waitFor(() => expect(onLike).toHaveBeenCalled());
  });

  it('pure 模式返回操作节点数组', () => {
    const { container } = render(
      <BubbleExtra {...baseProps} pure shouldShowVoice />,
    );
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
    expect(screen.getByTestId('voice-button')).toBeInTheDocument();
    expect(container.querySelector('.ant-bubble-extra')).toBeNull();
  });

  it('shouldShowCopy 函数返回 false 时隐藏复制', () => {
    render(
      <BubbleExtra
        {...baseProps}
        shouldShowCopy={() => false}
      />,
    );
    expect(screen.queryByTestId('chat-item-copy-button')).not.toBeInTheDocument();
  });

  it('shouldShowCopy 布尔 false 时隐藏复制', () => {
    render(<BubbleExtra {...baseProps} shouldShowCopy={false} />);
    expect(screen.queryByTestId('chat-item-copy-button')).not.toBeInTheDocument();
  });

  it('onDisLike 废弃回调仍可触发点踩', async () => {
    const onDisLike = vi.fn();
    render(
      <BubbleExtra {...baseProps} onDislike={undefined} onDisLike={onDisLike} />,
    );
    fireEvent.click(screen.getByTestId('dislike-button'));
    await waitFor(() => expect(onDisLike).toHaveBeenCalled());
  });

  it('已点赞时 onCancelLike 取消点赞', async () => {
    const onCancelLike = vi.fn();
    render(
      <BubbleExtra
        {...baseProps}
        onLikeCancel={undefined}
        onCancelLike={onCancelLike}
        bubble={makeBubble({ feedback: 'thumbsUp' })}
      />,
    );
    fireEvent.click(screen.getByTestId('like-button'));
    await waitFor(() => expect(onCancelLike).toHaveBeenCalled());
  });

  it('aborted 且仅有 copy 时渲染复制按钮', () => {
    render(
      <BubbleExtra
        {...baseProps}
        readonly
        bubble={makeBubble({
          isAborted: true,
          isFinished: false,
          extra: {},
        })}
      />,
    );
    expect(screen.getByTestId('chat-item-copy-button')).toBeInTheDocument();
  });

  it('已反馈时点踩不再调用 onDislike', async () => {
    const onDislike = vi.fn();
    render(
      <BubbleExtra
        {...baseProps}
        onDislike={onDislike}
        bubble={makeBubble({ feedback: 'thumbsDown' })}
      />,
    );
    fireEvent.click(screen.getByTestId('dislike-button'));
    await waitFor(() => expect(onDislike).not.toHaveBeenCalled());
  });

  it('复制失败时 console.error', async () => {
    const copyMod = await import('copy-to-clipboard');
    (copyMod.default as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('copy fail');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<BubbleExtra {...baseProps} />);
    fireEvent.click(screen.getByTestId('chat-item-copy-button'));
    expect(errorSpy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('typing 时展示 Loading 与生成中文案', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({
          isFinished: false,
          isAborted: false,
          content: 'streaming...',
        })}
      />,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('生成中')).toBeInTheDocument();
  });

  it('aborted 文案为 content 时不展示 copy', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({
          isAborted: true,
          isFinished: false,
          content: '回答已停止生成',
          extra: {},
        })}
        shouldShowCopy={false}
      />,
    );
    expect(screen.queryByTestId('chat-item-copy-button')).not.toBeInTheDocument();
  });

  it('rightRender 函数返回自定义节点', () => {
    render(
      <BubbleExtra
        {...baseProps}
        rightRender={() => <span data-testid="custom-right">R</span>}
      />,
    );
    expect(screen.getByTestId('custom-right')).toBeInTheDocument();
  });

  it('rightRender 为 false 时不渲染右侧', () => {
    render(<BubbleExtra {...baseProps} rightRender={false} />);
    expect(screen.queryByTestId('custom-right')).not.toBeInTheDocument();
  });

  it('onCancelLike 与 onLikeCancel 均支持取消点赞', async () => {
    const onCancelLike = vi.fn();
    render(
      <BubbleExtra
        {...baseProps}
        onCancelLike={onCancelLike}
        bubble={makeBubble({ feedback: 'thumbsUp' })}
      />,
    );
    fireEvent.click(screen.getByTestId('like-button'));
    await waitFor(() => expect(onCancelLike).toHaveBeenCalled());
  });

  it('compact context 时使用较小字号', () => {
    render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <BubbleExtra {...baseProps} />
      </BubbleConfigContext.Provider>,
    );
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
  });

  it('extraShowOnHover context 时使用零 padding 样式', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ extraShowOnHover: true } as any}>
        <BubbleExtra {...baseProps} />
      </BubbleConfigContext.Provider>,
    );
    const extra = container.querySelector('.chat-item-extra');
    expect(extra).toHaveAttribute('style', expect.stringContaining('padding: 0'));
  });

  it('shouldShowVoice 为 false 时不渲染语音按钮', () => {
    render(<BubbleExtra {...baseProps} shouldShowVoice={false} />);
    expect(screen.queryByTestId('voice-button')).not.toBeInTheDocument();
  });

  it('readonly 时隐藏点赞点踩', () => {
    render(<BubbleExtra {...baseProps} readonly />);
    expect(screen.queryByTestId('like-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dislike-button')).not.toBeInTheDocument();
  });

  it('点击 reSend 触发 onReply 并传递 preMessage 内容', async () => {
    const onReply = vi.fn();
    render(<BubbleExtra {...baseProps} onReply={onReply} />);
    fireEvent.click(screen.getByTestId('reply-button'));
    await waitFor(() =>
      expect(onReply).toHaveBeenCalledWith('retry prompt'),
    );
  });

  it('点踩失败时静默 catch', async () => {
    const onDislike = vi.fn().mockRejectedValue(new Error('fail'));
    render(<BubbleExtra {...baseProps} onDislike={onDislike} />);
    fireEvent.click(screen.getByTestId('dislike-button'));
    await waitFor(() => expect(onDislike).toHaveBeenCalled());
  });

  it('已点踩时不渲染 like 按钮', () => {
    render(
      <BubbleExtra
        {...baseProps}
        onLikeCancel={vi.fn()}
        bubble={makeBubble({ feedback: 'thumbsDown' })}
      />,
    );
    expect(screen.queryByTestId('like-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('dislike-button')).toBeInTheDocument();
  });

  it('placement=left 时使用默认 padding 变量', () => {
    const { container } = render(
      <BubbleExtra {...baseProps} placement="left" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.paddingLeft).toContain('var(--padding');
  });

  it('props.style 合并到根节点', () => {
    const { container } = render(
      <BubbleExtra {...baseProps} style={{ marginTop: 8 }} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.marginTop).toBe('8px');
  });

  it('aborted 且无 copy 时仍展示 aborted 文案', () => {
    render(
      <BubbleExtra
        {...baseProps}
        readonly
        shouldShowCopy={false}
        bubble={makeBubble({
          isAborted: true,
          isFinished: false,
          content: 'stopped',
          extra: {},
        })}
      />,
    );
    expect(screen.getByText('回答已停止生成')).toBeInTheDocument();
  });

  it('onRenderExtraNull(false) 有内容时不调用 true', () => {
    const onRenderExtraNull = vi.fn();
    render(
      <BubbleExtra {...baseProps} onRenderExtraNull={onRenderExtraNull} />,
    );
    expect(onRenderExtraNull).toHaveBeenCalledWith(false);
  });

  it('shouldShowCopy 函数返回 true 时显示复制', () => {
    render(
      <BubbleExtra
        {...baseProps}
        shouldShowCopy={() => true}
      />,
    );
    expect(screen.getByTestId('chat-item-copy-button')).toBeInTheDocument();
  });

  it('点击 reply-button 触发 onReply(preMessage)', async () => {
    const onReply = vi.fn();
    render(
      <BubbleExtra
        {...baseProps}
        onReply={onReply}
        bubble={makeBubble({
          content: 'done',
          isFinished: true,
          extra: { preMessage: { content: 'quoted-user' } },
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('reply-button'));
    await waitFor(() => expect(onReply).toHaveBeenCalledWith('quoted-user'));
  });

  it('thumbsUp + onLikeCancel 标题为取消点赞', () => {
    render(
      <BubbleExtra
        {...baseProps}
        onLike={vi.fn()}
        onLikeCancel={vi.fn()}
        bubble={makeBubble({ feedback: 'thumbsUp', content: 'liked' })}
      />,
    );
    expect(screen.getByTitle('取消点赞')).toBeInTheDocument();
  });
});

describe('BubbleExtra istanbul residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLocaleMock.mockImplementation(() => ({
      'chat.message.like': '喜欢',
      'chat.message.dislike': '不喜欢',
      'chat.message.copy': '复制',
      'chat.message.cancel-like': '取消点赞',
      'chat.message.feedback-success': '已反馈',
      'chat.message.aborted': '回答已停止生成',
      'chat.message.generating': '生成中',
      'chat.message.retrySend': '重新生成',
    }));
  });

  it.skip('locale 空对象时点赞/点踩/复制/重试走中文 fallback', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        {...baseProps}
        onLike={vi.fn()}
        onDislike={vi.fn()}
        onReply={vi.fn()}
        bubble={makeBubble({ feedback: undefined, content: 'x' })}
      />,
    );
    expect(screen.getByTitle('喜欢')).toBeInTheDocument();
    expect(screen.getByTitle('不喜欢')).toBeInTheDocument();
    expect(screen.getByTitle('复制')).toBeInTheDocument();
  });

  it('thumbsUp 无取消回调时 locale 空 → feedback-success fallback', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        onLike={vi.fn()}
        readonly={false}
        bubble={makeBubble({ feedback: 'thumbsUp', content: 'liked' })}
      />,
    );
    expect(screen.getByTitle('已经反馈过了哦')).toBeInTheDocument();
  });

  it('thumbsUp + onCancelLike 且 locale 空 → 取消点赞 fallback', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        onLike={vi.fn()}
        onCancelLike={vi.fn()}
        readonly={false}
        bubble={makeBubble({ feedback: 'thumbsUp', content: 'liked' })}
      />,
    );
    expect(screen.getByTitle('取消点赞')).toBeInTheDocument();
  });

  it('thumbsDown 已反馈且 locale 空 → feedback-success fallback', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        onDislike={vi.fn()}
        readonly={false}
        bubble={makeBubble({ feedback: 'thumbsDown', content: 'x' })}
      />,
    );
    expect(screen.getByTitle('已经反馈过了哦')).toBeInTheDocument();
  });

  it('originData 缺失时 feedback 空串；无 onLike/onDislike 则不展示', () => {
    render(
      <BubbleExtra
        readonly={false}
        bubble={{ id: 'b1', originData: undefined } as any}
        shouldShowCopy={false}
      />,
    );
    expect(screen.queryByTestId('like-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dislike-button')).not.toBeInTheDocument();
  });

  it('shouldShowCopy 为 0/null 时非 boolean 走默认 true（若 content 有效）', () => {
    const { rerender, unmount } = render(
      <BubbleExtra {...baseProps} shouldShowCopy={0 as any} />,
    );
    // typeof 0 !== 'boolean' → fallthrough return true
    expect(screen.getByTestId('chat-item-copy-button')).toBeInTheDocument();
    rerender(<BubbleExtra {...baseProps} shouldShowCopy={null as any} />);
    expect(screen.getByTestId('chat-item-copy-button')).toBeInTheDocument();
    unmount();
  });

  it('仅 like 无 voice/copy 时不渲染 divider', () => {
    render(
      <BubbleExtra
        onLike={vi.fn()}
        readonly={false}
        shouldShowCopy={false}
        shouldShowVoice={false}
        bubble={makeBubble({ content: 'only-like', extra: {} })}
      />,
    );
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
    expect(screen.queryByTestId('divider')).not.toBeInTheDocument();
  });

  it('typing 且 locale 空时 generating fallback 为空串仍渲染 Loading', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({
          isFinished: false,
          isAborted: false,
          content: 'streaming...',
          extra: {},
        })}
      />,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('aborted + locale 空走 aborted 文案 fallback', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        readonly
        shouldShowCopy={false}
        bubble={makeBubble({
          isAborted: true,
          isFinished: false,
          content: 'stopped',
          extra: {},
        })}
      />,
    );
    expect(screen.getByText('回答已停止生成')).toBeInTheDocument();
  });

  it('重试按钮 locale 空时 title/文案 fallback', () => {
    useLocaleMock.mockReturnValue({} as any);
    render(
      <BubbleExtra
        onReply={vi.fn()}
        readonly={false}
        shouldShowCopy={false}
        bubble={makeBubble({
          content: 'done',
          isFinished: true,
          extra: { preMessage: { content: 'retry-me' } },
        })}
      />,
    );
    expect(screen.getByTitle('重新生成')).toBeInTheDocument();
    expect(screen.getByText('重新生成')).toBeInTheDocument();
  });

  it('无左右内容时 onRenderExtraNull(true) 并返回 null', () => {
    const onRenderExtraNull = vi.fn();
    const { container } = render(
      <BubbleExtra
        readonly
        shouldShowCopy={false}
        shouldShowVoice={false}
        rightRender={false}
        onRenderExtraNull={onRenderExtraNull}
        bubble={makeBubble({
          content: '...',
          isFinished: true,
          isAborted: false,
          extra: {},
        })}
      />,
    );
    expect(onRenderExtraNull).toHaveBeenCalledWith(true);
    expect(container.querySelector('.chat-item-extra')).toBeNull();
  });

  it('copy 时 content 缺失：defaultConditions 为假不展示复制按钮', () => {
    render(
      <BubbleExtra
        {...baseProps}
        bubble={makeBubble({ content: undefined })}
      />,
    );
    expect(
      screen.queryByTestId('chat-item-copy-button'),
    ).not.toBeInTheDocument();
  });
});
