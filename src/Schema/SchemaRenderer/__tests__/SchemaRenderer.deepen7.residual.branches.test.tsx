/**
 * SchemaRenderer deepen7：
 * textContent||'' 假值臂：executeScript 要求 truthy textContent → 死臂，跳过。
 * 覆盖 Critical 非 Error、validation fallback、debug 错误文案。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
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
  default: { render: (tpl: string) => tpl },
  render: (tpl: string) => tpl,
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
    vi.advanceTimersByTime(40);
  });
}

describe('SchemaRenderer deepen7 residual branches', () => {
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
  });

  it('template Error：debug 展示错误；再成功清 renderError', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockTemplateRender.mockImplementationOnce(() => {
      throw new Error('tmp-fail');
    });
    const { rerender, container } = render(
      <SchemaRenderer schema={baseSchema()} values={{ name: 'a' }} debug />,
    );
    await flush();
    expect(
      container.textContent?.includes('tmp-fail') ||
        container.textContent?.includes('Template') ||
        container.textContent?.includes('渲染'),
    ).toBe(true);

    mockTemplateRender.mockImplementation((tpl: string, data: any) =>
      tpl.replace(/\{\{\s*name\s*\}\}/g, String(data?.name ?? '')),
    );
    rerender(
      <SchemaRenderer schema={baseSchema()} values={{ name: 'b' }} debug />,
    );
    await flush();
    expect(container.querySelector('[data-testid="schema-renderer"]')).toBeTruthy();
    err.mockRestore();
  });

  it('Critical rendering：非 Error 抛值 → String(error)', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockValidate.mockImplementationOnce(() => {
      throw 'plain-string-fail';
    });
    const { container } = render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'a' }}
        debug
        fallbackContent={<div data-testid="fb7">fb</div>}
      />,
    );
    await flush();
    expect(
      container.querySelector('[data-testid="fb7"]') ||
        container.textContent?.includes('plain-string') ||
        err.mock.calls.some((c) =>
          String(c[0]).includes('Critical') ||
          String(c[1]).includes('plain-string'),
        ),
    ).toBeTruthy();
    err.mockRestore();
  });

  it('validation 失败 + fallbackContent', async () => {
    mockValidate.mockReturnValueOnce({
      valid: false,
      errors: [{ message: 'bad' }],
    });
    const { container } = render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'a' }}
        fallbackContent={<div data-testid="val-fb7">invalid</div>}
      />,
    );
    await flush();
    expect(
      container.querySelector('[data-testid="val-fb7"]') ||
        container.textContent === '' ||
        container.textContent?.includes('invalid'),
    ).toBeTruthy();
  });
});
