import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockMerge = vi.hoisted(() =>
  vi.fn((...objs: any[]) => Object.assign({}, ...objs)),
);
const mockValidate = vi.hoisted(() =>
  vi.fn(() => ({ valid: true, errors: [] })),
);
const mockTemplateRender = vi.hoisted(() =>
  vi.fn((template: string) => template),
);
const mockPartialParse = vi.hoisted(() =>
  vi.fn((input: string) => JSON.parse(input)),
);
const mockSandboxExecute = vi.hoisted(() =>
  vi.fn(async () => ({ success: true })),
);
const mockSandboxDestroy = vi.hoisted(() => vi.fn());
const mockCreateSandbox = vi.hoisted(() =>
  vi.fn(() => ({
    execute: mockSandboxExecute,
    destroy: mockSandboxDestroy,
  })),
);

vi.mock('lodash-es', () => ({ merge: (...args: any[]) => mockMerge(...args) }));
vi.mock('../../../src/Schema/validator', () => ({
  mdDataSchemaValidator: { validate: (...args: any[]) => mockValidate(...args) },
}));
vi.mock('../../../src/Schema/SchemaRenderer/templateEngine', () => ({
  TemplateEngine: { render: (...args: any[]) => mockTemplateRender(...args) },
}));
vi.mock('../../../src/MarkdownEditor/editor/parser/json-parse', () => ({
  default: (...args: any[]) => mockPartialParse(...args),
}));
vi.mock('../../../src/Utils/proxySandbox', () => ({
  createSandbox: (...args: any[]) => mockCreateSandbox(...args),
  DEFAULT_SANDBOX_CONFIG: {
    allowedGlobals: ['console'],
    forbiddenGlobals: ['eval'],
  },
  ProxySandbox: class {},
}));

import { SchemaRenderer } from '../../../src/Schema/SchemaRenderer';

const baseSchema: any = {
  version: '1.0.0',
  name: 'Schema',
  description: 'desc',
  component: {
    type: 'html',
    schema: '<div>Hello {{name}}</div>',
    properties: {
      name: { type: 'string', default: 'A' },
    },
  },
};

describe('SchemaRenderer targeted coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockMerge.mockImplementation((...objs: any[]) => Object.assign({}, ...objs));
    mockValidate.mockImplementation(() => ({ valid: true, errors: [] }));
    mockTemplateRender.mockImplementation((template: string) => template);
    mockPartialParse.mockImplementation((input: string) => JSON.parse(input));
    mockSandboxExecute.mockImplementation(async () => ({ success: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('覆盖 schema validate 异常分支（317-318）', () => {
    mockValidate.mockImplementationOnce(() => {
      throw new Error('validate failed');
    });
    render(<SchemaRenderer schema={baseSchema} values={{}} />);
    expect(screen.getByText(/Schema 验证失败/)).toBeInTheDocument();
  });

  it('覆盖模板数据转换异常与默认分支（359,373,401-402）', () => {
    let setCount = 0;
    mockMerge.mockImplementationOnce(
      () =>
        new Proxy<any>(
          { arr: 'a,b', obj: '{"a":1}', boolLike: undefined },
          {
          set(target, prop, value) {
            if (prop === 'obj' && setCount < 2) {
              setCount += 1;
              throw new Error('set fail');
            }
            target[prop as any] = value;
            return true;
          },
          },
        ),
    );
    mockPartialParse.mockImplementation((val: string) => {
      if (val === 'a,b') return { notArray: true };
      return { hello: 'world' };
    });

    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            type: 'html',
            schema: '<div>ok</div>',
            properties: {
              arr: { type: 'array' },
              obj: { type: 'object' },
              boolLike: { type: 'boolean' },
            },
          },
        }}
        values={{ arr: 'a,b', obj: '{"a":1}', boolLike: undefined }}
      />,
    );

    const passedData = mockTemplateRender.mock.calls[0][1];
    expect(passedData.arr).toEqual(['a', 'b']);
    expect(passedData.obj).toEqual({});
    expect(passedData.boolLike).toBe('-');
  });

  it('覆盖模板数据准备总 catch（409-410）', () => {
    mockMerge.mockImplementationOnce(() => {
      throw new Error('merge failed');
    });
    render(<SchemaRenderer schema={baseSchema} values={{ name: 'B' }} />);
    expect(mockTemplateRender).toHaveBeenCalled();
    expect(mockTemplateRender.mock.calls[0][1]).toEqual({ name: 'B' });
  });

  it('覆盖未知模板类型与模板渲染 catch（423,425-426,429）', () => {
    const successSpy = vi.fn();
    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: { ...baseSchema.component, type: 'unknown' as any },
        }}
        values={{}}
        onRenderSuccess={successSpy}
      />,
    );
    expect(successSpy).toHaveBeenCalledWith('<div>Hello {{name}}</div>');

    mockTemplateRender.mockImplementationOnce(() => {
      throw new Error('template failed');
    });
    render(
      <SchemaRenderer
        schema={baseSchema}
        values={{}}
        debug
      />,
    );
    expect(console.error).toHaveBeenCalled();
    expect(screen.getByText('渲染错误')).toBeInTheDocument();
  });

  it('覆盖样式构造 catch（448-449）', () => {
    const theme: any = {};
    Object.defineProperty(theme, 'typography', {
      configurable: true,
      get() {
        throw new Error('theme fail');
      },
    });
    const { container } = render(
      <SchemaRenderer schema={{ ...baseSchema, theme }} values={{}} />,
    );
    const el = container.querySelector('.schemaRenderer') as HTMLElement;
    expect(el).toHaveStyle('font-size: 13px');
  });

  it('覆盖 external script append 失败（91）', async () => {
    const originalAppend = Node.prototype.appendChild;
    Node.prototype.appendChild = vi.fn(function (this: any, node: any) {
      if (this instanceof ShadowRoot && node?.tagName === 'SCRIPT') {
        throw new Error('append script fail');
      }
      return originalAppend.call(this, node);
    }) as any;

    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            ...baseSchema.component,
            schema: '<div>ok<script src=\"https://a.com/a.js\"></script></div>',
          },
        }}
        values={{}}
      />,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    Node.prototype.appendChild = originalAppend;
  });

  it('覆盖 sandbox 执行返回 error（112）', async () => {
    mockSandboxExecute.mockResolvedValueOnce({ success: false, error: 'sandbox error' });
    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            ...baseSchema.component,
            schema: '<div>ok<script>console.log(1)</script></div>',
          },
        }}
        values={{}}
      />,
    );
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('覆盖 executeScript 总 catch（155）', async () => {
    const originalCreate = document.createElement.bind(document);
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: any) => {
        const el = originalCreate(tagName);
        if (tagName === 'script') {
          Object.defineProperty(el, 'src', {
            configurable: true,
            get() {
              throw new Error('src read failed');
            },
            set() {},
          });
        }
        return el;
      });

    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            ...baseSchema.component,
            schema: '<div>ok<script>1+1</script></div>',
          },
        }}
        values={{}}
      />,
    );
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    createSpy.mockRestore();
  });

  it('覆盖 attachShadow 失败回退（469,471,472）', async () => {
    const originAttach = HTMLElement.prototype.attachShadow;
    HTMLElement.prototype.attachShadow = vi.fn(() => {
      throw new Error('no shadow');
    }) as any;
    const { container } = render(<SchemaRenderer schema={baseSchema} values={{}} />);
    expect(container.querySelector('.schemaRenderer')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    HTMLElement.prototype.attachShadow = originAttach;
  });

  it('覆盖 script 处理异常（588）', async () => {
    const originRemove = Node.prototype.removeChild;
    Node.prototype.removeChild = vi.fn(() => {
      throw new Error('remove fail');
    }) as any;
    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            ...baseSchema.component,
            schema: '<div>ok<script>console.log(1)</script></div>',
          },
        }}
        values={{}}
      />,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    Node.prototype.removeChild = originRemove;
  });

  it('覆盖节点追加异常（597）', async () => {
    const originAppend = Node.prototype.appendChild;
    Node.prototype.appendChild = vi.fn(function (this: any, node: any) {
      if (this instanceof ShadowRoot && node?.tagName !== 'STYLE') {
        throw new Error('append node fail');
      }
      return originAppend.call(this, node);
    }) as any;
    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            ...baseSchema.component,
            schema: '<div><span>content</span></div>',
          },
        }}
        values={{}}
      />,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    Node.prototype.appendChild = originAppend;
  });

  it('覆盖内容回退再次失败（611）', async () => {
    const originQuery = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = vi.fn(() => {
      throw new Error('content fail');
    }) as any;
    const originalInner = Object.getOwnPropertyDescriptor(
      ShadowRoot.prototype,
      'innerHTML',
    );
    Object.defineProperty(ShadowRoot.prototype, 'innerHTML', {
      configurable: true,
      get() {
        return '';
      },
      set() {
        throw new Error('inner fail');
      },
    });

    render(
      <SchemaRenderer
        schema={{
          ...baseSchema,
          component: {
            ...baseSchema.component,
            schema: '<div><span>content</span></div>',
          },
        }}
        values={{}}
      />,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    Element.prototype.querySelectorAll = originQuery;
    if (originalInner) {
      Object.defineProperty(ShadowRoot.prototype, 'innerHTML', originalInner);
    }
  });
});

