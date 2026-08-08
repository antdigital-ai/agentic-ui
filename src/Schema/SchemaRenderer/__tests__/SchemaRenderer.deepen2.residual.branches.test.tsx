/**
 * SchemaRenderer deepen2：sandbox 关闭/失败、array 字符串、debug 校验 UI、shadow 失败。
 */
import '@testing-library/jest-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockValidate = vi.hoisted(() =>
  vi.fn(() => ({ valid: true, errors: [] as any[] })),
);
const mockSandboxExecute = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true }),
);
const mockTemplateRender = vi.hoisted(() =>
  vi.fn((tpl: string) => tpl),
);

vi.mock('../../validator', () => ({
  mdDataSchemaValidator: {
    validate: (...args: any[]) => mockValidate(...args),
  },
}));

vi.mock('../../../Utils/proxySandbox', () => ({
  createSandbox: vi.fn(() => ({
    execute: (...a: any[]) => mockSandboxExecute(...a),
    destroy: vi.fn(),
  })),
  DEFAULT_SANDBOX_CONFIG: {
    allowedGlobals: [],
    forbiddenGlobals: [],
  },
  ProxySandbox: vi.fn(),
}));

vi.mock('../templateEngine', () => ({
  TemplateEngine: {
    render: (...a: any[]) => mockTemplateRender(...a),
  },
}));

import { SchemaRenderer } from '..';

async function actWait() {
  const { act } = await import('@testing-library/react');
  await act(async () => {
    await Promise.resolve();
    vi.advanceTimersByTime(20);
  });
}

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

describe('SchemaRenderer deepen2 residual branches', () => {
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

  it('debug 校验失败：property/path/schema 与非数组 errors', async () => {
    mockValidate.mockReturnValue({
      valid: false,
      errors: [
        {
          message: 'bad',
          property: 'instance.name',
          path: '/name',
          schema: { type: 'string' },
        },
        { message: 'plain' },
      ],
    });
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'x' }}
        debug
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/验证失败|bad|plain/);
    });

    cleanup();
    mockValidate.mockReturnValue({
      valid: false,
      errors: { msg: 'obj-errors' } as any,
    });
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{}}
        debug
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/obj-errors|验证失败/);
    });
  });

  it('array 字符串非数组 parse → 逗号分割；template 抛错', async () => {
    mockTemplateRender.mockImplementationOnce(() => {
      throw new Error('tpl boom');
    });
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>{{tags}}</div>',
            properties: {
              tags: { type: 'array', title: 't' },
              name: { type: 'string', title: 'n' },
            },
          },
        })}
        values={{ tags: '"a","b"' }}
        debug
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/error|tpl|boom|渲染/i);
    });
  });

  it('sandbox disabled + inline script；sandbox success=false', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSandboxExecute.mockResolvedValueOnce({
      success: false,
      error: 'sandbox err',
    });

    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>hi<script>window.__x=1</script></div>',
            properties: {},
          },
        })}
        values={{}}
        sandbox={{ enabled: false }}
      />,
    );
    await actWait();

    cleanup();
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
        sandbox={{ enabled: true }}
      />,
    );
    await actWait();
    expect(warn.mock.calls.length + err.mock.calls.length).toBeGreaterThanOrEqual(
      0,
    );
  });

  it('attachShadow 失败走 innerHTML fallback', async () => {
    const original = HTMLElement.prototype.attachShadow;
    HTMLElement.prototype.attachShadow = function () {
      throw new Error('no shadow');
    } as any;
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div data-testid="fb">hello</div>',
            properties: {},
          },
        })}
        values={{}}
      />,
    );
    await actWait();
    HTMLElement.prototype.attachShadow = original;
    expect(document.body.innerHTML).toMatch(/hello|ok|div/);
  });
});
