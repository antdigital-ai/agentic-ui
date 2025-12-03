// 常量定义
const EMPTY_LINE_DISTANCE_THRESHOLD = 4; // 两个元素之间的行距阈值
const EMPTY_LINE_CALCULATION_OFFSET = 2; // 计算空行数量时的偏移量
const EMPTY_LINE_DIVISOR = 2; // 计算空行数量的除数

/**
 * 根据行间距添加空行元素（纯函数版本）
 * @param els - 目标元素数组
 * @param preNode - 前一个节点
 * @param currentElement - 当前处理的元素
 * @param top - 是否为顶级解析
 * @returns 返回添加了空行元素的新数组
 */
export const addEmptyLinesIfNeeded = (
  els: any[],
  preNode: any,
  currentElement: any,
  top: boolean,
): any[] => {
  if (!preNode || !top) {
    return els;
  }

  const distance =
    (currentElement.position?.start.line || 0) -
    (preNode.position?.end.line || 0);

  if (distance < EMPTY_LINE_DISTANCE_THRESHOLD) {
    return els;
  }

  const lines = Math.floor(
    (distance - EMPTY_LINE_CALCULATION_OFFSET) / EMPTY_LINE_DIVISOR,
  );

  const emptyLines = Array.from({ length: lines }, () => ({
    type: 'paragraph',
    children: [{ text: '' }],
  }));

  return [...els, ...emptyLines];
};
