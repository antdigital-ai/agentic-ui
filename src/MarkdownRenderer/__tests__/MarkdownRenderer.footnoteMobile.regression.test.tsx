import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as extraction from '../extractFootnoteDefinitions';
import MarkdownRenderer from '../MarkdownRenderer';

vi.mock('../../MarkdownInputField/AttachmentButton/utils', () => ({
  isMobileDevice: () => true,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('readonly Markdown mobile footnotes', () => {
  it('preserves ordinary superscripts without opening footnote UI', () => {
    const renderFootnote = vi.fn((_props, defaultDom) => defaultDom);
    render(
      <MarkdownRenderer
        content="Text<sup>2</sup>"
        fncProps={{ render: renderFootnote }}
      />,
    );
    fireEvent.click(screen.getByText('2'));
    expect(renderFootnote).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shares one definition extraction across references and opens their real body without an editor store', () => {
    const parse = vi.spyOn(extraction, 'extractStreamingFootnoteDefinitions');
    const notify = vi.fn();
    const renderFootnote = vi.fn((_props, defaultDom) => defaultDom);
    const content = `${Array.from({ length: 50 }, () => 'Reference [^1]').join(' ')}\n\n[^1]: Shared **definition** body`;
    const { container } = render(
      <MarkdownRenderer
        content={content}
        fncProps={{
          onFootnoteDefinitionChange: notify,
          render: renderFootnote,
        }}
      />,
    );
    expect(parse).toHaveBeenCalledExactlyOnceWith(content, undefined);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();

    const references = container.querySelectorAll('[data-fnc-name="1"]');
    expect(references).toHaveLength(50);
    expect(renderFootnote).toHaveBeenCalledTimes(50);
    expect(renderFootnote.mock.calls[0][0]).toMatchObject({ identifier: '1' });
    fireEvent.click(references[0]);
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText('Shared definition body'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('updates an open popup when a streamed definition changes', () => {
    const initial = 'Reference [^1]\n\n[^1]: Initial body';
    const updated = `${initial} continues`;
    const view = render(
      <MarkdownRenderer
        content={initial}
        streaming
        throttleOptions={{ enabled: false }}
      />,
    );
    fireEvent.click(view.container.querySelector('[data-fnc="fnc"]')!);
    expect(
      within(screen.getByRole('dialog')).getByText('Initial body'),
    ).toBeInTheDocument();

    view.rerender(
      <MarkdownRenderer
        content={updated}
        streaming
        throttleOptions={{ enabled: false }}
      />,
    );
    expect(
      within(screen.getByRole('dialog')).getByText('Initial body continues'),
    ).toBeInTheDocument();
  });
});
