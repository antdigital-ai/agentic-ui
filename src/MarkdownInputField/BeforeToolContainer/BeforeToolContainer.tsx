import { GripVertical, Menu } from '@sofa-design/icons';
import { ConfigProvider, Popover } from 'antd';
import classNames from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useStyle } from '../../Components/ActionItemBox';
import { useRefFunction } from '../../Hooks/useRefFunction';

type KeyedElement = React.ReactElement & { key: React.Key };

export type ActionItemContainerProps = {
  children: KeyedElement | KeyedElement[];
  size?: 'small' | 'large' | 'default';
  style?: React.CSSProperties;
  showMenu?: boolean;
  menuDisabled?: boolean;
};

type ChildEntry = { key: React.Key | null; node: React.ReactNode };

// 常量提取
const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [contenteditable="true"], [data-no-pan]';
const PAN_THRESHOLD = 6;

const SCROLL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: 8,
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'contain',
  touchAction: 'pan-x',
  paddingRight: 54,
};

const POPOVER_OVERLAY_STYLE: React.CSSProperties = { padding: 0 };

// 可拖拽的 Popup Item 子组件
const DraggablePopupItem: React.FC<{
  entry: ChildEntry;
  index: number;
  basePrefixCls: string;
  hashId: string;
  draggingIndex: number | null;
  overIndex: number | null;
  isHandlePressRef: React.MutableRefObject<boolean>;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  isHandleTarget: (target: EventTarget | null) => boolean;
  setDraggingIndex: (index: number | null) => void;
}> = React.memo((props) => {
  const {
    entry,
    index,
    basePrefixCls,
    hashId,
    draggingIndex,
    overIndex,
    isHandlePressRef,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isHandleTarget,
    setDraggingIndex,
  } = props;

  const handleMouseDown = useRefFunction((evt: React.MouseEvent) => {
    const isHandle = isHandleTarget(evt.target);
    isHandlePressRef.current = isHandle;
    setDraggingIndex(isHandle ? index : null);
  });

  const handleMouseUp = useRefFunction(() => {
    if (draggingIndex === null) {
      isHandlePressRef.current = false;
    }
  });

  const handleGripMouseDown = useRefFunction((evt: React.MouseEvent) => {
    isHandlePressRef.current = true;
    setDraggingIndex(index);
    evt.stopPropagation();
  });

  return (
    <div
      key={entry.key as any}
      className={classNames(
        `${basePrefixCls}-overflow-container-popup-item`,
        hashId,
        {
          [`${basePrefixCls}-dragging`]: draggingIndex === index,
          [`${basePrefixCls}-drag-over`]: overIndex === index,
        },
      )}
      draggable
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragStart={(evt) => onDragStart(evt, index)}
      onDragOver={(evt) => onDragOver(evt, index)}
      onDrop={(evt) => onDrop(evt, index)}
      onDragEnd={onDragEnd}
    >
      <GripVertical
        className={classNames(`${basePrefixCls}-drag-handle`, hashId)}
        onMouseDown={handleGripMouseDown}
      />
      <div draggable={false}>{entry.node}</div>
    </div>
  );
});

DraggablePopupItem.displayName = 'DraggablePopupItem';

export const ActionItemContainer = (props: ActionItemContainerProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const basePrefixCls = getPrefixCls('agentic-chat-action-item-box');
  const { wrapSSR, hashId } = useStyle(basePrefixCls);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isIndicatorHover, setIsIndicatorHover] = useState(false);
  const [showOverflowPopup, setShowOverflowPopup] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const isHandlePressRef = useRef(false);

  // horizontal drag-to-scroll state (main container only)
  const isPanningRef = useRef(false);
  const panStartXRef = useRef(0);
  const panStartScrollLeftRef = useRef(0);
  const hasPanMovedRef = useRef(false);
  const panIntentRef = useRef(false);

  // 辅助函数：检查是否是交互元素
  const isInteractiveTarget = useRefFunction((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest(INTERACTIVE_SELECTOR);
  });

  // 辅助函数：检查是否是拖拽手柄
  const isHandleTarget = useRefFunction((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const handle = target.closest(`.${basePrefixCls}-drag-handle`);
    return !!handle;
  });

  // 辅助函数：将子节点转换为条目数组
  const toEntries = useRefFunction((nodes: React.ReactNode): ChildEntry[] => {
    const array = React.Children.toArray(nodes);
    return array.map((node) => ({ key: (node as any)?.key ?? null, node }));
  });

  const [ordered, setOrdered] = useState<ChildEntry[]>(() =>
    toEntries(props.children),
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    let hasMissingKey = false;
    React.Children.forEach(props.children as any, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.key === null) {
        hasMissingKey = true;
      }
    });
    if (hasMissingKey) {
      throw new Error(
        'ActionItemContainer: all children must include an explicit `key` prop.',
      );
    }
  }, [props.children]);

  // keep ordered list in sync when children change; preserve existing order by key when possible
  useEffect(() => {
    const incoming = toEntries(props.children);
    const existingKeys = new Set(ordered.map((e) => e.key));
    // map existing order
    const merged: ChildEntry[] = [];
    // keep items in previous order for keys that still exist
    for (const e of ordered) {
      if (incoming.find((i) => i.key === e.key)) {
        // replace node to reflect latest props while keeping position
        const updated = incoming.find((i) => i.key === e.key)!;
        merged.push({ key: e.key, node: updated.node });
      }
    }
    // append any new items not seen before
    for (const e of incoming) {
      if (!existingKeys.has(e.key)) {
        merged.push(e);
      }
    }
    // if counts don't match (e.g., many changes), fallback to incoming order
    setOrdered(merged.length === incoming.length ? merged : incoming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.children]);

  // 辅助函数：重新排序数组
  const reorder = useRefFunction(
    (list: ChildEntry[], from: number, to: number) => {
      const next = list.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    },
  );

  // 拖拽事件处理
  const handleDragStart = useRefFunction(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', String(index));
      } catch {
        console.error(e);
      }
      setDraggingIndex(index);
    },
  );

  const handleDragOver = useRefFunction(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (overIndex !== index) setOverIndex(index);
    },
  );

  const handleDrop = useRefFunction(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (draggingIndex === null) return;
      if (draggingIndex === index) return;

      setOrdered((prev) => reorder(prev, draggingIndex, index));
      setDraggingIndex(null);
      setOverIndex(null);
      isHandlePressRef.current = false;
    },
  );

  const handleDragEnd = useRefFunction(() => {
    setDraggingIndex(null);
    setOverIndex(null);
    isHandlePressRef.current = false;
  });

  // Pointer 事件处理 - 拖拽滚动
  const handlePointerDown = useRefFunction(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el || e.button !== 0 || isInteractiveTarget(e.target)) return;

      panIntentRef.current = true;
      hasPanMovedRef.current = false;
      panStartXRef.current = e.clientX;
      panStartScrollLeftRef.current = el.scrollLeft;
    },
  );

  const handlePointerMove = useRefFunction(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;

      // 检测是否开始拖拽
      if (!isPanningRef.current && panIntentRef.current) {
        const dx = e.clientX - panStartXRef.current;
        if (Math.abs(dx) > PAN_THRESHOLD) {
          isPanningRef.current = true;
          hasPanMovedRef.current = true;
          try {
            el.setPointerCapture(e.pointerId);
          } catch {}
        }
      }

      // 执行拖拽滚动
      if (isPanningRef.current) {
        const dx = e.clientX - panStartXRef.current;
        el.scrollLeft = panStartScrollLeftRef.current - dx;
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
    },
  );

  const handlePointerUp = useRefFunction(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;

      panIntentRef.current = false;
      if (isPanningRef.current) {
        isPanningRef.current = false;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}
      }
    },
  );

  const handlePointerCancel = useRefFunction(() => {
    isPanningRef.current = false;
    panIntentRef.current = false;
  });

  const handleWheel = useRefFunction((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    // 将滚轮事件映射到水平滚动
    const horizontalDelta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (horizontalDelta !== 0) {
      el.scrollLeft += horizontalDelta;
    }
    e.stopPropagation();
  });

  const handleClick = useRefFunction((e: React.MouseEvent<HTMLDivElement>) => {
    // 防止拖拽时误触点击
    if (hasPanMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasPanMovedRef.current = false;
    }
  });

  // Popover 事件处理
  const handlePopoverChange = useRefFunction((visible: boolean) => {
    if (!props.menuDisabled) {
      setShowOverflowPopup(visible);
    }
  });

  const handleMenuMouseEnter = useRefFunction(() => {
    if (!props.menuDisabled) {
      setIsIndicatorHover(true);
    }
  });

  const handleMenuMouseLeave = useRefFunction(() => {
    if (!props.menuDisabled) {
      setIsIndicatorHover(false);
    }
  });

  const handlePopupWheel = useRefFunction((e: React.WheelEvent) => {
    e.stopPropagation();
  });

  // 容器样式
  const containerStyle = useMemo(() => ({ ...props.style }), [props.style]);

  const containerClassName = useMemo(
    () =>
      classNames(
        `${basePrefixCls}-container`,
        {
          [`${basePrefixCls}-container-${props.size}`]: props.size,
          [`${basePrefixCls}-container-no-hover`]: isIndicatorHover,
        },
        hashId,
      ),
    [basePrefixCls, props.size, isIndicatorHover, hashId],
  );

  return wrapSSR(
    <div
      ref={containerRef}
      style={containerStyle}
      className={containerClassName}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      <div
        ref={scrollRef}
        className={classNames(`${basePrefixCls}-scroll`, hashId)}
        style={SCROLL_STYLE}
      >
        {ordered.map((entry) => (
          <React.Fragment key={entry.key as any}>{entry.node}</React.Fragment>
        ))}
      </div>
      {props.showMenu !== false && (
        <div
          className={classNames(`${basePrefixCls}-overflow-container`, hashId)}
          data-no-pan
        >
          <div
            className={classNames(
              `${basePrefixCls}-overflow-container-indicator`,
              hashId,
            )}
          >
            <div
              className={classNames(
                `${basePrefixCls}-overflow-container-placeholder`,
                hashId,
              )}
            ></div>
            <Popover
              open={showOverflowPopup}
              onOpenChange={handlePopoverChange}
              trigger="click"
              placement="topRight"
              arrow={false}
              styles={{ body: POPOVER_OVERLAY_STYLE }}
              overlayClassName={classNames(
                `${basePrefixCls}-overflow-popover`,
                hashId,
              )}
              content={
                <div
                  className={classNames(
                    `${basePrefixCls}-overflow-container-popup`,
                    hashId,
                  )}
                  onWheel={handlePopupWheel}
                >
                  {ordered.map((entry, index) => (
                    <DraggablePopupItem
                      key={entry.key as any}
                      entry={entry}
                      index={index}
                      basePrefixCls={basePrefixCls}
                      hashId={hashId}
                      draggingIndex={draggingIndex}
                      overIndex={overIndex}
                      isHandlePressRef={isHandlePressRef}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      isHandleTarget={isHandleTarget}
                      setDraggingIndex={setDraggingIndex}
                    />
                  ))}
                </div>
              }
            >
              <div
                className={classNames(
                  `${basePrefixCls}-overflow-container-menu`,
                  hashId,
                  {
                    [`${basePrefixCls}-overflow-container-menu-disabled`]:
                      props.menuDisabled,
                  },
                )}
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
              >
                <Menu />
              </div>
            </Popover>
          </div>
        </div>
      )}
    </div>,
  );
};

ActionItemContainer.displayName = 'ActionItemContainer';
