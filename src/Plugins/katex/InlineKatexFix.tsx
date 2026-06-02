import React from 'react';

import { useEditorStore } from '../../MarkdownEditor/editor/store';
import type { ElementProps, InlineKatexNode } from '../../MarkdownEditor/el';
import { InlineKatex } from './InlineKatex';
import { INLINE_KATEX_READONLY_STYLE } from './inlineKatexReadonlyStyle';

/**
 * 只读 inline-katex 修复：仅渲染 Slate children，避免与 plainText 重复输出。
 * 编辑态回退到 InlineKatex（KaTeX 渲染 + 隐藏 children）。
 */
export const InlineKatexFix = (
  props: ElementProps<InlineKatexNode> & { style?: React.CSSProperties },
) => {
  const { readonly } = useEditorStore();

  if (readonly) {
    return (
      <code {...props.attributes} style={INLINE_KATEX_READONLY_STYLE}>
        {props.children}
      </code>
    );
  }

  return <InlineKatex {...props} />;
};

InlineKatexFix.displayName = 'InlineKatexFix';
