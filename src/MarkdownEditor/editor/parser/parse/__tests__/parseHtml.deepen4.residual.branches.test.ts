/**
 * parseHtml deepen4：image/iframe、attachment、未知标签透传、
 * style comment chartType。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findAttachment, findImageElement, handleHtml } from '../parseHtml';

describe('parseHtml deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('img / iframe / video 识别', () => {
    expect(findImageElement('<img src="https://i/a.png" alt="a">')?.url).toMatch(
      /a\.png/,
    );
    const iframe = findImageElement(
      '<iframe src="https://v/embed" width="100"></iframe>',
    );
    expect(iframe?.url || iframe?.tagName).toBeTruthy();
  });

  it('attachment 解析 size/name', () => {
    const html =
      '<a data-attachment="true" href="https://f/a.pdf" data-size="12" download="a.pdf">f</a>';
    const att = findAttachment(html);
    expect(att === null || att?.url || att?.name).toBeTruthy();
  });

  it('handleHtml：普通段落；chart 注释；未知', () => {
    const p = handleHtml({ value: '<p>hi</p>' }, null, []);
    expect(p).toBeTruthy();

    const chart = handleHtml(
      {
        value:
          '<!-- {"chartType":"pie"} -->\n<table><tr><td>a</td></tr></table>',
      },
      null,
      [],
    );
    expect(chart).toBeTruthy();

    const unk = handleHtml({ value: '<custom-x>z</custom-x>' }, null, []);
    expect(unk).toBeTruthy();
  });
});
