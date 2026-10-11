import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chunk } from '../../ThoughtChainList/types';
import { DocInfoList } from '../MessagesContent/DocInfo';

vi.mock('../../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <p>{content}</p>,
}));

const openList = () =>
  fireEvent.click(screen.getByRole('button', { name: /引用内容/ }));
const option = (content: string, originUrl = ''): Chunk => ({
  content,
  originUrl,
  docMeta: {},
});
afterEach(() => vi.restoreAllMocks());
beforeEach(() => vi.clearAllMocks());

describe('reference content and navigation', () => {
  it('replaces every supported literal placeholder', () => {
    render(
      <DocInfoList
        options={[option('`${ref}` $ref $[ref] $ref')]}
        reference_url_info_list={[
          { placeholder: 'ref', url: 'https://example.com/source' },
        ]}
      />,
    );
    openList();
    expect(
      screen.getByText(Array(4).fill('(https://example.com/source)').join(' ')),
    ).toBeTruthy();
  });

  it('matches longer identifiers first without rewriting inserted URLs', () => {
    render(
      <DocInfoList
        options={[option('$10 $1 $b')]}
        reference_url_info_list={[
          { placeholder: '1', url: 'https://example.com/$b' },
          { placeholder: '10', doc_id: 'Ten' },
          { placeholder: 'b', doc_id: 'B' },
        ]}
      />,
    );
    openList();
    expect(screen.getByText('(Ten) (https://example.com/$b) (B)')).toBeTruthy();
  });

  it('treats identifier punctuation literally and retains unresolved placeholders', () => {
    render(
      <DocInfoList
        options={[option('$ref.[] $unknown')]}
        reference_url_info_list={[
          { placeholder: 'ref.[]', doc_id: 'Source' },
          { placeholder: 'unknown' },
        ]}
      />,
    );
    openList();
    expect(screen.getByText('(Source) $unknown')).toBeTruthy();
  });

  it('uses native navigation when no original URL callback is supplied', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <DocInfoList
        options={[option('Reference', 'https://example.com/source')]}
      />,
    );
    openList();
    fireEvent.click(screen.getByTitle('Reference'));
    expect(open).toHaveBeenCalledExactlyOnceWith('https://example.com/source');
  });

  it('does not open a blank window for a reference without a URL', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<DocInfoList options={[option('Reference')]} />);
    openList();
    fireEvent.click(screen.getByTitle('Reference'));
    expect(open).not.toHaveBeenCalled();
  });

  it('uses the supplied navigation callback for the row and its original link action', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onOriginUrlClick = vi.fn();
    render(
      <DocInfoList
        options={[option('Reference', 'https://example.com/source')]}
        onOriginUrlClick={onOriginUrlClick}
      />,
    );
    openList();
    fireEvent.click(screen.getByTitle('Reference'));
    fireEvent.click(screen.getByRole('button', { name: '查看原文' }));
    expect(onOriginUrlClick).toHaveBeenCalledTimes(2);
    expect(onOriginUrlClick).toHaveBeenLastCalledWith(
      'https://example.com/source',
    );
    expect(open).not.toHaveBeenCalled();
  });

  it('applies the custom row renderer to short references', () => {
    const renderItem = vi.fn((_item: Chunk, dom: React.ReactNode) => (
      <section aria-label="Custom reference">{dom}</section>
    ));
    render(<DocInfoList options={[option('Short')]} render={renderItem} />);
    expect(renderItem).not.toHaveBeenCalled();
    openList();
    expect(
      within(
        screen.getByRole('region', { name: 'Custom reference' }),
      ).getByText('Short'),
    ).toBeTruthy();
    expect(renderItem).toHaveBeenCalledOnce();
  });
});
