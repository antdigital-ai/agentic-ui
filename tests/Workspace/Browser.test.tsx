import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import Browser, {
  BrowserList,
  type BrowserItem,
  type BrowserSuggestion,
} from '../../src/Workspace/Browser';

describe('BrowserList Component', () => {
  const mockLocale = {
    'browser.noResults': '暂无结果',
    'browser.totalResults': '共${count}个结果',
    'browser.searching': '搜索中...',
  } as any;

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
          {ui}
        </I18nContext.Provider>
      </ConfigProvider>,
    );
  };

  const mockItems: BrowserItem[] = [
    {
      id: '1',
      title: '结果标题1',
      site: 'example.com',
      url: 'https://example.com',
    },
    {
      id: '2',
      title: '结果标题2',
      site: 'foo.bar',
      url: 'https://foo.bar',
    },
  ];

  it('应该正确渲染结果列表和计数标签', () => {
    renderWithProvider(<BrowserList items={mockItems} activeLabel="搜索A" />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(screen.getByText('结果标题1')).toBeInTheDocument();
    expect(screen.getByText('结果标题2')).toBeInTheDocument();
    // 默认计数文案
    expect(screen.getByText('共2个结果')).toBeInTheDocument();
  });

  it('点击站点信息时应通过 window.open 打开链接', async () => {
    const user = userEvent.setup();
    const openSpy = vi
      .spyOn(window, 'open')
      // jsdom 中不需要真正打开窗口
      .mockImplementation(() => null as any);

    renderWithProvider(<BrowserList items={mockItems} activeLabel="搜索站点" />);

    await user.click(screen.getByText('example.com'));

    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );

    openSpy.mockRestore();
  });

  it('应该使用自定义计数格式化函数', () => {
    renderWithProvider(
      <BrowserList
        items={mockItems}
        activeLabel="搜索B"
        countFormatter={(count) => `共 ${count} 条`}
      />,
    );

    expect(screen.getByText('共 2 条')).toBeInTheDocument();
  });

  it('应该在 showHeader = false 时不渲染头部', () => {
    const { container } = renderWithProvider(
      <BrowserList items={mockItems} activeLabel="搜索C" showHeader={false} />,
    );

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    const headerWrapper = container.querySelector(
      '.ant-browser-header-wrapper',
    );
    expect(headerWrapper).toBeInTheDocument();
    // 关闭头部时不应该渲染具体的头部内容
    expect(
      container.querySelector('.ant-browser-header'),
    ).not.toBeInTheDocument();
  });

  it('应该支持自定义头部内容', () => {
    renderWithProvider(
      <BrowserList
        items={mockItems}
        activeLabel="搜索D"
        customHeader={<div data-testid="custom-header">自定义头部</div>}
      />,
    );

    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  it('应该在加载时显示加载文案', () => {
    renderWithProvider(
      <BrowserList
        items={[]}
        activeLabel="搜索E"
        loading
        loadingText="加载中"
      />,
    );

    expect(screen.getByText('加载中')).toBeInTheDocument();
  });

  it('应该在没有结果时显示空状态文案', () => {
    renderWithProvider(
      <BrowserList items={[]} activeLabel="搜索F" emptyText="没有找到结果" />,
    );

    expect(screen.getByText('没有找到结果')).toBeInTheDocument();
  });

  it('在缺少 items 时也不应该抛异常', () => {
    // @ts-expect-error 测试运行时健壮性
    renderWithProvider(<BrowserList activeLabel="搜索G" />);

    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
  });
});

describe('Browser Component', () => {
  const mockLocale = {
    'browser.noResults': '暂无结果',
    'browser.totalResults': '共${count}个结果',
    'browser.searching': '搜索中...',
  } as any;

  const renderBrowserWithProvider = (ui: React.ReactElement) => {
    return render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
          {ui}
        </I18nContext.Provider>
      </ConfigProvider>,
    );
  };

  const createSuggestions = (): BrowserSuggestion[] => [
    {
      id: 's1',
      label: '搜索建议1',
      count: 2,
    },
  ];

  it('点击搜索建议后应展示结果列表', async () => {
    const user = userEvent.setup();
    const suggestions = createSuggestions();

    const request = vi.fn().mockReturnValue({
      items: [
        {
          id: '1',
          title: '结果标题1',
          site: 'example.com',
          url: 'https://example.com',
        },
      ] satisfies BrowserItem[],
      loading: false,
    });

    renderBrowserWithProvider(
      <Browser
        suggestions={suggestions}
        request={request}
        suggestionIcon={null}
      />,
    );

    expect(screen.getByText('搜索建议1')).toBeInTheDocument();

    await user.click(screen.getByText('搜索建议1'));

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(suggestions[0]);
    expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    expect(screen.getByText('结果标题1')).toBeInTheDocument();
  });

  it('在结果视图中点击返回按钮应回到搜索建议视图', async () => {
    const user = userEvent.setup();
    const suggestions = createSuggestions();

    const request = vi.fn().mockReturnValue({
      items: [
        {
          id: '1',
          title: '结果标题1',
          site: 'example.com',
          url: 'https://example.com',
        },
      ] satisfies BrowserItem[],
      loading: false,
    });

    renderBrowserWithProvider(
      <Browser
        suggestions={suggestions}
        request={request}
        suggestionIcon={null}
      />,
    );

    await user.click(screen.getByText('搜索建议1'));

    const backButton = screen.getByRole('button');
    await user.click(backButton);

    expect(screen.getByText('搜索建议1')).toBeInTheDocument();
  });
});
