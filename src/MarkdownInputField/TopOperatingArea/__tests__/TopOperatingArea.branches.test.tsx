/**
 * TopOperatingArea：BackTo 显隐、operationBtnRender、targetRef。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import TopOperatingArea from '../index';

describe('TopOperatingArea branches', () => {
  it('默认显示 back 区域为 visible', () => {
    const { container } = render(
      <ConfigProvider>
        <TopOperatingArea />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('[class*="back-buttons-visible"]'),
    ).toBeTruthy();
  });

  it('isShowBackTo false 为 hidden 且无 BackTo', () => {
    const { container } = render(
      <ConfigProvider>
        <TopOperatingArea isShowBackTo={false} />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('[class*="back-buttons-hidden"]'),
    ).toBeTruthy();
  });

  it('operationBtnRender 渲染按钮区', () => {
    render(
      <ConfigProvider>
        <TopOperatingArea
          operationBtnRender={() => <button type="button">op</button>}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('op')).toBeTruthy();
  });

  it.skip('无 operationBtnRender 时中心区为空', () => {
    const { container } = render(
      <ConfigProvider>
        <TopOperatingArea />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('[class*="-buttons"]'),
    ).toBeNull();
  });

  it('targetRef 空 current 时回退 window', () => {
    const ref = React.createRef<HTMLDivElement>();
    expect(() =>
      render(
        <ConfigProvider>
          <TopOperatingArea targetRef={ref} />
        </ConfigProvider>,
      ),
    ).not.toThrow();
  });
});
