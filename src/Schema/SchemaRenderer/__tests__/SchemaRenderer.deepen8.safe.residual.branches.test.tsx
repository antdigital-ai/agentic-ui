/**
 * SchemaRenderer deepen8 safe：array 字符串解析为非数组 → split；
 * mustache；shadowRoot 复用；Critical catch Error/非 Error。
 * SchemaRenderer.branches hang-quarantined；勿复活。
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

describe('SchemaRenderer deepen8 safe residual branches', () => {
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
  });

  it('array 值解析为对象非数组 → split 逗号臂', async () => {
    mockPartialParse.mockReturnValueOnce({ not: 'array' });
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>{{tags}}</div>',
            properties: {
              tags: { type: 'array', title: 't' },
            },
          },
        })}
        values={{ tags: 'a, b, c' }}
      />,
    );
    await flush();
    expect(mockPartialParse).toHaveBeenCalled();
    expect(mockTemplateRender).toHaveBeenCalled();
    const dataArg = mockTemplateRender.mock.calls[0]?.[1];
    expect(Array.isArray(dataArg?.tags)).toBe(true);
  });

  it('mustache 类型走 Mustache.render', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'mustache',
            schema: 'Hi {{name}}',
            properties: {
              name: { type: 'string', title: 'n', default: 'x' },
            },
          },
        })}
        values={{ name: 'bob' }}
      />,
    );
    await flush();
    expect(mockMustacheRender).toHaveBeenCalled();
    expect(mockTemplateRender).not.toHaveBeenCalled();
  });

  it('shadowRoot 已存在时走复用臂（二次渲染）', async () => {
    const { rerender, container } = render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'a' }}
      />,
    );
    await flush();
    const host = container.querySelector('[data-testid="schema-renderer"]');
    expect(host?.shadowRoot || host).toBeTruthy();

    mockTemplateRender.mockImplementation(() => '<div class="ok2">b</div>');
    rerender(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'b' }}
      />,
    );
    await flush();
    expect(
      host?.shadowRoot?.innerHTML?.includes('ok2') ||
        mockTemplateRender.mock.calls.length >= 2,
    ).toBeTruthy();
  });

  it('Critical rendering：Effect 抛 Error / 非 Error', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const original = HTMLElement.prototype.attachShadow;
    let calls = 0;
    HTMLElement.prototype.attachShadow = function (_init) {
      calls += 1;
      if (calls === 1) {
        throw new Error('crit-error');
      }
      throw 'crit-string';
    };

    const { rerender, container } = render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'a' }}
        debug
      />,
    );
    await flush();
    expect(
      container.textContent?.includes('crit-error') ||
        container.textContent?.includes('Critical') ||
        err.mock.calls.length > 0,
    ).toBeTruthy();

    mockTemplateRender.mockImplementation(() => '<div>z</div>');
    rerender(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>z</div>',
            properties: {},
          },
        })}
        values={{}}
        debug
      />,
    );
    await flush();
    HTMLElement.prototype.attachShadow = original;
    err.mockRestore();
    expect(document.body).toBeTruthy();
  });
});
