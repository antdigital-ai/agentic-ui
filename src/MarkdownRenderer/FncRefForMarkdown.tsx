import React, { useMemo } from 'react';

import { FncLeaf } from '../MarkdownEditor/editor/elements/FncLeaf';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';

export interface MarkdownLinkInterceptConfig {
  openInNewTab?: boolean;
  onClick?: (url?: string) => boolean | void;
}

const FOOTNOTE_HREF_ID = /user-content-fn-([^#?]+)$/i;

const extractSingleChildText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractSingleChildText).join('');
  if (
    React.isValidElement(node) &&
    node.props !== undefined &&
    node.props.children !== undefined &&
    node.props.children !== null
  ) {
    return extractSingleChildText(node.props.children);
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
  const el = only as React.ReactElement<{ href?: string; children?: React.ReactNode }>;
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
export const FncRefForMarkdown: React.FC<FncRefForMarkdownProps> = ({
  fncProps,
  linkConfig,
  identifier,
  children,
  url,
}) => {
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

  return (
    <FncLeaf
      attributes={{ 'data-slate-leaf': true }}
      leaf={leaf}
      text={leaf}
      fncProps={fncProps}
      linkConfig={linkConfig}
    >
      {children}
    </FncLeaf>
  );
};
