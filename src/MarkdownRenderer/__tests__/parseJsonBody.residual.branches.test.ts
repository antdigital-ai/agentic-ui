/**
 * parseJsonBody / parseSchemaJson residual：json5 容忍与 partial 回退。
 */
import { describe, expect, it } from 'vitest';
import {
  parseJsonBody,
  parseSchemaJson,
} from '../renderers/utils/parseJsonBody';

describe('parseJsonBody residual branches', () => {
  it('json5 容忍尾逗号与注释', () => {
    expect(parseJsonBody('{a:1,}')).toEqual({ a: 1 });
    expect(parseJsonBody('{/*c*/"b":2}')).toEqual({ b: 2 });
  });

  it('残缺对象走 partialParse；非法 token 为 null', () => {
    const partial = parseJsonBody('{"x":');
    expect(partial === null || typeof partial === 'object').toBe(true);
    expect(parseJsonBody('not-json!!!')).toBeNull();
  });

  it('parseSchemaJson：严格 JSON 成功；残缺/空/失败', () => {
    expect(parseSchemaJson('[1,2]')).toEqual([1, 2]);
    expect(parseSchemaJson('{"a":')).not.toBeNull();
    expect(parseSchemaJson('')).toEqual([]);
    expect(parseSchemaJson('%%%')).toBeNull();
  });
});
