import { ConfigProvider, Skeleton } from 'antd';
import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { ElementProps, LinkCardNode } from '../../../el';
import { AvatarList } from '../../components/ContributorAvatar';

/**
 * ReadonlyLinkCard 组件 - 只读链接卡片预览组件
 *
 * 专门针对 readonly 模式优化的链接卡片组件，移除了拖拽功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读链接卡片预览组件，用于预览模式下的链接卡片渲染
 * @param {ElementProps<LinkCardNode>} props - 组件属性
 * @param {LinkCardNode} props.element - 链接卡片节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyLinkCard
 *   element={linkCardNode}
 *   attributes={attributes}
 * >
 *   内容
 * </ReadonlyLinkCard>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读链接卡片组件
 *
 * @remarks
 * - 移除拖拽手柄（DragHandle）
 * - 移除拖拽相关事件处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyLinkCard: React.FC<
  ElementProps<
    LinkCardNode<{
      url: string;
      collaborators: { [key: string]: number }[];
      updateTime: string;
    }>
  >
> = React.memo(({ element, attributes, children }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-md-editor-link-card');
  const [showAsText, setShowAsText] = useState(false);

  // 如果 finished 为 false，设置 5 秒超时，超时后显示为文本
  useEffect(() => {
    if (element.finished === false) {
      setShowAsText(false);
      const timer = setTimeout(() => {
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
    return (
      <div {...attributes}>
        <Skeleton active paragraph={{ rows: 2 }} />
        {children}
      </div>
    );
  }

  return (
    <div {...attributes}>
      <div
        className={classNames(baseCls)}
        data-be="link-card"
        draggable={false}
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
        <div
          style={{
            flex: 1,
          }}
          onClick={() => {
            if (typeof window === 'undefined') return;
            window.open(element?.url);
          }}
          className={classNames(`${baseCls}-container`)}
        >
          <div
            className={classNames(`${baseCls}-container-content`)}
            contentEditable={false}
          >
            {element.icon ? (
              <img
                className={classNames(`${baseCls}-container-content-icon`)}
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
                className={classNames(`${baseCls}-container-content-title`)}
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
                )}
              >
                {element.description ? element.description : element?.url}
              </div>
              <div
                className={classNames(
                  `${baseCls}-container-content-collaborators`,
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
    </div>
  );
});

ReadonlyLinkCard.displayName = 'ReadonlyLinkCard';
