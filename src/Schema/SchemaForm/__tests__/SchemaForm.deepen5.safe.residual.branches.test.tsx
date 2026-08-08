/**
 * SchemaForm deepen5 safe：嵌套 array-of-object / object-of-array 路径。
 * baseName 真值臂为死代码（renderFormItem 从未传入 baseName）— 不可达。
 * SchemaForm.test / deepen2 hang-quarantined。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import type { LowCodeSchema } from '../../types';
import { SchemaForm } from '..';

const baseSchema = (properties: any): LowCodeSchema =>
  ({
    version: '1.0.0',
    name: 'deepen5',
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

describe('SchemaForm deepen5 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('array of object items + 顶层 object 子字段', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'schemaForm.addItem': '添加',
              inputPlaceholder: '请输入',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <SchemaForm
          schema={baseSchema({
            people: {
              type: 'array',
              title: 'People',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', title: 'Name' },
                  meta: {
                    type: 'object',
                    title: 'Meta',
                    properties: {
                      age: { type: 'number', description: '年龄' },
                    },
                  },
                },
              },
              default: [{ name: 'a', meta: { age: 1 } }],
            },
          })}
          initialValues={{
            people: [{ name: 'a', meta: { age: 1 } }],
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /添加/i })).toBeInTheDocument();
  });
});
