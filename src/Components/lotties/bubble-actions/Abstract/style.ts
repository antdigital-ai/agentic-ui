import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '@ant-design/agentic-ui/Hooks/useStyle';

const genAbstractLottieStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      'svg, svg path': {
        fill: 'currentColor',
        stroke: 'currentColor',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('bubble-actions-lottie', (token) => {
    const abstractLottieToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genAbstractLottieStyle(abstractLottieToken)];
  });
}
