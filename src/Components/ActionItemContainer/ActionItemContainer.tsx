import { GripVertical, Menu } from '@sofa-design/icons';
import { ConfigProvider, Popover } from 'antd';
import classNames from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { useStyle } from './style';

type KeyedElement = React.ReactElement & { key: React.Key };

export interface ActionItemContainerProps {
  children: KeyedElement | KeyedElement[];
  size?: 'small' | 'large' | 'default';
  style?: React.CSSProperties;
  showMenu?: boolean;
  menuDisabled?: boolean;
}

interface ChildEntry {
  key: React.Key | null;
  node: React.ReactNode;
}

/**
 * 把 `key: React.Key | null` 收敛为 React 可接受的 key 类型。
 *
 * `null` 在 React key 位上等价于「未提供 key」；这里做一次集中转换，
 * 同时去除调用点对 `as any` 的依赖。
 */
const toReactKey = (key: React.Key | null): React.Key | undefined =>
  key ?? undefined;

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
      key={toReactKey(entry.key)}
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

/**
 * ActionItemContainer 组件 - 可拖拽排序 + 横向滚动 + 溢出 Popover 的操作条容器。
 *
 * 之前位于 `src/MarkdownInputField/BeforeToolContainer/`，与 MarkdownInputField 几乎
 * 没有耦合（只是被作为 `beforeToolsRender` 的「建议实现」使用）。已迁移至通用组件目录，
 * 文件名与默认导出一致；原位置保留 re-export 兼容层，公开 API（`ActionItemContainer`）
 * 不变。
 */
export const ActionItemContainer = (props: ActionItemContainerProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const basePrefixCls = getPrefixCls('agentic-chat-action-item-box');
  const { hashId } = useStyle(basePrefixCls);
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
    return array.map((node) => {
      // React.Children.toArray 返回 ReactChild[]，但其中 ReactElement 才有 key
      const key = React.isValidElement(node) ? node.key : null;
      return { key, node };
    });
  });

  const [ordered, setOrdered] = useState<ChildEntry[]>(() =>
    toEntries(props.children),
  );

  // 提取 children 的 key 序列用于比较，避免 props.children 每次渲染新引用导致 effect 过度触发
  const childrenKeys = useMemo(
    () =>
      React.Children.toArray(props.children)
        .filter(React.isValidElement)
        .map((child) => child.key),
    [props.children],
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    let hasMissingKey = false;
    React.Children.forEach(props.children, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.key === null) {
        hasMissingKey = true;
      }
    });
    if (hasMissingKey) {
      // 仅开发环境抛错：与既有契约一致，强制使用方为每个子元素显式提供 key，
      // 否则 ordered list 在 children 变化 / 拖拽重排时无法稳定身份。
      // 生产环境（NODE_ENV === 'production'）已在上方提前 return，不会触发。
      throw new Error(
        'ActionItemContainer: all children must include an explicit `key` prop.',
      );
    }
  }, [childrenKeys]);

  // keep ordered list in sync when children change; preserve existing order by key when possible
  useEffect(() => {
    const incoming = toEntries(props.children);
    // 用 Map<key, node> 避免下方双重 find 带来的 O(n²) 复杂度
    const incomingByKey = new Map<React.Key | null, React.ReactNode>();
    for (const entry of incoming) {
      incomingByKey.set(entry.key, entry.node);
    }
    const existingKeys = new Set(ordered.map((e) => e.key));

    const merged: ChildEntry[] = [];
    // 保留已有顺序（同时用最新 node 替换以反映 props 变化）
    for (const e of ordered) {
      if (incomingByKey.has(e.key)) {
        merged.push({ key: e.key, node: incomingByKey.get(e.key) });
      }
    }
    // 追加新增项
    for (const e of incoming) {
      if (!existingKeys.has(e.key)) {
        merged.push(e);
      }
    }
    // 数量对不上（例如批量替换）时直接采用 incoming
    setOrdered(merged.length === incoming.length ? merged : incoming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenKeys]);

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

  return (
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
          <React.Fragment key={toReactKey(entry.key)}>
            {entry.node}
          </React.Fragment>
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
                      key={toReactKey(entry.key)}
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
    </div>
  );
};

ActionItemContainer.displayName = 'ActionItemContainer';
