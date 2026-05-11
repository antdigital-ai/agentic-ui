import { genStyleHooks, type GenStyleFn } from '@ant-design/agentic-ui/Hooks/useStyle';

const genAbstractLottieStyle: GenStyleFn<'Abstract'> = (token) => {
  return {
    [token.componentCls]: {
      'svg, svg path': {
        fill: 'currentColor',
        stroke: 'currentColor',
      },
    },
  };
};

const useGenStyle = genStyleHooks('Abstract', genAbstractLottieStyle);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'bubble-actions-lottie');
  return { wrapSSR, hashId };
}
