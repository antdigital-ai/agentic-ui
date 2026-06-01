import React, { useContext, useEffect, useMemo } from 'react';

import {
  resolveFormulaConfig,
  resetGlobalFormulaConfig,
  setGlobalFormulaConfig,
  type FormulaConfig,
} from './formulaConfig';

export interface AgenticConfigType {
  formula?: FormulaConfig;
}

export const AgenticConfigContext = React.createContext<
  AgenticConfigType | undefined
>(undefined);

export const AgenticConfigProvide: React.FC<
  React.PropsWithChildren<AgenticConfigType>
> = ({ children, formula }) => {
  const value = useMemo(() => ({ formula }), [formula]);

  useEffect(() => {
    if (formula) {
      setGlobalFormulaConfig(formula);
      return () => resetGlobalFormulaConfig();
    }
    resetGlobalFormulaConfig();
    return undefined;
  }, [formula?.enable, formula?.singleDollarTextMath]);

  return (
    <AgenticConfigContext.Provider value={value}>
      {children}
    </AgenticConfigContext.Provider>
  );
};

export const useAgenticConfig = (): AgenticConfigType => {
  return useContext(AgenticConfigContext) ?? {};
};

export const useFormulaConfig = (
  override?: FormulaConfig,
): Required<FormulaConfig> => {
  const { formula: contextFormula } = useAgenticConfig();
  return resolveFormulaConfig({ ...contextFormula, ...override });
};
