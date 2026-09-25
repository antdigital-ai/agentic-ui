/**
 * Loading：size 默认与 nested pattern 分支。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Loading } from '../Loading';

describe('Loading branches', () => {
  it.skip('省略 size 且无 children 时使用 1em', () => {
    render(
      <ConfigProvider prefixCls="ant">
        <Loading />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ant-loading')).toHaveStyle({ fontSize: '1em' });
  });

  it('省略 size 且有 children 时使用 nested 默认 32', () => {
    render(
      <ConfigProvider prefixCls="ant">
        <Loading spinning>
          <div>child</div>
        </Loading>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ant-loading')).toHaveStyle({ fontSize: '32px' });
  });

  it('提供 size 时优先使用 size', () => {
    render(
      <ConfigProvider prefixCls="ant">
        <Loading size={64} spinning>
          <div>child</div>
        </Loading>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ant-loading')).toHaveStyle({ fontSize: '64px' });
  });
});
