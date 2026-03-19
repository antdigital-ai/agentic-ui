/**
 * MarkdownRenderer 复用 MarkdownEditor 的样式体系。
 * 两者使用相同的 CSS 前缀（agentic-md-editor），确保渲染结果视觉一致。
 *
 * 额外注册间距 CSS 变量回退值，防止宿主未定义 --margin-Nx 时间距异常。
 * 使用低优先级选择器（:where），宿主定义的变量会自动覆盖。
 */
export { useStyle } from '../MarkdownEditor/style';

import { useEditorStyleRegister } from '../Hooks/useStyle';

export const useRendererVarStyle = (prefixCls: string) => {
  return useEditorStyleRegister('MarkdownRendererVars', (_token) => {
    return {
      [`:where(.${prefixCls})`]: {
        '--margin-2x': '8px',
        '--margin-4x': '16px',
        '--margin-8x': '20px',
        '--padding-2x': '8px',
        '--padding-4x': '16px',
        '--padding-5x': '20px',
      },

      // 流式文字淡入动画（opacity + translateY，GPU 硬件加速，清爽流派）
      // 仅使用 opacity 和 transform，避免 blur 带来的重绘开销
      '@keyframes markdownRendererSlideFadeIn': {
        from: { opacity: 0, transform: 'translateY(2px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
    };
  });
};
