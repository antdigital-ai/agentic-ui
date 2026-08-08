/**
 * VoiceInputButton 分支覆盖：录音态、title、disabled、locale 与点击回调。
 */
import '@testing-library/jest-dom';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { VoiceInputButton } from '../VoiceInput';

const renderVoiceButton = (
  props: Partial<React.ComponentProps<typeof VoiceInputButton>> = {},
  locale?: Record<string, string>,
) => {
  const onStart = vi.fn().mockResolvedValue(undefined);
  const onStop = vi.fn().mockResolvedValue(undefined);

  const result = render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <VoiceInputButton
          recording={false}
          onStart={onStart}
          onStop={onStop}
          {...props}
        />
      </I18nContext.Provider>
    </ConfigProvider>,
  );

  return { ...result, onStart, onStop };
};

describe('VoiceInputButton 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('未录音且无 title 时渲染 Mic 图标', () => {
    renderVoiceButton();
    expect(screen.getByTestId('voice-input-button')).toBeInTheDocument();
    expect(screen.getByTestId('voice-input-button')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('录音中且无 title 时 aria-pressed 为 true', () => {
    renderVoiceButton({ recording: true });
    expect(screen.getByTestId('voice-input-button')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('带 title 时展示标题文案', () => {
    renderVoiceButton({ title: '按住说话' });
    expect(screen.getByText('按住说话')).toBeInTheDocument();
  });

  it('disabled 时点击不触发 onStart/onStop', () => {
    const { onStart, onStop } = renderVoiceButton({ disabled: true });
    fireEvent.click(screen.getByTestId('voice-input-button'));
    expect(onStart).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });

  it('未录音时点击触发 onStart', async () => {
    const { onStart } = renderVoiceButton();
    fireEvent.click(screen.getByTestId('voice-input-button'));
    await waitFor(() => expect(onStart).toHaveBeenCalledTimes(1));
  });

  it('录音中点击触发 onStop', async () => {
    const { onStop } = renderVoiceButton({ recording: true });
    fireEvent.click(screen.getByTestId('voice-input-button'));
    await waitFor(() => expect(onStop).toHaveBeenCalledTimes(1));
  });

  describe('tooltip locale 分支', () => {
    it('未录音时使用 locale 默认 tooltip 文案', async () => {
      renderVoiceButton({}, { 'input.voiceInput': 'Voice input' });
      fireEvent.mouseEnter(screen.getByTestId('voice-input-button'));
      expect(
        await screen.findByText('Voice input', {}, { timeout: 2000 }),
      ).toBeInTheDocument();
    });

    it('录音中使用 locale 停止提示文案', async () => {
      renderVoiceButton(
        { recording: true },
        { 'input.voiceInputting': 'Stop voice input' },
      );
      fireEvent.mouseEnter(screen.getByTestId('voice-input-button'));
      expect(
        await screen.findByText('Stop voice input', {}, { timeout: 2000 }),
      ).toBeInTheDocument();
    });

    it('无 locale 时回退中文默认 tooltip', async () => {
      render(
        <ConfigProvider>
          <I18nContext.Provider value={{ locale: undefined, language: 'zh-CN' }}>
            <VoiceInputButton
              recording={false}
              onStart={vi.fn()}
              onStop={vi.fn()}
            />
          </I18nContext.Provider>
        </ConfigProvider>,
      );
      fireEvent.mouseEnter(screen.getByTestId('voice-input-button'));
      expect(
        await screen.findByText('语音输入', {}, { timeout: 2000 }),
      ).toBeInTheDocument();
    });
  });

  it('recording 样式类名在录音态生效', () => {
    const { container } = renderVoiceButton({ recording: true });
    const btn = container.querySelector('[data-testid="voice-input-button"]');
    expect(btn?.className).toMatch(/-recording/);
  });

  it('disabled 样式类名在禁用态生效', () => {
    const { container } = renderVoiceButton({ disabled: true });
    const btn = container.querySelector('[data-testid="voice-input-button"]');
    expect(btn?.className).toMatch(/-disabled/);
  });
});
