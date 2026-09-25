/**
 * TextAnimate deepen2：数字 children、空串跳过、mix、非字符串 accessible、空 segments。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TextAnimate, resolveSegments } from '../index';

describe('TextAnimate deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('resolveSegments：number / 空串跳过 / mix / 元素 children', () => {
    expect(resolveSegments(42, 'character')).toEqual(['4', '2']);
    expect(resolveSegments(['', 'ab'], 'character')).toEqual(['a', 'b']);
    expect(resolveSegments('z', 'mix' as any)).toEqual(['z']);
    const el = <span key="k">n</span>;
    expect(resolveSegments([el, ' x'], 'word')).toEqual(
      expect.arrayContaining([el]),
    );
  });

  it('空 children：stagger=0；accessible 非字符串无 aria-label', () => {
    render(
      <ConfigProvider>
        <TextAnimate startOnView={false} by="word" accessible>
          {''}
        </TextAnimate>
      </ConfigProvider>,
    );
    const root = screen.getByTestId('ant-text-animate');
    // 空字符串仍是 string，aria-label 为 ''
    expect(root.getAttribute('aria-label')).toBe('');
    expect(root.querySelectorAll('[data-animation]').length).toBe(0);

    cleanup();
    render(
      <ConfigProvider>
        <TextAnimate startOnView={false} by="word" accessible>
          <span>ns</span>
        </TextAnimate>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ant-text-animate')).not.toHaveAttribute(
      'aria-label',
    );
  });

  it('数字 children + variants 自定义 stagger 路径', () => {
    render(
      <ConfigProvider>
        <TextAnimate
          startOnView={false}
          by="character"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          accessible={false}
        >
          {12}
        </TextAnimate>
      </ConfigProvider>,
    );
    const root = screen.getByTestId('ant-text-animate');
    expect(root.querySelector('[data-animation="custom"]')).toBeTruthy();
    expect(root.querySelectorAll('[data-animation]').length).toBe(2);
  });

  it('React 元素 children：itemKey 走 element.key', () => {
    render(
      <ConfigProvider>
        <TextAnimate startOnView={false} by="text" animation="slideUp">
          <em key="em">emph</em>
        </TextAnimate>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ant-text-animate')).toBeInTheDocument();
    expect(
      screen.getByTestId('ant-text-animate').querySelector('[data-animation]'),
    ).toHaveAttribute('data-animation', 'slideUp');
  });
});
