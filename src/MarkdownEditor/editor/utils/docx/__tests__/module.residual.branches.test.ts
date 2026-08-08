/**
 * docx module TEXT_TAGS / makeDeserializer residual：done class、BR、空白 text。
 */
import { describe, expect, it } from 'vitest';
import { TEXT_TAGS, makeDeserializer } from '../module';

describe('docx/module residual branches', () => {
  it('TEXT_TAGS 标记映射', () => {
    expect(TEXT_TAGS.CODE()).toEqual({ code: true });
    expect(TEXT_TAGS.DEL()).toEqual({ strikethrough: true });
    expect(TEXT_TAGS.B()).toEqual({ bold: true });
    expect(TEXT_TAGS.U()).toEqual({ underline: true });
  });

  it('deserialize：class=done 返回 null；BR→换行；空白 text', () => {
    const jsx = (type: string, attrs: any, children: any) => ({
      type,
      ...attrs,
      children: Array.isArray(children) ? children : [children],
    });
    const deserialize = makeDeserializer(jsx);

    const doneEl = {
      attributes: {
        getNamedItem: () => ({ value: 'done' }),
      },
      nodeType: 1,
      nodeName: 'SPAN',
      childNodes: [],
    };
    expect(deserialize(doneEl, {})).toBeNull();

    expect(
      deserialize(
        {
          nodeType: 1,
          nodeName: 'BR',
          childNodes: [],
        },
        {},
      ),
    ).toBe('\n');

    expect(
      deserialize(
        {
          nodeType: 3,
          nodeName: '#text',
          textContent: '   \n  ',
          parentNode: { nodeName: 'P' },
        },
        {},
      ),
    ).toBeNull();
  });
});
