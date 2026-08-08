/**
 * parseCode residual：handleYaml、value trim 边界、仅 config 合并。
 */
import { describe, expect, it, vi } from 'vitest';
import { handleCode, handleYaml } from '../parseCode';

describe('parseCode handleYaml / residual matrix', () => {
  it('handleYaml：有/无 value；frontmatter 标记', () => {
    expect(handleYaml({ value: 'a: 1' })).toMatchObject({
      type: 'code',
      language: 'yaml',
      frontmatter: true,
      value: 'a: 1',
    });
    expect(handleYaml({ value: undefined }).value).toBeUndefined();
  });

  it('isConfig：空白与 HTML 注释；render meta', () => {
    expect(handleCode({ value: '  <!--x-->\n', lang: 'js' }).isConfig).toBe(
      true,
    );
    expect(handleCode({ value: '', lang: 'js' }).isConfig).toBe(false);
    expect(
      handleCode({ value: 'x\n', lang: 'html', meta: 'render' }).render,
    ).toBe(true);
    expect(handleCode({ value: 'x\n', lang: 'html' }).render).toBe(false);
  });

  it('schema 非法 JSON 双 catch；agentic partial 解析', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const schemaBad = handleCode({ value: '{not-json', lang: 'schema' });
    expect(schemaBad.type).toBe('apaasify');
    const taskBad = handleCode({
      value: '{not-json',
      lang: 'agentic-ui-task',
    });
    expect(taskBad.type).toBe('agentic-ui-task');
    expect(taskBad.value).toBeTruthy();
    spy.mockRestore();
  });

  it('handler 无 otherProps 时从 config 写入；二者皆有时合并', () => {
    const mermaid = handleCode(
      { value: 'graph TD\nA-->B\n', lang: 'mermaid' },
      { theme: 'dark' },
    );
    expect(mermaid.otherProps).toMatchObject({ theme: 'dark' });

    const withBoth = handleCode(
      {
        value: 'x^2',
        lang: 'katex',
        otherProps: { finished: false, keep: 1 },
      },
      { extra: 2 },
    );
    expect(withBoth.otherProps).toMatchObject({
      finished: false,
      keep: 1,
      extra: 2,
    });
  });

  it.skip('LANGUAGE_HANDLERS 矩阵：空 value / agentic embeds / apaasify 别名', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(handleCode({ value: '', lang: 'schema' }).type).toBe('apaasify');
    expect(handleCode({ value: '[]', lang: 'schema' }).value).toEqual([]);
    expect(handleCode({ value: '[]', lang: 'apassify' }).type).toBe('apaasify');
    expect(handleCode({ value: '[]', lang: 'apaasify' }).type).toBe('apaasify');
    expect(
      handleCode({ value: '', lang: 'agentic-ui-toolusebar' }).type,
    ).toBe('agentic-ui-toolusebar');
    expect(
      handleCode({ value: '', lang: 'agentic-ui-usertoolbar' }).type,
    ).toBe('agentic-ui-toolusebar');
    expect(
      handleCode({ value: '{"a":1}', lang: 'agentic-ui-filemap' }).type,
    ).toBe('agentic-ui-filemap');
    expect(
      handleCode({ value: '<div/>\n', lang: 'html', meta: 'render' }).render,
    ).toBe(true);
    expect(
      handleCode({ value: 'x\n', lang: 'js', meta: 'indented' }),
    ).toMatchObject({ type: 'code' });
    expect(handleCode({ value: 'x', lang: undefined }).language).toBeFalsy();
    expect(
      handleCode({ value: 'y\n', lang: 'js' }, { 'data-language': 'python' })
        .language,
    ).toBe('python');
    expect(
      handleCode({ value: 'partial', lang: 'js' }).otherProps?.finished,
    ).toBe(false);
    // 无 otherProps 时仅靠 config 写入
    expect(
      handleCode({ value: 'z\n', lang: 'js' }, { onlyConfig: true }).otherProps,
    ).toMatchObject({ onlyConfig: true });
    // finished 已 true 时不强制写 finished:false
    expect(
      handleCode({
        value: 'complete enough code\n',
        lang: 'js',
        otherProps: { finished: true },
      }).otherProps?.finished,
    ).toBe(true);
    spy.mockRestore();
  });

  it('exclusive deepen：mermaid 流式；空 value；lang 属性覆盖；html 代码', () => {
    const loading = handleCode({
      value: 'graph',
      lang: 'mermaid',
    });
    expect(loading.type).toBe('code');
    expect(loading.otherProps?.finished).toBe(false);

    const doneish = handleCode({
      value: 'graph TD\nA-->B\nC-->D\nE-->F\n',
      lang: 'mermaid',
    });
    expect(doneish.type).toBe('code');

    expect(handleCode({ lang: 'txt' } as any).value).toBeUndefined();
    expect(
      handleCode({ value: '', lang: 'js' }).language || '',
    ).toBeDefined();
    expect(
      handleCode(
        { value: 'print(1)\n', lang: 'js' },
        { 'data-language': 'python', finished: false },
      ).language,
    ).toBe('python');

    const html = handleCode({
      value: '<div>x</div>\n',
      lang: 'html',
      meta: 'render',
    });
    expect(html.type).toBe('code');

    const indented = handleCode({
      value: '  a\n  b\n',
      lang: 'yaml',
      meta: 'indented',
    });
    expect(indented.type).toBe('code');

    const katex = handleCode({
      value: 'x^2\n',
      lang: 'katex',
    });
    expect(katex.type).toBe('code');
  });
});
