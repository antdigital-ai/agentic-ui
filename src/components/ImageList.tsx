import React from 'react';

export interface VisualListItem {
  id?: string;
  src: string;
  alt?: string;
  title?: string;
  href?: string;
}

export interface VisualListProps {
  className?: string;
  style?: React.CSSProperties;
  data: VisualListItem[];
  filter?: (item: VisualListItem) => boolean;
  emptyRender?: () => React.ReactNode;
  renderItem?: (item: VisualListItem, index: number) => React.ReactNode;
  loading?: boolean;
  loadingRender?: () => React.ReactNode;
  itemStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  linkStyle?: React.CSSProperties;
}

export const VisualList: React.FC<VisualListProps> = ({
  className,
  style,
  data = [],
  filter = () => true,
  emptyRender,
  renderItem,
  loading = false,
  loadingRender,
  itemStyle,
  imageStyle,
  linkStyle,
}) => {
  // 加载状态渲染
  if (loading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flexFlow: 'wrap',
          ...style,
        }}
      >
        {loadingRender ? loadingRender() : <span>加载中...</span>}
      </div>
    );
  }

  // 过滤数据
  const displayList = data.filter(filter);

  // 空状态渲染
  if (displayList.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          ...style,
        }}
      >
        {emptyRender ? emptyRender() : <span>暂无数据</span>}
      </div>
    );
  }

  // 默认渲染函数
  const defaultRenderItem = (item: VisualListItem, index: number) => (
    <li
      key={item.id || index}
      style={{
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 8,
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid #ddd',
        display: 'flex',
        ...itemStyle,
      }}
    >
      {item.href ? (
        <a
          href={item.href}
          style={{
            display: 'flex',
            textDecoration: 'none',
            ...linkStyle,
          }}
        >
          <img
            width={40}
            height={40}
            src={item.src}
            alt={item.alt || item.title || ''}
            title={item.title}
            style={{
              objectFit: 'cover',
              ...imageStyle,
            }}
          />
        </a>
      ) : (
        <img
          width={40}
          height={40}
          src={item.src}
          alt={item.alt || item.title || ''}
          title={item.title}
          style={{
            objectFit: 'cover',
            ...imageStyle,
          }}
        />
      )}
    </li>
  );

  return (
    <ul
      className={className}
      style={{
        display: 'flex',
        boxSizing: 'border-box',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        flexFlow: 'wrap',
        ...style,
      }}
    >
      {displayList.map((item, index) => {
        if (renderItem) {
          return renderItem(item, index);
        }
        return defaultRenderItem(item, index);
      })}
    </ul>
  );
};
