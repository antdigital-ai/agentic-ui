import DOMPurify from 'dompurify';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';

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
        {element?.otherProps?.isConfig
          ? ''
          : DOMPurify.sanitize(element?.value?.trim())}
      </div>
    );
  }

  // 检查代码块是否未闭合
  const isUnclosed = element?.otherProps?.finished === false;
  debugInfo('Code - 普通代码块', {
    language: element?.language,
    isUnclosed,
    valueLength: element?.value?.length,
  });

  return (
    <div
      {...attributes}
      data-is-unclosed={isUnclosed}
      data-language={element?.language}
      style={
        element?.language === 'html'
          ? {
              display: element?.otherProps?.isConfig ? 'none' : 'block',
            }
          : {
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
              fontSize: '0.8em',
              lineHeight: '1.5',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
              wordWrap: 'break-word',
              borderRadius: '12px',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-control-base)',
              position: 'relative',
            }
      }
    >
      {element?.value?.trim() || children}
    </div>
  );
};
