import { InlineKatexNode } from '../../../el';

// 常量定义
const INLINE_MATH_SUFFIX_PATTERN = '(?:%|[kKmMbB]|千|万|亿|兆|万亿|百万|亿万)?';
const INLINE_MATH_CURRENCY_PATTERN = new RegExp(
  `^[+-]?\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?${INLINE_MATH_SUFFIX_PATTERN}$`,
);
const INLINE_MATH_SIMPLE_NUMBER_PATTERN = new RegExp(
  `^[+-]?\\d+(?:\\.\\d+)?${INLINE_MATH_SUFFIX_PATTERN}$`,
);

/**
 * 判断是否应该将内联数学公式作为文本处理
 */
export const shouldTreatInlineMathAsText = (rawValue: string): boolean => {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return true;
  }
  if (/[=^_\\{}]/.test(trimmedValue)) {
    return false;
  }
  return (
    INLINE_MATH_CURRENCY_PATTERN.test(trimmedValue) ||
    INLINE_MATH_SIMPLE_NUMBER_PATTERN.test(trimmedValue)
  );
};

/**
 * 处理内联数学公式
 * @param currentElement - 当前处理的内联数学公式元素
 * @returns 返回格式化的内联KaTeX节点对象
 */
export const handleInlineMath = (currentElement: any) => {
  const inlineMathValue =
    typeof currentElement?.value === 'string' ? currentElement.value : '';
  if (shouldTreatInlineMathAsText(inlineMathValue)) {
    return {
      type: 'paragraph',
      children: [{ text: `$${inlineMathValue}$` }],
    } as any;
  }
  return {
    type: 'inline-katex',
    children: [{ text: inlineMathValue }],
  } as InlineKatexNode;
};

/**
 * 处理数学公式块
 * @param currentElement - 当前处理的数学公式块元素
 * @returns 返回格式化的KaTeX块节点对象
 */
export const handleMath = (currentElement: any) => {
  return {
    type: 'katex',
    language: 'latex',
    katex: true,
    value: currentElement.value,
    children: [{ text: '' }],
  };
};
