/**
 * WelcomeMessage 残留：空 title、typing、description。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../../Components/TypingAnimation', () => ({
  TypingAnimation: ({ children }: any) => (
    <span data-testid="typing">{children}</span>
  ),
}));

vi.mock('../../Components/TextAnimate', () => ({
  TextAnimate: ({ children }: any) => (
    <span data-testid="text-animate">{children}</span>
  ),
}));

import { WelcomeMessage } from '../index';

describe('WelcomeMessage residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('title + description', () => {
    render(
      <ConfigProvider>
        <WelcomeMessage title="Hello" description="desc text" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('typing')).toHaveTextContent('Hello');
    expect(screen.getByTestId('text-animate')).toHaveTextContent('desc text');
  });

  it('空 description / className', () => {
    render(
      <ConfigProvider>
        <WelcomeMessage title="T" rootClassName="wm" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('typing')).toHaveTextContent('T');
  });
});
