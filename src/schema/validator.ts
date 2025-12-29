import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import lowcodeSchema from './schema.definition.json';
import { LowCodeSchema } from './types';

export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    addFormats(this.ajv);
  }

  /**
   * 验证JSON数据是否符合低代码组件规范
   * @param data 要验证的JSON数据
   * @returns 验证结果对象
   */
  validate(data: unknown): {
    valid: boolean;
    errors: Array<{
      path: string;
      message: string;
    }>;
  } {
    const validate = this.ajv.compile<LowCodeSchema>(lowcodeSchema);
    const valid = validate(data);

    if (!valid) {
      const errors = (validate.errors || []).map((error: ErrorObject) => ({
        path: error.instancePath,
        message: error.message || '未知错误',
      }));

      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: true,
      errors: [],
    };
  }
}

// 导出单例实例
export const mdDataSchemaValidator = new SchemaValidator();
