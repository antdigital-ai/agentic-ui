/**
 * parserMdToSchema deepen：links 缺省走 `|| []`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../parserMarkdownToSlateNode', () => ({
  parserMarkdownToSlateNode: () => ({
    schema: [{ type: 'paragraph', children: [{ text: 'x' }] }],
    links: null,
  }),
}));

import { parserMdToSchema } from '../parserMdToSchema';

describe('parserMdToSchema deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('links 为 null 时归一为空数组', () => {
    expect(parserMdToSchema('# hi').links).toEqual([]);
  });
});
