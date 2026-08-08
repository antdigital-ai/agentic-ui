/**
 * Schema validator deepen：validate.errors 缺省走 `|| []`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('ajv', () => {
  class AjvMock {
    compile() {
      const validate: any = () => false;
      validate.errors = null;
      return validate;
    }
  }
  return { default: AjvMock };
});

vi.mock('ajv-formats', () => ({
  default: () => undefined,
}));

import { SchemaValidator } from '../validator';

describe('Schema validator deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('errors 为 null 时映射为空数组', () => {
    const v = new SchemaValidator();
    const result = v.validate({});
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([]);
  });
});
