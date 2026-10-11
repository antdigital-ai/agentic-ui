import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import React, {
  MutableRefObject,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import type { RoleType } from '../../Types/common';
import { Bubble } from '../Bubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import {
  bubblePropsAreEqual,
  messageBubbleDataAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../bubblePropsAreEqual';
import { LOADING_FLAT } from '../MessagesContent';
import type {
  BubbleImperativeHandle,
  BubbleMetaData,
  BubbleProps,
  MessageBubbleData,
} from '../type';
import { normalizeBubbleStyles } from '../utils/normalizeBubbleStyles';
import { BubbleListItem } from './BubbleListItem';
import SkeletonList from './SkeletonList';
import { useStyle } from './style';

export interface BubbleListProps {
  /**
   * 聊天消息列表
   */
  bubbleList?: MessageBubbleData[];

  readonly?: boolean;

  /**
   * 聊天列表的引用
   */
  bubbleListRef?: MutableRefObject<HTMLDivElement | null>;

  bubbleRef?: MutableRefObject<BubbleImperativeHandle | null | undefined>;
  /**
   * @deprecated @since 2.29.0 请使用 isLoading 代替
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
   * 文件视图配置，透传给每条气泡内的 FileMapView。
   */
  fileViewConfig?: BubbleProps['fileViewConfig'];

  /**
   * 组件的样式
   */
  style?: React.CSSProperties;

  /**
   * extra（点赞、踩、复制等）是否仅在 hover 时展示
   * @default false 默认常驻展示
   */
  extraShowOnHover?: boolean;

  /**
   * 用户元数据
   */
  userMeta?: BubbleMetaData;

  /**
   * 助手元数据
   */
  assistantMeta?: BubbleMetaData;

  styles?: BubbleProps['styles'];
  classNames?: BubbleProps['classNames'];

  /**
   * @deprecated @since 2.29.0 请使用 onDislike 替代（符合命名规范）
   */
  onDisLike?: BubbleProps['onDisLike'];
  /** 不喜欢回调 */
  onDislike?: BubbleProps['onDislike'];
  onLike?: BubbleProps['onLike'];
  /**
   * @deprecated @since 2.29.0 请使用 onLikeCancel 替代（符合命名规范）
   */
  onCancelLike?: BubbleProps['onCancelLike'];
  /** Like 子组件取消事件 */
  onLikeCancel?: BubbleProps['onLikeCancel'];
  onReply?: BubbleProps['onReply'];
  onAvatarClick?: BubbleProps['onAvatarClick'];
  onDoubleClick?: BubbleProps['onDoubleClick'];
  markdownRenderConfig?: BubbleProps['markdownRenderConfig'];
  /**
   * 渲染模式快捷设置
   * - 'slate': 使用 Slate 编辑器渲染
   * - 'markdown': 使用轻量 MarkdownRenderer（无 Slate 实例，性能更优）
   * 未指定时，普通只读 Markdown 自动使用轻量渲染；编辑及 Slate 扩展保留编辑器
   * 等效于 markdownRenderConfig={{ renderMode }}
   */
  renderMode?: 'slate' | 'markdown';
  /**
   * 与 `renderMode` 等价，兼容协议字段 `renderType=markdown`
   */
  renderType?: 'slate' | 'markdown';
  docListProps?: BubbleProps['docListProps'];

  /**
   * 动态控制复制按钮的显隐
   */
  shouldShowCopy?: BubbleProps['shouldShowCopy'];

  /**
   * 控制语音按钮的显示
   * @description 控制语音按钮是否显示
   */
  shouldShowVoice?: BubbleProps['shouldShowVoice'];

  /** 自定义语音适配器 */
  useSpeech?: BubbleProps['useSpeech'];

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
        role?: RoleType;
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

interface LoadingRowKey {
  key: string;
  createAt: MessageBubbleData['createAt'];
}

interface BubbleListRowData {
  source: MessageBubbleData;
  isLast: boolean;
  value: MessageBubbleData;
}

interface BubbleListAvatarData {
  base: BubbleMetaData | undefined;
  meta: MessageBubbleData['meta'];
  value: BubbleMetaData;
}

interface BubbleListRow {
  data: BubbleListRowData;
  avatar: BubbleListAvatarData;
  sharedProps: BubbleProps;
  preMessage: MessageBubbleData | undefined;
  styles: BubbleProps['styles'];
  lazy: BubbleListProps['lazy'];
  shouldLazyLoad: boolean;
  index: number;
  total: number;
  element: React.ReactElement;
}

function rowPlaceholderOptionsEqual(
  previous: BubbleListRow,
  lazy: BubbleListProps['lazy'],
  index: number,
  total: number,
) {
  return (
    (previous.lazy?.rootMargin ?? '200px') === (lazy?.rootMargin ?? '200px') &&
    (previous.lazy?.placeholderHeight ?? 100) ===
      (lazy?.placeholderHeight ?? 100) &&
    previous.lazy?.renderPlaceholder === lazy?.renderPlaceholder &&
    (!lazy?.renderPlaceholder ||
      (previous.index === index && previous.total === total))
  );
}

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
 * @param {MarkdownEditorProps} [props.markdownRenderConfig] - Markdown渲染配置
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
export const BubbleList = React.memo<BubbleListProps>((props) => {
  const {
    bubbleListRef,
    bubbleRenderConfig,
    className,
    loading: legacyLoading,
    isLoading,
    styles,
    classNames,
    markdownRenderConfig: markdownRenderConfigProp,
    renderMode,
    renderType,
    userMeta,
    assistantMeta,
    bubbleList = [],
    style,
    onScroll,
    onWheel,
    onTouchMove,
  } = props;

  // 合并 renderMode / renderType 快捷属性到 markdownRenderConfig
  const markdownRenderConfig = useMemo(() => {
    const mode =
      renderMode ??
      renderType ??
      markdownRenderConfigProp?.renderMode ??
      markdownRenderConfigProp?.renderType;
    return mode
      ? { ...markdownRenderConfigProp, renderMode: mode }
      : markdownRenderConfigProp;
  }, [markdownRenderConfigProp, renderMode, renderType]);

  // 兼容旧属性
  const loading = isLoading ?? legacyLoading;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);

  const parentContext = useContext(BubbleConfigContext);
  const { compact } = parentContext || {};
  const mergedContext = useMemo(
    () =>
      parentContext
        ? {
            ...parentContext,
            extraShowOnHover:
              props.extraShowOnHover ?? parentContext.extraShowOnHover,
          }
        : {
            standalone: false,
            extraShowOnHover: props.extraShowOnHover,
          },
    [parentContext, props.extraShowOnHover],
  );

  const prefixCls = getPrefixCls('agentic-bubble-list');
  const { hashId } = useStyle(prefixCls);
  const prevStyleRef = useRef(props.style);
  const stableStyle = shallowEqualRecord(
    (props.style || {}) as Record<string, unknown>,
    (prevStyleRef.current || {}) as Record<string, unknown>,
  )
    ? prevStyleRef.current
    : props.style;
  const deps = useMemo(() => [stableStyle], [stableStyle]);

  // 记录每个 index 在上一轮是否是 loading，用于 loading→real 过渡时保持 key 稳定，避免闪动
  const loadingKeyByIndexRef = useRef<Map<number, LoadingRowKey>>(new Map());
  // 真实 id 映射到稳定 key（过渡后沿用），避免同一条消息因 id 变化导致 remount
  const realIdToStableKeyRef = useRef<Map<string, string>>(new Map());
  const bubbleMergedStylesRef = useRef<
    Map<'left' | 'right', BubbleProps['styles']>
  >(new Map());
  const rowsRef = useRef<Map<string, BubbleListRow>>(new Map());
  const sharedPropsRef = useRef<BubbleProps | undefined>(undefined);

  // 每个布局只合并一次样式，流式消息更新时复用历史行使用的引用。
  const mergedStyles = useMemo(() => {
    const nextStyles = new Map<'left' | 'right', BubbleProps['styles']>();
    const normalizedStyles = normalizeBubbleStyles(styles);
    for (const placement of ['left', 'right'] as const) {
      const contentStyle = {
        ...normalizedStyles?.bubbleListItemContentStyle,
        ...(placement === 'right'
          ? normalizedStyles?.bubbleListRightItemContentStyle
          : normalizedStyles?.bubbleListLeftItemContentStyle),
      };
      const candidate: BubbleProps['styles'] = {
        ...normalizedStyles,
        bubbleListItemContentStyle: contentStyle,
        // AI/User normalize short slots again. Keep the alias in sync so the
        // direction-specific styles remain layered over the common content.
        ...(styles?.content !== undefined ? { content: contentStyle } : {}),
      };
      const previous = bubbleMergedStylesRef.current.get(placement);
      nextStyles.set(
        placement,
        shallowEqualStyles(previous, candidate) ? previous : candidate,
      );
    }
    return nextStyles;
  }, [styles]);

  const lazyRows = useMemo(() => {
    if (loading || !props.lazy?.enable) return undefined;
    return Array.from(
      { length: bubbleList.length },
      (_, index) =>
        props.lazy?.shouldLazyLoad?.(index, bubbleList.length) ?? true,
    );
  }, [
    loading,
    props.lazy?.enable,
    props.lazy?.shouldLazyLoad,
    bubbleList.length,
  ]);

  // Compare shared options once per list update. Historical rows can then use
  // reference equality without building a fresh Bubble props object per token.
  const sharedProps = useMemo(() => {
    const candidate: BubbleProps = {
      style: styles?.bubbleListItemStyle,
      deps,
      pure: props.pure,
      bubbleListRef,
      bubbleRenderConfig,
      classNames,
      bubbleRef: props.bubbleRef,
      markdownRenderConfig,
      docListProps: props.docListProps,
      fileViewConfig: props.fileViewConfig,
      readonly: props.readonly,
      onReply: props.onReply,
      onDisLike: props.onDisLike,
      onDislike: props.onDislike,
      onLike: props.onLike,
      onCancelLike: props.onCancelLike,
      onLikeCancel: props.onLikeCancel,
      onAvatarClick: props.onAvatarClick,
      onDoubleClick: props.onDoubleClick,
      customConfig: bubbleRenderConfig?.customConfig,
      shouldShowCopy: props.shouldShowCopy,
      shouldShowVoice: props.shouldShowVoice,
      useSpeech: props.useSpeech,
    };
    const previous = sharedPropsRef.current;
    return previous && bubblePropsAreEqual(previous, candidate)
      ? previous
      : candidate;
  }, [
    bubbleListRef,
    bubbleRenderConfig,
    classNames,
    deps,
    markdownRenderConfig,
    props.bubbleRef,
    props.docListProps,
    props.fileViewConfig,
    props.onAvatarClick,
    props.onCancelLike,
    props.onDisLike,
    props.onDislike,
    props.onDoubleClick,
    props.onLike,
    props.onLikeCancel,
    props.onReply,
    props.pure,
    props.readonly,
    props.shouldShowCopy,
    props.shouldShowVoice,
    props.useSpeech,
    styles?.bubbleListItemStyle,
  ]);

  const rowState = useMemo(() => {
    if (loading) {
      return {
        dom: null,
        loadingKeys: loadingKeyByIndexRef.current,
        realKeys: realIdToStableKeyRef.current,
        rows: rowsRef.current,
      };
    }
    const totalCount = bubbleList.length;
    const nextLoadingKeys = new Map<number, LoadingRowKey>();
    const nextRows = new Map<string, BubbleListRow>();
    let realRowCount = 0;
    let hasRealKeyChanges = false;

    const dom = bubbleList.map((item, index) => {
      const isLast = bubbleList.length - 1 === index;
      const placement = item.role === 'user' ? 'right' : 'left';
      let itemKey: string;
      if (item.id === LOADING_FLAT) {
        const previous = loadingKeyByIndexRef.current.get(index);
        itemKey =
          previous && previous.createAt === item.createAt
            ? previous.key
            : nanoid();
        nextLoadingKeys.set(index, { key: itemKey, createAt: item.createAt });
      } else {
        const realId = item.id as string;
        const prevLoadingKey = loadingKeyByIndexRef.current.get(index);
        itemKey =
          realIdToStableKeyRef.current.get(realId) ??
          prevLoadingKey?.key ??
          realId;
        realRowCount += 1;
        if (realIdToStableKeyRef.current.get(realId) !== itemKey) {
          hasRealKeyChanges = true;
        }
      }

      const previousRow = rowsRef.current.get(itemKey);
      let cachedData = previousRow?.data;
      if (cachedData?.source !== item || cachedData.isLast !== isLast) {
        cachedData = {
          source: item,
          isLast,
          value:
            cachedData?.isLast === isLast &&
            messageBubbleDataAreEqual(cachedData.source, item)
              ? cachedData.value
              : { ...item, isLatest: isLast, isLast },
        };
      }

      const baseAvatar = placement === 'right' ? userMeta : assistantMeta;
      const prevAvatar = previousRow?.avatar;
      let mergedAvatar = prevAvatar;
      if (
        !prevAvatar ||
        prevAvatar.base !== baseAvatar ||
        prevAvatar.meta !== item.meta
      ) {
        const candidateAvatar = { ...baseAvatar, ...item.meta };
        mergedAvatar = {
          base: baseAvatar,
          meta: item.meta,
          value:
            prevAvatar &&
            shallowEqualRecord(
              prevAvatar.value as Record<string, unknown>,
              candidateAvatar as Record<string, unknown>,
            )
              ? prevAvatar.value
              : candidateAvatar,
        };
      }
      const preMessage = bubbleList[index - 1];
      const rowStyles = mergedStyles.get(placement);
      const shouldLazyLoad = lazyRows?.[index] ?? false;
      const canReuseElement =
        previousRow &&
        previousRow.data.value === cachedData.value &&
        previousRow.avatar.value === mergedAvatar!.value &&
        previousRow.sharedProps === sharedProps &&
        previousRow.styles === rowStyles &&
        previousRow.shouldLazyLoad === shouldLazyLoad &&
        messageBubbleDataAreEqual(previousRow.preMessage, preMessage) &&
        rowPlaceholderOptionsEqual(previousRow, props.lazy, index, totalCount);
      const element = canReuseElement ? (
        previousRow.element
      ) : (
        <BubbleListItem
          key={itemKey}
          className={classNames?.bubbleListItemClassName}
          lazy={props.lazy}
          shouldLazyLoad={shouldLazyLoad}
          index={index}
          total={totalCount}
          role={item.role}
          isLast={isLast}
        >
          <Bubble
            {...sharedProps}
            data-id={item.id}
            avatar={mergedAvatar!.value}
            preMessage={preMessage}
            id={item.id}
            originData={cachedData.value}
            placement={placement}
            time={item.updateAt ?? item.createAt}
            styles={rowStyles}
          />
        </BubbleListItem>
      );
      nextRows.set(
        itemKey,
        canReuseElement &&
          previousRow.data === cachedData &&
          previousRow.avatar === mergedAvatar
          ? previousRow
          : {
              data: cachedData,
              avatar: mergedAvatar!,
              sharedProps,
              preMessage,
              styles: rowStyles,
              lazy: props.lazy,
              shouldLazyLoad,
              index,
              total: totalCount,
              element,
            },
      );
      return element;
    });
    // Token updates usually leave the key set unchanged. Avoid copying every
    // real-id mapping; rebuild only when membership or a stable key changes.
    let realKeys = realIdToStableKeyRef.current;
    if (hasRealKeyChanges || realRowCount !== realKeys.size) {
      realKeys = new Map<string, string>();
      nextRows.forEach((row, key) => {
        const id = row.data.source.id;
        if (id !== LOADING_FLAT) realKeys.set(id as string, key);
      });
    }
    return {
      dom,
      loadingKeys: nextLoadingKeys,
      realKeys,
      rows: nextRows,
    };
  }, [
    bubbleList,
    classNames,
    loading,
    lazyRows,
    mergedStyles,
    props.lazy,
    sharedProps,
    userMeta,
    assistantMeta,
  ]);

  // 仅发布已提交的行缓存；被 Suspense 放弃的渲染不能改变当前消息的 key。
  useLayoutEffect(() => {
    prevStyleRef.current = stableStyle;
    bubbleMergedStylesRef.current = mergedStyles;
    loadingKeyByIndexRef.current = rowState.loadingKeys;
    realIdToStableKeyRef.current = rowState.realKeys;
    rowsRef.current = rowState.rows;
    sharedPropsRef.current = sharedProps;
  }, [stableStyle, mergedStyles, rowState, sharedProps]);

  return (
    <BubbleConfigContext.Provider value={mergedContext}>
      <div
        className={clsx(prefixCls, className, hashId, {
          [`${prefixCls}-loading`]: loading,
          [`${prefixCls}-readonly`]: props.readonly,
          [`${prefixCls}-compact`]: compact,
        })}
        data-chat-list={bubbleList.length}
        style={loading ? { padding: 24, ...style } : style}
        ref={bubbleListRef}
        onScroll={onScroll}
        onWheel={(e) => onWheel?.(e, e.currentTarget)}
        onTouchMove={(e) => onTouchMove?.(e, e.currentTarget)}
      >
        {loading ? <SkeletonList /> : rowState.dom}
      </div>
    </BubbleConfigContext.Provider>
  );
});

BubbleList.displayName = 'BubbleList';

export default BubbleList;
