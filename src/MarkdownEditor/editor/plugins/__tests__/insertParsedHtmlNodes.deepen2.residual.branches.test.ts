/**
 * insertParsedHtmlNodes deepen2：ELEMENT_TAGS align、IMG 校验、
 * htmlToFragmentList 复杂、TEXT_TAGS、空 figure。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deserialize,
  ELEMENT_TAGS,
  htmlToFragmentList,
  TEXT_TAGS,
} from '../insertParsedHtmlNodes';

describe('insertParsedHtmlNodes deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ELEMENT_TAGS：H1-H5 align / data-align / style.textAlign', () => {
    const el = document.createElement('h1');
    el.setAttribute('align', 'center');
    expect(ELEMENT_TAGS.H1(el)).toMatchObject({ level: 1, align: 'center' });

    const h2 = document.createElement('h2');
    h2.style.textAlign = 'right';
    expect(ELEMENT_TAGS.H2(h2)).toMatchObject({ level: 2, align: 'right' });

    const h3 = document.createElement('h3');
    h3.setAttribute('data-align', 'left');
    expect(ELEMENT_TAGS.H3(h3)).toMatchObject({ level: 3, align: 'left' });

    expect(ELEMENT_TAGS.H4(document.createElement('h4'))).toMatchObject({
      level: 4,
    });
    expect(ELEMENT_TAGS.H5(document.createElement('h5'))).toMatchObject({
      level: 5,
    });
    expect(ELEMENT_TAGS.BLOCKQUOTE()).toMatchObject({ type: 'blockquote' });
    expect(ELEMENT_TAGS.TABLE()).toMatchObject({ type: 'table' });
  });

  it('ELEMENT_TAGS.IMG：无效 url / blob / http 扩展名', () => {
    const bad = document.createElement('img');
    bad.src = 'ftp://x';
    expect(ELEMENT_TAGS.IMG(bad as HTMLImageElement)).toBeTruthy();

    const blob = document.createElement('img');
    Object.defineProperty(blob, 'src', { value: 'blob:http://local/1' });
    expect(ELEMENT_TAGS.IMG(blob as HTMLImageElement)).toBeTruthy();

    const http = document.createElement('img');
    Object.defineProperty(http, 'src', {
      value: 'https://cdn.example/a.png',
    });
    http.alt = 'pic';
    expect(ELEMENT_TAGS.IMG(http as HTMLImageElement)).toBeTruthy();
  });

  it('TEXT_TAGS / deserialize 嵌套 span', () => {
    expect(TEXT_TAGS.STRONG()).toMatchObject({ bold: true });

    const span = document.createElement('span');
    span.innerHTML = '<em>i</em>';
    const out = deserialize(span);
    expect(out).toBeTruthy();
  });

  it('htmlToFragmentList：列表 / 空 figure / br', () => {
    const list = htmlToFragmentList('<ul><li>a</li></ul>', 'ltr');
    expect(Array.isArray(list)).toBe(true);

    const fig = htmlToFragmentList('<figure></figure>', 'rtl');
    expect(Array.isArray(fig)).toBe(true);

    const withBr = htmlToFragmentList('<p>a<br/>b</p>', 'ltr');
    expect(Array.isArray(withBr)).toBe(true);
  });

  it('deserialize：COMMENT 返回 null；BODY fragment', () => {
    const comment = document.createComment('x');
    expect(deserialize(comment as any)).toBeNull();

    const body = document.createElement('body');
    body.innerHTML = '<p>p</p>';
    const nodes = deserialize(body);
    expect(nodes).toBeTruthy();
  });
});
