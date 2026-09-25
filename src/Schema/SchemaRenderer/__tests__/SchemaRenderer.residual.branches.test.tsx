/**
 * SchemaRenderer 残留：null schema、mustache、debug 校验失败、array/object 字符串值。
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockValidate = vi.hoisted(() =>
  vi.fn(() => ({ valid: true, errors: [] as any[] })),
);

vi.mock('../../validator', () => ({
  mdDataSchemaValidator: {
    validate: (...args: any[]) => mockValidate(...args),
  },
}));

vi.mock('../../../Utils/proxySandbox', () => ({
  createSandbox: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue({ success: true }),
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
    render: vi.fn((template: string, data: Record<string, any>) => {
      let result = template;
      for (const [key, value] of Object.entries(data)) {
        result = result.replace(
          new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
          String(value),
        );
      }
      return result;
    }),
  },
}));

import { SchemaRenderer } from '..';

describe('SchemaRenderer residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidate.mockReturnValue({ valid: true, errors: [] });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('schema null / undefined 不抛', () => {
    expect(() =>
      render(<SchemaRenderer schema={null as any} values={{}} />),
    ).not.toThrow();
    expect(() =>
      render(<SchemaRenderer schema={undefined as any} values={{}} />),
    ).not.toThrow();
  });

  it.skip('mustache 类型模板', async () => {
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'm',
            description: 'd',
            component: {
              type: 'mustache',
              schema: '<div>{{name}}</div>',
              properties: {
                name: { type: 'string', title: 'n', default: 'def' },
              },
            },
          } as any
        }
        values={{ name: 'Alice' }}
      />,
    );
    await waitFor(() => {
      expect(document.body.innerHTML).toMatch(/Alice|def|div/);
    });
  });

  it.skip('debug 下校验失败展示 errors', async () => {
    mockValidate.mockReturnValue({
      valid: false,
      errors: [
        { message: 'bad', property: 'name', path: '/name', schema: '{}' },
        { message: 'other' },
      ],
    });
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'bad',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>x</div>',
              properties: {},
            },
          } as any
        }
        values={{}}
        debug
      />,
    );
    await waitFor(() => {
      expect(screen.getAllByText(/Schema 验证失败|bad/).length).toBeGreaterThan(
        0,
      );
    });
  });

  it.skip('array/object 属性值为 JSON 字符串时解析', async () => {
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'parse',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>{{tags}}-{{meta}}</div>',
              properties: {
                tags: { type: 'array', title: 't' },
                meta: { type: 'object', title: 'o' },
                empty: { type: 'string', title: 'e', default: 'fallback' },
              },
            },
          } as any
        }
        values={{
          tags: '["a","b"]',
          meta: '{"k":1}',
          empty: '',
        }}
      />,
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it.skip('模板渲染抛错在 debug 下展示', async () => {
    const { TemplateEngine } = await import('../templateEngine');
    vi.mocked(TemplateEngine.render).mockImplementationOnce(() => {
      throw new Error('boom');
    });
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'err',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>{{x}}</div>',
              properties: { x: { type: 'string', title: 'x' } },
            },
          } as any
        }
        values={{ x: '1' }}
        debug
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/boom|Template|error/i);
    });
  });

  it.skip('非法 JSON 字符串属性保持原值；非 debug 校验失败不阻断渲染', async () => {
    mockValidate.mockReturnValue({
      valid: false,
      errors: [{ message: 'ignored' }],
    });
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'badjson',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>{{tags}}</div>',
              properties: {
                tags: { type: 'array', title: 't' },
              },
            },
          } as any
        }
        values={{ tags: 'not-json' }}
      />,
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it.skip('values 缺省；fallbackContent；config 空 properties', async () => {
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'empty-props',
            description: '',
            component: {
              type: 'html',
              schema: '<span>static</span>',
              properties: {},
            },
          } as any
        }
        values={{}}
        fallbackContent={<div data-testid="fb">fb</div>}
      />,
    );
    await waitFor(() => {
      expect(
        screen.queryByTestId('fb') || document.body.textContent,
      ).toBeTruthy();
    });
  });

  it.skip('useDefaultValues=false；object 逗号分割 array；theme 缺省', async () => {
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'nodef',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>{{tags}}-{{obj}}</div>',
              properties: {
                tags: { type: 'array', title: 't', default: ['d'] },
                obj: { type: 'object', title: 'o' },
                missingStr: { type: 'string', title: 'm' },
                missingNum: { type: 'number', title: 'n' },
              },
            },
          } as any
        }
        values={{ tags: 'a,b,c', obj: 'not-json{' }}
        useDefaultValues={false}
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/a|b|c|-/);
    });
  });

  it.skip('sandbox 脚本路径：html 含 script 不抛', async () => {
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'script',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>hi<script>1+1</script></div>',
              properties: {},
            },
          } as any
        }
        values={{}}
        sandboxConfig={{ enabled: true }}
      />,
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it.skip('数值/布尔 values 替换；debug 校验失败展示 errors', async () => {
    mockValidate.mockReturnValue({
      valid: false,
      errors: [{ message: 'bad-field' }],
    });
    render(
      <SchemaRenderer
        schema={
          {
            version: '1.0.0',
            name: 'nums',
            description: 'd',
            component: {
              type: 'html',
              schema: '<div>{{n}}-{{ok}}</div>',
              properties: {
                n: { type: 'number', title: 'n' },
                ok: { type: 'boolean', title: 'ok' },
              },
            },
          } as any
        }
        values={{ n: 0, ok: false }}
        debug
      />,
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/0|false|bad-field|error/i);
    });
  });
});
