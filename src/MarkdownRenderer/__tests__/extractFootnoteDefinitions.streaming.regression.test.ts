import { describe, expect, it } from 'vitest';
import {
  extractFootnoteDefinitionsFromMarkdown,
  extractStreamingFootnoteDefinitions,
  type FootnoteExtractionSnapshot,
} from '../extractFootnoteDefinitions';

const paragraphs = Array.from(
  { length: 12 },
  (_, index) => `Paragraph ${index} with [^a] and [label][ref].`,
).join('\n\n');

describe('streaming footnote extraction', () => {
  it.each([
    [
      'paragraphs and indentation',
      '[^a]: First\n\n    Second paragraph\n\nTail',
    ],
    ['nested quote', '> [^a]: Quote\n>\n>     continuation\n\nTail'],
    ['nested list', '- Start\n\n  [^a]: Nested\n\n      continued\n\nTail'],
    ['link reference', '[^a]: [label][ref]\n\nTail\n\n[ref]: /url'],
    ['footnote reference', '[^a]: See [^b]\n\nTail\n\n[^b]: New'],
    [
      'reference split across chunks',
      '[^a]: [label][ref]\n\n[ref]:\n /url\n\nTail',
    ],
    ['duplicate definitions', '[^a]: First\n\nMiddle\n\n[^a]: Second'],
    [
      'fence with pseudo definition',
      '```md\n[^fake]: false\n```\n\n[^a]: Real',
    ],
    ['HTML with pseudo definition', '<!--\n[^fake]: false\n-->\n\n[^a]: Real'],
    ['unfinished code', '[^a]: Real\n\n```md\n[^fake]: false\n```'],
  ])('matches full parsing for every prefix of %s', (_name, tail) => {
    const source = `${paragraphs}\n\n${tail}`;
    let previous: FootnoteExtractionSnapshot | undefined;
    for (let length = 0; length <= source.length; length += 1) {
      const content = source.slice(0, length);
      previous = extractStreamingFootnoteDefinitions(content, previous);
      expect(previous.definitions, JSON.stringify(content)).toEqual(
        extractFootnoteDefinitionsFromMarkdown(content),
      );
    }
  });

  it.each([
    '[^a]: Prefix [label][ref]\n\n[ref]: /url',
    '> [^a]: Prefix\n>\n>     Body [label][ref]\n>\n> [ref]: /url',
    '- Start\n\n  [^a]: Nested [label][ref]\n\n  [ref]: /url',
    '[^a]: First\n\n[^a]: Duplicate\n\n[ref]: /url',
    '    [^fake]: Code\n\n[^a]: True\n\n[ref]: /url',
  ])('preserves sealed definition contexts: %s', (context) => {
    const initial = `${context}\n\n${paragraphs}\n\n[^tail]: [label][ref] and [^a]`;
    let previous = extractStreamingFootnoteDefinitions(initial);
    expect(previous.tailOffset).toBeGreaterThan(context.length);
    for (const chunk of [
      ' continues',
      '\n\n    Indented paragraph',
      '\n\nTail',
      '\n\n[late]:',
      ' /new',
    ]) {
      const content = previous.content + chunk;
      previous = extractStreamingFootnoteDefinitions(content, previous);
      expect(previous.definitions).toEqual(
        extractFootnoteDefinitionsFromMarkdown(content),
      );
    }
  });

  it('refreshes earlier notes when a new global reference becomes valid or invalid', () => {
    const initial = `[^a]: Prefix [label][later]\n\n${paragraphs}\n\n[later]: <url`;
    let previous = extractStreamingFootnoteDefinitions(initial);
    expect(previous.definitions[0].origin_text).toBe('Prefix [label][later]');
    previous = extractStreamingFootnoteDefinitions(`${initial}>`, previous);
    expect(previous.definitions[0].origin_text).toBe('Prefix label');
    previous = extractStreamingFootnoteDefinitions(
      `${initial}>invalid`,
      previous,
    );
    expect(previous.definitions[0].origin_text).toBe('Prefix [label][later]');
  });

  it('handles CRLF/CR lines, revisions, clear, rollback and restarts', () => {
    let previous: FootnoteExtractionSnapshot | undefined;
    for (const content of [
      `${paragraphs}\n\n[^a]: First`.replaceAll('\n', '\r\n'),
      `${paragraphs}\n\n[^a]: First continues`.replaceAll('\n', '\r\n'),
      `${paragraphs}\n\n[^a]: Revised`.replaceAll('\n', '\r'),
      `${paragraphs}\n\n[^a]: Revised continues`.replaceAll('\n', '\r'),
      '',
      '[^a]: Restart',
      '[^a]: Short',
    ]) {
      previous = extractStreamingFootnoteDefinitions(content, previous);
      expect(previous.definitions).toEqual(
        extractFootnoteDefinitionsFromMarkdown(content),
      );
    }
  });

  it('does not mutate the committed baseline during speculative extraction', () => {
    const initial = `[^a]: Prefix\n\n${paragraphs}\n\n[^tail]: Original`;
    const committed = extractStreamingFootnoteDefinitions(initial);
    const before = JSON.stringify(committed);
    const abandoned = extractStreamingFootnoteDefinitions(
      `${initial}\n\n[new]: /url`,
      committed,
    );
    expect(abandoned).not.toBe(committed);
    expect(JSON.stringify(committed)).toBe(before);
    expect(
      extractStreamingFootnoteDefinitions(`${initial} accepted`, committed)
        .definitions,
    ).toEqual(extractFootnoteDefinitionsFromMarkdown(`${initial} accepted`));
  });

  it('matches full parsing through mixed append, rollback and nested syntax', () => {
    let seed = 7391;
    const random = (max: number) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % max;
    };
    const pieces = [
      'x',
      '\n',
      '\n\n',
      '\r\n',
      '    continued',
      '> quoted',
      '- list',
      '[^tail]:',
      ' [label][new]',
      '[ref]:',
      ' /url',
      '[new]: /new',
      '`',
      '```\n',
      '<!--',
      '-->',
      '<div>',
      '</div>',
      ' [^a]',
      '[later]: /last',
      '"title"',
      '\\',
    ];
    for (let run = 0; run < 8; run += 1) {
      let content = `[^a]: Prefix [label][later]\n\n[ref]: /url\n\n${paragraphs}\n\n[^tail]: Growing [label][ref]`;
      let previous = extractStreamingFootnoteDefinitions(content);
      for (let step = 0; step < 90; step += 1) {
        content =
          random(15) === 0
            ? content.slice(0, Math.max(0, content.length - random(50)))
            : content + pieces[random(pieces.length)];
        previous = extractStreamingFootnoteDefinitions(content, previous);
        expect(previous.definitions, `run ${run}, step ${step}`).toEqual(
          extractFootnoteDefinitionsFromMarkdown(content),
        );
      }
    }
  });
});
