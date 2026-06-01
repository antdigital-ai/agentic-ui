import { Keyframes } from '@ant-design/cssinjs';
import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../Hooks/useStyle';

// 定义旋转动画
const pauseIconRotate = new Keyframes('pauseIconRotate', {
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

const genStyle: GenStyleFn<'SendButton'> = (token) => {
  return {
    [token.componentCls]: {
      fontSize: '32px',
      height: 32,
      display: 'flex',
      alignItems: 'center',
      lineHeight: '32px',
      cursor: 'pointer',
      marginLeft: 4,
      // 旋转动画样式
      '.pause-icon-ring': {
        transition: 'transform 0.1s ',
        transformOrigin: '16px 16px',
        animationName: pauseIconRotate,
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      },
    },
    // 使用完整 modifier 类名，避免嵌套 `&&-disabled` 与 BEM 类名拼接不一致导致 cursor 等未生效
    [`${token.componentCls}-disabled`]: {
      cursor: 'not-allowed',
      // StopIcon 等仍读语义变量：用 antd token 随亮色/暗色一致
      '--color-primary-control-fill-primary': token.colorTextQuaternary,
      '--color-gray-bg-card-white': token.colorBgContainer,
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('SendButton', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'SendButton');
  return { hashId };
}
