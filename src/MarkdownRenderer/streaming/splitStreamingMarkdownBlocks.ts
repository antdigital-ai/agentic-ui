import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessNormalizeLeafToContainerDirective,
} from '../../MarkdownEditor/editor/parser/constants';
import { debugInfo } from '../../Utils/debugUtils';
import { splitMarkdownBlocks } from '../markdownReactShared';

export interface StreamingMarkdownBlocks {
  content: string;
  blocks: string[];
  offsets: number[];
  reusable: boolean;
}

const EMPTY_BLOCKS: string[] = [];

// These syntaxes can change the source or split a line into multiple blocks.
// Keep their existing whole-document behavior rather than guessing offsets.
const requiresFullSource = (content: string): boolean =>
  content.includes('::') ||
  content.includes(JINJA_DOLLAR_PLACEHOLDER) ||
  /<\/?(?:think|thinking|redacted_thinking)\b/.test(content);

/**
 * Reuse completed blocks and rescan the last two blocks. The previous block
 * remains in the window because an incomplete table/list/footnote marker can
 * still change the boundary as more characters arrive.
 *
 * Compare the completed prefix, rather than the entire previous source:
 * streaming repair can replace an artificial closing fence in the tail.
 */
export function splitStreamingMarkdownBlocks(
  content: string,
  previous?: StreamingMarkdownBlocks,
): StreamingMarkdownBlocks {
  if (content === previous?.content) return previous;
  if (!content) {
    return { content, blocks: EMPTY_BLOCKS, offsets: [], reusable: true };
  }

  const reusable = !requiresFullSource(content);
  let prefix: string[] = [];
  let prefixOffsets: number[] = [];
  let offset = 0;
  if (reusable && previous?.reusable && previous.blocks.length > 2) {
    const reuseCount = previous.blocks.length - 2;
    const candidateOffset = previous.offsets[reuseCount];
    if (
      candidateOffset !== undefined &&
      content.length >= candidateOffset &&
      content.slice(0, candidateOffset) ===
        previous.content.slice(0, candidateOffset)
    ) {
      offset = candidateOffset;
      prefix = previous.blocks.slice(0, reuseCount);
      prefixOffsets = previous.offsets.slice(0, reuseCount);
    }
  }

  try {
    const source = reusable
      ? content.slice(offset)
      : preprocessNormalizeLeafToContainerDirective(
          content.replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$'),
        );
    const splitSuffix = splitMarkdownBlocks(source);
    const suffix =
      prefix.length > 0 && splitSuffix.length === 1 && splitSuffix[0] === ''
        ? EMPTY_BLOCKS
        : splitSuffix;
    const blocks = prefix.concat(suffix);
    const offsets = prefixOffsets;
    if (reusable) {
      let searchFrom = offset;
      for (const block of suffix) {
        const blockOffset = content.indexOf(block, searchFrom);
        if (blockOffset < 0) {
          return { content, blocks, offsets: [], reusable: false };
        }
        offsets.push(blockOffset);
        searchFrom = blockOffset + block.length;
      }
    }
    return { content, blocks, offsets, reusable };
  } catch (error) {
    debugInfo('[MarkdownRenderer] splitMarkdownBlocks failed', {
      error: (error as Error).message || String(error),
    });
    return { content, blocks: EMPTY_BLOCKS, offsets: [], reusable: false };
  }
}
