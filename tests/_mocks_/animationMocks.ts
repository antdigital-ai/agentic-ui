import React from 'react';
import { vi } from 'vitest';

// 简单的 Framer Motion Mock - 避免JSX语法问题
export const framerMotionMock: Record<string, any> = {
  motion: {
    div: vi.fn().mockImplementation(({ children, ...props }: any) => {
      return React.createElement('div', props, children);
    }),
    span: vi.fn().mockImplementation(({ children, ...props }: any) => {
      return React.createElement('span', props, children);
    }),
    button: vi.fn().mockImplementation(({ children, ...props }: any) => {
      return React.createElement(
        'button',
        { type: 'button', ...props },
        children,
      );
    }),
    img: vi.fn().mockImplementation(({ ...props }: any) => {
      return React.createElement('img', props);
    }),
    svg: vi.fn().mockImplementation(({ children, ...props }: any) => {
      return React.createElement('svg', props, children);
    }),
    path: vi.fn().mockImplementation(({ ...props }: any) => {
      return React.createElement('path', props);
    }),
    circle: vi.fn().mockImplementation(({ ...props }: any) => {
      return React.createElement('circle', props);
    }),
    rect: vi.fn().mockImplementation(({ ...props }: any) => {
      return React.createElement('rect', props);
    }),
    g: vi.fn().mockImplementation(({ children, ...props }: any) => {
      return React.createElement('g', props, children);
    }),
  },
  AnimatePresence: vi.fn().mockImplementation(({ children }: any) => children),
  useMotionValue: vi.fn().mockReturnValue({ get: vi.fn(), set: vi.fn() }),
  useTransform: vi.fn().mockReturnValue({ get: vi.fn(), set: vi.fn() }),
  useSpring: vi.fn().mockReturnValue({ get: vi.fn(), set: vi.fn() }),
  useMotionValueEvent: vi.fn(),
  LazyMotion: vi.fn().mockImplementation(({ children }: any) => children),
  domAnimation: {},
  domMax: {},
  // 添加更多framer-motion的hooks和组件
  useAnimation: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useCycle: vi.fn().mockReturnValue([vi.fn(), vi.fn()]),
  useReducedMotion: vi.fn().mockReturnValue(false),
  useInView: vi.fn().mockReturnValue([vi.fn(), false]),
  useScroll: vi.fn().mockReturnValue({
    scrollX: { get: vi.fn(), set: vi.fn() },
    scrollY: { get: vi.fn(), set: vi.fn() },
    scrollXProgress: { get: vi.fn(), set: vi.fn() },
    scrollYProgress: { get: vi.fn(), set: vi.fn() },
  }),
  usePresence: vi.fn().mockReturnValue([false, vi.fn()]),
  useDragControls: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
  }),
  usePanGesture: vi.fn().mockReturnValue({
    pan: vi.fn(),
    panStart: vi.fn(),
    panEnd: vi.fn(),
  }),
  useTapGesture: vi.fn().mockReturnValue({
    tap: vi.fn(),
    tapStart: vi.fn(),
    tapEnd: vi.fn(),
  }),
  useHoverGesture: vi.fn().mockReturnValue({
    hover: vi.fn(),
    hoverStart: vi.fn(),
    hoverEnd: vi.fn(),
  }),
  useFocusGesture: vi.fn().mockReturnValue({
    focus: vi.fn(),
    focusStart: vi.fn(),
    focusEnd: vi.fn(),
  }),
  useGesture: vi.fn().mockReturnValue({
    bind: vi.fn(),
  }),
  Reorder: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
  ReorderGroup: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
  ReorderItem: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
  LayoutGroup: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
  LayoutId: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
  Layout: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
  LayoutRoot: vi.fn().mockImplementation(({ children, ...props }: any) => {
    return React.createElement('div', props, children);
  }),
};

// 设置动画相关的全局mock
export const setupAnimationMocks = () => {
  // 禁用CSS动画和过渡
  Object.defineProperty(document.body.style, 'animation', {
    value: 'none',
    writable: true,
  });

  Object.defineProperty(document.body.style, 'transition', {
    value: 'none',
    writable: true,
  });

  // Mock requestAnimationFrame 以加速测试
  global.requestAnimationFrame = vi.fn((callback) => {
    setTimeout(callback, 0);
    return 1;
  });

  global.cancelAnimationFrame = vi.fn();

  // Mock performance.now 以提供一致的时间
  global.performance = {
    ...global.performance,
    now: vi.fn().mockReturnValue(0),
  };
};
