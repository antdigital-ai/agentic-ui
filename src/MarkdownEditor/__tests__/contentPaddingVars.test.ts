import { describe, expect, it } from 'vitest';
import { resolveContainerContentStyle } from '../../Constants/contentPaddingVars';

describe('contentPaddingVars', () => {
  it('resolveContainerContentStyle 将 padding 转为 --agentic-ui-content-padding', () => {
    const resolved = resolveContainerContentStyle({
      padding: 0,
      height: '100%',
    });
    expect(resolved.padding).toBeUndefined();
    expect(resolved['--agentic-ui-content-padding']).toBe('0px');
    expect(resolved.height).toBe('100%');
  });
});
