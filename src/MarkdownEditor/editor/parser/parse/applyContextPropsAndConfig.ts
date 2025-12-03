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

  if (Array.isArray(el)) {
    return (el as Element[]).map((item) => {
      const result = { ...item };
      if (hasContextProps) {
        result.contextProps = contextProps;
      }
      if (hasConfig && !item.otherProps) {
        result.otherProps = config;
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
  return result;
};
