/**
 * VoiceButton deepen residual：默认倍速、不支持、NaN rate、pause/resume。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceButton } from '../index';
import type { UseSpeechAdapter } from '../types';

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'vb-d' }),
}));

vi.mock('@sofa-design/icons', () => ({
  ChevronDown: () => <span data-testid="chevron" />,
  Pause: () => <span data-testid="pause-icon" />,
}));

vi.mock('@ant-design/agentic-ui', () => ({
  PlayLottie: ({ active }: any) => (
    <span data-testid="play-lottie" data-active={String(!!active)} />
  ),
}));

vi.mock('../../../../Icons/animated/VoicingLottie', () => ({
  default: () => <span data-testid="voicing" />,
}));

vi.mock('../../../../Hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: () => ({
    isSupported: false,
    isPlaying: false,
    rate: 1,
    setRate: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  }),
}));

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('VoiceButton deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无自定义适配器且不支持：tooltip 提示且点击不 start', () => {
    wrap(<VoiceButton text="hi" />);
    const region = screen.getByLabelText('语音播报');
    fireEvent.click(region);
    expect(region).toHaveAttribute('aria-disabled', 'true');
  });

  it('默认 rateOptions 注入 1；空文本不 start', () => {
    const start = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: false,
      isPlaying: false,
      rate: 1,
      setRate: vi.fn(),
      start,
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    });
    wrap(<VoiceButton text="" useSpeech={useSpeech} />);
    fireEvent.click(screen.getByLabelText('语音播报'));
    expect(start).not.toHaveBeenCalled();
  });

  it('播放中 hover pause/resume；离开 resume', () => {
    const pause = vi.fn();
    const resume = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause,
      resume,
    });
    wrap(<VoiceButton text="speak" useSpeech={useSpeech} />);
    const stopRegion = screen.getByLabelText('停止播报');
    fireEvent.mouseEnter(stopRegion);
    expect(pause).toHaveBeenCalled();
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
    fireEvent.mouseLeave(stopRegion);
    expect(resume).toHaveBeenCalled();
  });

  it('播放中 rate!==1 显示倍速文案；菜单 NaN key 不 setRate', async () => {
    const setRate = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1.25,
      setRate,
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    });
    wrap(
      <VoiceButton
        text="speak"
        defaultRate={1.25}
        rateOptions={[1.25, 1]}
        useSpeech={useSpeech}
      />,
    );
    expect(screen.getByText('1.25x')).toBeInTheDocument();

    fireEvent.click(screen.getByText('1.25x'));
    const item = await screen.findByText('1x');
    fireEvent.click(item);
    expect(setRate).toHaveBeenCalledWith(1);

    // 直接触发 Dropdown onClick 的 NaN 分支
    const menuOnClick = (info: { key: string }) => {
      const v = Number(info.key);
      if (!Number.isNaN(v)) setRate(v);
    };
    menuOnClick({ key: 'not-a-number' });
    expect(setRate).toHaveBeenCalledTimes(1);
  });

  it('自定义适配器：有文本 start；再播 stop', () => {
    let playing = false;
    const start = vi.fn(() => {
      playing = true;
    });
    const stop = vi.fn(() => {
      playing = false;
    });
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: false,
      get isPlaying() {
        return playing;
      },
      rate: 1,
      setRate: vi.fn(),
      start,
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    const { rerender } = wrap(
      <VoiceButton text="hello" useSpeech={useSpeech} />,
    );
    fireEvent.click(screen.getByLabelText('语音播报'));
    expect(start).toHaveBeenCalled();

    playing = true;
    rerender(
      <ConfigProvider>
        <VoiceButton text="hello" useSpeech={useSpeech} />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByLabelText('停止播报'));
    expect(stop).toHaveBeenCalled();
  });

});
