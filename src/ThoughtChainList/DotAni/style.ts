import type { ChatTokenType, GenerateStyle } from '../../hooks/useStyle';
import { useEditorStyleRegister } from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 加载器样式
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

/**
 * DotAni 样式 Hook
 * @param prefixCls 样式前缀
 * @returns 样式对象
 */
export function useDotAniStyle(prefixCls?: string) {
  return useEditorStyleRegister('DotAni', (token) => {
    const dotAniToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(dotAniToken)];
  });
}
