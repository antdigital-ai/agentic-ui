import React from 'react';
import { MarkdownEditor } from '../../MarkdownEditor';
import I18nBoundary from '../../MarkdownEditor/I18nBoundary';
import { MarkdownRenderer } from '../../MarkdownRenderer';
import type { MarkdownRendererProps } from '../../MarkdownRenderer/types';

/** Keep the editor's locale inheritance without mounting its editing shell. */
export interface ReadonlyMarkdownContentProps extends MarkdownRendererProps {
  /** Editor configuration comments need the Slate document parser. */
  preserveEditorDirectives?: boolean;
}

export const hasEditorDirectives = (content: string) =>
  /<!--\s*\{/.test(content);

export const ReadonlyMarkdownContent: React.FC<
  ReadonlyMarkdownContentProps
> = ({ content, preserveEditorDirectives = true, ...props }) => {
  if (preserveEditorDirectives && hasEditorDirectives(content)) {
    return (
      <MarkdownEditor
        {...props}
        initValue={content}
        contentStyle={props.style}
        markdownToHtmlOptions={props.remarkPlugins}
        readonly
        renderMode="slate"
      />
    );
  }
  return (
    <I18nBoundary>
      <MarkdownRenderer {...props} content={content} />
    </I18nBoundary>
  );
};
