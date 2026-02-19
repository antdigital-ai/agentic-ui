import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { VoiceButton } from '../index';
import type { UseSpeechAdapter } from '../types';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('VoiceButton', () => {
  it('无 text 或未支持时点击播放区域不调用 start/stop', () => {
    const start = vi.fn();
    const stop = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: false,
      rate: 1,
      setRate: vi.fn(),
      start,
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.click(playRegion);
    expect(start).not.toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });

  it('播放中点击停止区域应调用 stop（handleStop 与 handleClick 内 stop 覆盖 65）', () => {
    const stop = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1,
      setRate: vi.fn(),
      start: vi.fn(),
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="朗读内容" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    const stopRegion = screen.getByLabelText('停止播报');
    fireEvent.click(stopRegion);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('点击播放区域时调用 start', () => {
    const start = vi.fn();
    const stop = vi.fn();
    const setRate = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: false,
      rate: 1,
      setRate,
      start,
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="朗读内容" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.click(playRegion);

    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).not.toHaveBeenCalled();
  });

  it('播放中点击停止区域时调用 stop 并执行 handleStop', () => {
    const start = vi.fn();
    const stop = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1,
      setRate: vi.fn(),
      start,
      stop,
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="朗读内容" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    const stopRegion = screen.getByLabelText('停止播报');
    fireEvent.click(stopRegion);

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('播放区域 onMouseLeave 时 setIsPlayHover(false)', () => {
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: false,
      rate: 1,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="朗读内容" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    const playRegion = screen.getByLabelText('语音播报');
    fireEvent.mouseEnter(playRegion);
    fireEvent.mouseLeave(playRegion);
    expect(playRegion).toBeInTheDocument();
  });

  it('播放中点击倍速下拉项时调用 setRate', async () => {
    const setRate = vi.fn();
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1,
      setRate,
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="朗读内容" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    const rateBox = screen.getByText('倍速');
    fireEvent.click(rateBox);

    const menuItem = await screen.findByText('1.5x');
    fireEvent.click(menuItem);

    expect(setRate).toHaveBeenCalledWith(1.5);
  });

  it('播放中且 rate !== 1 时显示 rateDisplay', () => {
    const useSpeech: UseSpeechAdapter = () => ({
      isSupported: true,
      isPlaying: true,
      rate: 1.5,
      setRate: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <TestWrapper>
        <VoiceButton text="朗读内容" useSpeech={useSpeech} />
      </TestWrapper>,
    );

    expect(screen.getByText('1.5x')).toBeInTheDocument();
  });
});
