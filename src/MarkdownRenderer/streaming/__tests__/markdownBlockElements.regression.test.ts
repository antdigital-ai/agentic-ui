import { expect, it } from 'vitest';
import { createHastProcessor } from '../../processor';
import { createMarkdownBlockElements } from '../markdownBlockElements';

it('creates only one new block element for each streamed tail update', () => {
  const processor = createHastProcessor();
  const components = {};
  const blocks = Array.from(
    { length: 1000 },
    (_, index) => `Paragraph ${index}`,
  );
  let previous = createMarkdownBlockElements(
    blocks,
    blocks.length,
    0,
    processor,
    components,
    true,
  );
  let created = 0;
  for (let step = 0; step < 100; step++) {
    const nextBlocks = blocks.slice();
    nextBlocks[nextBlocks.length - 1] += ` update ${step}`;
    const next = createMarkdownBlockElements(
      nextBlocks,
      nextBlocks.length,
      0,
      processor,
      components,
      true,
      previous,
    );
    created += next.elements.filter(
      (element, index) => element !== previous.elements[index],
    ).length;
    expect(next.elements[0]).toBe(previous.elements[0]);
    previous = next;
  }
  expect(created).toBe(100);
});

it('promotes the old tail with its existing key and reuses earlier blocks', () => {
  const processor = createHastProcessor();
  const components = {};
  const previous = createMarkdownBlockElements(
    ['One', 'Two', 'Tail'],
    3,
    0,
    processor,
    components,
    true,
  );
  const next = createMarkdownBlockElements(
    ['One', 'Two', 'Tail', 'New tail'],
    4,
    0,
    processor,
    components,
    true,
    previous,
  );
  expect(next.elements[0]).toBe(previous.elements[0]);
  expect(next.elements[1]).toBe(previous.elements[1]);
  expect(next.elements[2]).not.toBe(previous.elements[2]);
  expect(next.elements[2].props.variant).toBe('sealed');
  expect(next.elements[2].key).toBe(previous.elements[2].key);
});

it('reuses the whole output when source changes do not alter any visible block', () => {
  const processor = createHastProcessor();
  const components = {};
  const previous = createMarkdownBlockElements(
    ['One', 'Two'],
    2,
    0,
    processor,
    components,
    true,
  );
  expect(
    createMarkdownBlockElements(
      ['One', 'Two'],
      2,
      0,
      processor,
      components,
      true,
      previous,
    ),
  ).toBe(previous);
});

it('updates every affected element for processor, components, streaming and revision changes', () => {
  const processor = createHastProcessor();
  const components = {};
  const blocks = ['One', 'Two'];
  const previous = createMarkdownBlockElements(
    blocks,
    2,
    0,
    processor,
    components,
    true,
  );
  const changed = [
    createMarkdownBlockElements(
      blocks,
      2,
      0,
      createHastProcessor(),
      components,
      true,
      previous,
    ),
    createMarkdownBlockElements(blocks, 2, 0, processor, {}, true, previous),
    createMarkdownBlockElements(
      blocks,
      2,
      0,
      processor,
      components,
      false,
      previous,
    ),
    createMarkdownBlockElements(
      blocks,
      2,
      1,
      processor,
      components,
      true,
      previous,
    ),
  ];
  for (const next of changed) {
    expect(next.elements[0]).not.toBe(previous.elements[0]);
    expect(next.elements[1]).not.toBe(previous.elements[1]);
  }
  expect(changed.at(-1)?.elements[0].key).not.toBe(previous.elements[0].key);
});

it('retains mounted prefix elements as progressive rendering advances', () => {
  const processor = createHastProcessor();
  const components = {};
  const blocks = Array.from({ length: 30 }, (_, index) => `Paragraph ${index}`);
  const previous = createMarkdownBlockElements(
    blocks,
    8,
    0,
    processor,
    components,
    false,
  );
  const next = createMarkdownBlockElements(
    blocks,
    14,
    0,
    processor,
    components,
    false,
    previous,
  );
  expect(next.elements).toHaveLength(14);
  expect(next.elements.slice(0, 8)).toEqual(previous.elements);
  for (let index = 0; index < 8; index++) {
    expect(next.elements[index]).toBe(previous.elements[index]);
  }
});
