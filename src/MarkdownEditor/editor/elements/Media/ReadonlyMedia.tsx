import React from 'react';
import { shouldRenderUrlAsPlainText } from '../../../../Utils/htmlUrlSafety';
import { ElementProps, MediaNode } from '../../../el';
import { MediaContent } from './MediaContent';

export const ReadonlyMedia = React.memo(function ReadonlyMedia({
  element,
  attributes,
  children,
}: ElementProps<MediaNode>) {
  const unsafeUrl = !!element.url && shouldRenderUrlAsPlainText(element.url);
  return (
    <div {...attributes}>
      <div
        data-be="media"
        data-testid={unsafeUrl ? undefined : 'media-container'}
        style={{ position: 'relative', width: '100%', maxWidth: '100%' }}
        draggable={false}
      >
        <div
          tabIndex={-1}
          contentEditable={false}
          data-be="media-container"
          style={{ padding: 4, maxWidth: '100%', boxSizing: 'border-box' }}
        >
          <MediaContent element={element} readonly />
          <div style={{ display: 'none' }}>{children}</div>
        </div>
      </div>
    </div>
  );
});
