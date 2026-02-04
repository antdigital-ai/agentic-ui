import SkeletonList from './SkeletonList';
export { PureBubbleList } from './PureBubbleList';

import { MutableRefObject, useContext, useMemo, useRef } from 'react';

import type { BubbleMetaData, BubbleProps, MessageBubbleData } from '../type';

import { ConfigProvider } from 'antd';
import cx from 'classnames';
import { nanoid } from 'nanoid';
import React from 'react';
import { LazyElement } from '../../MarkdownEditor/editor/components/LazyElement';
import { Bubble } from '../Bubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { LOADING_FLAT } from '../MessagesContent';
import { useStyle } from './style';

export type BubbleListProps = {
  /**
   * 聊天消息列表
   */
  bubbleList: MessageBubbleData[];

  readonly?: boolean;

  /**
   * 聊天列表的引用
   */
  bubbleListRef?: MutableRefObject<HTMLDivElement | null>;

  bubbleRef?: MutableRefObject<any | undefined>;
  /**
   * @deprecated 请使用 isLoading 代替
   * @description 已废弃，将在未来版本移除
   */
  loading?: boolean;
  /**
   * 加载状态
   */
  isLoading?: boolean;

  pure?: boolean;

  /**
   * 组件的类名
   */
  className?: string;

  /**
   * 聊天项的渲染配置
   */
  bubbleRenderConfig?: BubbleProps['bubbleRenderConfig'];

  /**
   * 组件的样式
   */
  style?: React.CSSProperties;

  /**
   * 用户元数据
   */
  userMeta?: BubbleMetaData;

  /**
   * 助手元数据
   */
  assistantMeta?: BubbleMetaData;

  styles?: {
    /**
     * 气泡根容器的自定义样式
     */
    bubbleStyle?: React.CSSProperties;

    /**
     * 头像标题区域的自定义样式
     */
    bubbleAvatarTitleStyle?: React.CSSProperties;

    /**
     * 主容器的自定义样式
     */
    bubbleContainerStyle?: React.CSSProperties;

    /**
     * 加载图标的自定义样式
     */
    bubbleLoadingIconStyle?: React.CSSProperties;

    /**
     * 名称区域的自定义样式
     */
    bubbleNameStyle?: React.CSSProperties;

    /**
     * 聊天项的样式
     */
    bubbleListItemStyle?: React.CSSProperties;

    /**
     * 聊天项内容的样式
     */
    bubbleListItemContentStyle?: React.CSSProperties;

    /**
     * 内容前置区域的自定义样式
     */
    bubbleListItemBeforeStyle?: React.CSSProperties;

    /**
     * 内容后置区域的自定义样式
     */
    bubbleListItemAfterStyle?: React.CSSProperties;

    /**
     * 聊天项左侧内容的样式
     */
    bubbleListLeftItemContentStyle?: React.CSSProperties;

    /**
     * 聊天项右侧内容的样式
     */
    bubbleListRightItemContentStyle?: React.CSSProperties;

    /**
     * 聊天项标题的样式
     */
    bubbleListItemTitleStyle?: React.CSSProperties;

    /**
     * 聊天项头像的样式
     */
    bubbleListItemAvatarStyle?: React.CSSProperties;

    /**
     * 聊天项额外内容的样式
     */
    bubbleListItemExtraStyle?: React.CSSProperties;
  };
  classNames?: {
    /**
     * 气泡根容器的自定义类名
     */
    bubbleClassName?: string;

    /**
     * 头像标题区域的自定义类名
     */
    bubbleAvatarTitleClassName?: string;

    /**
     * 主容器的自定义类名
     */
    bubbleContainerClassName?: string;

    /**
     * 加载图标的自定义类名
     */
    bubbleLoadingIconClassName?: string;

    /**
     * 名称区域的自定义类名
     */
    bubbleNameClassName?: string;

    /**
     * 聊天项的类名
     */
    bubbleListItemClassName?: string;

    /**
     * 聊天项内容的类名
     */
    bubbleListItemContentClassName?: string;

    /**
     * 内容前置区域的自定义类名
     */
    bubbleListItemBeforeClassName?: string;

    /**
     * 内容后置区域的自定义类名
     */
    bubbleListItemAfterClassName?: string;

    /**
     * 聊天项标题的类名
     */
    bubbleListItemTitleClassName?: string;

    /**
     * 聊天项头像的类名
     */
    bubbleListItemAvatarClassName?: string;
  };

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
  markdownRenderConfig?: BubbleProps['markdownRenderConfig'];
  docListProps?: BubbleProps['docListProps'];

  /**
   * 动态控制复制按钮的显隐
   */
  shouldShowCopy?: boolean | ((bubbleItem: any) => boolean);

  /**
   * 控制语音按钮的显示
   * @description 控制语音按钮是否显示
   */
  shouldShowVoice?: boolean;

  /**
   * 滚动事件的回调
   */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;

  /**
   * 滚轮事件的回调
   */
  onWheel?: (
    e: React.WheelEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;

  /**
   * 触摸移动事件的回调
   */
  onTouchMove?: (
    e: React.TouchEvent<HTMLDivElement>,
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
};

/**
 * BubbleList 组件 - 聊天气泡列表组件
 *
 * 该组件用于渲染聊天气泡列表，支持用户和助手的消息显示、加载状态、滚动事件等。
 * 提供完整的聊天界面功能，包括消息渲染、交互操作、样式自定义等。
 *
 * @component
 * @description 聊天气泡列表组件，渲染聊天消息列表
 * @param {BubbleListProps} props - 组件属性
 * @param {BubbleProps[]} [props.bubbleList=[]] - 气泡列表数据
 * @param {React.RefObject} [props.bubbleListRef] - 气泡列表引用
 * @param {boolean} [props.loading] - 是否显示加载状态
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {BubbleRenderConfig} [props.bubbleRenderConfig] - 气泡渲染配置
 * @param {MarkdownRenderConfig} [props.markdownRenderConfig] - Markdown渲染配置
 * @param {BubbleMetaData} [props.userMeta] - 用户头像元数据
 * @param {BubbleMetaData} [props.assistantMeta] - 助手头像元数据
 * @param {BubbleStyles} [props.styles] - 自定义样式配置
 * @param {BubbleClassNames} [props.classNames] - 自定义类名配置
 * @param {boolean} [props.readonly] - 是否只读模式
 * @param {Function} [props.onScroll] - 滚动事件回调
 * @param {Function} [props.onWheel] - 滚轮事件回调
 * @param {Function} [props.onTouchMove] - 触摸移动事件回调
 * @param {Function} [props.onLike] - 点赞事件回调
 * @param {Function} [props.onDislike] - 点踩事件回调（符合命名规范）
 * @param {Function} [props.onDisLike] - 点踩事件回调（已废弃，请使用 onDislike）
 * @param {Function} [props.onReply] - 回复事件回调
 * @param {Function} [props.onLikeCancel] - 取消点赞事件回调（符合命名规范）
 * @param {Function} [props.onCancelLike] - 取消点赞事件回调（已废弃，请使用 onLikeCancel）
 * @param {Function} [props.onAvatarClick] - 头像点击事件回调
 * @param {Function} [props.onDoubleClick] - 双击事件回调
 * @param {boolean|Function} [props.shouldShowCopy] - 是否显示复制按钮
 *
 * @example
 * ```tsx
 * <BubbleList
 *   bubbleList={chatMessages}
 *   loading={false}
 *   userMeta={{ avatar: "user.jpg", title: "用户" }}
 *   assistantMeta={{ avatar: "assistant.jpg", title: "助手" }}
 *   onLike={(message) => console.log('点赞:', message)}
 *   onReply={(message) => console.log('回复:', message)}
 *   onAvatarClick={() => console.log('点击了头像')}
 *   onDoubleClick={() => console.log('双击了消息')}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的聊天气泡列表组件
 *
 * @remarks
 * - 支持用户和助手消息的不同布局
 * - 提供加载状态和骨架屏
 * - 支持消息交互操作（点赞、点踩、回复等）
 * - 支持自定义样式和类名
 * - 支持Markdown内容渲染
 * - 支持滚动和触摸事件
 * - 提供消息复制功能
 */
export const BubbleList: React.FC<BubbleListProps> = (props) => {
  const {
    bubbleListRef,
    bubbleRenderConfig,
    className,
    loading: legacyLoading,
    isLoading,
    styles,
    classNames,
    markdownRenderConfig,
    userMeta,
    assistantMeta,
    bubbleList = [],
    style,
    onScroll,
    onWheel,
    onTouchMove,
  } = props;

  // 兼容旧属性
  const loading = isLoading ?? legacyLoading;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);

  const { compact } = useContext(BubbleConfigContext) || {};

  const prefixClass = getPrefixCls('agentic-bubble-list');
  const { wrapSSR, hashId } = useStyle(prefixClass);
  const deps = useMemo(() => [props.style], [JSON.stringify(props.style)]);

  // 为 loading 项生成唯一的 key，使用 ref 缓存以确保稳定性
  // 使用 item 的唯一标识（index + createAt）作为缓存 key
  const loadingKeysRef = useRef<Map<string, string>>(new Map());

  const bubbleListDom = useMemo(() => {
    const isLazyEnabled = props.lazy?.enable;
    const totalCount = bubbleList.length;

    return bubbleList.map((item, index) => {
      const isLast = bubbleList.length - 1 === index;
      const placement = item.role === 'user' ? 'right' : 'left';
      // 保持向后兼容性，设置isLatest
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
        <Bubble
          key={itemKey}
          data-id={item.id}
          avatar={{
            ...(item.role === 'user' ? userMeta : assistantMeta),
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
          pure={props.pure}
          bubbleListRef={bubbleListRef}
          bubbleRenderConfig={bubbleRenderConfig}
          classNames={classNames}
          bubbleRef={props.bubbleRef}
          markdownRenderConfig={markdownRenderConfig}
          docListProps={props.docListProps}
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
          onReply={props.onReply}
          onDisLike={props.onDisLike}
          onDislike={props.onDislike}
          onLike={props.onLike}
          onCancelLike={props.onCancelLike}
          onLikeCancel={props.onLikeCancel}
          onAvatarClick={props.onAvatarClick}
          onDoubleClick={props.onDoubleClick}
          customConfig={props?.bubbleRenderConfig?.customConfig}
          shouldShowCopy={props.shouldShowCopy}
          shouldShowVoice={props.shouldShowVoice}
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

  if (loading)
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
      onWheel={(e) => onWheel?.(e, bubbleListRef?.current || null)}
      onTouchMove={(e) => onTouchMove?.(e, bubbleListRef?.current || null)}
    >
      {bubbleListDom}
    </div>,
  );
};

export default BubbleList;
