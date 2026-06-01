import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import type {
  FullToken as CssUtilsFullToken,
  GenStyleFn as CssUtilsGenStyleFn,
  TokenMap,
} from '@ant-design/cssinjs-utils';
import { genStyleUtils } from '@ant-design/cssinjs-utils';
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd';
import type { AliasToken, GlobalToken } from 'antd/es/theme/interface';
import { useContext } from 'react';

export type { CSSInterpolation };

/**
 * Agentic UI 组件级 ComponentToken 映射表。
 *
 * 与 antd `ComponentTokenMap` 同形：键为组件名，值为该组件追加的 token 类型。
 * 业务组件通过 TypeScript module augmentation 扩展，例如：
 *
 * ```ts
 * declare module '@ant-design/agentic-ui/Hooks/useStyle' {
 *   interface AgenticComponentTokenMap {
 *     Bubble: { bubbleMaxWidth: string };
 *   }
 * }
 * ```
 *
 * 未声明的组件回退为空对象，保持与 antd genStyleHooks 行为一致。
 */
export interface AgenticComponentTokenMap extends TokenMap {
  // 默认开放：允许任意组件名作为键，值由各组件通过模块声明窄化。
  // 用 `any` 是为了兼容 AliasToken 内的 string/number 字段
  // （`GlobalToken = AliasToken & CompTokenMap`，索引签名若过窄会与 AliasToken 冲突）。
  [componentName: string]: any;
}

/**
 * 组件 styleFn 接收的完整 token：alias token + 组件 token + cssinjs 通用工具
 * （componentCls / prefixCls / antCls / iconCls / calc / max / min）。
 */
export type FullToken<C extends string = string> = CssUtilsFullToken<
  AgenticComponentTokenMap,
  AliasToken,
  C
>;

/**
 * 组件 styleFn 类型签名。等价于 antd 内部的 `GenStyleFn`，但绑定到 agentic-ui
 * 的 ComponentTokenMap。
 */
export type GenStyleFn<C extends string = string> = CssUtilsGenStyleFn<
  AgenticComponentTokenMap,
  AliasToken,
  C
>;

/**
 * 旧版 ChatTokenType。新代码请直接使用 `FullToken<'ComponentName'>`，
 * 此别名仅为兼容现存 style.ts 与公共导出而保留。
 */
export type ChatTokenType = FullToken & {
  themeId?: number;
  /**
   * agentic-ui 前缀 className（含点号），如 `.agentic-md-editor`
   */
  chatCls?: string;
  /**
   * antd 前缀 className（含点号），如 `.ant`
   */
  antCls: string;
  componentCls: string;
  placeholderContent?: string;
};

export type GenerateStyle<T = ChatTokenType> = (
  token: T,
) => Record<string, CSSInterpolation>;

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
 * 基于 antd cssinjs-utils 构建的 genStyleHooks 工厂。
 *
 * 与 antd 内部 `theme/util/genStyleUtils` 同源，区别仅在于：
 *   1. 使用 agentic-ui 自有的 ComponentTokenMap（可自由扩展）
 *   2. hashId 始终为空字符串，避免与宿主 antd 主题 hashId 叠加导致选择器失效
 *      —— 组件库选择器需对消费方稳定，不能随主题哈希变化
 */
const styleUtils = genStyleUtils<
  AgenticComponentTokenMap,
  AliasToken,
  GlobalToken
>({
  usePrefix: () => {
    const { getPrefixCls, iconPrefixCls } = useContext(
      AntdConfigProvider.ConfigContext,
    );
    return {
      rootPrefixCls: getPrefixCls(),
      iconPrefixCls: iconPrefixCls ?? 'anticon',
    };
  },
  useToken: () => {
    const { theme, token } = antdTheme.useToken();
    return {
      theme,
      realToken: token as GlobalToken,
      // 组件库默认关闭 hashId，避免与宿主 antd hashId 叠加。
      hashId: '',
      token: token as GlobalToken,
    };
  },
  useCSP: () => {
    const { csp } = useContext(AntdConfigProvider.ConfigContext);
    return csp ?? {};
  },
});

/**
 * 注册组件样式（含 antCls / iconCls / 计算工具），返回 `useStyle(prefixCls)`。
 *
 * 与 antd `genStyleHooks` 行为一致：
 *   - 顶层调用一次，签名 `(prefixCls, rootCls?) => [_, hashId, cssVarCls]`
 *   - styleFn 接收的 token 含 `componentCls`、`prefixCls`、`antCls` 等
 *   - 元组第 0 位为 identity 占位（保持上游类型兼容），调用方使用
 *     `const [, hashId] = useStyle(...)` 跳过它。
 *
 * @example
 * ```ts
 * import { genStyleHooks } from '../Hooks/useStyle';
 *
 * const genStyle: GenStyleFn<'Bubble'> = (token) => ({
 *   [token.componentCls]: { padding: token.padding },
 * });
 *
 * export const useStyle = genStyleHooks('Bubble', genStyle);
 * ```
 */
export const genStyleHooks: typeof styleUtils.genStyleHooks =
  styleUtils.genStyleHooks;

/**
 * 同 antd `genComponentStyleHook`：与 `genStyleHooks` 类似，但不接管 CSS Var 注册。
 * 元组第 0 位为 identity 占位（保持上游类型兼容），调用方使用
 * `const [, hashId] = useStyle(...)` 跳过它。
 */
export const genComponentStyleHook: typeof styleUtils.genComponentStyleHook =
  styleUtils.genComponentStyleHook;

/**
 * 同 antd `genSubStyleComponent`：返回一个 SubStyle 组件，用于在父组件内挂载子样式。
 */
export const genSubStyleComponent = styleUtils.genSubStyleComponent;

/**
 * 兼容旧版的 useStyle 注册器。
 *
 * 新代码请改用 `genStyleHooks`；本函数仅为已有 style.ts 调用点保留。
 * 内部直接调用 cssinjs 的 `useStyleRegister`，与 `genComponentStyleHook` 同源，
 * 因此即便不迁移调用点，样式注入路径也已统一在 antd cssinjs 之上。
 *
 * @param componentName 组件名（用作 cssinjs cache path）
 * @param styleFn 生成样式的函数，token 由调用方按需附加 `componentCls`
 */
export function useEditorStyleRegister(
  componentName: string,
  styleFn: (token: ChatTokenType) => CSSInterpolation,
) {
  const { theme, token } = antdTheme.useToken();
  const { getPrefixCls, csp } = useContext(AntdConfigProvider.ConfigContext);
  const chatToken = {
    ...(token as unknown as ChatTokenType),
    chatCls: `.${getPrefixCls('agentic-ui')}`,
    antCls: `.${getPrefixCls()}`,
  };

  // 调用 useStyleRegister 触发 cssinjs 的样式注册副作用（updateCSS 注入到
  // document.head）；返回值不使用，对外只暴露 hashId。
  useStyleRegister(
    {
      theme: theme as any,
      token: chatToken,
      hashId: '',
      path: [componentName],
      // 缺省 nonce 时透传 undefined，避免在 <style> 上 emit nonce=""
      // —— 严格 CSP 策略下空 nonce 会被解读为「无值」并被拒绝
      nonce: csp?.nonce ? () => csp.nonce! : undefined,
    },
    () => styleFn(chatToken),
  );

  return { hashId: '' };
}
