import { useLayoutEffect, useMemo, useRef } from 'react';
import { extractFilemapBlocks } from './extractFilemapBlocks';

type FilemapExtraction = ReturnType<typeof extractFilemapBlocks>;

/** @internal Preserve attachment identities across ordinary body updates. */
export const extractStableFilemapBlocks = (
  content: string,
  previous?: FilemapExtraction,
): FilemapExtraction => {
  const result = extractFilemapBlocks(content);
  const blocks = result.blocks.map((block, index) => {
    const previousBlock = previous?.blocks[index];
    return previousBlock?.raw === block.raw ? previousBlock : block;
  });
  if (
    previous?.blocks.length === blocks.length &&
    blocks.every((block, index) => block === previous.blocks[index])
  ) {
    return { blocks: previous.blocks, stripped: result.stripped };
  }
  return { blocks, stripped: result.stripped };
};

export const useFilemapBlocks = (content: string) => {
  const committed = useRef<FilemapExtraction | undefined>(undefined);
  const extraction = useMemo(
    () => extractStableFilemapBlocks(content, committed.current),
    [content],
  );
  useLayoutEffect(() => {
    committed.current = extraction;
  }, [extraction]);
  return extraction;
};
