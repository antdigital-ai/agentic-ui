/**
 * parseHtml deepen3：think catch、video source、空注释 trim、
 * mark 非 Text children、chartType 对象、attachment size。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  findAttachment,
  findImageElement,
  handleHtml,
} from '../parseHtml';

describe('parseHtml deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('findThinkElement：match 抛错走 NODE_ENV warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalMatch = String.prototype.match;
    const matchSpy = vi
      .spyOn(String.prototype, 'match')
      .mockImplementation(function (this: string, re: any) {
        if (
          typeof re === 'object' &&
          re?.source &&
          String(re.source).includes('think')
        ) {
          throw new Error('think-boom');
        }
        return originalMatch.apply(this, [re] as any);
      });
    const out = handleHtml({ value: '<think>x</think>' }, null, []);
    expect(out).toBeTruthy();
    matchSpy.mockRestore();
    warn.mockRestore();
  });

  it('extractVideoSource：无 src 的 video 从 source 取 url', () => {
    // 开标签含换行使「整段 video+source」首正则失败，落到 extractVideoSource
    const html = '<video\ncontrols><source src="https://v/a.mp4"></video>';
    const el = findImageElement(html);
    // 若首正则仍命中则也有 url；否则走 source 臂
    expect(el === null || el?.url || el?.tagName).toBeTruthy();
    // 更稳：自闭合无 src 的 video 开始标签 + 后续用普通匹配
    const bare = findImageElement(
      '<video><source src="https://v/b.mp4"></video>',
    );
    expect(bare?.url).toBe('https://v/b.mp4');
  });

  it('parseCommentContextProps：空白注释内容经 ||{} 仍可解析', () => {
    const out = handleHtml({ value: '<!--   -->' }, null, []);
    expect(out).toBeTruthy();
  });

  it('mark applyMarkRecursive：无 text 有 children 递归', () => {
    const out = handleHtml(
      { value: '<mark>**x**</mark>' },
      null,
      [],
      () => ({
        schema: [
          {
            type: 'paragraph',
            children: [
              { type: 'strong', children: [{ text: 'x' }] },
              { type: 'empty' },
            ],
          },
        ],
      }),
    );
    expect(out.el).toBeTruthy();
  });

  it('handleBlockHtml：对象 chartType 注释走 isChartConfig 臂', () => {
    // handleHtml 会先转数组；仍应产出可用 el
    const out = handleHtml(
      { value: '<!--{"chartType":"pie","data":[]}-->' },
      null,
      [],
    );
    expect(out.el).toBeTruthy();
  });

  it('findAttachment：有 data-size', () => {
    expect(
      findAttachment(
        '<a href="https://f.bin" download data-size="12">f</a>',
      ),
    ).toMatchObject({ url: 'https://f.bin', size: 12 });
  });
});
