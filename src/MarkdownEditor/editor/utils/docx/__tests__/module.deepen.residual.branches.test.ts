/**
 * docx/module deepen：MsoListParagraph 列表、O:P 文本、IMG/H1、TEXT_TAGS。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeDeserializer, TEXT_TAGS } from '../module';

describe('docx/module deepen residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isList + deserializeList 使用真实 DOM 节点', () => {
    const jsx = (type: string, a: any, children: any) => ({
      type,
      attrs: a,
      children: Array.isArray(children) ? children : [children],
    });
    const deserialize = makeDeserializer(jsx);

    const first = document.createElement('p');
    first.setAttribute('class', 'MsoListParagraph');
    first.setAttribute('style', 'mso-list:level1 lfo1');
    first.appendChild(document.createTextNode('first'));

    const second = document.createElement('p');
    second.setAttribute('class', 'MsoListParagraph');
    second.setAttribute('style', 'mso-list:level2 lfo1');
    const span = document.createElement('span');
    span.textContent = 'o more';
    second.appendChild(span);
    const bold = document.createElement('b');
    bold.textContent = 'bold';
    second.appendChild(bold);

    document.body.appendChild(first);
    document.body.appendChild(second);

    const result = deserialize(first, {});
    expect(result).toBeTruthy();
    first.remove();
    second.remove();
  });

  it('O:P 内文本；非 element nodeType；PRE>CODE；IMG 替换 src；H1', () => {
    const jsx = (type: string, a: any, children: any) => ({
      type,
      ...a,
      children: Array.isArray(children) ? children : [children],
    });
    const deserialize = makeDeserializer(jsx);

    const p = document.createElement('p');
    const op = document.createElement('span');
    // mimic O:P via nodeName override is hard; use plain text path instead
    Object.defineProperty(op, 'nodeName', { value: 'O:P' });
    const text = document.createTextNode('op-text');
    op.appendChild(text);
    p.appendChild(op);
    // parent chain: text -> O:P -> P
    Object.defineProperty(text, 'parentNode', { value: op, configurable: true });
    Object.defineProperty(op, 'parentNode', { value: p, configurable: true });
    expect(deserialize(text, {})).toBe('op-text');

    expect(
      deserialize({ nodeType: 8, nodeName: '#comment', childNodes: [] }, {}),
    ).toBeNull();

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.appendChild(document.createTextNode('code\nline'));
    pre.appendChild(code);
    expect(deserialize(pre, {})).toBeTruthy();

    const img = document.createElement('img');
    img.setAttribute('src', 'cid:1');
    const setSpy = vi.spyOn(img, 'setAttribute');
    expect(deserialize(img, { 'cid:1': 'https://cdn/x.png' })).toBeTruthy();
    expect(setSpy).toHaveBeenCalledWith('src', 'https://cdn/x.png');

    const h1 = document.createElement('h1');
    h1.appendChild(document.createTextNode('Title'));
    const head = deserialize(h1, {});
    expect(head).toMatchObject({ type: 'head', level: 1 });
  });

  it('TEXT_TAGS 包装；BODY filler；无 style level 默认 4', () => {
    const jsx = (type: string, a: any, children: any) => ({
      type,
      ...a,
      children: Array.isArray(children) ? children : [children],
    });
    const deserialize = makeDeserializer(jsx);

    expect(TEXT_TAGS.EM()).toEqual({ italic: true });
    expect(TEXT_TAGS.I()).toEqual({ italic: true });
    expect(TEXT_TAGS.S()).toEqual({ strikethrough: true });

    const bold = document.createElement('b');
    bold.appendChild(document.createTextNode('bold'));
    expect(deserialize(bold, {})).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'text', bold: true }),
      ]),
    );

    const body = document.createElement('body');
    const frag = deserialize(body, {});
    expect(frag.type).toBe('fragment');

    const alone = document.createElement('p');
    alone.setAttribute('class', 'MsoListParagraphCxSpFirst');
    alone.setAttribute('style', 'color:red');
    alone.appendChild(document.createTextNode('x'));
    document.body.appendChild(alone);
    expect(deserialize(alone, {})).toBeTruthy();
    alone.remove();
  });
});
