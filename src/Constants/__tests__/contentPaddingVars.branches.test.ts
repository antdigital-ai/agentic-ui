import { describe, expect, it } from 'vitest';
import {
  CONTENT_PADDING_CSS_VAR,
  resolveContainerContentStyle,
  toContentPaddingCssVar,
} from '../contentPaddingVars';

describe('contentPaddingVars 分支覆盖', () => {
  it('toContentPaddingCssVar 字符串 padding 原样写入 CSS 变量', () => {
    expect(toContentPaddingCssVar('12px')).toEqual({
      [CONTENT_PADDING_CSS_VAR]: '12px',
    });
  });

  it('resolveContainerContentStyle undefined 返回空对象', () => {
    expect(resolveContainerContentStyle(undefined)).toEqual({});
  });

  it('resolveContainerContentStyle 无 padding 时原样返回', () => {
    expect(resolveContainerContentStyle({ height: '100%' })).toEqual({
      height: '100%',
    });
  });
});

describe('contentPaddingVars istanbul residual：number padding', () => {
  it('toContentPaddingCssVar 数字转 px', () => {
    // typeof padding === 'number' ? `${padding}px` : padding
    expect(toContentPaddingCssVar(8)).toEqual({
      [CONTENT_PADDING_CSS_VAR]: '8px',
    });
  });
});
