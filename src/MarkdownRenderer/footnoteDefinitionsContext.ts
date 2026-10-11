import { createContext } from 'react';

import type { FootnoteDefinitionNode } from '../MarkdownEditor/el';

/** Readonly Markdown references need definitions, without an editor store. */
export const FootnoteDefinitionsContext = createContext<ReadonlyMap<
  string,
  FootnoteDefinitionNode
> | null>(null);
