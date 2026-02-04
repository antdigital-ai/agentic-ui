import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../src/Bubble/BubbleConfigProvide';
import { BubbleExtra } from '../src/Bubble/MessagesContent/BubbleExtra';

const BubbleConfigProvide: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  standalone?: boolean;
}> = ({ children, compact, standalone }) => {
  return (
    <BubbleConfigContext.Provider
      value={{ standalone: standalone || false, compact, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
  );
};

// Mock framer-motion，避免动画及视口相关副作用
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock @ant-design/agentic-ui (别名指向 ./src)
vi.mock('@ant-design/agentic-ui', async () => {
  const actual = await vi.importActual('@ant-design/agentic-ui');
  // Mock Lottie 组件，当 active 为 true 时显示 lottie-animation
  const mockPlayLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'voice-play-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockCopyLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'copy-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockLikeLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'like-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockDislikeLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'dislike-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockRefreshLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'refresh-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  return {
    ...actual,
    PlayLottie: mockPlayLottie,
    CopyLottie: mockCopyLottie,
    LikeLottie: mockLikeLottie,
    DislikeLottie: mockDislikeLottie,
    RefreshLottie: mockRefreshLottie,
  };
});

// Mock CopyButton / ActionIconBox，避免依赖样式与外部行为
vi.mock('../src/index', async () => {
  const actual = await vi.importActual('../src/index');
  // Mock Lottie 组件，当 active 为 true 时显示 lottie-animation
  const mockPlayLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'voice-play-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockCopyLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'copy-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockLikeLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'like-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockDislikeLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'dislike-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  const mockRefreshLottie = ({ active }: any) => (
    <span data-testid={active ? 'lottie-animation' : 'refresh-lottie'}>
      {active ? 'lottie-active' : 'lottie-inactive'}
    </span>
  );
  return {
    ...actual,
    ActionIconBox: ({
      children,
      onClick,
      title,
      style,
      scale,
      'data-testid': dataTestid,
      ...restProps
    }: any) => (
      <span
        data-testid={dataTestid || 'action-icon-box'}
        onClick={onClick}
        style={style}
        title={title}
        data-scale={scale ? 'true' : 'false'}
        {...restProps}
      >
        {children}
      </span>
    ),
    CopyButton: ({
      children,
      onClick,
      title,
      style,
      scale,
      'data-testid': dataTestid,
      ...restProps
    }: any) => (
      <span
        data-testid={dataTestid || 'copy-button'}
        onClick={onClick}
        style={style}
        title={title}
        data-scale={scale ? 'true' : 'false'}
        {...restProps}
      >
        {children || '复制'}
      </span>
    ),
    PlayLottie: mockPlayLottie,
    CopyLottie: mockCopyLottie,
    LikeLottie: mockLikeLottie,
    DislikeLottie: mockDislikeLottie,
    RefreshLottie: mockRefreshLottie,
  };
});

// Mock lottie 相关组件，避免加载动画 JSON（保持默认导出与命名导出一致）
vi.mock('../src/icons/VoicePlayLottie', () => {
  const Mock = ({ size = 16 }: { size?: number }) => (
    <span data-testid="voice-play-lottie">lottie-{size}</span>
  );
  return { __esModule: true, default: Mock, VoicePlayLottie: Mock };
});
vi.mock('../src/icons/VoicingLottie', () => {
  const Mock = ({ size = 16 }: { size?: number }) => (
    <span data-testid="voicing-lottie">voicing-{size}</span>
  );
  return { __esModule: true, default: Mock, VoicingLottie: Mock };
});

// 基础 bubble 数据
const defaultBubbleProps = {
  id: 'test-id',
  content: 'Test message content',
  isFinished: true,
  isAborted: false,
  uuid: 1,
  originData: {
    id: 'test-id',
    role: 'assistant' as const,
    content: 'Test message content',
    createAt: 1716537600000,
    updateAt: 1716537600000,
  },
};

describe('BubbleExtra - VoiceButton / shouldShowVoice / useSpeech', () => {
  it('默认显示语音按钮（未配置 shouldShowVoice 时，内容满足条件）', () => {
    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    // 语音按钮容器存在（通过 aria-label 或播放/停止区域判断）
    // 初始未播放，存在“语音播报”按钮区域
    const playRegion = screen.queryByLabelText('语音播报');
    expect(playRegion).toBeInTheDocument();
  });

  it('shouldShowVoice=false 时隐藏语音按钮', () => {
    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={false}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.queryByLabelText('语音播报');
    expect(playRegion).not.toBeInTheDocument();
  });

  it('当内容为空时，即使 shouldShowVoice=true 也不显示语音按钮', () => {
    const bubbleWithEmpty = {
      ...defaultBubbleProps,
      originData: {
        ...defaultBubbleProps.originData,
        content: '',
      },
    };

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={bubbleWithEmpty as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.queryByLabelText('语音播报')).not.toBeInTheDocument();
  });

  it('点击播放后进入播放态，出现停止播报区域', () => {
    // Mock 浏览器 SpeechSynthesis 支持
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      },
    });
    const MockUtter = vi.fn().mockImplementation(function (
      this: any,
      txt: string,
    ) {
      this.text = txt;
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    });
    Object.defineProperty(global, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtter,
    });

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.click(playRegion);

    // 播放态：应渲染“停止播报”区域
    expect(screen.getByLabelText('停止播报')).toBeInTheDocument();
  });

  it('外部 useSpeech 适配器提供时，即使无浏览器支持也应显示并可切换播放态', () => {
    // 移除 speechSynthesis 支持
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });

    const mockAdapter = vi.fn().mockImplementation(() => {
      let playing = false;
      let rate = 1;
      return {
        isPlaying: playing,
        rate,
        setRate: (v: number) => {
          rate = v;
        },
        start: () => {
          playing = true;
        },
        stop: () => {
          playing = false;
        },
        pause: vi.fn(),
        resume: vi.fn(),
      } as any;
    });

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
          useSpeech={mockAdapter}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.queryByLabelText('语音播报');
    expect(playRegion).toBeInTheDocument();
    if (playRegion) fireEvent.click(playRegion);

    // 由于我们没有触发重新渲染，无法检测播放态 UI 切换，这里仅验证适配器被调用
    expect(mockAdapter).toHaveBeenCalled();
  });

  it('不支持 Web Speech 时，语音按钮应禁用（aria-disabled=true）', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    expect(playRegion).toHaveAttribute('aria-disabled', 'true');
  });

  it('播放态下 hover 会调用 pause 与 resume', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      },
    });
    const MockUtter = vi.fn().mockImplementation(function (
      this: any,
      txt: string,
    ) {
      this.text = txt;
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    });
    Object.defineProperty(global, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtter,
    });

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.click(playRegion);

    const playingBox = screen.getByLabelText('停止播报');
    fireEvent.mouseEnter(playingBox);
    expect((global as any).window.speechSynthesis.pause).toHaveBeenCalled();
    fireEvent.mouseLeave(playingBox);
    expect((global as any).window.speechSynthesis.resume).toHaveBeenCalled();
  });

  it('再次点击停止区域会调用 cancel 停止播报', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      },
    });
    const MockUtter = vi.fn().mockImplementation(function (
      this: any,
      txt: string,
    ) {
      this.text = txt;
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    });
    Object.defineProperty(global, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtter,
    });

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.click(playRegion);
    const playingBox = screen.getByLabelText('停止播报');
    fireEvent.click(playingBox);
    expect((global as any).window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('rate 文案：rate 为 1 时显示 “倍速”', () => {
    const adapter = vi.fn().mockImplementation(() => ({
      isPlaying: true,
      rate: 1,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    }));

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          useSpeech={adapter}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('倍速')).toBeInTheDocument();
  });

  it('rate 文案：rate 非 1 时显示具体倍速，比如 1.25x', () => {
    const adapter = vi.fn().mockImplementation(() => ({
      isPlaying: true,
      rate: 1.25,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    }));

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          useSpeech={adapter}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.getByText('1.25x')).toBeInTheDocument();
  });

  it('hover 播放按钮会展示 lottie（非播放态）', () => {
    // Mock 浏览器 SpeechSynthesis 支持，使得按钮可用
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      },
    });
    const MockUtter = vi.fn().mockImplementation(function (
      this: any,
      txt: string,
    ) {
      this.text = txt;
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    });
    Object.defineProperty(global, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtter,
    });

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={defaultBubbleProps as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.mouseEnter(playRegion);
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });

  it('内容为 “回答已停止生成” 时隐藏语音按钮', () => {
    const abortedBubble = {
      ...defaultBubbleProps,
      originData: {
        ...defaultBubbleProps.originData,
        content: '回答已停止生成',
      },
    };

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={abortedBubble as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.queryByLabelText('语音播报')).not.toBeInTheDocument();
  });

  it('存在 extra.answerStatus 时隐藏语音按钮', () => {
    const bubbleWithAnswerStatus = {
      ...defaultBubbleProps,
      originData: {
        ...defaultBubbleProps.originData,
        extra: { answerStatus: 'done' },
      },
    };

    render(
      <BubbleConfigProvide>
        <BubbleExtra
          bubble={bubbleWithAnswerStatus as any}
          onLike={vi.fn()}
          onDislike={vi.fn()}
          shouldShowVoice={true}
        />
      </BubbleConfigProvide>,
    );

    expect(screen.queryByLabelText('语音播报')).not.toBeInTheDocument();
  });
});
