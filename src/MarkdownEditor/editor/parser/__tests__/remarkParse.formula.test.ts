import type { Root } from 'mdast';
import { describe, expect, it } from 'vitest';

import { getMarkdownParser } from '../remarkParse';

const parseMarkdown = (
  markdown: string,
  formula?: Parameters<typeof getMarkdownParser>[0],
) => {
  const parser = getMarkdownParser(formula);
  return parser.runSync(parser.parse(markdown)) as Root;
};

const getFirstParagraphChild = (root: Root) => {
  const paragraph = root.children[0] as any;
  expect(paragraph.type).toBe('paragraph');
  return paragraph.children[0];
};

describe('getMarkdownParser formula config', () => {
  it('does not parse block math when formula parsing is disabled', () => {
    const root = parseMarkdown('$$E = mc^2$$', { enable: false });

    expect(root.children).toHaveLength(1);
    expect(getFirstParagraphChild(root)).toMatchObject({
      type: 'text',
      value: '$$E = mc^2$$',
    });
  });

  it('switches cached parsers when single-dollar math config changes', () => {
    const defaultRoot = parseMarkdown('$a^2$');
    expect(getFirstParagraphChild(defaultRoot)).toMatchObject({
      type: 'text',
      value: '$a^2$',
    });

    const enabledRoot = parseMarkdown('$a^2$', {
      singleDollarTextMath: true,
    });
    expect(getFirstParagraphChild(enabledRoot)).toMatchObject({
      type: 'inlineMath',
      value: 'a^2',
    });

    const disabledAgainRoot = parseMarkdown('$a^2$', {
      singleDollarTextMath: false,
    });
    expect(getFirstParagraphChild(disabledAgainRoot)).toMatchObject({
      type: 'text',
      value: '$a^2$',
    });
  });
});
