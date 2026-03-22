import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SchemaValidator,
  mdDataSchemaValidator,
} from '../../src/Schema/validator';

// Mock Ajv
const { mockValidate, mockCompile } = vi.hoisted(() => {
  const mockValidate = vi.fn();
  const mockCompile = vi.fn(() => mockValidate);
  return { mockValidate, mockCompile };
});

vi.mock('ajv', () => {
  return {
    default: vi.fn(function MockAjv() {
      return {
        compile: mockCompile,
      };
    }),
  };
});

// Mock ajv-formats
vi.mock('ajv-formats', () => ({
  default: vi.fn(),
}));

describe('SchemaValidator', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    vi.clearAllMocks();
    validator = new SchemaValidator();
  });

  describe('构造函数', () => {
    it('应该正确初始化SchemaValidator实例', () => {
      expect(validator).toBeInstanceOf(SchemaValidator);
    });
  });

  describe('validate方法', () => {
    it('应该能够调用validate方法', () => {
      mockValidate.mockReturnValue(true);
      mockValidate.errors = null;
      const result = validator.validate({ test: 'data' });
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
    });

    it('应在 error.message 为空时使用默认值 "未知错误" (line 36)', () => {
      mockValidate.mockReturnValue(false);
      mockValidate.errors = [
        {
          instancePath: '/test',
          message: undefined,
        },
      ];

      const result = validator.validate({ test: 'data' });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('未知错误');
      expect(result.errors[0].path).toBe('/test');
    });
  });
});

describe('mdDataSchemaValidator单例', () => {
  it('应该导出SchemaValidator的实例', () => {
    expect(mdDataSchemaValidator).toBeInstanceOf(SchemaValidator);
  });

  it('应该能够验证数据', () => {
    expect(typeof mdDataSchemaValidator.validate).toBe('function');
  });
});

describe('集成测试', () => {
  it('应该能够处理基本的验证场景', () => {
    const validator = new SchemaValidator();
    const result = validator.validate({});
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
  });
});
