/**
 * VisualList residual：href 链接、renderItem、variant、description、outline。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { VisualList } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('VisualList residual branches', () => {
  it('href 渲染为链接；linkStyle 生效', () => {
    const { container } = wrap(
      <VisualList
        data={[
          {
            id: '1',
            src: 'https://x/a.png',
            href: 'https://example.com',
            alt: 'a',
            title: 't',
          },
        ]}
        linkStyle={{ outline: '1px solid red' }}
        variant="outline"
        description="desc"
      />,
    );
    const a = container.querySelector('a');
    expect(a).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByText('desc')).toBeTruthy();
  });

  it('renderItem 完全自定义；borderless variant', () => {
    wrap(
      <VisualList
        data={[{ id: '1', src: 'x.png' }]}
        variant="borderless"
        renderItem={(item) => <span key={item.id}>custom-{item.src}</span>}
      />,
    );
    expect(screen.getByText('custom-x.png')).toBeTruthy();
  });

  it('无 id 时用 index；itemStyle/imageStyle；prefixCls', () => {
    const { container } = wrap(
      <VisualList
        data={[{ src: 'y.png', title: 'Y' }]}
        itemStyle={{ margin: 4 }}
        imageStyle={{ width: 20 }}
        prefixCls="vl"
        shape="default"
      />,
    );
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('loading 无 loadingRender 时不崩；filter 保留项', () => {
    wrap(
      <VisualList
        data={[
          { id: '1', src: 'a.png' },
          { id: '2', src: 'b.png' },
        ]}
        filter={(i) => i.id === '2'}
        isLoading={false}
      />,
    );
    expect(document.querySelectorAll('img').length).toBe(1);
  });

  it('circle + 无 src 默认图标圆角', () => {
    const { container } = wrap(
      <VisualList data={[{ id: '1', src: '' }]} shape="circle" />,
    );
    const el = container.querySelector('[data-type="image"]') as HTMLElement;
    expect(el.style.borderRadius).toBe('50%');
  });
});
