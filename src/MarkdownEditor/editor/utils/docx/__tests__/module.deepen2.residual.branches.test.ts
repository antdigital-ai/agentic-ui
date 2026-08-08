/**
 * docx/module deepen2：class done 早退、O:P 非 P 父、空白 trim、TEXT_TAGS catch、SPAN 清理。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeDeserializer, TEXT_TAGS } from '../module';

describe('docx/module deepen2 residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const jsx = (type: string, a: any, children: any) => ({
    type,
    ...a,
    children: Array.isArray(children) ? children : [children],
  });

  it('class=done 节点直接 null', () => {
    const deserialize = makeDeserializer(jsx);
    const el = document.createElement('p');
    el.setAttribute('class', 'done');
    el.appendChild(document.createTextNode('x'));
    expect(deserialize(el, {})).toBeNull();
  });

  it('O:P 文本但祖父非 P；纯空白 trim 为 null', () => {
    const deserialize = makeDeserializer(jsx);
    const div = document.createElement('div');
    const op = document.createElement('span');
    Object.defineProperty(op, 'nodeName', { value: 'O:P' });
    const text = document.createTextNode('   ');
    op.appendChild(text);
    div.appendChild(op);
    Object.defineProperty(text, 'parentNode', { value: op, configurable: true });
    Object.defineProperty(op, 'parentNode', {
      value: div,
      configurable: true,
    });
    // O:P but parent of O:P is DIV not P → fall through to whitespace trim
    expect(deserialize(text, {})).toBeNull();

    const spaced = document.createTextNode('  hello\nworld  ');
    const p = document.createElement('p');
    p.appendChild(spaced);
    Object.defineProperty(spaced, 'parentNode', {
      value: p,
      configurable: true,
    });
    expect(deserialize(spaced, {})).toMatch(/hello/);
  });

  it('BR；IMG 无 imageTags 映射；H2/H3 align', () => {
    const deserialize = makeDeserializer(jsx);
    const br = document.createElement('br');
    expect(deserialize(br, {})).toBe('\n');

    const img = document.createElement('img');
    img.setAttribute('src', 'cid:missing');
    expect(deserialize(img, {})).toBeTruthy();

    const h2 = document.createElement('h2');
    h2.appendChild(document.createTextNode('H2'));
    h2.setAttribute('align', 'center');
    const head = deserialize(h2, {});
    expect(head).toMatchObject({ type: 'head', level: 2 });
  });

  it('TEXT_TAGS map 非 string child；CODE/DEL/U', () => {
    const deserialize = makeDeserializer(jsx);
    expect(TEXT_TAGS.CODE()).toEqual({ code: true });
    expect(TEXT_TAGS.DEL()).toEqual({ strikethrough: true });
    expect(TEXT_TAGS.U()).toEqual({ underline: true });

    const em = document.createElement('em');
    const nested = document.createElement('span');
    nested.textContent = 'n';
    em.appendChild(nested);
    // span is not TEXT → children may include arrays
    expect(() => deserialize(em, {})).not.toThrow();

    const code = document.createElement('code');
    code.appendChild(document.createTextNode('c'));
    expect(deserialize(code, {})).toBeTruthy();
  });

  it('extractTextFromNodes：#text 与 SPAN o 前缀清理；list item deserialize 失败 fallback', () => {
    const deserialize = makeDeserializer(jsx);
    const li = document.createElement('p');
    li.setAttribute('class', 'MsoListParagraph');
    li.setAttribute('style', 'mso-list:level1 lfo1');
    const span = document.createElement('span');
    span.textContent = 'o item';
    li.appendChild(span);
    const text = document.createTextNode('plain');
    li.appendChild(text);
    document.body.appendChild(li);
    expect(deserialize(li, {})).toBeTruthy();
    li.remove();
  });

  it('getSiblings 无 style level 默认 4；非 list class 返回 false', () => {
    const deserialize = makeDeserializer(jsx);
    const p = document.createElement('p');
    p.setAttribute('class', 'Normal');
    p.appendChild(document.createTextNode('n'));
    expect(deserialize(p, {})).toBeTruthy();

    const alone = document.createElement('p');
    alone.setAttribute('class', 'MsoListParagraph');
    // no style → default level 4
    alone.appendChild(document.createTextNode('solo'));
    document.body.appendChild(alone);
    expect(deserialize(alone, {})).toBeTruthy();
    alone.remove();
  });
});
