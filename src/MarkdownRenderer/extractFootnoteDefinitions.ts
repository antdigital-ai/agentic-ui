import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/** 与 `fncProps.onFootnoteDefinitionChange` 数组元素一致 */
export interface FootnoteDefinitionRow {
  id: any;
  placeholder: any;
  origin_text: any;
  url: any;
  origin_url: any;
}

const mdastFootnoteProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm, { singleTilde: false });

interface FootnoteMdastNode {
  type: string;
  identifier?: string;
  label?: string;
  value?: string;
  children?: FootnoteMdastNode[];
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
}

/** @internal A render-local extraction; publish it only after commit. */
export interface FootnoteExtractionSnapshot {
  content: string;
  definitions: FootnoteDefinitionRow[];
  prefixDefinitions: FootnoteDefinitionRow[];
  definitionIds: ReadonlySet<string>;
  referenceContext: string;
  tailOffset: number;
}

// A complete HTML comment prevents separate list/quote/indented-code blocks
// from joining when irrelevant blocks between their source ranges are omitted.
const CONTEXT_SEPARATOR = '\n\n<!-- footnote-context-boundary -->\n\n';
const MAX_INCREMENTAL_TAIL = 16_384;

const sourceLineStart = (content: string, offset: number) => {
  let start = offset;
  while (
    start > 0 &&
    content[start - 1] !== '\n' &&
    content[start - 1] !== '\r'
  ) {
    start -= 1;
  }
  return start;
};

const inspectFootnotes = (tree: FootnoteMdastNode, fromOffset = 0) => {
  const definitions: FootnoteDefinitionRow[] = [];
  const definitionIds = new Set<string>();
  visit(tree, (node: FootnoteMdastNode) => {
    if (node.type === 'definition' || node.type === 'footnoteDefinition') {
      definitionIds.add(`${node.type}:${node.identifier}`);
    }
    if (
      node.type === 'footnoteDefinition' &&
      (node.position?.start.offset ?? 0) >= fromOffset
    ) {
      definitions.push({
        id: node.identifier,
        placeholder: node.label ?? node.identifier,
        origin_text: mdastPlainText(node),
        url: undefined,
        origin_url: undefined,
      });
    }
  });
  return { definitions, definitionIds };
};

const parseFootnoteTree = (content: string) =>
  mdastFootnoteProcessor.parse(content) as unknown as FootnoteMdastNode;

const fullSnapshot = (content: string): FootnoteExtractionSnapshot => {
  const tree = parseFootnoteTree(content);
  const { definitions, definitionIds } = inspectFootnotes(tree);
  const children = tree.children ?? [];
  // Reparse complete outer containers, retaining two tail blocks so a partial
  // final marker can still change the preceding block's interpretation.
  const prefixCount = Math.max(0, children.length - 2);
  const candidateOffset = children[prefixCount]?.position?.start.offset ?? 0;
  const tailOffset = sourceLineStart(content, candidateOffset);
  const prefixDefinitions: FootnoteDefinitionRow[] = [];
  const contexts: string[] = [];
  for (let index = 0; index < prefixCount; index += 1) {
    const child = children[index];
    const inspected = inspectFootnotes(child);
    prefixDefinitions.push(...inspected.definitions);
    if (!inspected.definitionIds.size) continue;
    const start = child.position?.start.offset;
    const end = child.position?.end.offset;
    if (start === undefined || end === undefined) continue;
    const lineStart = sourceLineStart(content, start);
    contexts.push(content.slice(lineStart, end));
  }
  const referenceContext = contexts.length
    ? contexts.join(CONTEXT_SEPARATOR) + CONTEXT_SEPARATOR
    : '';
  return {
    content,
    definitions,
    prefixDefinitions,
    definitionIds,
    referenceContext,
    tailOffset,
  };
};

/**
 * Reparse the changing tail with the original enclosing Markdown containers
 * and all sealed definition contexts. New or invalidated global identifiers
 * require full parsing because they can resolve references in earlier notes.
 */
export const extractStreamingFootnoteDefinitions = (
  content: string,
  previous?: FootnoteExtractionSnapshot,
): FootnoteExtractionSnapshot => {
  if (content === previous?.content) return previous;
  try {
    if (
      previous &&
      previous.tailOffset > 0 &&
      content.startsWith(previous.content) &&
      content.length - previous.tailOffset <= MAX_INCREMENTAL_TAIL &&
      previous.referenceContext.length + content.length - previous.tailOffset <
        content.length * 0.85
    ) {
      const source =
        previous.referenceContext + content.slice(previous.tailOffset);
      const { definitions, definitionIds } = inspectFootnotes(
        parseFootnoteTree(source),
        previous.referenceContext.length,
      );
      if (
        definitionIds.size === previous.definitionIds.size &&
        [...definitionIds].every((id) => previous.definitionIds.has(id))
      ) {
        return {
          ...previous,
          content,
          definitions: previous.prefixDefinitions.concat(definitions),
        };
      }
    }
    return fullSnapshot(content);
  } catch {
    return {
      content,
      definitions: [],
      prefixDefinitions: [],
      definitionIds: new Set(),
      referenceContext: '',
      tailOffset: 0,
    };
  }
};

const mdastPlainText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) {
    return node.children.map(mdastPlainText).join('');
  }
  return '';
};

/**
 * 从 Markdown 源码提取 GFM 脚注定义，结构与 Slate 只读 Editor 中
 * `fncProps.onFootnoteDefinitionChange` 入参对齐。
 */
export const extractFootnoteDefinitionsFromMarkdown = (
  content: string,
): FootnoteDefinitionRow[] => {
  if (!content?.trim()) return [];
  try {
    return inspectFootnotes(parseFootnoteTree(content)).definitions;
  } catch {
    return [];
  }
};
