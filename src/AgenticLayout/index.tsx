import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, {
  memo,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  LayoutHeader,
  type LayoutHeaderConfig,
} from '../Components/LayoutHeader';
import { useRefFunction } from '../Hooks/useRefFunction';
import { useAgenticLayoutStyle } from './style';

export interface AgenticLayoutProps {
  /** 左侧内容 */
  left?: ReactNode;
  /** 中间内容 */
  center: ReactNode;
  /** 右侧内容 */
  right?: ReactNode;
  /** 头部配置 */
  header?: LayoutHeaderConfig;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 左侧宽度 */
  leftWidth?: number;
  /** 右侧宽度 */
  rightWidth?: number;
}

/**
 * 用于 e2e / 单元测试稳定定位组件根节点。
 * 历史上曾使用 prefixCls 当 testid，但 prefixCls 是与 ConfigProvider
 * 联动的样式前缀，把它当作测试标识会导致同页面多实例 testid 冲突，
 * 这里改用语义化常量。
 */
export const AGENTIC_LAYOUT_TEST_ID = 'agentic-layout';

/**
 * AgenticLayout 组件 - 智能体布局组件
 *
 * 该组件提供一个三栏布局的容器，支持左中右三个区域的灵活配置。
 * 左右侧栏支持折叠功能，中间区域自适应宽度。
 *
 * @component
 * @description 智能体布局组件，提供左中右三栏布局
 * @param {AgenticLayoutProps} props - 组件属性
 * @param {ReactNode} [props.left] - 左侧内容
 * @param {ReactNode} props.center - 中间内容
 * @param {ReactNode} [props.right] - 右侧内容
 * @param {LayoutHeaderConfig} [props.header] - 头部配置
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.className] - 自定义CSS类名
 * @param {number} [props.leftWidth=256] - 左侧宽度
 * @param {number} [props.rightWidth=540] - 右侧宽度
 *
 * @example
 * ```tsx
 * <AgenticLayout
 *   left={<History />}
 *   center={<ChatLayout />}
 *   right={<Workspace />}
 *   header={{
 *     title: "智能体助手",
 *     showShare: true,
 *     showLeftCollapse: true,
 *     showRightCollapse: true,
 *     onLeftCollapse: (collapsed) => console.log('左侧折叠:', collapsed),
 *     onRightCollapse: (collapsed) => console.log('右侧折叠:', collapsed),
 *     onShare: () => console.log('分享')
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的布局组件
 *
 * @remarks
 * - 支持左右侧栏的独立折叠控制
 * - 中间区域自适应剩余宽度
 * - 提供响应式布局适配
 * - 支持自定义宽度
 * - 集成 Ant Design 主题系统
 */
// 常量定义
/** 右侧栏拖拽允许的最小宽度。 */
const MIN_RIGHT_WIDTH = 400;
/** 中间区域必须保留的最小宽度，防止被左右栏挤没。 */
const MIN_CENTER_WIDTH = 320;
/** 右侧栏最大宽度占视口宽度的比例。 */
const MAX_RIGHT_WIDTH_RATIO = 0.7;
const DEFAULT_LEFT_WIDTH = 256;
const DEFAULT_RIGHT_WIDTH = 540;
/** 左侧栏内边距（折叠态需归零）。 */
const SIDEBAR_LEFT_PADDING = 12;

/** 键盘步长：每按一次方向键调整的像素数。 */
const KEYBOARD_RESIZE_STEP = 16;
/** 键盘步长（按住 Shift）：粗调用大步长。 */
const KEYBOARD_RESIZE_LARGE_STEP = 64;

/** 计算视口允许的最大右栏宽度。 */
const computeMaxRightWidth = (): number => {
  if (typeof window === 'undefined') return Infinity;
  return window.innerWidth * MAX_RIGHT_WIDTH_RATIO;
};

/**
 * 把宽度夹到 [MIN_RIGHT_WIDTH, maxWidth] 区间。
 * 仅用于「拖拽 / 键盘交互」：保留下限避免用户手抖把右栏拖没。
 */
const clampRightWidth = (next: number, maxWidth: number): number =>
  Math.max(MIN_RIGHT_WIDTH, Math.min(next, maxWidth));

/**
 * 仅夹上限，不约束下限（仍兜底防止负数）。
 * 用于「外部 rightWidth prop / 初始化 / props 同步 / 视口 resize」：
 * 这些场景应完全尊重外部传入值，仅防止超过视口允许的最大宽度。
 * 若也套用 MIN_RIGHT_WIDTH 会导致 `rightWidth={200}` 这类 prop 被默默夹回 400，
 * 表现为「rightWidth 不生效」。
 */
const clampRightWidthMaxOnly = (next: number, maxWidth: number): number =>
  Math.max(0, Math.min(next, maxWidth));

const AgenticLayoutComponent: React.FC<AgenticLayoutProps> = ({
  left,
  center,
  right,
  header,
  style,
  className,
  leftWidth = DEFAULT_LEFT_WIDTH,
  rightWidth = DEFAULT_RIGHT_WIDTH,
}) => {
  const { getPrefixCls, direction } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-layout');
  const { wrapSSR, hashId } = useAgenticLayoutStyle(prefixCls);
  // RTL 下拖拽方向取反：在 RTL 中，鼠标向右移动应等同于扩大右侧栏。
  const isRTL = direction === 'rtl';

  // 从 header 配置中获取折叠状态
  const leftCollapsed =
    header?.leftCollapsed ?? header?.leftDefaultCollapsed ?? false;
  const rightCollapsed =
    header?.rightCollapsed ?? header?.rightDefaultCollapsed ?? false;

  // 右侧边栏宽度状态
  // 使用 lazy initializer 在首屏阶段就执行 clamp，避免「初值超出 maxWidth → 渲染 → 再 clamp」造成的两帧布局抖动。
  // 这里走 maxOnly 版本：完全尊重外部 rightWidth prop，不强制套用 MIN_RIGHT_WIDTH。
  const [currentRightWidth, setCurrentRightWidth] = useState<number>(() =>
    clampRightWidthMaxOnly(rightWidth, computeMaxRightWidth()),
  );
  const currentRightWidthRef = useRef(currentRightWidth);
  currentRightWidthRef.current = currentRightWidth;
  const isResizingRef = useRef(false);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(rightWidth);

  // 计算最大宽度（浏览器窗口的70%）
  const getMaxRightWidth = useRefFunction(() => computeMaxRightWidth());

  // 当 rightWidth prop 变化时同步状态，并在同一时刻 clamp 防止越界。
  // 同样走 maxOnly：尊重外部 prop，不强制套用 MIN_RIGHT_WIDTH。
  useEffect(() => {
    setCurrentRightWidth(
      clampRightWidthMaxOnly(rightWidth, computeMaxRightWidth()),
    );
  }, [rightWidth]);

  // 监听窗口大小变化，确保右侧边栏宽度不超过最大限制
  useEffect(() => {
    const handleWindowResize = () => {
      const maxWidth = getMaxRightWidth();
      if (currentRightWidthRef.current > maxWidth) {
        setCurrentRightWidth(maxWidth);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [getMaxRightWidth]);

  // 持有最近一次注册到 document 的 listener 引用，用于卸载时清理。
  // 不放入依赖数组，避免拖拽过程中 callback 引用变化引发 effect 反复 re-bind。
  const boundMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const boundUpHandlerRef = useRef<(() => void) | null>(null);
  // rAF 节流：同一帧多次 mousemove 只 setState 一次，避免高频 rerender。
  const rafIdRef = useRef<number | null>(null);
  const pendingWidthRef = useRef<number | null>(null);

  // 处理拖拽开始：捕获本次拖拽的初始状态，并把 mousemove/mouseup 直接绑定到 document。
  // listener 通过 ref 持有，使得卸载/单次拖拽结束都能精确移除。
  const handleResizeStart = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = currentRightWidth;

    const onMove = (event: MouseEvent) => {
      if (!isResizingRef.current) return;
      // 向左拖拽（扩大右侧边栏）时 deltaX 为正，向右拖拽（缩小）时 deltaX 为负。
      // RTL 下方向相反：向右拖拽即扩大右侧栏。
      const rawDeltaX = resizeStartX.current - event.clientX;
      const deltaX = isRTL ? -rawDeltaX : rawDeltaX;
      const newWidth = resizeStartWidth.current + deltaX;
      const maxWidth = getMaxRightWidth();
      const clampedWidth = clampRightWidth(newWidth, maxWidth);

      // rAF 节流：同一帧的多次 mousemove 合并为最后一次的 setState。
      pendingWidthRef.current = clampedWidth;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          const nextWidth = pendingWidthRef.current;
          pendingWidthRef.current = null;
          if (nextWidth !== null) {
            setCurrentRightWidth(nextWidth);
          }
        });
      }
    };

    const onUp = () => {
      isResizingRef.current = false;
      // 拖拽结束前 flush 掉最后一帧未提交的宽度，避免最后一次微调丢失。
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (pendingWidthRef.current !== null) {
        setCurrentRightWidth(pendingWidthRef.current);
        pendingWidthRef.current = null;
      }
      if (boundMoveHandlerRef.current) {
        document.removeEventListener('mousemove', boundMoveHandlerRef.current);
        boundMoveHandlerRef.current = null;
      }
      if (boundUpHandlerRef.current) {
        document.removeEventListener('mouseup', boundUpHandlerRef.current);
        boundUpHandlerRef.current = null;
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    boundMoveHandlerRef.current = onMove;
    boundUpHandlerRef.current = onUp;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  /**
   * 键盘交互：方向键调宽，Home/End 跳到极值。
   * - 在 LTR 下：ArrowLeft = 扩大（向左拉手柄）、ArrowRight = 缩小
   * - 在 RTL 下方向相反
   * - Shift 切大步长
   */
  const handleResizeKeyDown = useRefFunction(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const maxWidth = getMaxRightWidth();
      const step = e.shiftKey
        ? KEYBOARD_RESIZE_LARGE_STEP
        : KEYBOARD_RESIZE_STEP;
      let next: number | null = null;
      switch (e.key) {
        case 'ArrowLeft':
          next = currentRightWidth + (isRTL ? -step : step);
          break;
        case 'ArrowRight':
          next = currentRightWidth + (isRTL ? step : -step);
          break;
        case 'Home':
          next = MIN_RIGHT_WIDTH;
          break;
        case 'End':
          next = maxWidth;
          break;
        default:
          return;
      }
      e.preventDefault();
      setCurrentRightWidth(clampRightWidth(next, maxWidth));
    },
  );

  // 仅在卸载时执行一次清理：移除可能残留的 document 级 listener、复位 body 样式、取消 rAF。
  // 依赖数组留空，避免拖拽过程中 setCurrentRightWidth 引发的 rerender 反复重跑此 effect。
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      pendingWidthRef.current = null;
      if (boundMoveHandlerRef.current) {
        document.removeEventListener('mousemove', boundMoveHandlerRef.current);
        boundMoveHandlerRef.current = null;
      }
      if (boundUpHandlerRef.current) {
        document.removeEventListener('mouseup', boundUpHandlerRef.current);
        boundUpHandlerRef.current = null;
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // 拖拽手柄当前可达的最大宽度，用于 aria-valuemax 和键盘交互边界。
  const ariaValueMax = Math.round(getMaxRightWidth());
  const ariaValueNow = Math.round(currentRightWidth);

  return wrapSSR(
    <div
      className={classNames(prefixCls, className, hashId)}
      data-testid={AGENTIC_LAYOUT_TEST_ID}
      style={style}
    >
      {/* 主体内容区域 */}
      <div
        className={classNames(`${prefixCls}-body`, hashId)}
        style={{ display: 'flex', flex: 1 }}
      >
        {/* 左侧边栏 */}
        {left && (
          <div
            className={classNames(
              `${prefixCls}-sidebar`,
              `${prefixCls}-sidebar-left`,
              {
                [`${prefixCls}-sidebar-left-collapsed`]: leftCollapsed,
              },
              hashId,
            )}
            // 宽度与 padding 完全由 inline style 控制，确保折叠态不依赖 !important。
            style={{
              width: leftCollapsed ? 0 : leftWidth,
              minWidth: leftCollapsed ? 0 : leftWidth,
              maxWidth: leftCollapsed ? 0 : leftWidth,
              padding: leftCollapsed ? 0 : SIDEBAR_LEFT_PADDING,
              border: leftCollapsed ? 'none' : undefined,
            }}
          >
            <div className={classNames(`${prefixCls}-sidebar-content`, hashId)}>
              {left}
            </div>
          </div>
        )}

        {/* 中间内容区域 */}
        <div
          className={classNames(`${prefixCls}-main`, hashId)}
          style={{
            flex: 1,
            // 用专属常量防止与右栏最小宽度耦合误读。
            minWidth: MIN_CENTER_WIDTH,
          }}
        >
          {header && (
            <LayoutHeader
              {...header}
              leftCollapsible={header.leftCollapsible ?? !!left}
              rightCollapsible={header.rightCollapsible ?? !!right}
            />
          )}
          <div className={classNames(`${prefixCls}-main-content`, hashId)}>
            {center}
          </div>
        </div>
      </div>
      {/* 右侧边栏 */}
      {right && (
        <div
          className={classNames(`${prefixCls}-sidebar-wrapper-right`, hashId)}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          {/* 拖拽手柄：role="separator" 为 ARIA 推荐的可调分隔条语义 */}
          {!rightCollapsed && (
            <div
              className={classNames(
                `${prefixCls}-resize-handle`,
                `${prefixCls}-resize-handle-right`,
                hashId,
              )}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize right sidebar"
              aria-valuemin={MIN_RIGHT_WIDTH}
              aria-valuemax={ariaValueMax}
              aria-valuenow={ariaValueNow}
              tabIndex={0}
              onMouseDown={handleResizeStart}
              onKeyDown={handleResizeKeyDown}
            />
          )}
          <div
            className={classNames(
              `${prefixCls}-sidebar`,
              `${prefixCls}-sidebar-right`,
              {
                [`${prefixCls}-sidebar-right-collapsed`]: rightCollapsed,
              },
              hashId,
            )}
            // 宽度由 inline style 单一来源控制，避免与 class 打架。
            style={{
              width: rightCollapsed ? 0 : currentRightWidth,
              minWidth: rightCollapsed ? 0 : currentRightWidth,
              maxWidth: rightCollapsed ? 0 : currentRightWidth,
              padding: rightCollapsed ? 0 : undefined,
              opacity: rightCollapsed ? 0 : undefined,
              overflow: rightCollapsed ? 'hidden' : undefined,
            }}
          >
            <div className={classNames(`${prefixCls}-sidebar-content`, hashId)}>
              {right}
            </div>
          </div>
        </div>
      )}
    </div>,
  );
};

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const AgenticLayout = memo(AgenticLayoutComponent);
