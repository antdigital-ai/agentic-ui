import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
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
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-md-editor-link-card');
  const { wrapSSR, hashId } = useStyle(baseCls);
  const htmlRef = React.useRef<HTMLDivElement>(null);
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
