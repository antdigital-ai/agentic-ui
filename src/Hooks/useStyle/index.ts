import type { CSSInterpolation } from '@ant-design/cssinjs';
import { ComponentToken, createStyleRegister } from '@ant-design/theme-token';
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd';
import { useContext } from 'react';

export { CSSInterpolation };

export type GenerateStyle<T = ComponentToken> = (
  token: T,
) => Record<string, CSSInterpolation>;

export type ChatTokenType = ComponentToken & {
  themeId?: number;
  /**
   * prochat 的 className
   * @type {string}
   * @example .ant-pro
   */
  chatCls?: string;
  /**
   * antd 的 className
   * @type {string}
   * @example .ant
   */
  antCls?: string;
  /**
   * 组件的 className
   */
  componentCls: string;

  placeholderContent?: string;
};

export const resetComponent: GenerateStyle<ChatTokenType> = (
  token: ChatTokenType,
) => ({
  [`${token.componentCls}`]: {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    color: token.colorText,
    fontSize: '1em',
    lineHeight: token.lineHeight,
    listStyle: 'none',
    'svg.sofa-icons-icon > g': {
      clipPath: 'none!important',
    },
  },
});
/**
 * 封装了一下 antd 的 useStyle，支持了一下antd@4
 * @param componentName {string} 组件的名字
 * @param styleFn {GenerateStyle} 生成样式的函数
 * @returns UseStyleResult
 */
export function useEditorStyleRegister(
  componentName: string,
  styleFn: (token: ComponentToken) => CSSInterpolation,
) {
  // 直接调用 useToken；用可选链 `antdTheme?.useToken?.()` 会让该 render 跳过 hook 调用，
  // 下次它存在时又调用，造成 hook 调用顺序变化，违反 Rules of Hooks。
  // peerDependencies 已约束 antd>=5，useToken 必然存在。
  const { token, theme } = antdTheme.useToken();
  const chatToken = {
    ...token,
    chatCls: '',
    antCls: '',
  };
  const { getPrefixCls } = useContext(AntdConfigProvider.ConfigContext);

  chatToken.chatCls = `.${getPrefixCls('agentic-ui')}`;
  chatToken.antCls = `.${getPrefixCls()}`;

  // 组件库默认关闭 hashId，避免与宿主页面的 antd hashId 叠加导致选择器不生效；传入 '' 后 createStyleRegister 与返回的 hashId 均为空
  const genStyles = createStyleRegister({
    hashId: '',
    token: chatToken,
    theme: theme,
    cssVariables: {},
  });

  const result = genStyles(componentName, styleFn);

  // 确保总是返回一个有效的对象，且 hashId 保持关闭
  // fallback 分支触发场景：createStyleRegister 返回 falsy（如 token 缺失、theme 上下文异常等），
  // 此时透传 node 不注入样式 —— dev 模式下打 warn 便于定位，prod 不打扰
  if (!result) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[useEditorStyleRegister] genStyles returned falsy for "${componentName}" — styles will not be injected. Check antd ConfigProvider / theme context.`,
      );
    }
    return {
      wrapSSR: (node: React.ReactElement) => node,
      hashId: '',
    };
  }
  return { ...result, hashId: '' };
}
