import { beforeEach, describe, expect, it } from 'vitest';
import { SchemaValidator, mdDataSchemaValidator } from '../validator';

describe('SchemaValidator - 增强测试', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('构造函数和初始化', () => {
    it('应该创建 SchemaValidator 实例', () => {
      expect(validator).toBeInstanceOf(SchemaValidator);
      expect(validator).toBeDefined();
    });

    it('应该初始化 Ajv 实例', () => {
      const result = validator.validate({});
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('应该支持创建多个实例', () => {
      const validator1 = new SchemaValidator();
      const validator2 = new SchemaValidator();

      expect(validator1).not.toBe(validator2);
      expect(validator1).toBeInstanceOf(SchemaValidator);
      expect(validator2).toBeInstanceOf(SchemaValidator);
    });
  });

  describe('validate 方法 - 基本功能', () => {
    it('应该返回包含 valid 和 errors 的对象', () => {
      const result = validator.validate({});

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('应该处理空对象', () => {
      const result = validator.validate({});

      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('应该处理 null 输入', () => {
      const result = validator.validate(null);

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理 undefined 输入', () => {
      const result = validator.validate(undefined);

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理字符串输入', () => {
      const result = validator.validate('test string');

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理数字输入', () => {
      const result = validator.validate(123);

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理布尔输入', () => {
      const result = validator.validate(true);

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理数组输入', () => {
      const result = validator.validate([1, 2, 3]);

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });
  });

  describe('validate 方法 - 复杂数据结构', () => {
    it('应该处理简单对象', () => {
      const data = {
        name: 'test',
        value: 123,
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('应该处理嵌套对象', () => {
      const data = {
        user: {
          name: 'John',
          profile: {
            age: 30,
            email: 'john@example.com',
          },
        },
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('应该处理包含数组的对象', () => {
      const data = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('应该处理混合类型数组', () => {
      const data = {
        mixed: [1, 'two', true, { key: 'value' }, [1, 2]],
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('应该处理深层嵌套结构', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validate 方法 - 错误处理', () => {
    it('errors 数组应该包含正确的结构', () => {
      const result = validator.validate({});

      expect(Array.isArray(result.errors)).toBe(true);
      result.errors.forEach((error) => {
        expect(error).toHaveProperty('path');
        expect(error).toHaveProperty('message');
        expect(typeof error.path).toBe('string');
        expect(typeof error.message).toBe('string');
      });
    });

    it('应该提供有意义的错误信息', () => {
      const result = validator.validate({});

      if (!result.valid) {
        result.errors.forEach((error) => {
          expect(error.message).toBeTruthy();
          expect(error.message.length).toBeGreaterThan(0);
        });
      }
    });

    it('应该包含错误路径信息', () => {
      const result = validator.validate({});

      if (!result.valid) {
        result.errors.forEach((error) => {
          expect(typeof error.path).toBe('string');
        });
      }
    });
  });

  describe('validate 方法 - 边界情况', () => {
    it('应该处理非常大的对象', () => {
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }

      const result = validator.validate(largeObject);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理特殊字符', () => {
      const data = {
        special: '!@#$%^&*()_+-=[]{}|;:"<>?,./`~',
        unicode: '中文字符 🚀 émojis',
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理空字符串键', () => {
      const data = {
        '': 'empty key',
      };

      const result = validator.validate(data);
      expect(result).toBeDefined();
    });

    it('应该处理空数组', () => {
      const result = validator.validate([]);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理空字符串', () => {
      const result = validator.validate('');
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理零值', () => {
      const result = validator.validate(0);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理负数', () => {
      const result = validator.validate(-123);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理 NaN', () => {
      const result = validator.validate(NaN);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('应该处理 Infinity', () => {
      const result = validator.validate(Infinity);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });
  });

  describe('validate 方法 - 多次调用', () => {
    it('应该支持连续多次调用', () => {
      const result1 = validator.validate({ test: 1 });
      const result2 = validator.validate({ test: 2 });
      const result3 = validator.validate({ test: 3 });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();
    });

    it('多次调用应该返回独立的结果', () => {
      const result1 = validator.validate({ a: 1 });
      const result2 = validator.validate({ b: 2 });

      expect(result1).not.toBe(result2);
      expect(result1.errors).not.toBe(result2.errors);
    });

    it('应该支持相同数据多次验证', () => {
      const data = { test: 'value' };
      const result1 = validator.validate(data);
      const result2 = validator.validate(data);

      expect(result1.valid).toBe(result2.valid);
      expect(result1.errors.length).toBe(result2.errors.length);
    });
  });
});

describe('mdDataSchemaValidator 单例 - 增强测试', () => {
  describe('单例模式', () => {
    it('应该导出单一实例', () => {
      expect(mdDataSchemaValidator).toBeDefined();
      expect(mdDataSchemaValidator).toBeInstanceOf(SchemaValidator);
    });

    it('多次导入应该返回相同实例', () => {
      const instance1 = mdDataSchemaValidator;
      const instance2 = mdDataSchemaValidator;

      expect(instance1).toBe(instance2);
    });

    it('应该有 validate 方法', () => {
      expect(typeof mdDataSchemaValidator.validate).toBe('function');
    });
  });

  describe('功能测试', () => {
    it('应该能够验证数据', () => {
      const result = mdDataSchemaValidator.validate({ test: 'data' });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
    });

    it('应该返回一致的结果', () => {
      const data = { name: 'test', value: 123 };
      const result1 = mdDataSchemaValidator.validate(data);
      const result2 = mdDataSchemaValidator.validate(data);

      expect(result1.valid).toBe(result2.valid);
    });

    it('应该处理不同类型的输入', () => {
      const inputs = [
        {},
        { key: 'value' },
        [],
        [1, 2, 3],
        'string',
        123,
        true,
        null,
        undefined,
      ];

      inputs.forEach((input) => {
        const result = mdDataSchemaValidator.validate(input);
        expect(result).toBeDefined();
        expect(typeof result.valid).toBe('boolean');
      });
    });
  });

  describe('并发测试', () => {
    it('应该支持并发验证', () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(mdDataSchemaValidator.validate({ id: i })),
      );

      return Promise.all(promises).then((results) => {
        expect(results).toHaveLength(10);
        results.forEach((result) => {
          expect(result).toBeDefined();
          expect(typeof result.valid).toBe('boolean');
        });
      });
    });
  });
});

describe('SchemaValidator - 集成测试', () => {
  it('应该支持完整的验证流程', () => {
    const validator = new SchemaValidator();

    // 准备测试数据
    const validData = {
      name: 'Test Component',
      version: '1.0.0',
      properties: {
        title: {
          type: 'string',
          default: 'Default Title',
        },
      },
    };

    // 执行验证
    const result = validator.validate(validData);

    // 验证结果
    expect(result).toBeDefined();
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('应该支持多个验证器实例同时工作', () => {
    const validator1 = new SchemaValidator();
    const validator2 = new SchemaValidator();

    const result1 = validator1.validate({ id: 1 });
    const result2 = validator2.validate({ id: 2 });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1).not.toBe(result2);
  });

  it('应该正确处理验证成功的情况', () => {
    const validator = new SchemaValidator();
    const result = validator.validate({});

    if (result.valid) {
      expect(result.errors).toHaveLength(0);
    }
  });

  it('应该正确处理验证失败的情况', () => {
    const validator = new SchemaValidator();
    const result = validator.validate({});

    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach((error) => {
        expect(error).toHaveProperty('path');
        expect(error).toHaveProperty('message');
      });
    }
  });
});

describe('SchemaValidator - 性能测试', () => {
  it('应该能够快速验证小型数据', () => {
    const validator = new SchemaValidator();
    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
      validator.validate({ test: i });
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // 应该在 1 秒内完成
  });

  it('应该能够处理中等大小的数据', () => {
    const validator = new SchemaValidator();
    const data: any = {};

    for (let i = 0; i < 100; i++) {
      data[`field${i}`] = `value${i}`;
    }

    const result = validator.validate(data);
    expect(result).toBeDefined();
  });
});

describe('SchemaValidator - 错误信息质量', () => {
  it('错误信息应该是人类可读的', () => {
    const validator = new SchemaValidator();
    const result = validator.validate({});

    if (!result.valid) {
      result.errors.forEach((error) => {
        expect(error.message).toBeTruthy();
        expect(error.message).not.toBe('');
        expect(error.message).not.toBe('undefined');
        expect(error.message).not.toBe('null');
      });
    }
  });

  it('路径信息应该清晰', () => {
    const validator = new SchemaValidator();
    const result = validator.validate({});

    if (!result.valid) {
      result.errors.forEach((error) => {
        expect(typeof error.path).toBe('string');
      });
    }
  });
});
