import { describe, expect, it } from 'vitest';
import { isMarkdown } from '../isMarkdown';

/**
 * 直接对源码 isMarkdown 的测试，确保覆盖率计入 src/.../isMarkdown.ts
 * 特别是链接分支（约第 28 行）需由仅匹配链接的用例覆盖
 */
describe('isMarkdown (source)', () => {
  it('应通过链接正则 []( ) 识别为 Markdown', () => {
    // 不含 #、表格、![] 等，仅命中链接分支
    expect(isMarkdown('see [here](http://a.com) end')).toBe(true);
    expect(isMarkdown('[link](https://example.com)')).toBe(true);
  });
});
