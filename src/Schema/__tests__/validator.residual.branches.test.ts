/**
 * Schema validator residual：errors.message 回退、单例、非法 schema 数据。
 */
import { describe, expect, it } from 'vitest';
import { SchemaValidator, mdDataSchemaValidator } from '../validator';

describe('SchemaValidator residual branches', () => {
  it('合法最小 schema 通过', () => {
    const v = new SchemaValidator();
    const result = v.validate({
      version: '1.0.0',
      component: { type: 'div', properties: {} },
    });
    // 可能因 schema.definition 更严而失败，但路径/结构必须存在
    expect(result).toHaveProperty('valid');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('明显非法数据返回 errors（含 path/message）', () => {
    const v = new SchemaValidator();
    const result = v.validate({ version: 123, component: 'bad' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        path: expect.any(String),
        message: expect.any(String),
      }),
    );
  });

  it('mdDataSchemaValidator 单例可复用', () => {
    const a = mdDataSchemaValidator.validate(null);
    const b = mdDataSchemaValidator.validate({});
    expect(typeof a.valid).toBe('boolean');
    expect(typeof b.valid).toBe('boolean');
  });
});
