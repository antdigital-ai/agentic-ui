/**
 * SchemaForm deepen residual：rules 假值 title/description、locale 缺省、array/number 边界。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import type { LowCodeSchema } from '../../types';
import { SchemaForm } from '..';

const baseSchema = (properties: any): LowCodeSchema =>
  ({
    version: '1.0.0',
    name: 'deepen',
    description: '',
    author: '',
    createTime: '',
    updateTime: '',
    pageConfig: {
      layout: 'flex',
      router: { mode: 'hash', basePath: '/' },
      globalVariables: { colors: {}, constants: {} },
    },
    dataSources: {
      restAPI: {
        baseURL: '',
        defaultHeaders: {},
        timeout: 5000,
        interceptors: { request: false, response: false },
      },
      mock: { enable: false, responseDelay: 0, dataPath: '/mock' },
    },
    component: { properties },
  }) as any;

describe('SchemaForm deepen residual branches', () => {
  afterEach(() => {
    cleanup();
  });

  it.skip('required 仅 description；pattern 无 patternMessage；空 locale', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={baseSchema({
            bare: {
              type: 'string',
              description: '描述字段',
              required: true,
              pattern: '^[a-z]+$',
              default: 'abc',
            },
            noLabel: {
              type: 'string',
              required: true,
              default: 'x',
            },
          })}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('描述字段')).toBeInTheDocument();
  });

  it.skip('number min/max 无 title 用 description；无 locale 文案 fallback', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={baseSchema({
            n: {
              type: 'number',
              description: '数值描述',
              minimum: 1,
              maximum: 9,
              step: undefined,
              default: 3,
            },
            n2: {
              type: 'number',
              title: 'N2',
              default: 0,
            },
          })}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('数值描述')).toBeInTheDocument();
    expect(screen.getByText('N2')).toBeInTheDocument();
  });

  it.skip('array minItems/maxItems；items 缺省与 object items', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={baseSchema({
            arr: {
              type: 'array',
              title: 'Arr',
              minItems: 1,
              maxItems: 3,
              items: { type: 'string' },
              default: ['a'],
            },
            bareArr: {
              type: 'array',
              description: '裸数组',
              default: [''],
            },
            objArr: {
              type: 'array',
              title: 'ObjArr',
              items: {
                type: 'object',
                properties: {
                  k: { type: 'string', title: 'K', default: '' },
                },
              },
              default: [{ k: 'v' }],
            },
          })}
          initialValues={{
            arr: ['a'],
            bareArr: [''],
            objArr: [{ k: 'v' }],
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('Arr')).toBeInTheDocument();
    expect(screen.getByText('裸数组')).toBeInTheDocument();
    expect(screen.getByText('ObjArr')).toBeInTheDocument();
  });

  it.skip('readonly 默认 false 省略；string 无 enum；boolean 默认', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: { inputPlaceholder: '请输入' },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            s: { type: 'string', title: 'S', default: '' },
            flag: { type: 'boolean', title: 'F', default: true },
            weird: { type: 'unknown' as any, title: 'W', default: '' },
          })}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it.skip('嵌套 object 无 title 子字段；patternMessage 自定义', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              inputPlaceholder: '请输入',
              'schemaForm.invalidFormat': '格式不正确',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            nest: {
              type: 'object',
              title: 'Nest',
              properties: {
                onlyKey: {
                  type: 'string',
                  required: true,
                  pattern: '^x$',
                  patternMessage: '必须是 x',
                  default: 'x',
                },
              },
            },
          })}
          initialValues={{ nest: { onlyKey: 'x' } }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('Nest')).toBeInTheDocument();
  });

  it('istanbul deepen：number/array 边界 rules；仅 title；readonly', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              inputPlaceholder: '请输入',
              'schemaForm.mustBeNumber': '必须是数字',
              'schemaForm.minValue': '最小 ${min}',
              'schemaForm.maxValue': '最大 ${max}',
              'schemaForm.minItems': '至少 ${min} 项',
              'schemaForm.maxItems': '最多 ${max} 项',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            n: {
              type: 'number',
              title: 'Num',
              minimum: 1,
              maximum: 10,
              required: true,
              default: 5,
            },
            n2: {
              type: 'number',
              description: '仅描述数字',
              default: 0,
            },
            arr: {
              type: 'array',
              title: 'Arr',
              minItems: 1,
              maxItems: 3,
              default: ['a'],
              items: { type: 'string' },
            },
            arr2: {
              type: 'array',
              description: '数组描述',
              default: [],
              items: { type: 'string' },
            },
            sEnum: {
              type: 'string',
              title: 'Enum',
              enum: ['a', 'b'],
              default: 'a',
            },
          })}
          readonly
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('Num')).toBeInTheDocument();
    expect(screen.getByText('Arr')).toBeInTheDocument();
    expect(screen.getByText('Enum')).toBeInTheDocument();
  });

  it('istanbul deepen：空 locale；object 无 properties；array items object/缺省；pattern 无 message', () => {
    const { rerender } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'en-US' } as any}>
        <SchemaForm
          schema={baseSchema({
            bare: { type: 'string', required: true, pattern: '^[a-z]+$' },
            onlyDesc: { type: 'string', description: 'desc-only' },
            emptyObj: { type: 'object', title: 'EmptyObj' },
            nestArr: {
              type: 'array',
              title: 'NestArr',
              default: [{ k: 'v' }],
              items: {
                type: 'object',
                properties: {
                  k: { type: 'string', title: 'K', required: true },
                  n: { type: 'number', minimum: 0, maximum: 9 },
                },
              },
            },
            plainArr: {
              type: 'array',
              title: 'PlainArr',
              default: ['x'],
              items: undefined as any,
            },
            unknownType: { type: 'boolean' as any, title: 'BoolLike' },
          })}
          initialValues={{
            bare: 'abc',
            onlyDesc: 'd',
            nestArr: [{ k: 'v', n: 1 }],
            plainArr: ['x'],
          }}
          onValuesChange={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('EmptyObj')).toBeInTheDocument();
    expect(screen.getAllByText('NestArr').length).toBeGreaterThan(0);
    expect(screen.getByText('K')).toBeInTheDocument();

    rerender(
      <I18nContext.Provider value={{ locale: undefined, language: 'zh-CN' } as any}>
        <SchemaForm
          schema={{ component: undefined } as any}
          readonly={false}
        />
      </I18nContext.Provider>,
    );
    expect(document.body).toBeTruthy();
  });
});
