import { describe, expect, it } from 'vitest';
import { resolveSendDisabled } from '../index';

describe('SendButton residual prop matrix', () => {
  it.each([
    [undefined, undefined, false],
    [undefined, 'uploading', true],
    [undefined, 'done', false],
    [{ disabled: true }, 'done', true],
    [{ disabled: false }, 'uploading', false],
  ] as const)('resolves explicit disabled and upload states', (props, status, expected) => {
    expect(resolveSendDisabled(props, status as any)).toBe(expected);
  });
});
