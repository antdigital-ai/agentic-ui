import raf from 'rc-util/lib/raf';

import { easeInOutCubic } from './easings';
import getScroll, { isWindow } from './getScroll';

interface ScrollToOptions {
  /** Scroll container, default as window */
  container?: HTMLElement | Document | Window;
  /** Scroll end callback */
  callback?: () => void;
  /** Animation duration, default as 450 */
  duration?: number;
}

export default function scrollTo(y: number, options: ScrollToOptions = {}) {
  const {
    container = typeof window !== 'undefined' ? window : undefined,
    callback,
    duration = 450,
  } = options;

  // Early return if running in Node.js environment without proper DOM setup
  if (typeof window === 'undefined') {
    callback?.();
    return;
  }

  // Early return if container is undefined
  if (!container) {
    callback?.();
    return;
  }

  const scrollTop = getScroll(container);
  const startTime = Date.now();

  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScrollTop = easeInOutCubic(
      time > duration ? duration : time,
      scrollTop,
      y,
      duration,
    );
    if (isWindow(container)) {
      (container as Window).scrollTo(window.pageXOffset, nextScrollTop);
    } else if (
      container instanceof Document ||
      container.constructor.name === 'HTMLDocument'
    ) {
      (container as Document).documentElement.scrollTop = nextScrollTop;
    } else {
      (container as HTMLElement).scrollTop = nextScrollTop;
    }
    if (time < duration) {
      raf(frameFunc);
    } else {
      callback?.();
    }
  };
  raf(frameFunc);
}
