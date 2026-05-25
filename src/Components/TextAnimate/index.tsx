import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { isNumber, isObject, isString } from 'lodash-es';
import toArray from 'rc-util/lib/Children/toArray';
import React, {
  ElementType,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTextAnimateStyle } from './style';

/**
 * 等价 framer-motion `Variants` 的本地类型别名。
 *
 * 历史 API 接受 framer-motion `Variants` 对象自定义动画；去除 framer-motion 后
 * 保留同名类型以维持对外兼容（任意键值结构），但请注意：自定义 variants 在新
 * 纯 CSS 实现下统一退化为 fade-in 视觉效果（参见 style.ts 中 `data-animation="custom"`），
 * 因为 JS 对象描述无法在不引入运行时动画库的前提下完全转换为任意 CSS。
 */
export type Variants = Record<string, Record<string, unknown>>;

type AnimationType = 'text' | 'word' | 'character' | 'line' | 'mix';
type AnimationVariant =
  | 'fadeIn'
  | 'blurIn'
  | 'blurInUp'
  | 'blurInDown'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleUp'
  | 'scaleDown';

export interface TextAnimateProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  /**
   * The text content to animate
   */
  children: React.ReactNode;
  /**
   * The class name to be applied to the component
   */
  className?: string;
  /**
   * The class name to be applied to each segment
   */
  segmentClassName?: string;
  /**
   * The delay before the animation starts
   */
  delay?: number;
  /**
   * The duration of the animation
   */
  duration?: number;
  /**
   * Custom motion variants for the animation
   */
  variants?: Variants;
  /**
   * The element type to render
   */
  as?: ElementType;
  /**
   * How to split the text ("text", "word", "character")
   */
  by?: AnimationType;
  /**
   * Whether to start animation when component enters viewport
   */
  startOnView?: boolean;
  /**
   * Whether to animate only once
   */
  once?: boolean;
  /**
   * The animation preset to use
   */
  animation?: AnimationVariant;
  /**
   * Whether to enable accessibility features (default: true)
   */
  accessible?: boolean;
}

/**
 * 各拆分模式下相邻 segment 的 stagger 增量（秒/项）。
 *
 * 与历史 framer-motion 实现保持一致：每个 item 的 framer-motion `custom={i * staggerTimings[by]}`
 * 由这里的常量推导。新实现中 stagger 通过 inline `--text-animate-delay` 实现。
 */
const staggerTimings: Record<AnimationType, number> = {
  text: 0.06,
  word: 0.05,
  character: 0.03,
  line: 0.06,
  mix: 0.06,
};

/**
 * 等价 framer-motion useInView({ amount, once }) 的原生 IntersectionObserver Hook。
 *
 * - amount: threshold（0~1）
 * - once: 触发后是否断开 observer 不再回退为 false
 * - SSR / 无 IntersectionObserver 环境直接返回 true，与 framer-motion fallback 行为一致
 */
function useInViewObserver(
  ref: React.RefObject<Element>,
  amount: number,
  once: boolean,
): boolean {
  const [inView, setInView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (typeof IntersectionObserver === 'undefined') return true;
    return false;
  });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) {
              observer.disconnect();
            }
            return;
          }
        }
        if (!once) {
          setInView(false);
        }
      },
      { threshold: amount },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [ref, amount, once]);

  return inView;
}

export const resolveSegments = (
  children: React.ReactNode,
  by: AnimationType,
) => {
  const result: React.ReactNode[] = [];
  toArray(children).forEach((item) => {
    if (isString(item) || isNumber(item)) {
      const itemString = item.toString();
      if (itemString === '') return;
      switch (by) {
        case 'word':
          result.push(...itemString.split(/(\s+)/));
          break;
        case 'character':
          result.push(...itemString.split(''));
          break;
        case 'line':
          result.push(...itemString.split('\n'));
          break;
        case 'text':
        default:
          result.push(itemString);
      }
    } else {
      result.push(item);
    }
  });
  return result;
};

const TextAnimateBase = ({
  children,
  delay = 0,
  duration = 0.3,
  variants,
  className,
  segmentClassName,
  as: Component = 'p',
  startOnView = true,
  once = false,
  by = 'word',
  animation = 'fadeIn',
  accessible = true,
  ...props
}: TextAnimateProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('text-animate');
  const { hashId } = useTextAnimateStyle(prefixCls);

  const segments = useMemo(() => resolveSegments(children, by), [children, by]);

  // 等价历史 framer-motion `staggerChildren = duration / segments.length`
  const staggerChildrenSec = useMemo(
    () => (segments.length > 0 ? duration / segments.length : 0),
    [duration, segments.length],
  );

  // 等价 framer-motion useInView({ once, amount: 0.5 })
  // - startOnView=false 时立即播放（始终视为 in view）
  // - startOnView=true 时配合 IntersectionObserver 决定是否触发动画
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInViewObserver(containerRef, 0.5, once);
  const shouldPlay = startOnView ? isInView : true;

  // 自定义 variants 与预设 animation 的解析：
  // - 自定义 variants → data-animation="custom"（CSS 退化为 fadeIn 视觉效果，
  //   见 style.ts 中 `data-animation="custom"` 选择器与文档说明）
  // - 否则使用 animation preset；animation 为 null/undefined 时 fallback 到 fadeIn
  //   （与原默认参数 animation='fadeIn' 一致）
  const itemAnimationName: AnimationVariant | 'custom' = variants
    ? 'custom'
    : animation || 'fadeIn';

  // 单项 stagger 延迟基数（秒）：
  // 历史 framer-motion 实现存在两套 stagger 系数：
  //   1) 父级 staggerChildren = duration / segments.length（影响默认入场节奏）
  //   2) item 的 custom = i * staggerTimings[by]（仅在自定义 variants 中作为参数被消费）
  // 为保留语义：
  //   - 预设 animation 路径使用 staggerChildrenSec
  //   - 自定义 variants 路径使用 staggerTimings[by]，与 framer-motion `custom` 入参对齐
  const customStaggerDelaySec = staggerTimings[by];

  // 容器 props：保留 framer-motion 时代的 className/data-testid/aria-label 行为
  const containerProps: Record<string, unknown> = {
    ref: containerRef,
    className: classNames(prefixCls, hashId, className),
    'data-testid': prefixCls,
    'data-in-view': shouldPlay ? 'true' : 'false',
    'aria-label':
      accessible && isString(children) ? (children as string) : undefined,
    ...props,
  };

  return (
    React.createElement(
      Component,
      containerProps,
      segments.map((segment, i) => {
        const itemKey = `${by}-${
          isObject(segment) ? (segment as React.ReactElement).key : segment
        }-${i}`;
        const itemDelaySec =
          delay + i * (variants ? customStaggerDelaySec : staggerChildrenSec);

        return (
          <span
            key={itemKey}
            data-animation={shouldPlay ? itemAnimationName : 'none'}
            className={classNames(
              `${prefixCls}-item`,
              `${prefixCls}-item-${by}`,
              hashId,
              segmentClassName,
            )}
            aria-hidden={accessible ? true : undefined}
            style={
              {
                animationDuration: `${duration}s`,
                '--text-animate-delay': `${itemDelaySec}s`,
              } as React.CSSProperties
            }
          >
            {segment}
          </span>
        );
      }),
    )
  );
};

// Export the memoized version
export const TextAnimate = memo(TextAnimateBase);
