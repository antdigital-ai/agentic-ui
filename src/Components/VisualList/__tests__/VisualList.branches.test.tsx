/**
 * VisualList：filter 空、loading、无 src、emptyRender、circle。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { VisualList } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('VisualList branches', () => {
  it('filter 后为空走 emptyRender', () => {
    wrap(
      <VisualList
        data={[{ id: '1', src: 'a.png' }]}
        filter={() => false}
        emptyRender={() => <span>empty-x</span>}
      />,
    );
    expect(screen.getByText('empty-x')).toBeTruthy();
  });

  it('无 src 显示默认图标', () => {
    const { container } = wrap(
      <VisualList data={[{ id: '1', src: '' }]} shape="circle" />,
    );
    expect(container.querySelector('[data-type="image"]')).toBeTruthy();
  });

  it('loading / isLoading 渲染 loadingRender', () => {
    wrap(
      <VisualList
        data={[]}
        isLoading
        loadingRender={() => <span>ld</span>}
      />,
    );
    expect(screen.getByText('ld')).toBeTruthy();
  });

  it('img onError 切到默认图标', () => {
    const { container } = wrap(
      <VisualList
        data={[{ id: '1', src: 'https://x/bad.png', title: 't' }]}
      />,
    );
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    fireEvent.error(img!);
    expect(container.querySelector('[data-type="image"]')).toBeTruthy();
  });

  it('deprecated loading 仍生效', () => {
    wrap(
      <VisualList
        data={[]}
        loading
        loadingRender={() => <span>legacy-ld</span>}
      />,
    );
    expect(screen.getByText('legacy-ld')).toBeTruthy();
  });

  it('空 data 且无 loading；自定义 className', () => {
    const { container } = wrap(
      <VisualList data={[]} className="vl-x" emptyRender={() => <span>empty</span>} />,
    );
    expect(screen.getByText('empty')).toBeTruthy();
    expect(container.querySelector('.vl-x')).toBeTruthy();
  });
});
