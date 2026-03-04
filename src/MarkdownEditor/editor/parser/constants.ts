/**
 * 占位符：保护 Jinja 块内 $ 不被 remark-math 解析为数学公式。
 * 在 markdown 解析前替换，渲染与序列化时还原为 $。
 */
export const JINJA_DOLLAR_PLACEHOLDER = '\uE01A';
