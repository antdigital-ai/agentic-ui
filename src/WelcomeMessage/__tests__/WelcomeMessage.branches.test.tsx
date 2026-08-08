/**
 * WelcomeMessage 分支：title/description 有无、classNames/styles、rootClassName。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WelcomeMessage } from '../index';

vi.mock('../../Components/TypingAnimation', () => ({
  TypingAnimation: ({ children, className, style, ...rest }: any) => (
    <div
      data-testid="typing"
      className={className}
      style={style}
      data-loop={String(!!rest.loop)}
    >
      {children}
    </div>
  ),
}));

vi.mock('../../Components/TextAnimate', () => ({
  TextAnimate: ({ children, className, style, animation }: any) => (
    <div
      data-testid="text-animate"
      className={className}
      style={style}
      data-animation={animation}
    >
      {children}
    </div>
  ),
}));

describe('WelcomeMessage 分支覆盖', () => {
  it('无 title/description 时只渲染根节点', () => {
    render(
      <ConfigProvider>
        <WelcomeMessage />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ant-agentic-welcome')).toBeInTheDocument();
    expect(screen.queryByTestId('typing')).not.toBeInTheDocument();
    expect(screen.queryByTestId('text-animate')).not.toBeInTheDocument();
  });

  it('仅 title', () => {
    render(
      <ConfigProvider>
        <WelcomeMessage title="你好" titleAnimateProps={{ loop: true }} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('typing')).toHaveTextContent('你好');
    expect(screen.getByTestId('typing')).toHaveAttribute('data-loop', 'true');
  });

  it('仅 description', () => {
    render(
      <ConfigProvider>
        <WelcomeMessage
          description="描述"
          descriptionAnimateProps={{ animation: 'fadeIn' as any }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('text-animate')).toHaveTextContent('描述');
  });

  it('classNames / styles / rootClassName 合并', () => {
    render(
      <ConfigProvider>
        <WelcomeMessage
          title="T"
          description="D"
          rootClassName="deprecated-root"
          classNames={{
            root: 'root-cls',
            title: 'title-cls',
            description: 'desc-cls',
          }}
          styles={{
            root: { padding: 8 },
            title: { color: 'red' },
            description: { color: 'blue' },
          }}
          style={{ margin: 4 }}
        />
      </ConfigProvider>,
    );
    const root = screen.getByTestId('ant-agentic-welcome');
    expect(root).toHaveClass('root-cls');
    expect(root).toHaveClass('deprecated-root');
    expect(screen.getByTestId('typing')).toHaveClass('title-cls');
    expect(screen.getByTestId('text-animate')).toHaveClass('desc-cls');
  });
});
