import React from 'react';

/**
 * 流式闪烁光标——streaming 期间跟随末块末尾，streaming 结束自动消失。
 *
 * 由父级（MarkdownBlockPiece）控制是否挂载：
 * 仅 `variant === 'tail' && streaming` 时渲染，无需内部额外判断。
 */
const StreamingCursor: React.FC = () => (
  <span
    data-streaming-cursor=""
    data-testid="streaming-cursor"
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: 2,
      height: '1.1em',
      marginLeft: 2,
      verticalAlign: 'text-bottom',
      backgroundColor: 'currentColor',
      opacity: 0.8,
      borderRadius: 1,
      animation:
        'markdownStreamingCursorBlink 0.8s steps(2, start) infinite',
    }}
  />
);

StreamingCursor.displayName = 'StreamingCursor';

export { StreamingCursor };
