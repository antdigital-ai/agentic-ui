import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'DotAni'> = (token) => {
  return {
    [`${token.componentCls}`]: {
      width: '20px',
      display: 'inline-flex',
      aspectRatio: 2,
      marginLeft: '8px',
      '--_g':
        'no-repeat radial-gradient(circle closest-side, rgb(102, 111, 141) 90%, #0000)',
      background: [
        'var(--_g) 0% 50%',
        'var(--_g) 50% 50%',
        'var(--_g) 100% 50%',
      ].join(', '),
      backgroundSize: 'calc(100% / 3) 50%',
      animationName: 'l3',
      animationDuration: '1s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    },
  };
};

const useGenStyle = genStyleHooks('DotAni', genStyle);

/**
 * DotAni 样式 Hook
 * @param prefixCls 样式前缀
 * @returns 样式对象
 */
export function useDotAniStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'DotAni');
  return { hashId };
}
