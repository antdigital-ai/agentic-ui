import { describe, expect, it } from 'vitest';

import { parseJsonBody, parseSchemaJson } from '../parseJsonBody';

describe('parseJsonBody', () => {
  it('应将空代码块解析为默认对象', () => {
    expect(parseJsonBody('')).toEqual({});
  });

  it('应优先支持 json5 宽松语法', () => {
    expect(parseJsonBody('{type:"task", items:[1,],}')).toEqual({
      type: 'task',
      items: [1],
    });
  });
});

describe('parseSchemaJson', () => {
  it('应解析完整的严格 JSON schema', () => {
    expect(
      parseSchemaJson(
        JSON.stringify({
          type: 'object',
          properties: { name: { type: 'string' } },
        }),
      ),
    ).toEqual({
      type: 'object',
      properties: { name: { type: 'string' } },
    });
  });

  it('应将空 schema 代码块解析为默认数组', () => {
    expect(parseSchemaJson('')).toEqual([]);
  });

  it('应通过 partial-json 解析流式截断的 schema', () => {
    expect(
      parseSchemaJson('{"type":"object","properties":{"name":{"type":"string"'),
    ).toMatchObject({
      type: 'object',
      properties: { name: { type: 'string' } },
    });
  });

  it('不应接受仅 json5 支持的 schema 语法', () => {
    expect(parseSchemaJson('{type:"form"}')).toBeNull();
  });

  it('应在严格 JSON 与 partial-json 均失败时返回 null', () => {
    expect(parseSchemaJson('__PARSE_FAIL__')).toBeNull();
  });
});
