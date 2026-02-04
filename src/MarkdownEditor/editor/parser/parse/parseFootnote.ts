import { debugInfo } from '../../../../Utils/debugUtils';

/**
 * 处理脚注引用
 * @param currentElement - 当前处理的脚注引用元素
 * @returns 返回格式化的脚注引用节点对象
 */
export const handleFootnoteReference = (currentElement: any) => {
  debugInfo('handleFootnoteReference - 处理脚注引用', {
    identifier: currentElement.identifier,
  });
  const result = {
    text: `${currentElement.identifier?.toUpperCase()}`,
    identifier: currentElement.identifier,
    type: 'footnoteReference',
  };
  debugInfo('handleFootnoteReference - 脚注引用处理完成', {
    type: result.type,
    text: result.text,
    identifier: result.identifier,
  });
  return result;
};
