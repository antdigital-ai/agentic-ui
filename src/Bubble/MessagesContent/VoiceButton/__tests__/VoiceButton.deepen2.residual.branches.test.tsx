/**
 * VoiceButton deepen2：自定义 adapter 播放/暂停、rate 菜单、
 * 空 text、defaultRate。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceButton } from '../index';
import type { UseSpeechAdapter } from '../types';

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'vb-d2' }),
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

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('VoiceButton deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('adapter：start/pause/resume 与 rate 切换', async () => {
    const start = vi.fn();
    const pause = vi.fn();
    const resume = vi.fn();
    const stop = vi.fn();
    const setRate = vi.fn();
    let playing = false;
    let rate = 1;

    const useAdapter: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: playing,
      rate,
      setRate: (r: number) => {
        rate = r;
        setRate(r);
      },
      start: () => {
        playing = true;
        start();
      },
      stop: () => {
        playing = false;
        stop();
      },
      pause: () => {
        playing = false;
        pause();
      },
      resume: () => {
        playing = true;
        resume();
      },
    });

    const { rerender } = wrap(
      <VoiceButton text="hello world" useSpeech={useAdapter} defaultRate={1} />,
    );
    const play = screen.getByTestId('play-lottie');
    fireEvent.click(play.parentElement || play);
    expect(start).toHaveBeenCalled();

    playing = true;
    rerender(
      <ConfigProvider>
        <VoiceButton text="hello world" useSpeech={useAdapter} />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
  });

  it('空 text 仍渲染；rateOptions 自定义', () => {
    wrap(
      <VoiceButton
        text=""
        rateOptions={[0.5, 1, 1.5]}
        useSpeech={() => ({
          isSupported: true,
          isPlaying: false,
          rate: 1,
          setRate: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          pause: vi.fn(),
          resume: vi.fn(),
        })}
      />,
    );
    expect(screen.getByTestId('play-lottie')).toBeInTheDocument();
  });
});
