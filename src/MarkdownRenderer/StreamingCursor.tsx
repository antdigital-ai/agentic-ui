import React from 'react';

/** 流式闪烁光标，由 MarkdownBlockPiece 控制挂载/卸载 */
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
