/**
 * SchemaRenderer deepen10 safe：空 script textContent、ErrorBoundary fallback、
 * array split、mustache、Critical Error/非 Error。 heavily mocked；勿复活 hangers。
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
  vi.fn((tpl: string) => tpl),
);
const mockMustacheRender = vi.hoisted(() =>
  vi.fn((tpl: string, data: any) =>
    tpl.replace(/\{\{\s*name\s*\}\}/g, String(data?.name ?? '')),
  ),
);
const mockPartialParse = vi.hoisted(() =>
  vi.fn((s: string) => {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }),
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
  default: { render: (...a: any[]) => mockMustacheRender(...a) },
  render: (...a: any[]) => mockMustacheRender(...a),
}));

vi.mock('../../../MarkdownEditor/editor/parser/json-parse', () => ({
  default: (...a: any[]) => mockPartialParse(...a),
  partialParse: (...a: any[]) => mockPartialParse(...a),
}));

import { SchemaRenderer } from '..';

const baseSchema = (over: any = {}) =>
  ({
    version: '1.0.0',
    name: 's',
    description: 'd',
    component: {
      type: 'html',
      schema: '<div>{{name}}</div>',
      properties: {
        name: { type: 'string', title: 'n', default: 'def' },
      },
      ...over.component,
    },
    ...over,
  }) as any;

async function flush(ms = 40) {
  await act(async () => {
    await Promise.resolve();
    vi.advanceTimersByTime(ms);
  });
}

describe('SchemaRenderer deepen10 safe residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidate.mockReturnValue({ valid: true, errors: [] });
    mockSandboxExecute.mockResolvedValue({ success: true });
    mockTemplateRender.mockImplementation((tpl: string) => tpl);
    mockMustacheRender.mockImplementation((tpl: string, data: any) =>
      tpl.replace(/\{\{\s*name\s*\}\}/g, String(data?.name ?? '')),
    );
    mockPartialParse.mockImplementation((s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('空 script textContent：sandbox disabled 走 script.textContent||""', async () => {
    mockTemplateRender.mockReturnValueOnce(
      '<div>ok</div><script></script><script> </script>',
    );
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'x' }}
        sandboxConfig={{ enabled: false }}
      />,
    );
    await flush();
    expect(mockCreateSandbox).not.toHaveBeenCalled();
    expect(mockTemplateRender).toHaveBeenCalled();
  });

  it('sandbox enabled 空 script：execute 收到空串', async () => {
    mockTemplateRender.mockReturnValueOnce('<script> </script>');
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'y' }}
        sandboxConfig={{ enabled: true }}
      />,
    );
    await flush(80);
    expect(mockSandboxExecute).toHaveBeenCalled();
    expect(mockSandboxExecute.mock.calls[0]?.[0]?.trim?.() ?? '').toBe('');
  });

  it('模板渲染 Error / 非 Error + Critical attachShadow', async () => {
    mockTemplateRender.mockImplementationOnce(() => {
      throw 'tpl-string';
    });
    const tplErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<SchemaRenderer schema={baseSchema()} values={{ name: 't' }} debug />);
    await flush();
    expect(
      document.body.textContent?.includes('Template rendering error') ||
        tplErr.mock.calls.length > 0,
    ).toBeTruthy();
    tplErr.mockRestore();

    cleanup();
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const original = HTMLElement.prototype.attachShadow;
    let calls = 0;
    HTMLElement.prototype.attachShadow = function () {
      calls += 1;
      if (calls === 1) throw new Error('crit-err');
      throw 'crit-str';
    };
    const { container } = render(
      <SchemaRenderer schema={baseSchema()} values={{ name: 'c' }} debug />,
    );
    await flush();
    expect(
      container.textContent?.includes('crit-err') ||
        container.textContent?.includes('Critical') ||
        err.mock.calls.length > 0,
    ).toBeTruthy();
    HTMLElement.prototype.attachShadow = original;
    err.mockRestore();
  });

  it('array 字符串 partialParse 非数组 → split 臂', async () => {
    mockPartialParse.mockReturnValueOnce({ not: 'array' });
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>{{tags}}</div>',
            properties: { tags: { type: 'array', title: 't' } },
          },
        })}
        values={{ tags: 'x, y, z' }}
      />,
    );
    await flush();
    const dataArg = mockTemplateRender.mock.calls[0]?.[1];
    expect(Array.isArray(dataArg?.tags)).toBe(true);
    expect(dataArg?.tags).toEqual(['x', 'y', 'z']);
  });

  it('mustache 类型渲染', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'mustache',
            schema: 'Hi {{name}}',
            properties: { name: { type: 'string', title: 'n', default: 'a' } },
          },
        })}
        values={{ name: 'm' }}
      />,
    );
    await flush();
    expect(mockMustacheRender).toHaveBeenCalled();
  });
});
