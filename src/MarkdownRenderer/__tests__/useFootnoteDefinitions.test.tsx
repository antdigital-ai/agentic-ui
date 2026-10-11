import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as extraction from '../extractFootnoteDefinitions';
import { useFootnoteDefinitions } from '../useFootnoteDefinitions';

afterEach(() => vi.restoreAllMocks());

describe('readonly Markdown footnote definitions', () => {
  it('does not parse normal text or repeat empty notifications while content changes', () => {
    const parse = vi.spyOn(extraction, 'extractStreamingFootnoteDefinitions');
    const notify = vi.fn();
    const hook = renderHook(
      ({ content }) => useFootnoteDefinitions(content, notify),
      {
        initialProps: { content: 'Normal text' },
      },
    );
    const initial = hook.result.current;
    expect(notify).toHaveBeenCalledExactlyOnceWith([]);

    hook.rerender({ content: 'Normal text continues' });
    hook.rerender({ content: 'An unresolved reference [^1]' });
    expect(hook.result.current).toBe(initial);
    expect(parse).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('reuses one extraction for callbacks and all reference definitions', () => {
    const parse = vi.spyOn(extraction, 'extractStreamingFootnoteDefinitions');
    const notify = vi.fn();
    const content =
      'Reference [^a]\n\n[^a]: A **bold** definition\n\n[^b]: Second definition';
    const hook = renderHook(
      ({ content }) => useFootnoteDefinitions(content, notify),
      {
        initialProps: { content },
      },
    );
    expect(parse).toHaveBeenCalledExactlyOnceWith(content, undefined);
    expect(notify).toHaveBeenCalledExactlyOnceWith(
      hook.result.current.definitions,
    );
    expect(hook.result.current.definitionMap.get('a')).toEqual({
      type: 'footnoteDefinition',
      identifier: 'a',
      value: 'A bold definition',
      url: undefined,
      children: [{ text: 'A bold definition' }],
    });
    expect(hook.result.current.definitionMap.get('b')?.value).toBe(
      'Second definition',
    );

    const initial = hook.result.current;
    hook.rerender({ content });
    expect(hook.result.current).toBe(initial);
    expect(parse).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('extracts indented definitions and clears them once after removal', () => {
    const parse = vi.spyOn(extraction, 'extractStreamingFootnoteDefinitions');
    const notify = vi.fn();
    const hook = renderHook(
      ({ content }) => useFootnoteDefinitions(content, notify),
      {
        initialProps: { content: 'Reference [^1]\n\n  [^1]: Indented body' },
      },
    );
    expect(hook.result.current.definitionMap.get('1')?.value).toBe(
      'Indented body',
    );
    hook.rerender({ content: 'Definitions removed' });
    expect(hook.result.current.definitionMap.size).toBe(0);
    expect(notify).toHaveBeenLastCalledWith([]);
    hook.rerender({ content: 'Still no definitions' });
    expect(notify).toHaveBeenCalledTimes(2);
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('keeps definition consumers and callbacks stable when only unrelated text changes', () => {
    const parse = vi.spyOn(extraction, 'extractStreamingFootnoteDefinitions');
    const notify = vi.fn();
    const content = 'Reference [^a]\n\n[^a]: Stable body';
    const hook = renderHook(
      ({ content }) => useFootnoteDefinitions(content, notify),
      {
        initialProps: { content },
      },
    );
    const initial = hook.result.current;
    hook.rerender({ content: `More text\n\n${content}` });
    expect(parse).toHaveBeenCalledTimes(2);
    expect(hook.result.current).toBe(initial);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('initializes a newly supplied callback and keeps using its latest implementation without duplicate empty notifications', () => {
    const first = vi.fn();
    const next = vi.fn();
    const hook = renderHook(
      ({ notify, content }) => useFootnoteDefinitions(content, notify),
      {
        initialProps: {
          notify: undefined as typeof first | undefined,
          content: 'No definitions',
        },
      },
    );
    hook.rerender({ notify: first, content: 'No definitions' });
    hook.rerender({ notify: next, content: 'Still no definitions' });
    expect(first).toHaveBeenCalledExactlyOnceWith([]);
    expect(next).not.toHaveBeenCalled();
    hook.rerender({ notify: next, content: '[^a]: Latest body' });
    expect(next).toHaveBeenCalledExactlyOnceWith(
      hook.result.current.definitions,
    );
  });
});
