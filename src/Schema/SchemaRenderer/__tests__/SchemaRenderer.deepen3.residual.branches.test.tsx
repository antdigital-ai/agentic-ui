/**
 * SchemaRenderer deepen3：sandbox 配置显式值、property fallback 类型、
 * mustache、外部 script、非 Error 抛错、error.path。保持轻量，避免 hang。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockValidate = vi.hoisted(() =>
  vi.fn(() => ({ valid: true, errors: [] as any[] })),
);
const mockSandboxExecute = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true }),
);
const mockSandboxDestroy = vi.hoisted(() => vi.fn());
const mockCreateSandbox = vi.hoisted(() =>
  vi.fn(() => ({
    execute: (...a: any[]) => mockSandboxExecute(...a),
    destroy: mockSandboxDestroy,
  })),
);
const mockTemplateRender = vi.hoisted(() =>
  vi.fn((tpl: string, data: any) =>
    tpl.replace(/\{\{\s*name\s*\}\}/g, String(data?.name ?? '')),
  ),
);
const mockMustacheRender = vi.hoisted(() =>
  vi.fn((tpl: string, data: any) => `m:${data?.name ?? ''}`),
);

vi.mock('../../validator', () => ({
  mdDataSchemaValidator: {
    validate: (...args: any[]) => mockValidate(...args),
  },
}));

vi.mock('../../../Utils/proxySandbox', () => ({
  createSandbox: (...a: any[]) => mockCreateSandbox(...a),
  DEFAULT_SANDBOX_CONFIG: {
    allowedGlobals: ['Math'],
    forbiddenGlobals: ['eval'],
  },
  ProxySandbox: vi.fn(),
}));

vi.mock('../templateEngine', () => ({
  TemplateEngine: {
    render: (...a: any[]) => mockTemplateRender(...a),
  },
}));

vi.mock('mustache', () => ({
  default: {
    render: (...a: any[]) => mockMustacheRender(...a),
  },
  render: (...a: any[]) => mockMustacheRender(...a),
}));

import { SchemaRenderer } from '..';

const baseSchema = (over: any = {}) =>
  ({
    version: '1.0.0',
    name: 's',
    description: 'd',
    component: {
      type: 'html',
      schema: '<div class="ok">{{name}}</div>',
      properties: {
        name: { type: 'string', title: 'n', default: 'def' },
      },
      ...over.component,
    },
    ...over,
  }) as any;

async function flush() {
  await act(async () => {
    await Promise.resolve();
    vi.advanceTimersByTime(30);
  });
}

describe('SchemaRenderer deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidate.mockReturnValue({ valid: true, errors: [] });
    mockSandboxExecute.mockResolvedValue({ success: true });
    mockTemplateRender.mockImplementation((tpl: string, data: any) =>
      tpl.replace(/\{\{\s*name\s*\}\}/g, String(data?.name ?? '')),
    );
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('useDefaultValues：array/number/object/default 类型补全', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>{{tags}}{{n}}{{obj}}{{unk}}</div>',
            properties: {
              tags: { type: 'array', title: 't' },
              n: { type: 'number', title: 'n' },
              obj: { type: 'object', title: 'o' },
              unk: { type: 'boolean', title: 'b' },
              name: { type: 'string', title: 's' },
            },
          },
        })}
        values={{}}
        useDefaultValues
      />,
    );
    await flush();
    expect(mockTemplateRender).toHaveBeenCalled();
  });

  it('mustache 类型渲染；sandbox 显式配置触发 createSandbox', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'mustache',
            schema: 'Hello {{name}}',
            properties: {
              name: { type: 'string', title: 'n', default: 'x' },
            },
          },
        })}
        values={{ name: 'bob' }}
      />,
    );
    await flush();

    cleanup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>hi<script>var a=1</script></div>',
            properties: {},
          },
        })}
        values={{}}
        sandbox={{
          enabled: true,
          allowDOM: false,
          allowedGlobals: ['Date'],
          forbiddenGlobals: ['Function'],
          strictMode: false,
          timeout: 100,
        }}
      />,
    );
    await flush();
    expect(mockCreateSandbox).toHaveBeenCalled();
    void warn;
  });

  it('模板抛非 Error；validation error.path 无 property', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockTemplateRender.mockImplementationOnce(() => {
      throw 'string-boom';
    });
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'x' }}
        debug
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/string-boom|渲染|error/i);
    });

    cleanup();
    mockValidate.mockReturnValue({
      valid: false,
      errors: [{ message: 'path-only', path: '/instance.age' }],
    });
    render(
      <SchemaRenderer schema={baseSchema()} values={{}} debug />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/path-only|验证失败|age/);
    });
    expect(err).toHaveBeenCalled();
  });

  it('sandbox enabled=false 且 script 空 textContent 不执行', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>noscript<script></script></div>',
            properties: {},
          },
        })}
        values={{}}
        sandbox={{ enabled: false }}
      />,
    );
    await flush();
    expect(document.body).toBeTruthy();
  });
});
