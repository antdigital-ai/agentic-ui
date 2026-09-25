/**
 * DocCards deepen residual：空 title 列降级、cardColumns 非法、无 i18n、空 title 行。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { DocCards } from '../DocCards';

vi.mock('../DocCards/style', () => ({
  useStyle: () => ({ hashId: 'dc' }),
}));

const wrap = (ui: React.ReactElement, locale?: Record<string, string>) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider
        value={{ locale: locale as any, language: 'zh-CN' } as any}
      >
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('DocCards deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('无 title 列时空态默认文案；cardColumns NaN→1', () => {
    wrap(
      <DocCards
        columns={[{ dataIndex: 'url' }, { dataIndex: 'desc' }]}
        data={[{ url: 'https://a.com', desc: 'd' }]}
        cardColumns={Number.NaN}
        toolbar={<span data-testid="tb">T</span>}
      />,
    );
    expect(screen.getByTestId('doc-cards-empty')).toHaveTextContent('卡片列表');
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('有 title 列；空 title 行不渲染 h3；无 i18n 标签默认文案', () => {
    wrap(
      <DocCards
        title="Docs"
        columns={[
          { dataIndex: 'title' },
          { dataIndex: 'url' },
          { dataIndex: 'tags' },
        ]}
        data={[
          { title: '', url: null, tags: 'a,b' },
          { title: 'Ok', url: 'https://ok.com', tags: '' },
        ]}
        cardColumns={9}
      />,
      undefined,
    );
    expect(screen.getByTestId('doc-cards-title')).toHaveTextContent('Docs');
    expect(screen.queryByTestId('doc-cards-item-0-title')).toBeNull();
    expect(screen.getByTestId('doc-cards-item-0-tags')).toHaveAttribute(
      'aria-label',
      '标签列表',
    );
    expect(screen.getByTestId('doc-cards-item-1-title')).toHaveTextContent('Ok');
  });

  it('locale.docCards / docCardsTags 覆盖默认', () => {
    wrap(
      <DocCards columns={[{ dataIndex: 'x' }]} data={[]} />,
      { docCards: 'EmptyCards', docCardsTags: 'TagList' },
    );
    expect(screen.getByTestId('doc-cards-empty')).toHaveTextContent('EmptyCards');
  });
});
