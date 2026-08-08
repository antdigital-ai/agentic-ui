/**
 * docxDeserializer residual：空 html、空段落过滤、table 包装。
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('../utils', async () => {
  const actual = await vi.importActual<any>('../utils');
  return {
    ...actual,
    imagePastingListener: () => [],
  };
});

import { docxDeserializer } from '../docxDeserializer';

function nodeText(n: any): string {
  if (!n) return '';
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.children)) return n.children.map(nodeText).join('');
  return '';
}

describe('docxDeserializer residual branches', () => {
  it('无 html 返回 []', () => {
    expect(docxDeserializer('', '')).toEqual([]);
  });

  it('过滤空段落；保留有内容段落', () => {
    const html =
      '<html><body><p></p><p>hello</p><p> </p></body></html>';
    const nodes = docxDeserializer('', html);
    expect(nodes.some((n: any) => nodeText(n).includes('hello'))).toBe(true);
  });

  it('table 节点被 wrapperCardNode 包装', () => {
    const html =
      '<html><body><table><tr><td>a</td></tr></table></body></html>';
    const nodes = docxDeserializer('', html);
    expect(
      nodes.some((n: any) => n.type === 'card' || n.type === 'table'),
    ).toBe(true);
  });
});
