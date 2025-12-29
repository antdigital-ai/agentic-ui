import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SchemaValidator,
  mdDataSchemaValidator,
} from '../@ant-design/agentic-ui/Schema/validator';

// Mock Ajv
vi.mock('ajv', () => {
  const mockValidate = vi.fn();
  const mockCompile = vi.fn(() => mockValidate);

  return {
    default: vi.fn().mockImplementation(() => ({
      compile: mockCompile,
    })),
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
      const result = validator.validate({ test: 'data' });
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
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
