/**
 * SendButton 分支覆盖：typing/禁用/可发送/自定义色/onInit/tooltip。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { resolveSendDisabled, SendButton } from '../SendButton';

describe('resolveSendDisabled branches', () => {
  it('显式 disabled 优先', () => {
    expect(resolveSendDisabled({ disabled: true }, 'done')).toBe(true);
    expect(resolveSendDisabled({ disabled: false }, 'uploading')).toBe(false);
  });

  it('未传 disabled 时 uploading 视为禁用', () => {
    expect(resolveSendDisabled(undefined, 'uploading')).toBe(true);
    expect(resolveSendDisabled(undefined, 'done')).toBe(false);
  });
});

describe('SendButton branches', () => {
  const wrap = (ui: React.ReactElement) =>
    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: { send: '发送', stop: '停止' }, language: 'zh-CN' } as any}
        >
          {ui}
        </I18nContext.Provider>
      </ConfigProvider>,
    );

  it('挂载时调用 onInit', () => {
    const onInit = vi.fn();
    wrap(
      <SendButton
        isSendable
        typing={false}
        onClick={vi.fn()}
        onInit={onInit}
      />,
    );
    expect(onInit).toHaveBeenCalled();
  });

  it('可发送态点击触发 onClick', () => {
    const onClick = vi.fn();
    wrap(
      <SendButton isSendable typing={false} onClick={onClick} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('disabled 时不触发 onClick', () => {
    const onClick = vi.fn();
    wrap(
      <SendButton
        isSendable
        disabled
        typing={false}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('typing 态渲染停止图标仍可点击', () => {
    const onClick = vi.fn();
    wrap(<SendButton isSendable typing onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('不可发送弱态', () => {
    wrap(
      <SendButton isSendable={false} typing={false} onClick={vi.fn()} />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('自定义 colors 与 compact', () => {
    wrap(
      <SendButton
        isSendable
        typing={false}
        onClick={vi.fn()}
        compact
        colors={{
          icon: '#111',
          iconHover: '#222',
          background: '#333',
          backgroundHover: '#444',
        }}
        style={{ margin: 4 }}
        triggerSendKey="Mod+Enter"
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('无 locale 时仍渲染', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'en-US' } as any}>
          <SendButton isSendable typing={false} onClick={vi.fn()} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
