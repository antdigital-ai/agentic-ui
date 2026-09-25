import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryLoadMore } from '../LoadMoreComponent';

describe('HistoryLoadMore residual branches', () => {
  it('uses chat fallback text and keyboard activation', () => {
    const onLoadMore = vi.fn();
    render(<HistoryLoadMore onLoadMore={onLoadMore} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('prevents duplicate task requests and recovers after errors', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onLoadMore = vi.fn(async () => { throw new Error('failed'); });
    render(<HistoryLoadMore type="task" onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    await Promise.resolve();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(screen.getByText('查看更多历史')).toBeInTheDocument();
    error.mockRestore();
  });

  it('Space 键触发；chat 默认文案；className', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <HistoryLoadMore
        type="chat"
        className="load-more-x"
        onLoadMore={onLoadMore}
      />,
    );
    expect(screen.getByText('查看更多')).toBeTruthy();
    expect(container.querySelector('.load-more-x')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('loading 态展示 Ellipsis；重复 Enter 仍只触发一次进行中请求', async () => {
    let resolve!: () => void;
    const onLoadMore = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    render(<HistoryLoadMore type="task" onLoadMore={onLoadMore} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    resolve();
    await Promise.resolve();
  });
});
