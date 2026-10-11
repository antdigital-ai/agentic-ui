import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useRefFunction } from '../Hooks/useRefFunction';
import type { FootnoteDefinitionNode } from '../MarkdownEditor/el';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import {
  extractStreamingFootnoteDefinitions,
  type FootnoteDefinitionRow,
  type FootnoteExtractionSnapshot,
} from './extractFootnoteDefinitions';

export { FootnoteDefinitionsContext } from './footnoteDefinitionsContext';

interface MarkdownFootnoteDefinitions {
  definitions: FootnoteDefinitionRow[];
  definitionMap: ReadonlyMap<string, FootnoteDefinitionNode>;
}

const equalDefinitions = (
  left: FootnoteDefinitionRow[],
  right: FootnoteDefinitionRow[],
) =>
  left.length === right.length &&
  left.every((row, index) => {
    const other = right[index];
    return (
      row.id === other.id &&
      row.placeholder === other.placeholder &&
      row.origin_text === other.origin_text &&
      row.url === other.url &&
      row.origin_url === other.origin_url
    );
  });

export function useFootnoteDefinitions(
  content: string,
  notify?: NonNullable<
    MarkdownEditorProps['fncProps']
  >['onFootnoteDefinitionChange'],
): MarkdownFootnoteDefinitions {
  const empty = useMemo<MarkdownFootnoteDefinitions>(
    () => ({ definitions: [], definitionMap: new Map() }),
    [],
  );
  const committed = useRef(empty);
  const committedExtraction = useRef<FootnoteExtractionSnapshot | undefined>(
    undefined,
  );
  const extraction = useMemo(() => {
    // A reference alone has no body to extract. Permit indentation/nesting;
    // the Markdown parser remains responsible for recognizing definitions.
    if (!content.includes('[^') || !content.includes(']:')) return undefined;
    return extractStreamingFootnoteDefinitions(
      content,
      committedExtraction.current,
    );
  }, [content]);
  const result = useMemo(() => {
    const definitions = extraction?.definitions ?? empty.definitions;
    if (!definitions.length) return empty;
    // Appending unrelated text should not refresh every reference or resend
    // unchanged definitions. Only compare against a committed render snapshot.
    if (equalDefinitions(definitions, committed.current.definitions)) {
      return committed.current;
    }
    const definitionMap = new Map<string, FootnoteDefinitionNode>();
    for (const row of definitions) {
      const identifier = String(row.id);
      const text = String(row.origin_text ?? '');
      const url = row.url ?? row.origin_url;
      const previous = committed.current.definitionMap.get(identifier);
      if (previous?.value === text && previous.url === url) {
        definitionMap.set(identifier, previous);
        continue;
      }
      definitionMap.set(identifier, {
        type: 'footnoteDefinition',
        identifier,
        value: text,
        url: typeof url === 'string' ? url : undefined,
        children: [{ text }],
      });
    }
    return { definitions, definitionMap };
  }, [extraction, empty]);
  useLayoutEffect(() => {
    committed.current = result;
    committedExtraction.current = extraction;
  }, [result, extraction]);

  const notifyCurrent = useRefFunction(
    (definitions: FootnoteDefinitionRow[]) => {
      notify?.(definitions);
    },
  );
  const notificationEnabled = !!notify;
  useEffect(() => {
    if (notificationEnabled) notifyCurrent(result.definitions);
  }, [notificationEnabled, notifyCurrent, result.definitions]);

  return result;
}
