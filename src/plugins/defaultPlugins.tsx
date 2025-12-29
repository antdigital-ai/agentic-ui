import { ChartElement } from './chart';
import { CodeElement } from './code';
import { InlineKatex, KatexElement } from './katex';
import { Mermaid } from './mermaid/Mermaid';

export const standardPlugins = [
  {
    elements: {
      code: CodeElement,
      chart: ChartElement,
      katex: KatexElement,
      mermaid: Mermaid,
      'inline-katex': InlineKatex,
    },
  },
];
