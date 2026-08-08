/**
 * parseElements handleInlineCode residual：占位符、initialValue、非 tag。
 */
import { describe, expect, it } from 'vitest';
import {
  handleDefinition,
  handleInlineCode,
  handleThematicBreak,
} from '../parseElements';

describe('parseElements residual branches', () => {
  it('普通行内代码：非 ${ 开头', () => {
    const r = handleInlineCode({ value: 'foo' });
    expect(r).toMatchObject({
      code: true,
      tag: false,
      text: 'foo',
      placeholder: undefined,
      initialValue: undefined,
    });
  });

  it('tag + initialValue 优先', () => {
    const r = handleInlineCode({
      value: '${placeholder:场景,initialValue:已选}',
    });
    expect(r.tag).toBe(true);
    expect(r.text).toBe('已选');
    expect(r.placeholder).toBe('场景');
    expect(r.initialValue).toBe('已选');
  });

  it('tag 仅 placeholder 时 text 为空格', () => {
    const r = handleInlineCode({ value: '${placeholder:目标}' });
    expect(r.tag).toBe(true);
    expect(r.text).toBe(' ');
    expect(r.placeholder).toBe('目标');
  });

  it('tag 无匹配键值时 text 空格兜底', () => {
    const r = handleInlineCode({ value: '${}' });
    expect(r.tag).toBe(true);
    expect(r.text).toBe(' ');
  });

  it('handleThematicBreak 返回 hr', () => {
    expect(handleThematicBreak()).toMatchObject({ type: 'hr' });
  });

  it('handleDefinition：有/无 url', () => {
    expect(
      handleDefinition({ label: 'a', url: 'https://x' }).children[0].text,
    ).toContain('https://x');
    expect(handleDefinition({ label: 'b' }).children[0].text).toBe('[b]: ');
  });
});
