import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FncLeaf } from '../index';
import { isMobileDevice } from '../../../../../MarkdownInputField/AttachmentButton/utils';

vi.mock('../../../../../MarkdownInputField/AttachmentButton/utils', () => ({
  isMobileDevice: vi.fn(),
}));

describe('FncLeaf', () => {
  const defaultProps = {
    attributes: { 'data-slate-leaf': true },
    children: <span>text</span>,
    leaf: { text: '[^doc]: ref', fnc: true, identifier: 'doc-1' },
    fncProps: {},
    linkConfig: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isMobileDevice).mockReturnValue(false);
  });

  it('移动端且 hasFnc 时点击应 preventDefault 并 return', () => {
    vi.mocked(isMobileDevice).mockReturnValue(true);
    const { container } = render(
      <ConfigProvider>
        <FncLeaf {...defaultProps} />
      </ConfigProvider>,
    );
    const span = container.querySelector('[data-fnc="fnc"]');
    expect(span).toBeTruthy();
    fireEvent.click(span!);
    expect(span).toBeInTheDocument();
  });

  it('linkConfig.onClick 返回 false 时应 return false', () => {
    const onClick = vi.fn(() => false);
    const { container } = render(
      <ConfigProvider>
        <FncLeaf
          {...defaultProps}
          leaf={{ ...defaultProps.leaf, url: 'https://example.com' }}
          linkConfig={{ onClick }}
        />
      </ConfigProvider>,
    );
    const span = container.querySelector('[data-fnc="fnc"]');
    fireEvent.click(span!);
    expect(onClick).toHaveBeenCalledWith('https://example.com');
  });

  it('openInNewTab 为 false 时应走 else 分支不调用 window.open', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(
      <ConfigProvider>
        <FncLeaf
          {...defaultProps}
          leaf={{ ...defaultProps.leaf, url: 'https://example.com' }}
          linkConfig={{ openInNewTab: false }}
        />
      </ConfigProvider>,
    );
    const span = container.querySelector('[data-fnc="fnc"]');
    fireEvent.click(span!);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('ConfigProvider 包装下 openInNewTab false 点击不打开新窗口', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <ConfigProvider>
        <FncLeaf
          {...defaultProps}
          leaf={{ ...defaultProps.leaf, url: 'https://a.com' }}
          linkConfig={{ openInNewTab: false }}
        />
      </ConfigProvider>,
    );
    const span = document.querySelector('[data-fnc="fnc"]');
    fireEvent.click(span!);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
