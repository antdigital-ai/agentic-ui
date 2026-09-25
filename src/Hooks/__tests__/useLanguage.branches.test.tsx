/**
 * useLanguage：Provider 外 null context 抛错分支。
 */
import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nContext } from '../../I18n';
import { useLanguage } from '../useLanguage';

describe('useLanguage branches', () => {
  it('I18nContext 为 null 时抛错', () => {
    expect(() =>
      renderHook(() => useLanguage(), {
        wrapper: ({ children }) => (
          <I18nContext.Provider value={null as any}>
            {children}
          </I18nContext.Provider>
        ),
      }),
    ).toThrow(/outside <I18nProvide/);
  });
});
