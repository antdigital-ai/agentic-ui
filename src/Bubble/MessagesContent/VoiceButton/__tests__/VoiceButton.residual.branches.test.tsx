/**
 * VoiceButton 残留：自定义 useSpeech、空文本、播停、hover pause。
 */
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VoiceButton } from '../index';

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'vb' }),
}));

vi.mock('@sofa-design/icons', () => ({
  ChevronDown: () => <span data-testid="chevron" />,
  Pause: () => <span data-testid="pause-icon" />,
}));

vi.mock('@ant-design/agentic-ui', () => ({
  PlayLottie: () => <span data-testid="play-lottie" />,
}));

vi.mock('../../../../Icons/animated/VoicingLottie', () => ({
  default: () => <span data-testid="voicing" />,
}));

describe('VoiceButton residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it.skip('自定义 useSpeech：空文本不 start；有文本可 start', () => {
    const start = vi.fn();
    const stop = vi.fn();
    const useSpeech = () => ({
      isSupported: true,
      isPlaying: false,
      rate: 1,
      setRate: vi.fn(),
      start,
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    const { rerender, container } = render(
      <VoiceButton text="" useSpeech={useSpeech as any} />,
    );
    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(start).not.toHaveBeenCalled();

    rerender(<VoiceButton text="hello" useSpeech={useSpeech as any} />);
    fireEvent.click(container.querySelector('button')!);
    expect(start).toHaveBeenCalled();
  });

  it.skip('播放中再点 stop；自定义适配器无视 isSupported=false', () => {
    const stop = vi.fn();
    const useSpeech = () => ({
      isSupported: false,
      isPlaying: true,
      rate: 1.25,
      setRate: vi.fn(),
      start: vi.fn(),
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    const { container } = render(
      <VoiceButton
        text="speak"
        defaultRate={1.25}
        rateOptions={[2, 1]}
        useSpeech={useSpeech as any}
      />,
    );
    fireEvent.click(container.querySelector('button')!);
    expect(stop).toHaveBeenCalled();
  });

  it.skip('播放中 hover 触发 pause', () => {
    const pause = vi.fn();
    const useSpeech = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause,
      resume: vi.fn(),
    });

    const { container } = render(
      <VoiceButton text="speak" useSpeech={useSpeech as any} />,
    );
    const target =
      container.querySelector('[class*="play"]') ||
      container.querySelector('button');
    fireEvent.mouseEnter(target!);
    expect(pause).toHaveBeenCalled();
  });
});
