/**
 * parseHtml deepen residual：attachment/think/special/media 边角。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  createMediaNodeFromElement,
  decodeURIComponentUrl,
  findAttachment,
  findImageElement,
  handleHtml,
  isStandardHtmlElement,
  normalizeThinkTagAliases,
  preprocessNonStandardHtmlTags,
  preprocessSpecialTags,
  preprocessThinkTags,
} from '../parseHtml';

describe('parseHtml deepen residual branches', () => {
  it('normalizeThinkTagAliases：混合别名与孤立 open 不误换', () => {
    expect(normalizeThinkTagAliases('')).toBe('');
    const mixed =
      '<' +
      'redacted_thinking' +
      '>a</' +
      'redacted_thinking' +
      '> mid <' +
      'thinking' +
      '>b</' +
      'thinking' +
      '>';
    const out = normalizeThinkTagAliases(mixed);
    expect(out).toContain('<think>');
    expect(out).toContain('a');
    expect(out).toContain('b');
    // 孤立 open 不构成 pair
    const lone = '<' + 'thinking' + '>only-open';
    expect(normalizeThinkTagAliases(lone)).toContain('only-open');
  });

  it('findAttachment：download 属性与缺省；非法输入', () => {
    expect(
      findAttachment(
        '<a href="https://f.bin" download="f.bin" data-attachment>f</a>',
      ),
    ).toMatchObject({ url: 'https://f.bin' });
    expect(findAttachment('<a href="x">no</a>')).toBeNull();
    expect(findAttachment('')).toBeNull();
    expect(findAttachment(undefined as any)).toBeNull();
  });

  it('findImageElement / createMediaNode：video 尺寸缺省；null 早退', () => {
    const video = findImageElement('<video src="v.mp4"></video>');
    expect(video?.tagName).toBe('video');
    expect(createMediaNodeFromElement(video)).toBeTruthy();

    const img = findImageElement('<img src="a.png" />');
    expect(createMediaNodeFromElement(img)).toBeTruthy();

    expect(createMediaNodeFromElement(null)).toBeNull();
    expect(findImageElement('')).toBeNull();
  });

  it('isStandardHtmlElement：大小写闭合标签；非标签', () => {
    expect(isStandardHtmlElement('<SPAN>')).toBe(true);
    expect(isStandardHtmlElement('</Table>')).toBe(true);
    expect(isStandardHtmlElement('<my-widget>')).toBe(false);
    expect(isStandardHtmlElement('plain')).toBe(false);
  });

  it('preprocessSpecialTags / Think / NonStandard', () => {
    expect(preprocessThinkTags('<think>x</think>')).toContain('```think');
    expect(preprocessSpecialTags('<answer>y</answer>', 'answer')).toContain(
      '```answer',
    );
    expect(preprocessSpecialTags('no-tags', 'think')).toBe('no-tags');
    expect(preprocessNonStandardHtmlTags('<foo><p>z</p></foo>')).toContain(
      '<p>z</p>',
    );
    expect(preprocessNonStandardHtmlTags('<div>ok</div>')).toContain('div');
  });

  it('decodeURIComponentUrl：空串与合法；handleHtml br/hr', () => {
    expect(decodeURIComponentUrl('')).toBe('');
    expect(decodeURIComponentUrl('a%20b')).toBe('a b');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(decodeURIComponentUrl('%E0%A4%A')).toBe('%E0%A4%A');
    spy.mockRestore();

    const br = handleHtml({ value: '<br>' }, null, [], undefined);
    expect(br).toBeTruthy();

    const hr = handleHtml({ value: '<hr/>' }, null, [], undefined);
    expect(hr).toBeTruthy();
  });

  it('handleHtml：span 内联；注释 chartType 对象', () => {
    const span = handleHtml(
      { value: '<span style="color:red">t</span>' },
      { type: 'paragraph' },
      [],
      undefined,
    );
    expect(span).toBeTruthy();

    const chart = handleHtml(
      { value: '<!--{"chartType":"pie","data":[]}-->' },
      null,
      [],
      undefined,
    );
    expect(chart).toBeTruthy();
  });

  it('handleHtml：think/answer 块级标签', () => {
    const think = handleHtml(
      { value: '<think>inner</think>' },
      null,
      [],
      undefined,
    );
    expect(think.el).toMatchObject({ type: 'code', language: 'think' });

    const answer = handleHtml(
      { value: '<answer>ans</answer>' },
      null,
      [],
      undefined,
    );
    expect(answer.el).toMatchObject({ text: 'ans' });
  });

  it('handleHtml：mark 块与 card 块 + parseMarkdownFn', () => {
    const parseMd = (md: string) => ({
      schema: [{ type: 'paragraph', children: [{ text: md }] }],
    });
    const mark = handleHtml(
      { value: '<mark color="red" bg="yellow" label="L">**x**</mark>' },
      null,
      [],
      parseMd,
    );
    expect(mark.el).toBeTruthy();

    const card = handleHtml(
      { value: '<div data-card="true">card body</div>' },
      null,
      [],
      parseMd,
    );
    expect(card.el).toBeTruthy();
  });

  it('handleHtml：未闭合注释 finished=false', () => {
    const open = handleHtml(
      { value: '<!--{"key":' },
      null,
      [],
      undefined,
    );
    expect(open.el?.otherProps?.finished).toBe(false);
  });

  it('handleHtml：otherProps JSON 注释返回空文本', () => {
    const meta = handleHtml(
      { value: '<!--{"foo":"bar"}-->' },
      null,
      [],
      undefined,
    );
    expect(meta.el).toMatchObject({ text: '' });
  });

  it('handleHtml：p align 内联解析', () => {
    const parseMd = () => ({
      schema: [{ type: 'paragraph', children: [{ text: 'bold' }] }],
    });
    const aligned = handleHtml(
      { value: '<p align="center">**bold**</p>' },
      null,
      [],
      parseMd,
    );
    expect(aligned.el?.align).toBe('center');
  });

  it('handleHtml：内联 br / 闭合 tag / iframe 媒体', () => {
    const br = handleHtml({ value: '<br/>' }, { type: 'paragraph' }, [], undefined);
    expect(br.el?.type).toBe('break');

    const close = handleHtml(
      { value: '</strong>' },
      { type: 'paragraph' },
      [{ tag: 'strong' }],
      undefined,
    );
    expect(close.htmlTag).toEqual([]);

    const iframe = handleHtml(
      { value: '<iframe src="https://v.example/embed"></iframe>' },
      null,
      [],
      undefined,
    );
    expect(iframe.el).toBeTruthy();
  });

  it('findImageElement：iframe / img 自闭合 / video source', () => {
    expect(findImageElement('<iframe src="https://x.com"></iframe>')?.tagName).toBe(
      'iframe',
    );
    expect(findImageElement('<img src="a.png"/>')?.tagName).toBe('img');
    const video = findImageElement(
      '<video><source src="v.mp4"/></video>',
    );
    expect(video?.tagName).toBe('video');
  });

  it('findAttachment：带 data-size', () => {
    expect(
      findAttachment(
        '<a href="https://f.bin" download data-size="1024">file</a>',
      ),
    ).toMatchObject({ size: 1024 });
  });

  it('preprocessSpecialTags：内部 code fence 转义', () => {
    const raw = '<think>```js\ncode\n```</think>';
    const out = preprocessSpecialTags(raw, 'think');
    expect(out).toContain('```think');
    expect(out).toContain('CODE_BLOCK');
  });
});
