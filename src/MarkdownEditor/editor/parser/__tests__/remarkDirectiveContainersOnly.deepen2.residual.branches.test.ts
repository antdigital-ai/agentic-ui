/**
 * remarkDirectiveContainersOnly deepen2：unified 插件挂载。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirectiveContainersOnly from '../remarkDirectiveContainersOnly';

describe('remarkDirectiveContainersOnly deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('可作为 remark 插件挂载并 parse', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkDirectiveContainersOnly);
    const tree = processor.parse('hello');
    expect(tree.type).toBe('root');
  });
});
