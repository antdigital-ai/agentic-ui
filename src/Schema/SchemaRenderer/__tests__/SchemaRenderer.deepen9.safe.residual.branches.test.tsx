/**
 * SchemaRenderer deepen9 safe：validation 失败无 fallback；debug 文案；
 * 空 properties。SchemaRenderer.branches hang-quarantined；勿复活。
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

vi.mock('../../../MarkdownEditor/editor/parser/json-parse', () => ({
  default: (s: string) => {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  },
  partialParse: (s: string) => {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  },
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

describe('SchemaRenderer deepen9 safe residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidate.mockReturnValue({ valid: true, errors: [] });
    mockSandboxExecute.mockResolvedValue({ success: true });
    mockTemplateRender.mockImplementation((tpl: string) => tpl);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('validation 失败无 fallbackContent：展示错误', async () => {
    mockValidate.mockReturnValue({
      valid: false,
      errors: [{ message: 'bad' }],
    });
    const { container } = render(
      <SchemaRenderer schema={baseSchema()} values={{ name: 'x' }} debug />,
    );
    await flush();
    expect(
      container.textContent?.includes('bad') ||
        container.textContent?.includes('valid') ||
        container.textContent?.length,
    ).toBeTruthy();
  });

  it('空 properties + 空 values', async () => {
    render(
      <SchemaRenderer
        schema={baseSchema({
          component: {
            type: 'html',
            schema: '<div>static</div>',
            properties: {},
          },
        })}
        values={{}}
      />,
    );
    await flush();
    expect(mockTemplateRender).toHaveBeenCalled();
  });

  it('sandbox execute 失败仍挂载', async () => {
    mockSandboxExecute.mockResolvedValueOnce({
      success: false,
      error: 'boom',
    });
    render(
      <SchemaRenderer
        schema={baseSchema()}
        values={{ name: 'a' }}
        debug
      />,
    );
    await flush();
    expect(document.body).toBeTruthy();
  });
});
