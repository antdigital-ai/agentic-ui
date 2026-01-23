import { Element } from 'slate';

/**
 * 应用上下文属性和配置到元素（纯函数版本）
 * @param el - 目标元素或元素数组
 * @param contextProps - 上下文属性对象
 * @param config - 配置对象
 * @returns 返回应用了属性和配置的新元素
 */
export const applyContextPropsAndConfig = (
  el: any,
  contextProps: any,
  config: any,
) => {
  const hasContextProps = Object.keys(contextProps || {}).length > 0;
  const hasConfig = Object.keys(config || {}).length > 0;

  const resolveAlign = (item: any, res: any) =>
    config?.align ??
    res.otherProps?.align ??
    item.otherProps?.align ??
    item.align;

  if (Array.isArray(el)) {
    return (el as Element[]).map((item) => {
      const result = { ...item };
      if (hasContextProps) {
        result.contextProps = contextProps;
      }
      if (hasConfig && !item.otherProps) {
        result.otherProps = config;
      }
      const alignVal = resolveAlign(item, result);
      if (
        alignVal &&
        (result.type === 'paragraph' || result.type === 'head')
      ) {
        result.align = alignVal;
      }
      return result;
    }) as Element[];
  }

  const result = { ...el };
  if (hasContextProps) {
    result.contextProps = contextProps;
  }
  if (hasConfig && !el.otherProps) {
    result.otherProps = config;
  }
  const alignVal = resolveAlign(el, result);
  if (
    alignVal &&
    (result.type === 'paragraph' || result.type === 'head')
  ) {
    result.align = alignVal;
  }
  return result;
};
