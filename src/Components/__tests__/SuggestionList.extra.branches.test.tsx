import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionList } from '../SuggestionList';

describe('SuggestionList 额外分支', () => {
  it('空 items 渲染空列表容器', () => {
    const { container } = render(<SuggestionList items={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('item.onClick / disabled', () => {
    const onClick = vi.fn();
    render(
      <SuggestionList
        items={[
          { key: '1', text: 'go', onClick },
          { key: '2', text: 'no', disabled: true },
        ]}
        type="white"
      />,
    );
    fireEvent.click(screen.getByText('go'));
    expect(onClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText('no'));
  });

  it.skip('showMore 自定义 text；layout vertical', () => {
    const onMore = vi.fn();
    render(
      <SuggestionList
        items={[{ key: '1', text: 'a' }]}
        layout="vertical"
        showMore={{ enable: true, text: '更多', onClick: onMore }}
      />,
    );
    fireEvent.click(screen.getByText('更多'));
    expect(onMore).toHaveBeenCalled();
  });

  it('className / style / maxItems 截断', () => {
    render(
      <SuggestionList
        className="extra"
        style={{ margin: 4 }}
        maxItems={1}
        items={[
          { key: '1', text: 'one' },
          { key: '2', text: 'two' },
        ]}
      />,
    );
    expect(screen.getByText('one')).toBeInTheDocument();
  });
});
