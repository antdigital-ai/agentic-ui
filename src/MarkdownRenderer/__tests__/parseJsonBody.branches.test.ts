import { describe, expect, it } from 'vitest';
import { parseJsonBody, parseSchemaJson } from '../renderers/utils/parseJsonBody';

describe('parseJsonBody 分支覆盖', () => {
  it('parseJsonBody：合法 / 空串 / 部分 JSON / 彻底失败', () => {
    expect(parseJsonBody('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonBody('')).toEqual({});
    expect(parseJsonBody('{a:1}')).toEqual({ a: 1 });
    // partialParse 对残缺对象可能回退为 {}，真正失败用非法 token
    expect(parseJsonBody('@@@')).toBeNull();
  });

  it('parseSchemaJson：合法 / partial / 失败 / 空串回退 []', () => {
    expect(parseSchemaJson('{"x":1}')).toEqual({ x: 1 });
    expect(parseSchemaJson('{')).not.toBeNull();
    expect(parseSchemaJson('@@@')).toBeNull();
    // 空串走 JSON.parse 失败后 partialParse('[]')
    expect(parseSchemaJson('')).toEqual([]);
  });
});
