import { afterEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_FORMULA_CONFIG,
  getRemarkMathOptions,
  isFormulaEnabled,
  resetGlobalFormulaConfig,
  resolveFormulaConfig,
  setGlobalFormulaConfig,
} from '../formulaConfig';

describe('formulaConfig', () => {
  afterEach(() => {
    resetGlobalFormulaConfig();
  });

  it('默认启用公式且禁用单美元模式', () => {
    expect(DEFAULT_FORMULA_CONFIG).toEqual({
      enable: true,
      singleDollarTextMath: false,
    });
    expect(resolveFormulaConfig()).toEqual(DEFAULT_FORMULA_CONFIG);
  });

  it('支持全局关闭公式', () => {
    setGlobalFormulaConfig({ enable: false });
    expect(isFormulaEnabled()).toBe(false);
    expect(getRemarkMathOptions()).toBeNull();
  });

  it('局部配置应覆盖全局配置', () => {
    setGlobalFormulaConfig({ enable: false });
    expect(
      resolveFormulaConfig({ enable: true, singleDollarTextMath: true }),
    ).toEqual({
      enable: true,
      singleDollarTextMath: true,
    });
  });

  it('启用公式时应返回 remark-math 选项', () => {
    expect(getRemarkMathOptions()).toEqual({ singleDollarTextMath: false });
    expect(getRemarkMathOptions({ singleDollarTextMath: true })).toEqual({
      singleDollarTextMath: true,
    });
  });
});
