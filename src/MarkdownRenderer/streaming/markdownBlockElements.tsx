import React from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { Processor } from 'unified';
import {
  MarkdownBlockPiece,
  type MarkdownBlockPieceProps,
} from './MarkdownBlockPiece';

export interface MarkdownBlockElements {
  generation: number;
  processor: Processor;
  components: MarkdownBlockPieceProps['components'];
  streaming: boolean;
  elements: React.ReactElement<MarkdownBlockPieceProps>[];
  node: React.ReactNode;
}

/** Reuse unchanged block elements so React can skip their memo boundaries. */
export function createMarkdownBlockElements(
  blocks: string[],
  visibleCount: number,
  generation: number,
  processor: Processor,
  components: MarkdownBlockPieceProps['components'],
  streaming: boolean,
  previous?: MarkdownBlockElements,
): MarkdownBlockElements {
  const reusable =
    previous !== undefined &&
    previous.generation === generation &&
    previous.processor === processor &&
    previous.components === components &&
    previous.streaming === streaming;
  const renderCount = Math.min(visibleCount, blocks.length);
  const elements = new Array<React.ReactElement<MarkdownBlockPieceProps>>(
    renderCount,
  );
  let unchanged = reusable && previous.elements.length === renderCount;

  for (let index = 0; index < renderCount; index++) {
    const blockSource = blocks[index];
    const variant = index === blocks.length - 1 ? 'tail' : 'sealed';
    const cached = reusable ? previous.elements[index] : undefined;
    if (
      cached?.props.blockSource === blockSource &&
      cached.props.variant === variant
    ) {
      elements[index] = cached;
      continue;
    }
    unchanged = false;
    elements[index] = jsx(
      MarkdownBlockPiece,
      { variant, blockSource, processor, components, streaming },
      `b-${generation}-${index}`,
    ) as React.ReactElement<MarkdownBlockPieceProps>;
  }

  if (unchanged && previous) return previous;
  return {
    generation,
    processor,
    components,
    streaming,
    elements,
    node: elements.length ? jsxs(Fragment, { children: elements }) : null,
  };
}
