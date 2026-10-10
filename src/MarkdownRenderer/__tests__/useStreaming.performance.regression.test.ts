import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStreaming } from '../useStreaming';

afterEach(cleanup);

describe('streaming token cache batching', () => {
  it.each([
    'Ordinary Unicode text 中文 💡 keeps its full content',
    'Before [a link](https://example.com) and ![image](image.png) after',
    'Before *emphasis* and `inline code` and - list syntax\nNext line',
    'Before\n\n```ts\nconst text = "中文 💡";\n\nconst value = 1;\n```\nAfter',
    'Before\n\n~~~ts\nconst text = "value";\n~~~\nAfter',
    'Before\r\n\r\n```ts\r\nconst text = "value";\r\n```\r\nAfter',
    'Before\n\n````md\n``` inner fence\n`inline` remains code\n````\nAfter',
    'Before\n\n~~~md\n``` does not close tildes\n~~~~\nAfter',
    '1234567💡 then [a link](https://example.com) after',
    '| Name | Value |\n| --- | --- |\n| First | Second |\nAfter',
    'Before <span title="incomplete',
    'Before [unresolved text',
  ])('preserves token boundaries while appending %j', (source) => {
    const hook = renderHook(({ content }) => useStreaming(content, true), {
      initialProps: { content: '' },
    });
    const lengths = Array.from(
      { length: Math.ceil(source.length / 7) },
      (_, index) => 1 + index * 7,
    );
    lengths.push(source.length);
    for (const length of lengths) {
      const content = source.slice(0, length);
      const expected = renderHook(() => useStreaming(content, true));
      hook.rerender({ content });
      expect(hook.result.current, JSON.stringify(content)).toBe(
        expected.result.current,
      );
      expected.unmount();
    }
  });

  it('resets exact prefix state for revisions, rollback, clear, and a new fence', () => {
    const hook = renderHook(({ content }) => useStreaming(content, true), {
      initialProps: { content: 'Original content' },
    });
    for (const content of [
      'Original content grows',
      'Revised! content grows',
      'Revised!',
      '',
      '```ts\nconst text = "new";',
      '```ts\nconst text = "new";\n```\nAfter',
    ]) {
      const expected = renderHook(() => useStreaming(content, true));
      hook.rerender({ content });
      expect(hook.result.current).toBe(expected.result.current);
      expected.unmount();
    }
  });
});
