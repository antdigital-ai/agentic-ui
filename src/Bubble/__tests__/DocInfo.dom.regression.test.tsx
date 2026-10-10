import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DocInfoList } from '../MessagesContent/DocInfo';

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="reference-preview">{content}</div>
  ),
}));

const options = Array.from({ length: 100 }, (_, index) => ({
  content: `Reference ${index}`,
  docMeta: { doc_name: `Document ${index}` },
}));

describe('DocInfoList DOM lifecycle', () => {
  it('mounts reference rows only while expanded, including after repeated toggles', () => {
    const { container } = render(<DocInfoList options={options} />);
    const initialNodeCount = container.querySelectorAll('*').length;
    expect(initialNodeCount).toBeLessThan(20);
    expect(
      container.querySelectorAll('.ant-agent-doc-info-list-item'),
    ).toHaveLength(0);

    const toggle = screen.getByRole('button', { name: /引用内容/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Reference 99')).toBeInTheDocument();
    expect(
      container.querySelectorAll('.ant-agent-doc-info-list-item'),
    ).toHaveLength(100);
    fireEvent.click(toggle);
    expect(screen.queryByText('Reference 99')).not.toBeInTheDocument();
    expect(container.querySelectorAll('*')).toHaveLength(initialNodeCount);
    fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(screen.getByText('Reference 99')).toBeInTheDocument();
    fireEvent.keyDown(toggle, { key: ' ' });
    expect(screen.queryByText('Reference 99')).not.toBeInTheDocument();
  });

  it('does not invoke item renderers for collapsed references and shows the latest items when opened', () => {
    const renderItem = vi.fn((_item, dom) => dom);
    const { rerender } = render(
      <DocInfoList
        options={[{ content: 'First long reference content' }]}
        render={renderItem}
      />,
    );
    rerender(
      <DocInfoList
        options={[{ content: 'Updated long reference content' }]}
        render={renderItem}
      />,
    );
    expect(renderItem).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /引用内容/ }));
    expect(
      screen.getByText('Updated long reference content'),
    ).toBeInTheDocument();
    expect(renderItem).toHaveBeenCalledOnce();
  });

  it('releases a document preview when its popover closes', async () => {
    const user = userEvent.setup();
    render(
      <DocInfoList
        options={[{ content: 'A long reference for hover preview' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /引用内容/ }));
    expect(screen.queryByTestId('reference-preview')).not.toBeInTheDocument();
    const row = screen.getByTitle('A long reference for hover preview');
    await user.hover(row);
    expect(await screen.findByTestId('reference-preview')).toBeInTheDocument();
    await user.unhover(row);
    const popup = screen
      .getByTestId('reference-preview')
      .closest('.ant-popover')!;
    await waitFor(() => expect(popup.className).toContain('leave-active'));
    fireEvent.animationEnd(popup);
    fireEvent.transitionEnd(popup);
    await waitFor(() =>
      expect(screen.queryByTestId('reference-preview')).not.toBeInTheDocument(),
    );
  });
});
