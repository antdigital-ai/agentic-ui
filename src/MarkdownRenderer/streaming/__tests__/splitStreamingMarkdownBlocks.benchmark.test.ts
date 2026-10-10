import { performance } from 'node:perf_hooks';
import { expect, it } from 'vitest';
import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessNormalizeLeafToContainerDirective,
} from '../../../MarkdownEditor/editor/parser/constants';
import { splitMarkdownBlocks } from '../../markdownReactShared';
import { splitStreamingMarkdownBlocks } from '../splitStreamingMarkdownBlocks';

const fullSplit = (content: string) =>
  splitMarkdownBlocks(
    preprocessNormalizeLeafToContainerDirective(
      content.replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$'),
    ),
  );

it('reports elapsed block splitting for repeated tail updates', () => {
  const records: object[] = [];
  for (const [paragraphs, updates] of [
    [200, 100],
    [1000, 500],
  ]) {
    const content = Array.from(
      { length: paragraphs },
      (_, index) => `Paragraph ${index}: ${'content '.repeat(10)}`,
    ).join('\n\n');
    const sources = Array.from(
      { length: updates },
      (_, index) => `${content}${'x'.repeat(index + 1)}`,
    );
    // Warm both paths before collecting medians. Timings are diagnostic only;
    // correctness and scanned-source assertions live in the regression suite.
    for (const source of sources.slice(0, 20)) fullSplit(source);
    const measure = (incremental: boolean) => {
      let previous = splitStreamingMarkdownBlocks(content);
      const started = performance.now();
      for (const source of sources) {
        if (incremental)
          previous = splitStreamingMarkdownBlocks(source, previous);
        else fullSplit(source);
      }
      return performance.now() - started;
    };
    const baseline: number[] = [];
    const optimized: number[] = [];
    for (let round = 0; round < 7; round++) {
      baseline.push(measure(false));
      optimized.push(measure(true));
    }
    const median = (values: number[]) => values.sort((a, b) => a - b)[3];
    expect(splitStreamingMarkdownBlocks(sources.at(-1)!).blocks).toEqual(
      fullSplit(sources.at(-1)!),
    );
    records.push({
      paragraphs,
      updates,
      characters: content.length,
      fullSplitMs: median(baseline),
      incrementalSplitMs: median(optimized),
    });
  }
  process.stdout.write(`${JSON.stringify({ streamingBlockSplit: records })}\n`);
});
