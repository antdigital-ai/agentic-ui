import type React from 'react';
import type { BubbleProps } from '../type';

export const runRender = (
  render: unknown,
  props: BubbleProps,
  defaultDom: React.ReactNode,
  ...rest: undefined[]
): React.ReactNode => {
  if (render === false) return null;
  if (typeof render === 'function') return render(props, defaultDom, ...rest);
  return defaultDom;
};
