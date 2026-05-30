import { describe, expect, it } from 'vitest';

import { createHastProcessor } from '../processor';

const renderToHast = (
  markdown: string,
  formula?: Parameters<typeof createHastProcessor>[2],
) => {
  const processor = createHastProcessor(undefined, undefined, formula);
  return processor.runSync(processor.parse(markdown)) as any;
};

const collectNodesByClassName = (node: any, className: string): any[] => {
  if (!node || typeof node !== 'object') {
    return [];
  }

  const classNames = Array.isArray(node.properties?.className)
    ? node.properties.className
    : [];
  const current = classNames.includes(className) ? [node] : [];
  const children = Array.isArray(node.children) ? node.children : [];
  return children.reduce(
    (matchedNodes, child) => [
      ...matchedNodes,
      ...collectNodesByClassName(child, className),
    ],
    current,
  );
};

describe('createHastProcessor formula config', () => {
  it('omits KaTeX rendering when formulas are disabled', () => {
    const hast = renderToHast('$$E = mc^2$$', { enable: false });

    expect(collectNodesByClassName(hast, 'katex')).toHaveLength(0);
    expect(collectNodesByClassName(hast, 'math-display')).toHaveLength(0);
  });

  it('keeps single-dollar math as text by default', () => {
    const hast = renderToHast('$a^2$');

    expect(collectNodesByClassName(hast, 'katex')).toHaveLength(0);
    expect(hast.children[0].children[0]).toMatchObject({
      type: 'text',
      value: '$a^2$',
    });
  });

  it('can opt in to single-dollar math parsing for renderer output', () => {
    const hast = renderToHast('$a^2$', { singleDollarTextMath: true });

    expect(collectNodesByClassName(hast, 'katex')).toHaveLength(1);
    expect(collectNodesByClassName(hast, 'math-inline')).toHaveLength(1);
  });
});
