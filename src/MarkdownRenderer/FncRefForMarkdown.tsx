import React, { useContext, useMemo } from 'react';

import { FncLeaf } from '../MarkdownEditor/editor/elements/FncLeaf';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import { FootnoteDefinitionsContext } from './footnoteDefinitionsContext';

export interface MarkdownLinkInterceptConfig {
  openInNewTab?: boolean;
  onClick?: (url?: string) => boolean | void;
}

const FOOTNOTE_HREF_ID = /user-content-fn-([^#?]+)$/i;

interface FootnoteSupHastNode {
  type?: string;
  tagName?: string;
  properties?: { href?: unknown };
  children?: FootnoteSupHastNode[];
}

/** JSX component mapping may replace the anchor's React type before sup runs. */
export const extractFootnoteRefFromSupHast = (
  node?: FootnoteSupHastNode,
): { identifier: string; url?: string } | undefined => {
  if (node?.children?.length !== 1) return undefined;
  const anchor = node.children[0];
  if (anchor.type !== 'element' || anchor.tagName !== 'a') return undefined;
  const href = anchor.properties?.href;
  if (typeof href !== 'string') return undefined;
  const match = FOOTNOTE_HREF_ID.exec(href);
  if (!match?.[1]) return undefined;
  return {
    identifier: decodeURIComponent(match[1]),
    url: href.startsWith('http') ? href : undefined,
  };
};

const extractSingleChildText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractSingleChildText).join('');
  if (React.isValidElement(node)) {
    const { children } = node.props as { children?: React.ReactNode };
    if (children !== undefined && children !== null) {
      return extractSingleChildText(children);
    }
  }
  return '';
};

/**
 * 从 GFM 脚注引用 <sup><a href="#user-content-fn-x">…</a></sup> 解析标识符
 */
export const extractFootnoteRefFromSupChildren = (
  children: React.ReactNode,
): { identifier: string; url?: string } | undefined => {
  const childArray = React.Children.toArray(children);
  if (childArray.length !== 1) return undefined;
  const only = childArray[0];
  if (!React.isValidElement(only)) return undefined;
  const el = only as React.ReactElement<{
    href?: string;
    children?: React.ReactNode;
  }>;
  if (typeof el.type !== 'string' || el.type !== 'a') return undefined;
  const href = el.props?.href;
  const labelText = extractSingleChildText(el.props?.children);
  if (typeof href === 'string') {
    const m = FOOTNOTE_HREF_ID.exec(href);
    if (m?.[1]) {
      return {
        identifier: decodeURIComponent(m[1]),
        url: href.startsWith('http') ? href : undefined,
      };
    }
  }
  if (labelText) {
    return { identifier: labelText };
  }
  return undefined;
};

export interface FncRefForMarkdownProps {
  fncProps?: MarkdownEditorProps['fncProps'];
  linkConfig?: MarkdownLinkInterceptConfig;
  identifier: string;
  children: React.ReactNode;
  url?: string;
}

/**
 * 将 Markdown hast 中的脚注引用与 Slate 只读路径的 FncLeaf 对齐
 */
export const FncRefForMarkdown: React.FC<FncRefForMarkdownProps> = React.memo(
  ({
    fncProps,
    linkConfig,
    identifier,
    children,
    url,
  }: FncRefForMarkdownProps) => {
    const definitions = useContext(FootnoteDefinitionsContext);
    const leaf = useMemo(
      () =>
        ({
          fnc: true,
          text: `[^${identifier}]`,
          identifier,
          url,
        }) as any,
      [identifier, url],
    );

    const definition = definitions?.get(identifier);
    // Context updates visit every reference, but only the changed definition
    // should rerender a leaf, including any popup that is currently open.
    return useMemo(
      () => (
        <FncLeaf
          attributes={{ 'data-slate-leaf': true }}
          leaf={leaf}
          text={leaf}
          fncProps={fncProps}
          linkConfig={linkConfig}
          definition={definition}
        >
          {children}
        </FncLeaf>
      ),
      [leaf, fncProps, linkConfig, definition, children],
    );
  },
);

FncRefForMarkdown.displayName = 'FncRefForMarkdown';
