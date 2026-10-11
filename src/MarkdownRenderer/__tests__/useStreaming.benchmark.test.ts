import { cleanup, renderHook } from '@testing-library/react';
import { performance } from 'node:perf_hooks';
import { afterEach, expect, it } from 'vitest';
import { useStreaming } from '../useStreaming';

afterEach(cleanup);

it('reports token-cache elapsed time for large streaming chunks', () => {
  const records = [];
  for (const fenced of [false, true]) {
    const text = 'Ordinary text 中文 and an emoji 💡. '.repeat(6000);
    const prefix = fenced ? `\`\`\`text\n${text}` : text;
    const times = [];
    for (let round = 0; round < 5; round++) {
      const started = performance.now();
      const hook = renderHook(({ content }) => useStreaming(content, true), {
        initialProps: { content: prefix },
      });
      for (let update = 1; update <= 100; update++) {
        hook.rerender({ content: `${prefix}${'x'.repeat(update)}` });
      }
      times.push(performance.now() - started);
      expect(hook.result.current).toBe(`${prefix}${'x'.repeat(100)}`);
      hook.unmount();
    }
    times.sort((left, right) => left - right);
    records.push({
      fenced,
      characters: prefix.length,
      updates: 100,
      ms: times[2],
    });
  }
  // Diagnostic timings include React hook updates, not Markdown parsing/DOM.
  process.stdout.write(`${JSON.stringify({ streamingTokenCache: records })}\n`);
});
