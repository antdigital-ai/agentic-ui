import { ConfigProvider, Skeleton } from 'antd';
import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { debugInfo } from '../../../../Utils/debugUtils';
import { ElementProps, LinkCardNode } from '../../../el';
import { AvatarList } from '../../components/ContributorAvatar';
import { DragHandle } from '../../tools/DragHandle';
import { useStyle } from './style';

export function LinkCard({
  element,
  attributes,
  children,
}: ElementProps<
  LinkCardNode<{
    url: string;
    collaborators: { [key: string]: number }[];
    updateTime: string;
  }>
>) {
  debugInfo('LinkCard - 渲染链接卡片', {
    url: element?.url?.substring(0, 100),
    title: element?.title,
    name: element?.name,
    finished: element?.finished,
  });
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-md-editor-link-card');
  const { wrapSSR, hashId } = useStyle(baseCls);
  const htmlRef = React.useRef<HTMLDivElement>(null);
  const [showAsText, setShowAsText] = useState(false);

  // 如果 finished 为 false，设置 5 秒超时，超时后显示为文本
  useEffect(() => {
    if (element.finished === false) {
      debugInfo('LinkCard - 设置超时显示文本');
      setShowAsText(false);
      const timer = setTimeout(() => {
        debugInfo('LinkCard - 超时，显示为文本');
        setShowAsText(true);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setShowAsText(false);
    }
  }, [element.finished]);

  // 如果是不完整状态
  if (element.finished === false) {
    // 如果 5 秒后仍未完成，显示为文本
    if (showAsText) {
      debugInfo('LinkCard - 显示为文本');
      return (
        <div {...attributes}>
          <div
            style={{
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              color: 'rgba(0, 0, 0, 0.65)',
              wordBreak: 'break-all',
            }}
          >
            {element.url || element.title || element.name || '链接卡片'}
          </div>
          {children}
        </div>
      );
    }
    // 5 秒内显示加载骨架屏
    debugInfo('LinkCard - 显示加载骨架屏');
    return (
      <div {...attributes}>
        <Skeleton active paragraph={{ rows: 2 }} />
        {children}
      </div>
    );
  }

  debugInfo('LinkCard - 渲染完整链接卡片');
  return wrapSSR(
    <div {...attributes}>
      <div
        className={classNames(baseCls, hashId)}
        data-be="link-card"
        data-drag-el
        draggable={false}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{
          display: 'flex',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: '100%',
            minWidth: '0',
            fontSize: 60,
            minHeight: '100px',
            lineHeight: '100px',
          }}
        >
          {children.at(0)}
        </div>
        <DragHandle />
        <div
          ref={htmlRef}
          style={{
            flex: 1,
          }}
          onClick={() => {
            if (typeof window === 'undefined') return;
            window.open(element?.url);
          }}
          className={classNames(`${baseCls}-container`, hashId)}
        >
          <div
            className={classNames(`${baseCls}-container-content`, hashId)}
            contentEditable={false}
          >
            {element.icon ? (
              <img
                className={classNames(
                  `${baseCls}-container-content-icon`,
                  hashId,
                )}
                src={element.icon}
                width={56}
              />
            ) : null}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <a
                href={element?.url}
                className={classNames(
                  `${baseCls}-container-content-title`,
                  hashId,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (typeof window === 'undefined') return;
                  window.open(element?.url);
                }}
                download={element.title || element.name || 'no title'}
              >
                {element.title || element.name || 'no title'}
              </a>
              <div
                className={classNames(
                  `${baseCls}-container-content-description`,
                  hashId,
                )}
              >
                {element.description ? element.description : element?.url}
              </div>
              <div
                className={classNames(
                  `${baseCls}-container-content-collaborators`,
                  hashId,
                )}
              >
                {element.otherProps?.collaborators ? (
                  <div>
                    <AvatarList
                      displayList={
                        element.otherProps?.collaborators
                          ?.map((item: { [key: string]: number }) => {
                            return {
                              name: Object.keys(item)?.at(0) as string,
                              collaboratorNumber:
                                Object.values(item)?.at(0) || 0,
                            };
                          })
                          .slice(0, 5) || []
                      }
                    />
                  </div>
                ) : (
                  <div />
                )}
                {element.otherProps?.updateTime ? (
                  <div
                    className={classNames(
                      `${baseCls}-container-content-updateTime`,
                      hashId,
                    )}
                    style={{
                      color: 'rgba(0,0,0,0.45)',
                      fontSize: 12,
                    }}
                  >
                    {element.otherProps.updateTime}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            height: '100%',
            minWidth: '4px',
            minHeight: '100px',
            fontSize: 60,
            lineHeight: '100px',
          }}
        >
          {children.at(-1)}
        </div>
      </div>
    </div>,
  );
}
