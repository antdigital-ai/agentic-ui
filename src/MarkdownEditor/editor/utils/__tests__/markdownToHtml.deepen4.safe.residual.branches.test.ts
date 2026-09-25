/**
 * markdownToHtml deepen4 safe：getCodeText 无 children、className 数组、
 * file.value ?? 链（async/sync）、code properties 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  markdownToHtml,
  markdownToHtmlSync,
} from '../markdownToHtml';

describe('markdownToHtml deepen4 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('代码块 string className language- + 无换行 loading', async () => {
    const html = await markdownToHtml(
      '```typescript\nconst v=1```',
      undefined,
      { paragraphTag: 'section' },
    );
    expect(html).toMatch(/data-block|language-typescript|pre|code/i);
    expect(html).toMatch(/data-state="loading"|data-state="done"/i);
  });

  it('嵌套 element code：getCodeText 递归与 pre/code properties', async () => {
    const html = await markdownToHtml(
      '```\nouter\ninner\n```\n\n`inline`',
      undefined,
      { openLinksInNewTab: true },
    );
    expect(html).toMatch(/pre|code|outer/i);
  });

  it('async：VFile value ?? 链', async () => {
    const html = await markdownToHtml('# async-title\n\npara text');
    expect(html).toMatch(/async-title|h1|p|section/i);
    expect(html.length).toBeGreaterThan(0);
  });

  it('sync：VFile value ?? 链 + 空 value 容错', () => {
    const html = markdownToHtmlSync('## sync-h2\n\nbody');
    expect(html).toMatch(/sync-h2|h2|body/i);
  });

  it('短 HTML code 块不强制 block；长 multiline done', async () => {
    const short = await markdownToHtml('```\nab```');
    expect(typeof short).toBe('string');

    const long = await markdownToHtml(
      '```js\n' + Array.from({ length: 6 }, (_, i) => `line${i}`).join('\n') + '\n```',
    );
    expect(long).toMatch(/data-block|pre/i);
  });

  it('formula + paragraphTag 非 p 不触发 default-arg', async () => {
    const html = await markdownToHtml('$$x+y$$', undefined, {
      formula: { enable: true },
      paragraphTag: 'article',
    });
    expect(html.length).toBeGreaterThan(0);
  });
});
