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
      borderRadius: 1,
      animation:
        'markdownStreamingCursorFadeIn 0.2s ease-out forwards, markdownStreamingCursorBlink 0.8s ease-in-out 0.2s infinite',
    }}
  />
);

StreamingCursor.displayName = 'StreamingCursor';

export { StreamingCursor };
