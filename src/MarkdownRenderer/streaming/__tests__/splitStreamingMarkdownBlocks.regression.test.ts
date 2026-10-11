import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessNormalizeLeafToContainerDirective,
} from '../../../MarkdownEditor/editor/parser/constants';
import * as shared from '../../markdownReactShared';
import {
  splitStreamingMarkdownBlocks,
  type StreamingMarkdownBlocks,
} from '../splitStreamingMarkdownBlocks';

const reference = (content: string) =>
  content
    ? shared.splitMarkdownBlocks(
        preprocessNormalizeLeafToContainerDirective(
          content.replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$'),
        ),
      )
    : [];

afterEach(() => vi.restoreAllMocks());

describe('incremental streaming block boundaries', () => {
  it.each([
    ['paragraphs', 'One\n\nTwo\n\nThree\n\nFour\n\nFive'],
    ['repeated text', 'One\n\nOne\n\nOne\n\nOne\n\nOne'],
    [
      'lists and continuations',
      'One\n\nTwo\n\n- first\n\n  continuation\n\n- next\n\nFinal',
    ],
    ['blockquote', 'One\n\nTwo\n\n> first\n\n> next\n\nFinal\n\nEnd'],
    [
      'GFM tables and partial table markers',
      'One\n\nTwo\n\nHeading\n| a | b |\n| - | - |\n| c | d |\n\nnot | table\n\nEnd',
    ],
    [
      'footnotes after blank lines',
      'One\n\nTwo\n\nThree\n\nFour\n\n[^ref]: Footnote\n\nEnd',
    ],
    [
      'comment and table',
      'One\n\nTwo\n\n<!-- config -->\n\n| a | b |\n| - | - |\n\nEnd',
    ],
    [
      'fences with blank lines',
      'One\n\nTwo\n\n```ts\nconst a = 1;\n\nconst b = 2;\n```\n\nEnd',
    ],
    ['directives', 'One\n\nTwo\n\n::note\nvalue\n::\n\nEnd'],
    [
      'think tags and inline closure',
      'One\n\nTwo\n\n<think>\nreason\n</think>Answer\n\nEnd',
    ],
    ['placeholder', `One\n\nTwo\n\n${JINJA_DOLLAR_PLACEHOLDER}value`],
  ])('matches full splitting for every prefix of %s', (_name, content) => {
    let previous: StreamingMarkdownBlocks | undefined;
    for (let length = 0; length <= content.length; length++) {
      const source = content.slice(0, length);
      previous = splitStreamingMarkdownBlocks(source, previous);
      expect(previous.blocks, `prefix ${JSON.stringify(source)}`).toEqual(
        reference(source),
      );
    }
  });

  it('rescans the tail when streaming repair moves a closing fence', () => {
    const prefix = 'One\n\nTwo\n\nThree\n\n';
    let previous = splitStreamingMarkdownBlocks(`${prefix}\`\`\`ts\na\n\`\`\``);
    for (const tail of ['ab', 'abc', 'abc\n\nnext']) {
      const content = `${prefix}\`\`\`ts\n${tail}\n\`\`\``;
      previous = splitStreamingMarkdownBlocks(content, previous);
      expect(previous.blocks).toEqual(reference(content));
    }
  });

  it('resets safely for revision, rollback, clear and restarting', () => {
    let previous: StreamingMarkdownBlocks | undefined;
    for (const content of [
      'One\n\nTwo\n\nThree\n\nFour',
      'One\n\nTwo\n\nRevised\n\nAnswer',
      'One\n\nTwo',
      '',
      'New\n\nAnswer',
    ]) {
      previous = splitStreamingMarkdownBlocks(content, previous);
      expect(previous.blocks).toEqual(reference(content));
    }
  });

  it('does not add an empty block when rolling back exactly to a retained boundary', () => {
    const previous = splitStreamingMarkdownBlocks(
      'One\n\nTwo\n\nThree\n\nFour\n\nFive',
    );
    const content = 'One\n\nTwo\n\nThree\n\n';
    expect(splitStreamingMarkdownBlocks(content, previous).blocks).toEqual(
      reference(content),
    );
  });

  it('does not rescan completed paragraphs for each token', () => {
    const content = Array.from(
      { length: 200 },
      (_, index) => `Paragraph ${index}: ${'content '.repeat(10)}`,
    ).join('\n\n');
    let previous = splitStreamingMarkdownBlocks(content);
    const split = vi.spyOn(shared, 'splitMarkdownBlocks');
    for (let index = 0; index < 100; index++) {
      previous = splitStreamingMarkdownBlocks(`${previous.content}x`, previous);
    }
    const scanned = split.mock.calls.reduce(
      (total, [source]) => total + source.length,
      0,
    );
    expect(split).toHaveBeenCalledTimes(100);
    expect(scanned).toBeLessThan(content.length * 3);
  });

  it('matches full splitting through deterministic mixed append/rollback sequences', () => {
    let seed = 87341;
    const random = (max: number) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % max;
    };
    const pieces = [
      'plain text',
      '\n',
      '\n\n',
      '\r\n',
      '\u2028',
      ' ',
      '  continuation',
      '- ',
      '1. item',
      '> quote',
      '>> nested',
      '| a | b |',
      '| --- | --- |',
      '[',
      '^ref]: footnote',
      '[^ref]: another',
      '<!-- config -->',
      '<span>html</span>',
      '`',
      '```ts',
      '```',
      '~~~~',
      '~~~',
    ];
    for (let run = 0; run < 40; run++) {
      let content = 'One\n\nTwo\n\nThree\n\nFour\n\nFive';
      let previous = splitStreamingMarkdownBlocks(content);
      for (let step = 0; step < 120; step++) {
        if (random(6) === 0) {
          content = content.slice(0, Math.max(0, content.length - random(24)));
        } else {
          content += pieces[random(pieces.length)];
        }
        previous = splitStreamingMarkdownBlocks(content, previous);
        expect(
          previous.blocks,
          `run ${run}, step ${step}: ${JSON.stringify(content)}`,
        ).toEqual(reference(content));
      }
    }
  });
});
