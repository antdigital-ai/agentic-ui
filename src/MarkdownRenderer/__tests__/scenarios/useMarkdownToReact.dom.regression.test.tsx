import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../../index';
import * as markdownReactShared from '../../markdownReactShared';
import type { RendererBlockProps } from '../../types';
import { useMarkdownToReact } from '../../useMarkdownToReact';

const throttleOff = { enabled: false } as const;

const countDomNodes = (container: HTMLElement) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ALL);
  let count = 0;
  while (walker.nextNode()) count += 1;
  return count;
};

describe('completed streaming Markdown DOM', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps animation spans in the active paragraph and releases them on completion', () => {
    const paragraph = Array.from({ length: 20 }, (_, i) => `word${i}`).join(
      ' ',
    );
    const content = Array.from({ length: 50 }, () => paragraph).join('\n\n');
    const { container, rerender } = render(
      <MarkdownRenderer
        content={content}
        streaming
        throttleOptions={throttleOff}
      />,
    );

    expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(
      50,
    );
    expect(container.querySelectorAll('.stream-token')).toHaveLength(20);
    expect(container.querySelectorAll('*')).toHaveLength(73);
    expect(countDomNodes(container)).toBe(161);
    expect(
      container.querySelector('[data-be="paragraph"]')?.childNodes,
    ).toHaveLength(1);
    expect(container.textContent?.replace(/\s+/g, '')).toBe(
      content.replace(/\s+/g, ''),
    );

    rerender(
      <MarkdownRenderer
        content={content}
        streaming={false}
        throttleOptions={throttleOff}
      />,
    );

    expect(container.querySelectorAll('.stream-token')).toHaveLength(0);
    expect(container.querySelectorAll('*')).toHaveLength(53);
    expect(countDomNodes(container)).toBe(103);
    expect(container.textContent?.replace(/\s+/g, '')).toBe(
      content.replace(/\s+/g, ''),
    );
  });

  it('compacts a promoted paragraph without reparsing it or replacing formatting DOM', () => {
    const parse = vi.spyOn(markdownReactShared, 'renderMarkdownBlock');
    const Harness = ({ content }: { content: string }) => (
      <>{useMarkdownToReact(content, { streaming: true, fadeTokens: true })}</>
    );
    const original = 'one **bold word** [a link](https://example.com) end';
    const { container, rerender } = render(<Harness content={original} />);
    const paragraph = container.querySelector('[data-be="paragraph"]');
    const bold = container.querySelector('strong');
    const link = container.querySelector('a');
    const initialParses = parse.mock.calls.length;

    expect(paragraph?.querySelectorAll('.stream-token').length).toBeGreaterThan(
      0,
    );
    rerender(<Harness content={`${original}\n\nactive tail now`} />);

    expect(parse.mock.calls.length - initialParses).toBe(1);
    expect(container.querySelector('[data-be="paragraph"]')).toBe(paragraph);
    expect(container.querySelector('strong')).toBe(bold);
    expect(container.querySelector('a')).toBe(link);
    expect(paragraph?.textContent).toBe('one bold word a link end');
    expect(paragraph?.querySelectorAll('.stream-token')).toHaveLength(0);
    expect(container.querySelectorAll('.stream-token')).toHaveLength(3);
  });

  it('preserves a stateful code renderer when preceding animated text is compacted', () => {
    const lifecycle = { mounts: 0, unmounts: 0 };
    const Code = ({ children }: RendererBlockProps) => {
      useEffect(() => {
        lifecycle.mounts += 1;
        return () => {
          lifecycle.unmounts += 1;
        };
      }, []);
      return <video data-testid="stateful-media">{children}</video>;
    };
    const components = { __codeBlock: Code };
    const Harness = ({
      content,
      streaming,
    }: {
      content: string;
      streaming: boolean;
    }) => (
      <>
        {useMarkdownToReact(content, {
          streaming,
          fadeTokens: streaming,
          components,
        })}
      </>
    );
    const intro = Array.from(
      { length: 15 },
      (_, index) => `intro ${index}`,
    ).join('\n\n');
    const original = `${intro}\n\n\`\`\`media\nsource\n\`\`\``;
    const { container, rerender } = render(
      <Harness content={original} streaming />,
    );
    const media = container.querySelector('video');

    rerender(<Harness content={`${original}\n\nnew active text`} streaming />);
    rerender(
      <Harness content={`${original}\n\nnew active text`} streaming={false} />,
    );

    expect(container.querySelector('video')).toBe(media);
    expect(lifecycle).toEqual({ mounts: 1, unmounts: 0 });
    expect(container.querySelectorAll('.stream-token')).toHaveLength(0);
  });

  it('preserves authored spans that use the animation class', () => {
    const Harness = () => (
      <>
        {useMarkdownToReact(
          '<span class="stream-token" title="keep">authored text</span>\n\nactive tail',
          { streaming: true, fadeTokens: true },
        )}
      </>
    );
    const { container } = render(<Harness />);

    const span = container.querySelector('span[title="keep"]');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('authored text');
    expect(span?.querySelector('.stream-token')).toBeNull();
  });

  it('keeps a code player mounted when the active block finishes streaming', () => {
    const lifecycle = { mounts: 0, unmounts: 0 };
    const Code = () => {
      useEffect(() => {
        lifecycle.mounts += 1;
        return () => {
          lifecycle.unmounts += 1;
        };
      }, []);
      return <video />;
    };
    const components = { __codeBlock: Code };
    const Harness = ({ streaming }: { streaming: boolean }) => (
      <>
        {useMarkdownToReact('```media\nsource\n```', {
          streaming,
          fadeTokens: streaming,
          components,
        })}
      </>
    );
    const { container, rerender } = render(<Harness streaming />);
    const media = container.querySelector('video');

    rerender(<Harness streaming={false} />);

    expect(container.querySelector('video')).toBe(media);
    expect(lifecycle).toEqual({ mounts: 1, unmounts: 0 });
  });
});
