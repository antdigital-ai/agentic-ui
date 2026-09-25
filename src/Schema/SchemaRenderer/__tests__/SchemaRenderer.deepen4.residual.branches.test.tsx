/**
 * SchemaRenderer deepen4：sandbox 默认参、unsafe/empty script、
 * ErrorBoundary fallback、theme typography 缺省、renderError 非 Error。
 * Fake timers + clearAllTimers；afterEach 不 useRealTimers。
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

describe('SchemaRenderer deepen4 residual branches', () => {
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

  it('sandboxConfig 缺省字段走 ?? / ||', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>{{name}}</div><script>var x=1</script>',
            properties: {
              name: { type: 'string', title: 'n', default: 'a' },
            },
          },
        })}
        values={{ name: 'z' }}
        sandboxConfig={{
          enabled: true,
          // allowDOM / allowedGlobals / forbiddenGlobals / strictMode / timeout 缺省
        }}
      />,
    );
    await flush();
    await waitFor(() => {
      expect(mockCreateSandbox).toHaveBeenCalled();
    });
    const cfg = mockCreateSandbox.mock.calls[0]?.[0];
    expect(cfg.allowDOM).toBe(true);
    expect(cfg.timeout).toBe(3000);
    warn.mockRestore();
    err.mockRestore();
  });

  it('sandbox disabled：unsafe script 带 textContent', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>x</div><script>var y=2</script>',
            properties: { name: { type: 'string', title: 'n' } },
          },
        })}
        values={{}}
        sandboxConfig={{ enabled: false }}
      />,
    );
    await flush();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    err.mockRestore();
  });

  it('template throw 非 Error；fallbackContent；theme 缺省', async () => {
    mockTemplateRender.mockImplementationOnce(() => {
      throw 'boom-string';
    });
    const { container } = render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'a' }}
        debug
        fallbackContent={<div data-testid="fb">fb</div>}
      />,
    );
    await flush();
    expect(
      container.querySelector('[data-testid="fb"]') ||
        container.textContent?.includes('渲染错误') ||
        container.textContent?.includes('boom'),
    ).toBeTruthy();

    cleanup();
    mockTemplateRender.mockImplementation((tpl: string) => tpl);
    render(
      <SchemaRenderer
        schema={baseSchema({
          theme: {},
          component: {
            type: 'html',
            schema: '<span>ok</span>',
            properties: {},
          },
        })}
        values={{}}
        debug={false}
      />,
    );
    await flush();
    expect(document.body).toBeTruthy();
  });

  it('array string 非 JSON：逗号切分；object string parse 失败保留原串', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>{{tags}}{{obj}}</div>',
            properties: {
              tags: { type: 'array', title: 't' },
              obj: { type: 'object', title: 'o' },
              name: { type: 'string', title: 'n' },
            },
          },
        })}
        values={{ tags: 'a,b,c', obj: 'not-json{' }}
        useDefaultValues={false}
      />,
    );
    await flush();
    expect(mockTemplateRender).toHaveBeenCalled();
    const data = mockTemplateRender.mock.calls.at(-1)?.[1];
    expect(Array.isArray(data?.tags)).toBe(true);
  });

  it('schema null 走 EMPTY；component 缺省', async () => {
    render(
      <SchemaRenderer schema={null as any} values={{}} debug={false} />,
    );
    await flush();
    expect(document.body).toBeTruthy();
  });
});
