import { describe, expect, it } from 'vitest';
import {
  handleInlineMath,
  handleMath,
  shouldTreatInlineMathAsText,
} from '../parse/parseMath';

describe('parseMath 分支覆盖', () => {
  describe('shouldTreatInlineMathAsText', () => {
    it('空白视为文本', () => {
      expect(shouldTreatInlineMathAsText('')).toBe(true);
      expect(shouldTreatInlineMathAsText('   ')).toBe(true);
    });

    it('含公式符号视为公式', () => {
      expect(shouldTreatInlineMathAsText('a^2')).toBe(false);
      expect(shouldTreatInlineMathAsText('x_1')).toBe(false);
      expect(shouldTreatInlineMathAsText('\\frac{1}{2}')).toBe(false);
      expect(shouldTreatInlineMathAsText('a=b')).toBe(false);
      expect(shouldTreatInlineMathAsText('{x}')).toBe(false);
    });

    it('货币与带后缀数字视为文本', () => {
      expect(shouldTreatInlineMathAsText('1,234.56')).toBe(true);
      expect(shouldTreatInlineMathAsText('12.5k')).toBe(true);
      expect(shouldTreatInlineMathAsText('3万')).toBe(true);
      expect(shouldTreatInlineMathAsText('+42')).toBe(true);
    });

    it('普通单词不当作数字文本', () => {
      expect(shouldTreatInlineMathAsText('alpha')).toBe(false);
    });
  });

  it('handleInlineMath 包装为段落文本；非字符串 value 置空', () => {
    expect(handleInlineMath({ value: '1+1' })).toEqual({
      type: 'paragraph',
      children: [{ text: '$1+1$' }],
    });
    expect(handleInlineMath({ value: 12 })).toEqual({
      type: 'paragraph',
      children: [{ text: '$$' }],
    });
  });

  it('handleMath 生成 katex 块', () => {
    expect(handleMath({ value: 'E=mc^2' })).toMatchObject({
      type: 'katex',
      language: 'latex',
      katex: true,
      value: 'E=mc^2',
    });
  });
});
