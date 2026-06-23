import DOMPurify from 'dompurify';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';
import type { CodeNode } from '../../../el';
import { getSlateElementPlainText } from '../../utils/codeBlockPlainText';
import { SimpleCodeBlockEditor } from './SimpleCodeBlockEditor';

export const Code = ({ attributes, children, element }: RenderElementProps) => {
  debugInfo('Code - 渲染代码块', {
    language: element?.language,
    valueLength: element?.value?.length,
    isConfig: element?.otherProps?.isConfig,
    finished: element?.otherProps?.finished,
  });

  if (element?.language === 'html') {
    debugInfo('Code - HTML 代码块', {
      isConfig: element?.otherProps?.isConfig,
    });
    return (
      <div
        {...attributes}
        style={{
          display: element?.otherProps?.isConfig ? 'none' : 'block',
        }}
      >
        {element?.otherProps?.isConfig ? null : (
          <div
            contentEditable={false}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                getSlateElementPlainText(element).trim() || '',
              ),
            }}
          />
        )}
        <span style={{ display: 'none' }}>{children}</span>
      </div>
    );
  }

  // 检查代码块是否未闭合
  const isUnclosed = element?.otherProps?.finished === false;

  return (
    <div
      {...attributes}
      data-be="code"
      data-is-unclosed={isUnclosed || undefined}
      data-language={element?.language}
      style={{
        height: '240px',
        minWidth: '398px',
        maxWidth: '800px',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
        zIndex: 5,
        color: 'rgb(27, 27, 27)',
        padding: '1em',
        margin: '1em 0',
        fontSize: '1em',
        lineHeight: '1.5',
        overflowX: 'auto',
        borderRadius: '12px',
        background: '#FFFFFF',
        boxShadow: 'var(--shadow-control-base)',
        position: 'relative',
      }}
    >
      <div
        contentEditable={false}
        style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <SimpleCodeBlockEditor element={element as CodeNode} />
      </div>
      <span style={{ display: 'none' }}>{children}</span>
    </div>
  );
};
