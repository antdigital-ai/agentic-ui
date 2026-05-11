import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

/**
 * TextAnimate 的 10 种 animation preset 等价 CSS 定义。
 *
 * 历史 framer-motion 实现使用 variants={hidden, show, exit} 描述每个 preset 的
 * 起止状态；此处将每个 preset 转换为对应的 @keyframes，行为与原 motion variants
 * 完全等价：
 *   - fadeIn:    opacity:0, y:20 → opacity:1, y:0
 *   - blurIn:    opacity:0, blur(10px) → opacity:1, blur(0)
 *   - blurInUp:  opacity:0, blur(10px), y:20 → opacity:1, blur(0), y:0
 *   - blurInDown:opacity:0, blur(10px), y:-20 → opacity:1, blur(0), y:0
 *   - slideUp:   opacity:0, y:20 → opacity:1, y:0
 *   - slideDown: opacity:0, y:-20 → opacity:1, y:0
 *   - slideLeft: opacity:0, x:20 → opacity:1, x:0
 *   - slideRight:opacity:0, x:-20 → opacity:1, x:0
 *   - scaleUp:   opacity:0, scale(0.5) → opacity:1, scale(1)（原为 spring，
 *                此处用 cubic-bezier 近似 spring 的过冲感）
 *   - scaleDown: opacity:0, scale(1.5) → opacity:1, scale(1)（同上 spring 近似）
 *
 * stagger 通过每个 segment 的 inline `--text-animate-delay` 实现，
 * 等价于 framer-motion 父级 `staggerChildren` 配置。
 */
const itemKeyframes = {
  '@keyframes agentic-text-animate-fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes agentic-text-animate-blurIn': {
    from: { opacity: 0, filter: 'blur(10px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
  },
  '@keyframes agentic-text-animate-blurInUp': {
    from: {
      opacity: 0,
      filter: 'blur(10px)',
      transform: 'translateY(20px)',
    },
    to: { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
  },
  '@keyframes agentic-text-animate-blurInDown': {
    from: {
      opacity: 0,
      filter: 'blur(10px)',
      transform: 'translateY(-20px)',
    },
    to: { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
  },
  '@keyframes agentic-text-animate-slideUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes agentic-text-animate-slideDown': {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes agentic-text-animate-slideLeft': {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  '@keyframes agentic-text-animate-slideRight': {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  '@keyframes agentic-text-animate-scaleUp': {
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  '@keyframes agentic-text-animate-scaleDown': {
    from: { opacity: 0, transform: 'scale(1.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
};

const genStyle: GenStyleFn<'TextAnimate'> = (token) => {
  return {
    ...itemKeyframes,
    [token.componentCls]: {
      whiteSpace: 'pre-wrap',

      ['&-item']: {
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        // 单项动画基础属性，具体 keyframes 由 data-animation 切换
        animationDuration: '0.3s',
        animationFillMode: 'both',
        animationDelay: 'var(--text-animate-delay, 0s)',
        // 默认 cubic-bezier；scaleUp/scaleDown 等 spring preset 用近似过冲曲线覆盖
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // 各 preset 通过 data-animation 属性选择对应 keyframes
      ['&-item[data-animation="fadeIn"]']: {
        animationName: 'agentic-text-animate-fadeIn',
      },
      ['&-item[data-animation="blurIn"]']: {
        animationName: 'agentic-text-animate-blurIn',
      },
      ['&-item[data-animation="blurInUp"]']: {
        animationName: 'agentic-text-animate-blurInUp',
      },
      ['&-item[data-animation="blurInDown"]']: {
        animationName: 'agentic-text-animate-blurInDown',
      },
      ['&-item[data-animation="slideUp"]']: {
        animationName: 'agentic-text-animate-slideUp',
      },
      ['&-item[data-animation="slideDown"]']: {
        animationName: 'agentic-text-animate-slideDown',
      },
      ['&-item[data-animation="slideLeft"]']: {
        animationName: 'agentic-text-animate-slideLeft',
      },
      ['&-item[data-animation="slideRight"]']: {
        animationName: 'agentic-text-animate-slideRight',
      },
      ['&-item[data-animation="scaleUp"]']: {
        animationName: 'agentic-text-animate-scaleUp',
        // 近似原 spring(damping:15, stiffness:300) 的弹性过冲
        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      ['&-item[data-animation="scaleDown"]']: {
        animationName: 'agentic-text-animate-scaleDown',
        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // 自定义 variants 模式（用户传 variants prop）：使用 fadeIn 作为兜底视觉效果，
      // 因为 framer-motion 的 variants 是 JS 对象描述，无法在不引入 JS 库的情况下
      // 完全转换为任意 CSS。文档里会提示自定义 variants 仅产生 fade-in 效果。
      ['&-item[data-animation="custom"]']: {
        animationName: 'agentic-text-animate-fadeIn',
      },

      ['&-item-character']: {
        whiteSpace: 'pre-wrap',
      },

      ['&-item-line']: {
        display: 'block',
        whiteSpace: 'normal',
      },

      // 容器 startOnView=false 时立即播放；startOnView=true 时配合 IntersectionObserver
      // 切换 data-in-view，未在视口时子项保持初始状态（animation-play-state: paused）
      ['&[data-in-view="false"]']: {
        ['& &-item']: {
          animationPlayState: 'paused',
          opacity: 0,
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('TextAnimate', genStyle);

export const useTextAnimateStyle = (prefixCls: string) => {
  const [wrapSSR, hashId] = useGenStyle(prefixCls);
  return { wrapSSR, hashId };
};
