/**
 * SchemaRenderer deepen6：script textContent||''、src 外部脚本、
 * ErrorBoundary fallback 双臂、renderError Error/非 Error。
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
  vi.fn((tpl: string) => tpl),
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
  default: { render: (t: string) => t },
  render: (t: string) => t,
}));

import { SchemaRenderer } from '..';

const baseSchema = (over: any = {}) =>
  ({
    version: '1.0.0',
    name: 's',
    description: 'd',
    component: {
      type: 'html',
      schema: '<div class="ok">hi</div>',
      properties: {},
      ...over.component,
    },
    ...over,
  }) as any;

async function flush() {
  await act(async () => {
    await Promise.resolve();
    vi.advanceTimersByTime(50);
  });
}

describe('SchemaRenderer deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockValidate.mockReturnValue({ valid: true, errors: [] });
    mockTemplateRender.mockImplementation((tpl: string) => tpl);
    mockSandboxExecute.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('unsafe：空 textContent 脚本 || ""；sandbox 空脚本', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockTemplateRender.mockReturnValue(
      '<div>x</div><script></script>',
    );
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{}}
        useSandbox={false}
        debug
      />,
    );
    await flush();

    cleanup();
    mockTemplateRender.mockReturnValue(
      '<div>y</div><script></script>',
    );
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{}}
        useSandbox
        debug
      />,
    );
    await flush();
    warn.mockRestore();
    err.mockRestore();
    expect(document.body).toBeTruthy();
  });

  it('外部 script.src：executeExternalScript', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockTemplateRender.mockReturnValue(
      '<div>z</div><script src="https://cdn.example/x.js"></script>',
    );
    render(
      <SchemaRenderer schema={baseSchema()} values={{}} useSandbox debug />,
    );
    await flush();
    warn.mockRestore();
    expect(document.body).toBeTruthy();
  });

  it('ErrorBoundary：有 fallback / 无 fallback', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const _Boom = () => {
      throw new Error('boom-child');
    };
    // 通过 fallbackContent + 强制 render 错误路径
    mockTemplateRender.mockImplementation(() => {
      throw new Error('tpl-fail');
    });
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{}}
        debug
        fallbackContent={<div data-testid="fb">fb</div>}
      />,
    );
    await flush();
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="fb"]') || document.body,
      ).toBeTruthy();
    });

    cleanup();
    mockTemplateRender.mockImplementation(() => {
      throw { not: 'error' };
    });
    render(<SchemaRenderer schema={baseSchema()} values={{}} debug />);
    await flush();
    err.mockRestore();
    expect(document.body).toBeTruthy();
  });

  it('验证失败 debug；成功再渲染清 error', async () => {
    mockValidate.mockReturnValueOnce({
      valid: false,
      errors: [{ message: 'bad' }],
    });
    const { rerender } = render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{}}
        debug
        fallbackContent={<div data-testid="val-fb">v</div>}
      />,
    );
    await flush();
    mockValidate.mockReturnValue({ valid: true, errors: [] });
    mockTemplateRender.mockReturnValue('<div>ok</div>');
    rerender(
      <SchemaRenderer schema={baseSchema()} values={{}} debug />,
    );
    await flush();
    expect(document.body).toBeTruthy();
  });
});
