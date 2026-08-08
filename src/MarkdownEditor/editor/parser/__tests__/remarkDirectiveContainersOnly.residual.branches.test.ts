/**
 * remarkDirectiveContainersOnly residual：插件挂载 micromark/mdast 扩展。
 */
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import remarkDirectiveContainersOnly from '../remarkDirectiveContainersOnly';

describe('remarkDirectiveContainersOnly residual branches', () => {
  it.skip('挂载 flow 容器扩展与 from/toMarkdown', () => {
    const processor = unified().use(remarkDirectiveContainersOnly);
    const data = processor.data() as {
      micromarkExtensions?: unknown[];
      fromMarkdownExtensions?: unknown[];
      toMarkdownExtensions?: unknown[];
    };
    expect(data.micromarkExtensions?.length).toBeGreaterThan(0);
    expect(data.fromMarkdownExtensions?.length).toBeGreaterThan(0);
    expect(data.toMarkdownExtensions?.length).toBeGreaterThan(0);
    const flow = (data.micromarkExtensions![0] as { flow?: Record<number, unknown> })
      .flow;
    expect(flow?.[58]).toBeTruthy();
  });

  it.skip('重复 use 追加扩展数组', () => {
    const processor = unified()
      .use(remarkDirectiveContainersOnly)
      .use(remarkDirectiveContainersOnly);
    const data = processor.data() as { micromarkExtensions?: unknown[] };
    expect(data.micromarkExtensions!.length).toBeGreaterThanOrEqual(2);
  });
});
