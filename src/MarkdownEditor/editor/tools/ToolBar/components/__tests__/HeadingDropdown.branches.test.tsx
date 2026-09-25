/**
 * HeadingDropdown：hideTools、locale 回退、Text 等级。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HeadingDropdown } from '../HeadingDropdown';

describe('HeadingDropdown branches', () => {
  it('hideTools 过滤 H1', () => {
    render(
      <HeadingDropdown
        baseClassName="tb"
        i18n={{ locale: { largeTitle: '大标题', bodyText: '正文' } }}
        node={[{ level: 2 }]}
        hideTools={['H1']}
        onHeadingChange={vi.fn()}
      />,
    );
    expect(screen.getByText('paragraphTitle')).toBeTruthy();
  });

  it('locale 缺失时回退 key；无 level 用 Text', () => {
    render(
      <HeadingDropdown
        baseClassName="tb"
        i18n={{ locale: {} }}
        node={[{}]}
        onHeadingChange={vi.fn()}
      />,
    );
    expect(screen.getByText('bodyText')).toBeTruthy();
  });

  it('有 level 时显示对应文案', () => {
    render(
      <HeadingDropdown
        baseClassName="tb"
        i18n={{
          locale: {
            largeTitle: 'H1文案',
            heading: '标题',
          },
        }}
        node={[{ level: 1 }]}
        onHeadingChange={vi.fn()}
      />,
    );
    expect(screen.getByText('H1文案')).toBeTruthy();
  });

  it.skip('heading title 回退默认中文', () => {
    render(
      <HeadingDropdown
        baseClassName="tb"
        i18n={{}}
        node={null}
        onHeadingChange={vi.fn()}
      />,
    );
    expect(screen.getByTitle('标题')).toBeTruthy();
  });
});
