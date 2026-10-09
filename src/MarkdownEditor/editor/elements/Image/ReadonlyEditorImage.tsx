import { Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { ElementProps, MediaNode } from '../../../el';
import { ReadonlyImage } from './index';

/** Lightweight preview: load the visible image once, with no editor mutations. */
export const ReadonlyEditorImage: React.FC<ElementProps<MediaNode>> =
  React.memo(({ element, attributes, children }) => {
    const [showAsText, setShowAsText] = useState(false);
    useEffect(() => {
      setShowAsText(false);
      if (element.finished !== false) return;
      const timer = setTimeout(() => setShowAsText(true), 5000);
      return () => clearTimeout(timer);
    }, [element.finished, element.url]);

    const image =
      element.finished === false ? (
        showAsText ? (
          <div style={{ padding: '8px 12px', wordBreak: 'break-all' }}>
            {element.alt || element.url || '图片链接'}
          </div>
        ) : (
          <Skeleton.Image active />
        )
      ) : (
        <ReadonlyImage
          src={element.url}
          alt={element.alt}
          width={element.width}
          height={element.height}
        />
      );

    return (
      <div
        {...attributes}
        data-be="image"
        data-testid="image-container"
        style={{
          position: 'relative',
          userSelect: 'none',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
        draggable={false}
      >
        <div
          tabIndex={-1}
          style={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
          draggable={false}
          contentEditable={false}
          data-be="image-container"
        >
          {image}
          <div style={{ display: 'none' }}>{children}</div>
        </div>
      </div>
    );
  });
ReadonlyEditorImage.displayName = 'ReadonlyEditorImage';
