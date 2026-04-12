import { describe, expect, it } from 'vitest';
import { remarkContainer } from '../remarkContainer';

function mkText(value: string) {
  return { type: 'text', value };
}

function mkParagraph(children: any[]) {
  return { type: 'paragraph', children };
}

describe('remarkContainer', () => {
  it('transforms ::: container with content', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::info')]),
        mkParagraph([mkText('content')]),
        mkParagraph([mkText(':::')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].type).toBe('container');
    expect(tree.children[0].data.hProperties.className).toContain('info');
  });

  it('transforms container with title', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::warning Watch Out')]),
        mkParagraph([mkText('body')]),
        mkParagraph([mkText(':::')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(1);
    const container = tree.children[0];
    expect(container.children[0].children[0].value).toBe('Watch Out');
  });

  it('handles container without title', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::tip')]),
        mkParagraph([mkText('tip content')]),
        mkParagraph([mkText(':::')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children[0].data.hProperties.className).toContain('tip');
  });

  it('ignores non-matching paragraphs', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText('just text')]),
        mkParagraph([mkText('more text')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(2);
  });

  it('ignores non-paragraph nodes', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'heading', depth: 1, children: [mkText('heading')] },
        mkParagraph([mkText('text')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(2);
  });

  it('ignores non-literal first children', () => {
    const tree = {
      type: 'root',
      children: [mkParagraph([{ type: 'strong', children: [] }])],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(1);
  });

  it('handles non-root tree', () => {
    const tree = { type: 'other', children: [] };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(0);
  });

  it('handles tree without children', () => {
    const tree = { type: 'root' } as any;
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children).toBeUndefined();
  });

  it('accepts custom options', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::note')]),
        mkParagraph([mkText('body')]),
        mkParagraph([mkText(':::')]),
      ],
    };
    const transform = remarkContainer({
      className: 'custom-class',
      containerTag: 'section',
      titleElement: null,
    });
    transform(tree);
    expect(tree.children[0].data.hName).toBe('section');
    expect(tree.children[0].data.hProperties.className).toContain(
      'custom-class',
    );
  });

  it('skips title when titleElement is null', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::info My Title')]),
        mkParagraph([mkText('body')]),
        mkParagraph([mkText(':::')]),
      ],
    };
    const transform = remarkContainer({ titleElement: null });
    transform(tree);
    const container = tree.children[0];
    expect(
      container.children.every(
        (c: any) => !c.data?.hProperties?.className?.includes('__title'),
      ),
    ).toBe(true);
  });

  it('handles inner non-paragraph nodes between ::: markers', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::info')]),
        { type: 'code', value: 'code block' },
        mkParagraph([mkText(':::')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBe(1);
    expect(tree.children[0].children.length).toBe(1);
    expect(tree.children[0].children[0].type).toBe('code');
  });

  it('handles unclosed container', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph([mkText(':::info')]),
        mkParagraph([mkText('content without closing')]),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children.length).toBeLessThanOrEqual(2);
  });
});
