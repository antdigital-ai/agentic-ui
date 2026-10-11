import { ConfigProvider, Skeleton } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { ElementProps, LinkCardNode } from '../../../el';
import { LinkCardContent } from './LinkCardContent';

export interface LinkCardProps extends ElementProps<
  LinkCardNode<{
    url: string;
    collaborators: Record<string, number>[];
    updateTime: string;
  }>
> {}

interface LinkCardViewProps extends LinkCardProps {
  readonly?: boolean;
}

const boundaryStyle: React.CSSProperties = {
  display: 'flex',
  height: '100%',
  minWidth: 0,
  fontSize: 60,
  minHeight: 100,
  lineHeight: '100px',
};

export const LinkCardView = React.memo(function LinkCardView({
  element,
  attributes,
  children,
  readonly,
}: LinkCardViewProps) {
  const context = useContext(ConfigProvider.ConfigContext);
  const contentCls = context?.getPrefixCls('agentic-md-editor-content');
  const blockCls = contentCls ? `${contentCls}-link-card` : '';
  const [showAsText, setShowAsText] = useState(false);

  useEffect(() => {
    setShowAsText(false);
    if (element.finished !== false) return;
    const timer = setTimeout(() => setShowAsText(true), 5000);
    return () => clearTimeout(timer);
  }, [element.finished, element.url]);

  if (element.finished === false) {
    return (
      <div {...attributes}>
        {showAsText ? (
          <div
            style={{
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              color: 'rgba(0, 0, 0, 0.65)',
              wordBreak: 'break-all',
            }}
          >
            {element.url || element.title || element.name || '链接卡片'}
          </div>
        ) : (
          <Skeleton active paragraph={{ rows: 2 }} />
        )}
        {children}
      </div>
    );
  }

  // The Slate attributes and both editable boundaries stay on the same surface;
  // only the independent metadata body is memoized.
  return (
    <div
      {...attributes}
      className={blockCls}
      data-be="link-card"
      data-drag-el={readonly ? undefined : true}
      draggable={false}
      onContextMenu={readonly ? undefined : (event) => event.stopPropagation()}
      onMouseDown={readonly ? undefined : (event) => event.stopPropagation()}
      style={{ display: 'flex' }}
    >
      <div style={boundaryStyle}>{children.at(0)}</div>
      <LinkCardContent
        blockCls={blockCls}
        url={element.url}
        icon={element.icon}
        title={element.title}
        name={element.name}
        description={element.description}
        collaborators={element.otherProps?.collaborators}
        updateTime={element.otherProps?.updateTime}
      />
      <div style={{ ...boundaryStyle, minWidth: 4 }}>{children.at(-1)}</div>
    </div>
  );
});
