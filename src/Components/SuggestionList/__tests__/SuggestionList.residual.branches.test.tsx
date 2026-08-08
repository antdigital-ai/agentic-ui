/**
 * SuggestionList residual：layout/type/maxItems/disabled/async click。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionList } from '../index';

describe('SuggestionList residual prop matrix', () => {
  it('layout horizontal / type white / maxItems 截断', () => {
    const { container } = render(
      <ConfigProvider>
        <SuggestionList
          layout="horizontal"
          type="white"
          maxItems={1}
          items={[
            { key: '1', text: 'A' },
            { key: '2', text: 'B' },
          ]}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByText('B')).toBeNull();
    expect(container.querySelector('[class*="horizontal"]')).toBeTruthy();
  });

  it('disabled 项不触发；async onClick reject 被捕获', async () => {
    const onItemClick = vi.fn();
    const badClick = vi.fn(() =>
      Promise.reject(new Error('fail')).catch(() => undefined),
    );
    render(
      <ConfigProvider>
        <SuggestionList
          type="transparent"
          onItemClick={onItemClick}
          items={[
            { key: 'd', text: 'Disabled', disabled: true },
            { key: 'e', text: 'Async', onClick: badClick },
          ]}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Disabled'));
    expect(onItemClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Async'));
    await waitFor(() => expect(badClick).toHaveBeenCalled());
  });

  it('空 items / undefined items 不抛', () => {
    expect(() =>
      render(
        <ConfigProvider>
          <SuggestionList items={undefined} />
        </ConfigProvider>,
      ),
    ).not.toThrow();
    expect(() =>
      render(
        <ConfigProvider>
          <SuggestionList items={[]} layout="vertical" type="basic" />
        </ConfigProvider>,
      ),
    ).not.toThrow();
  });
});
