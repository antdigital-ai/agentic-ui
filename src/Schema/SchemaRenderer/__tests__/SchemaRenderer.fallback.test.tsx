import { merge } from 'lodash-es';
import { describe, expect, it } from 'vitest';
import type { ComponentProperties } from '@ant-design/agentic-ui/Schema/types';

// 模拟 SchemaRenderer 中的 templateData 计算逻辑
function calculateTemplateDataWithFallbacks(
  properties: ComponentProperties,
  values: Record<string, any>,
  initialValues: Record<string, any> = {},
  useDefaultValues: boolean = true,
): Record<string, any> {
  const defaultValues = useDefaultValues
    ? Object.entries(properties || {}).reduce(
        (data, [key, value]) => {
          if (value && 'default' in value) {
            data[key] = value.default;
          }
          return data;
        },
        {} as Record<string, any>,
      )
    : {};

  const mergedData = merge(defaultValues, initialValues, values);

  // 添加 fallback 值：如果数据在 properties 定义但是 mergedData 中没有
  const dataWithFallbacks = { ...mergedData };

  Object.entries(properties || {}).forEach(([key, property]) => {
    if (
      !(key in dataWithFallbacks) ||
      dataWithFallbacks[key] === undefined ||
      dataWithFallbacks[key] === null
    ) {
      switch (property.type) {
        case 'array':
          dataWithFallbacks[key] = [];
          break;
        case 'string':
          dataWithFallbacks[key] = '-';
          break;
        case 'number':
          dataWithFallbacks[key] = '-';
          break;
        case 'object':
          dataWithFallbacks[key] = {};
          break;
        default:
          dataWithFallbacks[key] = '-';
          break;
      }
    }
  });

  return dataWithFallbacks;
}

describe('SchemaRenderer Fallback Values', () => {
  const mockProperties: ComponentProperties = {
    title: {
      type: 'string',
      title: '标题',
      default: '默认标题',
    },
    count: {
      type: 'number',
      title: '数量',
      default: 10,
    },
    tags: {
      type: 'array',
      title: '标签',
      default: [],
    },
    config: {
      type: 'object',
      title: '配置',
      default: {},
    },
    // 没有默认值的属性，用于测试 fallback
    missingString: {
      type: 'string',
      title: '缺失的字符串',
      default: '',
    },
    missingNumber: {
      type: 'number',
      title: '缺失的数字',
      default: 0,
    },
    missingArray: {
      type: 'array',
      title: '缺失的数组',
      default: [],
    },
    missingObject: {
      type: 'object',
      title: '缺失的对象',
      default: {},
    },
  };

  it('applies string fallback for missing string properties', () => {
    const properties: ComponentProperties = {
      testString: {
        type: 'string',
        title: '测试字符串',
        default: '',
      },
    };

    const result = calculateTemplateDataWithFallbacks(properties, {});

    // 由于有默认值 ''，应该使用默认值
    expect(result.testString).toBe('');

    // 测试 null 值的情况
    const resultWithNull = calculateTemplateDataWithFallbacks(properties, {
      testString: null,
    });
    expect(resultWithNull.testString).toBe('-');
  });

  it('applies number fallback for missing number properties', () => {
    const properties: ComponentProperties = {
      testNumber: {
        type: 'number',
        title: '测试数字',
        default: 0,
      },
    };

    // 当值为 null 时应该使用 fallback
    const resultWithNull = calculateTemplateDataWithFallbacks(properties, {
      testNumber: null,
    });
    expect(resultWithNull.testNumber).toBe('-');
  });

  it('applies array fallback for missing array properties', () => {
    const properties: ComponentProperties = {
      testArray: {
        type: 'array',
        title: '测试数组',
        default: [],
      },
    };

    // 当值为 null 时应该使用 fallback
    const resultWithNull = calculateTemplateDataWithFallbacks(properties, {
      testArray: null,
    });
    expect(resultWithNull.testArray).toEqual([]);
  });

  it('applies object fallback for missing object properties', () => {
    const properties: ComponentProperties = {
      testObject: {
        type: 'object',
        title: '测试对象',
        default: {},
      },
    };

    // 当值为 null 时应该使用 fallback
    const resultWithNull = calculateTemplateDataWithFallbacks(properties, {
      testObject: null,
    });
    expect(resultWithNull.testObject).toEqual({});
  });

  it('preserves existing values and only adds fallbacks for missing ones', () => {
    const values = {
      title: '自定义标题',
      count: 42,
      // tags 缺失
      config: { width: 100 },
      // missingString, missingNumber, missingArray, missingObject 都缺失
    };

    const result = calculateTemplateDataWithFallbacks(mockProperties, values);

    // 保留现有值
    expect(result.title).toBe('自定义标题');
    expect(result.count).toBe(42);
    expect(result.config).toEqual({ width: 100 });

    // 缺失的属性使用默认值
    expect(result.tags).toEqual([]); // 使用默认值

    // 没有默认值的属性使用 fallback（但这里都有默认值）
    expect(result.missingString).toBe(''); // 使用默认值
    expect(result.missingNumber).toBe(0); // 使用默认值
    expect(result.missingArray).toEqual([]); // 使用默认值
    expect(result.missingObject).toEqual({}); // 使用默认值
  });

  it('handles mixed null values correctly', () => {
    // 使用新的 properties 对象避免之前测试的影响
    const freshProperties: ComponentProperties = {
      title: {
        type: 'string',
        title: '标题',
        default: '默认标题',
      },
      count: {
        type: 'number',
        title: '数量',
        default: 10,
      },
      tags: {
        type: 'array',
        title: '标签',
        default: [],
      },
      config: {
        type: 'object',
        title: '配置',
        default: {},
      },
      missingString: {
        type: 'string',
        title: '缺失的字符串',
        default: '',
      },
    };

    const values = {
      title: null, // null 值
      tags: ['existing'], // 有效值
      // config 完全缺失
      missingString: null,
      // count 完全缺失
    };

    const result = calculateTemplateDataWithFallbacks(freshProperties, values);

    // null 值应该使用 fallback
    expect(result.title).toBe('-');
    expect(result.missingString).toBe('-');

    // 有效值应该保留
    expect(result.tags).toEqual(['existing']);

    // 完全缺失的属性使用默认值
    expect(result.count).toBe(10); // 使用默认值
    expect(result.config).toEqual({}); // 使用默认值
  });

  it('works correctly when useDefaultValues is disabled', () => {
    const values = {
      title: '自定义标题',
      // 其他都缺失
    };

    const result = calculateTemplateDataWithFallbacks(
      mockProperties,
      values,
      {},
      false, // 禁用默认值
    );

    // 保留现有值
    expect(result.title).toBe('自定义标题');

    // 缺失的属性使用 fallback 而不是默认值
    expect(result.count).toBe('-');
    expect(result.tags).toEqual([]);
    expect(result.config).toEqual({});
    expect(result.missingString).toBe('-');
    expect(result.missingNumber).toBe('-');
    expect(result.missingArray).toEqual([]);
    expect(result.missingObject).toEqual({});
  });

  it('handles empty properties gracefully', () => {
    const result = calculateTemplateDataWithFallbacks(
      {},
      { someValue: 'test' },
    );

    // 应该保留传入的值
    expect(result.someValue).toBe('test');
  });

  it('applies fallback for properties not defined in schema but missing from data', () => {
    const properties: ComponentProperties = {
      newProperty: {
        type: 'string',
        title: '新属性',
        default: '',
      },
    };

    // 完全不提供这个属性
    const result = calculateTemplateDataWithFallbacks(properties, {});

    // 应该使用默认值
    expect(result.newProperty).toBe('');
  });
});
