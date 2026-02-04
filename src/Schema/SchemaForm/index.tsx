/* eslint-disable @typescript-eslint/no-use-before-define */
import { MinusCircleOutlined } from '@ant-design/icons';
import { Plus } from '@sofa-design/icons';

import { Button, Card, Form, Input, InputNumber, Select, Space } from 'antd';
import type { Rule } from 'antd/es/form';
import { merge } from 'lodash-es';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { I18nContext, cnLabels } from '../../I18n';
import { LowCodeSchema, SchemaProperty } from '../types';

export interface SchemaFormProps {
  schema: LowCodeSchema;
  onValuesChange?: (
    _: Record<string, any>,
    values: Record<string, any>,
  ) => void;
  initialValues?: Record<string, any>;
  readonly?: boolean;
}

/**
 * SchemaForm 组件 - 基于Schema的表单组件
 *
 * 该组件根据JSON Schema自动生成表单，支持多种数据类型和验证规则。
 * 提供动态表单生成、数据验证、只读模式等功能。
 *
 * @component
 * @description 基于Schema的表单组件，自动生成表单字段和验证规则
 * @param {SchemaFormProps} props - 组件属性
 * @param {LowCodeSchema} props.schema - 表单Schema定义
 * @param {Function} [props.onValuesChange] - 表单值变化回调
 * @param {Record<string, any>} [props.initialValues] - 初始值
 * @param {boolean} [props.readonly=false] - 是否只读模式
 *
 * @example
 * ```tsx
 * <SchemaForm
 *   schema={{
 *     component: {
 *       properties: {
 *         name: {
 *           type: 'string',
 *           title: '姓名',
 *           required: true
 *         },
 *         age: {
 *           type: 'number',
 *           title: '年龄',
 *           minimum: 0,
 *           maximum: 150
 *         }
 *       }
 *     }
 *   }}
 *   onValuesChange={(changed, values) => console.log(values)}
 *   initialValues={{ name: '张三', age: 25 }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Schema表单组件
 *
 * @remarks
 * - 根据JSON Schema自动生成表单
 * - 支持多种数据类型（string、number、array、object等）
 * - 提供完整的验证规则支持
 * - 支持只读模式
 * - 提供国际化支持
 * - 支持嵌套对象和数组
 * - 提供动态字段添加/删除
 * - 响应式布局适配
 */
const SchemaFormComponent: React.FC<SchemaFormProps> = ({
  schema,
  onValuesChange,
  initialValues,
  readonly = false,
}) => {
  const [form] = Form.useForm();
  const { properties = {} } = schema?.component || {};
  const { locale = cnLabels } = useContext(I18nContext);

  // 生成表单验证规则
  const generateRules = useCallback(
    (property: SchemaProperty): Rule[] => {
      const rules: Rule[] = [];

      if (property.required) {
        rules.push({
          required: true,
          message: `${locale?.inputPlaceholder || '请输入'} ${property.title || property.description || ''}`,
        });
      }

      if (property.type === 'string' && property.pattern) {
        rules.push({
          pattern: new RegExp(property.pattern),
          message:
            property.patternMessage ||
            `${property.title || property.description || ''}格式不正确`,
        });
      }

      if (property.type === 'number') {
        rules.push({
          type: 'number',
          message: `${property.title || property.description || ''}必须是数字`,
        });

        if (typeof property.minimum === 'number') {
          rules.push({
            type: 'number',
            min: property.minimum,
            message: `${property.title || property.description || ''}不能小于 ${property.minimum}`,
          });
        }

        if (typeof property.maximum === 'number') {
          rules.push({
            type: 'number',
            max: property.maximum,
            message: `${property.title || property.description || ''}不能大于 ${property.maximum}`,
          });
        }
      }

      if (property.type === 'array') {
        if (typeof property.minItems === 'number') {
          rules.push({
            type: 'array',
            min: property.minItems,
            message: `${property.title || property.description || ''}至少需要 ${property.minItems} 项`,
          });
        }

        if (typeof property.maxItems === 'number') {
          rules.push({
            type: 'array',
            max: property.maxItems,
            message: `${property.title || property.description || ''}最多只能有 ${property.maxItems} 项`,
          });
        }
      }

      return rules;
    },
    [locale],
  );

  // 获取属性标题
  const getPropertyTitle = useCallback(
    (property: SchemaProperty, key: string) => {
      return property.title || property.description || key;
    },
    [],
  );

  // 获取通用输入框属性
  const getCommonInputProps = useCallback(
    (property: SchemaProperty) => ({
      placeholder: `${locale?.inputPlaceholder || '请输入'} ${property.title || property.description}`,
      readOnly: readonly,
      disabled: readonly,
    }),
    [readonly, locale],
  );

  // 渲染基础表单项
  const renderBasicFormItem = useCallback(
    (property: SchemaProperty): React.ReactNode => {
      const commonProps = getCommonInputProps(property);

      switch (property.type) {
        case 'number':
          return (
            <InputNumber
              {...commonProps}
              style={{ width: '100%' }}
              min={property.minimum}
              max={property.maximum}
              step={property.step || 1}
            />
          );
        case 'string':
          if (property.enum) {
            return (
              <Select {...commonProps}>
                {property.enum.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            );
          }
          return <Input {...commonProps} />;
        default:
          return <Input {...commonProps} />;
      }
    },
    [getCommonInputProps, locale],
  );

  // 渲染数组项内容
  const renderArrayItemContent = useCallback(
    (
      name: string | number,
      items: SchemaProperty | undefined,
      isNested: boolean = false,
    ): React.ReactNode => {
      if (!items) {
        return (
          <Form.Item name={name} style={{ margin: 0 }}>
            <Input
              placeholder={locale?.inputPlaceholder || '请输入'}
              readOnly={readonly}
              disabled={readonly}
            />
          </Form.Item>
        );
      }

      if (items.type === 'object' && items.properties) {
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {Object.entries(items.properties).map(([objKey, objProperty]) => (
              <Form.Item
                key={objKey}
                label={getPropertyTitle(objProperty, objKey)}
                name={isNested ? [name, objKey] : [name, objKey]}
                rules={generateRules(objProperty)}
                style={{ margin: 0 }}
              >
                {renderFormItem(objKey, objProperty)}
              </Form.Item>
            ))}
          </Space>
        );
      }

      return (
        <Form.Item name={name} style={{ margin: 0 }}>
          {renderBasicFormItem(items)}
        </Form.Item>
      );
    },
    [readonly, getPropertyTitle, generateRules, renderBasicFormItem],
  );

  // 渲染数组表单项
  const renderArrayFormItem = useCallback(
    (
      key: string,
      property: SchemaProperty & { type: 'array' },
      baseName?: string | number,
    ): React.ReactNode => {
      const fieldName = baseName !== undefined ? [baseName, key] : key;

      return (
        <Form.List name={fieldName}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key: fieldKey, name }) => (
                <Card
                  key={fieldKey}
                  size="small"
                  style={{ marginBottom: 8 }}
                  extra={
                    !readonly && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    )
                  }
                >
                  {renderArrayItemContent(name, property.items, true)}
                </Card>
              ))}
              {!readonly && (
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<Plus />}
                  >
                    添加 {getPropertyTitle(property, key)}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      );
    },
    [readonly, renderArrayItemContent, getPropertyTitle],
  );

  // 渲染对象表单项
  const renderObjectFormItem = useCallback(
    (
      key: string,
      property: SchemaProperty & { type: 'object' },
      baseName?: string | number,
    ): React.ReactNode => {
      if (!property.properties) {
        return (
          <Input
            placeholder={`${locale?.inputPlaceholder || '请输入'} ${property.title || property.description}`}
            disabled
          />
        );
      }

      return (
        <Card size="small" style={{ marginTop: 8 }}>
          {Object.entries(property.properties).map(([objKey, objProperty]) => (
            <Form.Item
              key={objKey}
              label={getPropertyTitle(objProperty, objKey)}
              name={
                baseName !== undefined ? [baseName, key, objKey] : [key, objKey]
              }
              rules={generateRules(objProperty)}
              style={{ marginBottom: 16 }}
            >
              {renderFormItem(objKey, objProperty)}
            </Form.Item>
          ))}
        </Card>
      );
    },
    [getPropertyTitle, generateRules, locale],
  );

  // 根据属性类型返回对应的表单组件
  const renderFormItem = useCallback(
    (
      key: string,
      property: SchemaProperty,
      baseName?: string | number,
    ): React.ReactNode => {
      switch (property.type) {
        case 'array':
          return renderArrayFormItem(key, property, baseName);
        case 'object':
          return renderObjectFormItem(key, property, baseName);
        default:
          return renderBasicFormItem(property);
      }
    },
    [renderArrayFormItem, renderObjectFormItem, renderBasicFormItem],
  );

  // 计算默认值
  const defaultValues = useMemo(() => {
    return Object.entries(properties).reduce(
      (acc, [key, prop]) => {
        if (prop.default !== undefined) {
          acc[key] = prop.default;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [properties]);

  // 设置初始值
  useEffect(() => {
    const mergedValues = merge({}, defaultValues, initialValues);
    form.setFieldsValue(mergedValues);
  }, [form, defaultValues, initialValues]);

  // 生成表单项
  const formItems = useMemo(() => {
    return Object.entries(properties).map(([key, property]) => {
      const shouldUseFormItemName =
        property.type !== 'object' && property.type !== 'array';

      return (
        <Form.Item
          key={key}
          label={getPropertyTitle(property, key)}
          name={shouldUseFormItemName ? key : undefined}
          rules={generateRules(property)}
        >
          {renderFormItem(key, property)}
        </Form.Item>
      );
    });
  }, [properties, getPropertyTitle, generateRules, renderFormItem]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={defaultValues}
      onValuesChange={(_, allValues) => {
        onValuesChange?.(_, allValues);
      }}
      style={{
        maxWidth: 400,
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {formItems}
    </Form>
  );
};

SchemaFormComponent.displayName = 'SchemaForm';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const SchemaForm = memo(SchemaFormComponent);
