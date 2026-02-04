import SkeletonList from './SkeletonList';

import { MutableRefObject, useContext, useMemo, useRef } from 'react';

import type { BubbleMetaData, BubbleProps, MessageBubbleData } from '../type';

import { ConfigProvider } from 'antd';
import cx from 'classnames';
import { nanoid } from 'nanoid';
import React from 'react';
import { LazyElement } from '../../MarkdownEditor/editor/components/LazyElement';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { LOADING_FLAT } from '../MessagesContent';
import { PureAIBubble, PureUserBubble } from '../PureBubble';
import { useStyle } from './style';

export interface PureBubbleListProps {
  bubbleList: MessageBubbleData[];
  readonly?: boolean;
  bubbleListRef?: MutableRefObject<HTMLDivElement | null>;
  bubbleRef?: MutableRefObject<any | undefined>;
  isLoading?: boolean;
  className?: string;
  bubbleRenderConfig?: BubbleProps['bubbleRenderConfig'];
  style?: React.CSSProperties;
  userMeta?: BubbleMetaData;
  assistantMeta?: BubbleMetaData;
  styles?: BubbleProps['styles'];
  classNames?: BubbleProps['classNames'];
  markdownRenderConfig?: BubbleProps['markdownRenderConfig'];
  docListProps?: BubbleProps['docListProps'];
  /**
   * @deprecated 请使用 onDislike 替代（符合命名规范）
   */
  onDisLike?: BubbleProps['onDisLike'];
  /** 不喜欢回调 */
  onDislike?: BubbleProps['onDislike'];
  onLike?: BubbleProps['onLike'];
  /**
   * @deprecated 请使用 onLikeCancel 替代（符合命名规范）
   */
  onCancelLike?: BubbleProps['onCancelLike'];
  /** Like 子组件取消事件 */
  onLikeCancel?: BubbleProps['onLikeCancel'];
  onReply?: BubbleProps['onReply'];
  onAvatarClick?: BubbleProps['onAvatarClick'];
  onDoubleClick?: BubbleProps['onDoubleClick'];
  shouldShowCopy?: BubbleProps['shouldShowCopy'];
  shouldShowVoice?: BubbleProps['shouldShowVoice'];
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onWheel?: (
    event: React.WheelEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;
  onTouchMove?: (
    event: React.TouchEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;
  /**
   * 懒加载配置
   * @description 启用后，只有进入视口的气泡才会被渲染，提升长列表性能
   */
  lazy?: {
    /**
     * 是否启用懒加载
     */
    enable: boolean;
    /**
     * 占位符高度（单位：px），默认 100px
     */
    placeholderHeight?: number;
    /**
     * 提前加载距离，默认 '200px'
     * @description 元素距离视口多远时开始加载
     */
    rootMargin?: string;
    /**
     * 自定义占位符渲染函数
     */
    renderPlaceholder?: (props: {
      height: number;
      style: React.CSSProperties;
      isIntersecting: boolean;
      elementInfo?: {
        type: string;
        index: number;
        total: number;
        role?: 'user' | 'assistant';
      };
    }) => React.ReactNode;
    /**
     * 判断是否应该对指定索引的消息启用懒加载
     * @description 返回 false 时，该消息将不启用懒加载，优先渲染
     * @param index 消息索引
     * @param total 消息总数
     * @returns 是否启用懒加载
     */
    shouldLazyLoad?: (index: number, total: number) => boolean;
  };
}

export const PureBubbleList: React.FC<PureBubbleListProps> = (props) => {
  const {
    bubbleList,
    bubbleListRef,
    bubbleRenderConfig,
    className,
    classNames,
    docListProps,
    isLoading,
    markdownRenderConfig,
    onAvatarClick,
    onCancelLike,
    onLikeCancel,
    onDisLike,
    onDislike,
    onDoubleClick,
    onLike,
    onReply,
    onScroll,
    onTouchMove,
    onWheel,
    shouldShowCopy,
    shouldShowVoice,
    style,
    styles,
    userMeta,
    assistantMeta,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { compact } = useContext(BubbleConfigContext) || {};
  const prefixClass = getPrefixCls('agentic-bubble-list');
  const { wrapSSR, hashId } = useStyle(prefixClass);

  const deps = useMemo(() => [props.style], [JSON.stringify(props.style)]);

  // 为 loading 项生成唯一的 key，使用 ref 缓存以确保稳定性
  const loadingKeysRef = useRef<Map<string, string>>(new Map());

  const listDom = useMemo(() => {
    const isLazyEnabled = props.lazy?.enable;
    const totalCount = bubbleList.length;

    return bubbleList.map((item, index) => {
      const placement = item.role === 'user' ? 'right' : 'left';
      const BubbleComponent =
        placement === 'right' ? PureUserBubble : PureAIBubble;
      const isLast = index === bubbleList.length - 1;
      (item as any).isLatest = isLast;
      (item as any).isLast = isLast;

      // 如果 id 是 LOADING_FLAT，使用 uuid 作为 key
      // 使用 index 和 createAt 的组合作为缓存 key，确保同一项在重新渲染时保持相同的 key
      let itemKey = item.id;
      if (item.id === LOADING_FLAT) {
        const cacheKey = `${index}-${item.createAt || Date.now()}`;
        if (!loadingKeysRef.current.has(cacheKey)) {
          loadingKeysRef.current.set(cacheKey, nanoid());
        }
        itemKey = loadingKeysRef.current.get(cacheKey)!;
      }

      const bubbleElement = (
        <BubbleComponent
          key={itemKey}
          data-id={item.id}
          avatar={{
            ...(placement === 'right' ? userMeta : assistantMeta),
            ...(item as any).meta,
          }}
          preMessage={bubbleList[index - 1]}
          id={item.id}
          style={{
            ...styles?.bubbleListItemStyle,
          }}
          originData={item}
          placement={placement}
          time={item.updateAt || item.createAt}
          deps={deps}
          pure
          bubbleListRef={bubbleListRef}
          bubbleRenderConfig={bubbleRenderConfig}
          classNames={classNames}
          bubbleRef={props.bubbleRef}
          markdownRenderConfig={markdownRenderConfig}
          docListProps={docListProps}
          styles={{
            ...styles,
            bubbleListItemContentStyle: {
              ...styles?.bubbleListItemContentStyle,
              ...(placement === 'right'
                ? styles?.bubbleListRightItemContentStyle
                : styles?.bubbleListLeftItemContentStyle),
            },
          }}
          readonly={props.readonly}
          onReply={onReply}
          onDislike={onDislike || onDisLike}
          onLike={onLike}
          onLikeCancel={onLikeCancel || onCancelLike}
          onAvatarClick={onAvatarClick}
          onDoubleClick={onDoubleClick}
          customConfig={bubbleRenderConfig?.customConfig}
          shouldShowCopy={shouldShowCopy}
          shouldShowVoice={shouldShowVoice}
        />
      );

      // 如果启用了懒加载，用 LazyElement 包裹
      if (isLazyEnabled) {
        // 检查是否应该对该消息启用懒加载
        const shouldLazyLoad =
          props.lazy?.shouldLazyLoad?.(index, totalCount) ?? true;

        // 如果不需要懒加载，直接返回元素
        if (!shouldLazyLoad) {
          return bubbleElement;
        }

        // 创建适配的 renderPlaceholder，将 role 信息添加到 elementInfo
        const adaptedRenderPlaceholder = props.lazy?.renderPlaceholder
          ? (
              lazyProps: Parameters<
                NonNullable<typeof props.lazy.renderPlaceholder>
              >[0],
            ) => {
              return props.lazy!.renderPlaceholder!({
                ...lazyProps,
                elementInfo: lazyProps.elementInfo
                  ? {
                      ...lazyProps.elementInfo,
                      role: item.role as 'user' | 'assistant',
                    }
                  : undefined,
              });
            }
          : undefined;

        return (
          <LazyElement
            key={itemKey}
            placeholderHeight={props.lazy?.placeholderHeight ?? 100}
            rootMargin={props.lazy?.rootMargin ?? '200px'}
            renderPlaceholder={adaptedRenderPlaceholder}
            elementInfo={{
              type: 'bubble',
              index,
              total: totalCount,
            }}
          >
            {bubbleElement}
          </LazyElement>
        );
      }

      return bubbleElement;
    });
  }, [bubbleList, props.style, props.lazy]);

  if (isLoading) {
    return wrapSSR(
      <div
        className={cx(prefixClass, `${prefixClass}-loading`, className, hashId)}
        ref={bubbleListRef}
        style={{
          padding: 24,
        }}
      >
        <SkeletonList />
      </div>,
    );
  }

  return wrapSSR(
    <div
      className={cx(`${prefixClass}`, className, hashId, {
        [`${prefixClass}-readonly`]: props.readonly,
        [`${prefixClass}-compact`]: compact,
      })}
      data-chat-list={bubbleList.length}
      style={style}
      ref={bubbleListRef}
      onScroll={onScroll}
      onWheel={(event) => onWheel?.(event, bubbleListRef?.current || null)}
      onTouchMove={(event) =>
        onTouchMove?.(event, bubbleListRef?.current || null)
      }
    >
      {listDom}
    </div>,
  );
};

export default PureBubbleList;
