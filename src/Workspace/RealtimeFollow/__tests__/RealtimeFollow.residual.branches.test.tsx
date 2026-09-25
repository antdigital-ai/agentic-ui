/**
 * RealtimeFollow 残留：getContentForEditor / shouldUpdateEditor / 渲染。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  getContentForEditor,
  RealtimeFollow,
  shouldUpdateEditor,
} from '../index';

vi.mock('../style', () => ({
  useRealtimeFollowStyle: () => ({ hashId: 'h' }),
}));

describe('RealtimeFollow residual branches', () => {
  it('getContentForEditor：html 包装 / 其它原样 / 非字符串', () => {
    expect(getContentForEditor('html', '<div/>')).toContain('```html');
    expect(getContentForEditor('markdown', '# x')).toBe('# x');
    expect(getContentForEditor('shell', undefined)).toBe('undefined');
  });

  it('shouldUpdateEditor 矩阵', () => {
    expect(shouldUpdateEditor('shell', 'preview')).toBe(true);
    expect(shouldUpdateEditor('markdown', 'preview')).toBe(true);
    expect(shouldUpdateEditor('md', 'code')).toBe(true);
    expect(shouldUpdateEditor('html', 'code')).toBe(true);
    expect(shouldUpdateEditor('html', 'preview')).toBe(false);
    expect(shouldUpdateEditor('diff' as any, 'preview')).toBe(false);
  });

  it('shell / markdown / html 渲染', () => {
    const { rerender } = render(
      <ConfigProvider>
        <RealtimeFollow
          data={{ type: 'shell', content: 'echo 1', status: 'done' }}
        />
      </ConfigProvider>,
    );
    expect(document.body.textContent).toMatch(/echo/);

    rerender(
      <ConfigProvider>
        <RealtimeFollow
          data={{ type: 'markdown', content: 'hello', status: 'running' }}
        />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider>
        <RealtimeFollow
          data={{ type: 'html', content: '<b>x</b>', status: 'done' }}
          htmlViewMode="code"
        />
      </ConfigProvider>,
    );
    expect(document.body).toBeTruthy();
  });
});
