/**
 * 处理脚注引用
 * @param currentElement - 当前处理的脚注引用元素
 * @returns 返回格式化的脚注引用节点对象
 */
export const handleFootnoteReference = (currentElement: any) => {
  return {
    text: `${currentElement.identifier?.toUpperCase()}`,
    identifier: currentElement.identifier,
    type: 'footnoteReference',
  };
};
