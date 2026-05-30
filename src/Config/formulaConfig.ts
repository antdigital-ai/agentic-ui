export interface FormulaConfig {
  /** 是否启用公式解析与 KaTeX 渲染，默认 true */
  enable?: boolean;
  /** 是否允许 remark-math 识别 `$...$`（仍仅保留为普通文本，不渲染 inline-katex）；公式请使用 `$$...$$` */
  singleDollarTextMath?: boolean;
}

export type ResolvedFormulaConfig = Required<FormulaConfig>;

export const DEFAULT_FORMULA_CONFIG: ResolvedFormulaConfig = {
  enable: true,
  singleDollarTextMath: false,
};

let globalFormulaConfig: FormulaConfig = {};

export const setGlobalFormulaConfig = (config: FormulaConfig): void => {
  globalFormulaConfig = config;
};

export const resetGlobalFormulaConfig = (): void => {
  globalFormulaConfig = {};
};

export const resolveFormulaConfig = (
  override?: FormulaConfig,
): ResolvedFormulaConfig => ({
  ...DEFAULT_FORMULA_CONFIG,
  ...globalFormulaConfig,
  ...override,
});

export const getRemarkMathOptions = (
  config?: FormulaConfig,
): { singleDollarTextMath: boolean } | null => {
  const resolved = resolveFormulaConfig(config);
  if (!resolved.enable) {
    return null;
  }
  return { singleDollarTextMath: resolved.singleDollarTextMath };
};

export const isFormulaEnabled = (config?: FormulaConfig): boolean =>
  resolveFormulaConfig(config).enable;
