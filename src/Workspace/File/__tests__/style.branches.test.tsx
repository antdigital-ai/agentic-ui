import { render } from '@testing-library/react';
import { ConfigProvider, theme } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useFileStyle } from '../style';

const Probe: React.FC<{ prefix?: string }> = ({ prefix }) => {
  const { hashId } = useFileStyle(prefix);
  return <div data-testid="style-probe" data-hash={hashId || 'empty'} />;
};

describe('Workspace File style 分支覆盖', () => {
  it('默认 prefixCls WorkspaceFile', () => {
    const { getByTestId } = render(
      <ConfigProvider>
        <Probe />
      </ConfigProvider>,
    );
    expect(getByTestId('style-probe')).toBeTruthy();
  });

  it('自定义 prefixCls', () => {
    const { getByTestId } = render(
      <ConfigProvider>
        <Probe prefix="custom-file" />
      </ConfigProvider>,
    );
    expect(getByTestId('style-probe').getAttribute('data-hash')).toBeTruthy();
  });

  it('token 缺少 tertiary 时走 || 回退臂', () => {
    const { getByTestId } = render(
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorTextTertiary: undefined as any,
            colorBorderSecondary: undefined as any,
            colorFillTertiary: undefined as any,
            borderRadiusSM: undefined as any,
            marginXS: undefined as any,
          },
        }}
      >
        <Probe />
      </ConfigProvider>,
    );
    expect(getByTestId('style-probe')).toBeTruthy();
  });

  it('token 提供 tertiary 命中真值臂', () => {
    const { getByTestId } = render(
      <ConfigProvider
        theme={{
          token: {
            colorTextTertiary: '#999',
            colorBorderSecondary: '#eee',
            colorFillTertiary: '#f5f5f5',
            borderRadiusSM: 2,
            marginXS: 4,
          },
        }}
      >
        <Probe />
      </ConfigProvider>,
    );
    expect(getByTestId('style-probe')).toBeTruthy();
  });
});
