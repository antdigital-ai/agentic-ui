import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { expect, it } from 'vitest';
import { createHastProcessor } from '../../processor';
import { MarkdownBlockPiece } from '../MarkdownBlockPiece';
import { createMarkdownBlockElements } from '../markdownBlockElements';

it('reports element construction elapsed time for repeated tail updates', () => {
  const processor = createHastProcessor();
  const components = {};
  const records: object[] = [];
  for (const [blockCount, updates] of [
    [200, 100],
    [1000, 500],
  ]) {
    const blocks = Array.from(
      { length: blockCount },
      (_, index) => `Paragraph ${index}`,
    );
    const revisions = Array.from({ length: updates }, (_, index) => {
      const next = blocks.slice();
      next[next.length - 1] += ` update ${index}`;
      return next;
    });
    const fullCreate = (sources: string[]) =>
      jsxs(Fragment, {
        children: sources.map((blockSource, index) =>
          jsx(
            MarkdownBlockPiece,
            {
              blockSource,
              variant: index === sources.length - 1 ? 'tail' : 'sealed',
              processor,
              components,
              streaming: true,
            },
            `b-0-${index}`,
          ),
        ),
      });
    const measure = (reuse: boolean) => {
      let previous = createMarkdownBlockElements(
        blocks,
        blockCount,
        0,
        processor,
        components,
        true,
      );
      const started = performance.now();
      for (const sources of revisions) {
        if (reuse) {
          previous = createMarkdownBlockElements(
            sources,
            blockCount,
            0,
            processor,
            components,
            true,
            previous,
          );
        } else fullCreate(sources);
      }
      return performance.now() - started;
    };
    // Diagnostic medians only; regression tests enforce element identities and
    // invalidation behavior without timing assertions.
    measure(false);
    measure(true);
    const full: number[] = [];
    const reused: number[] = [];
    for (let round = 0; round < 7; round++) {
      full.push(measure(false));
      reused.push(measure(true));
    }
    const median = (values: number[]) => values.sort((a, b) => a - b)[3];
    const latest = createMarkdownBlockElements(
      revisions.at(-1)!,
      blockCount,
      0,
      processor,
      components,
      true,
    );
    expect(latest.elements).toHaveLength(blockCount);
    records.push({
      blockCount,
      updates,
      fullCreateMs: median(full),
      reuseElementsMs: median(reused),
      fullCreatedBlocks: blockCount * updates,
      reusedCreatedBlocks: updates,
    });
  }
  process.stdout.write(
    `${JSON.stringify({ markdownBlockElements: records })}\n`,
  );
});
