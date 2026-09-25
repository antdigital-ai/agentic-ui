/**
 * parseHtml deepen2：mark 嵌套/空 schema、card 空 schema、
 * p align 空内容、无 size 附件、无 lang fence、media 无 url、think catch。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMediaNodeFromElement,
  findAttachment,
  findImageElement,
  handleHtml,
  preprocessSpecialTags,
} from '../parseHtml';

describe('parseHtml deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('createMediaNode：无 url 的 img；video 自闭合无 source', () => {
    const bare = findImageElement('<img>');
    expect(bare?.tagName).toBe('img');
    expect(createMediaNodeFromElement(bare)).toBeTruthy();

    const videoBare = findImageElement('<video/>');
    expect(videoBare?.tagName).toBe('video');
    expect(createMediaNodeFromElement(videoBare)).toBeTruthy();
  });

  it('handleHtml：mark 嵌套 children + parseMarkdown 空 schema 回退', () => {
    const nested = handleHtml(
      { value: '<mark>**x**</mark>' },
      null,
      [],
      () => ({
        schema: [
          {
            type: 'paragraph',
            children: [{ type: 'strong', children: [{ text: 'x' }] }],
          },
        ],
      }),
    );
    expect(nested.el).toBeTruthy();

    const emptySchema = handleHtml(
      { value: '<mark color="red">y</mark>' },
      null,
      [],
      () => ({ schema: [] }),
    );
    expect(emptySchema.el).toMatchObject({
      type: 'paragraph',
      children: [expect.objectContaining({ text: 'y', mark: true })],
    });
  });

  it('handleHtml：card 空 schema / 空 inner 走 fallback wrapper', () => {
    const emptyCardSchema = handleHtml(
      { value: '<div data-card="true">body</div>' },
      null,
      [],
      () => ({ schema: [] }),
    );
    expect(emptyCardSchema.el).toBeTruthy();

    const emptyInner = handleHtml(
      { value: '<div data-card="true">   </div>' },
      null,
      [],
      () => ({
        schema: [{ type: 'paragraph', children: [{ text: 'noop' }] }],
      }),
    );
    expect(emptyInner.el).toBeTruthy();
  });

  it('handleHtml：p align 空 body；chartType 对象注释', () => {
    const emptyAlign = handleHtml(
      { value: '<p align="left"></p>' },
      null,
      [],
      () => ({ schema: [] }),
    );
    expect(emptyAlign.el).toMatchObject({
      type: 'paragraph',
      align: 'left',
      children: [{ text: '' }],
    });

    const chartObj = handleHtml(
      { value: '<!--{"chartType":"pie","data":[]}-->' },
      null,
      [],
      undefined,
    );
    expect(chartObj.el).toBeTruthy();
  });

  it('handleHtml：p align 非 paragraph 但有 children', () => {
    const headed = handleHtml(
      { value: '<p align="right">x</p>' },
      null,
      [],
      () => ({
        schema: [{ type: 'head', level: 1, children: [{ text: 'x' }] }],
      }),
    );
    expect(headed.el).toMatchObject({
      type: 'head',
      align: 'right',
    });
  });

  it('findAttachment：无 data-size 时 size=0', () => {
    expect(
      findAttachment('<a href="https://f.bin" download>f</a>'),
    ).toMatchObject({ url: 'https://f.bin', size: 0 });
  });

  it('preprocessSpecialTags：无语言 fence 仍转义', () => {
    const out = preprocessSpecialTags('<answer>```\ncode\n```</answer>', 'answer');
    expect(out).toContain('```answer');
    expect(out).toContain('CODE_BLOCK:');
  });
});
