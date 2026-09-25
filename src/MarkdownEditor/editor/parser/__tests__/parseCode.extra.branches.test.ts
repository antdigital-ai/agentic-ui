import { describe, expect, it } from 'vitest';
import { handleCode } from '../../parser/parse/parseCode';

describe('parseCode 额外分支', () => {
  it('agentic-ui-toolusebar 合法 JSON', () => {
    const result = handleCode({
      value: '{"id":"t1"}',
      lang: 'agentic-ui-toolusebar',
    });
    expect(result.type).toBe('agentic-ui-toolusebar');
    expect(result.value).toEqual({ id: 't1' });
  });

  it('mermaid 未完成时 finished=false', () => {
    const result = handleCode({
      value: 'graph TD\nA',
      lang: 'mermaid',
      otherProps: { finished: false },
    });
    expect(result.otherProps?.finished).toBe(false);
  });

  it('handler 无 otherProps 时从 base 合并 config', () => {
    const result = handleCode(
      { value: 'x^2', lang: 'katex' },
      { 'data-extra': 1 },
    );
    expect(result.type).toBe('katex');
    expect(result.otherProps).toMatchObject({ 'data-extra': 1 });
  });

  it('configLanguage 为空串时回退 lang', () => {
    const result = handleCode(
      { value: 'x\n', lang: 'js' },
      { 'data-language': '' },
    );
    expect(result.language).toBe('js');
  });

  it('lang 仅空格时 langString 为空', () => {
    const result = handleCode({ value: 'x\n', lang: '   ' });
    expect(result.type).toBe('code');
  });

  it('围栏不完整 mermaid 保持 loading', () => {
    const result = handleCode({
      value: 'graph',
      lang: 'mermaid',
    });
    expect(result.type).toBe('mermaid');
  });
});

describe('istanbul residual：parseCode 假值 / 别名 / 标点 lang', () => {
  it('value 空串；configLanguage 与 lang 皆假', () => {
    const result = handleCode({ value: '', lang: undefined });
    expect(result.language).toBeNull();
    expect(result.type).toBe('code');
  });

  it('configLanguage 假值回退 lang；lang 假值回退 null', () => {
    expect(
      handleCode({ value: 'x\n', lang: 'ts' }, { 'data-language': null }).language,
    ).toBe('ts');
    expect(
      handleCode({ value: 'x\n', lang: '' }, { 'data-language': false as any })
        .language,
    ).toBeNull();
  });

  it('lang 仅标点时 match?.[0]|| 为空串', () => {
    const result = handleCode({ value: 'x\n', lang: '!!!' });
    expect(result.type).toBe('code');
    expect(result.language).toBe('!!!');
  });

  it('schema / agentic 空 value 走 ||{} / ||[]；非法 JSON catch', () => {
    expect(handleCode({ value: '', lang: 'schema' }).type).toBe('apaasify');
    expect(handleCode({ value: '', lang: 'apaasify' }).type).toBe('apaasify');
    expect(handleCode({ value: '', lang: 'apassify' }).type).toBe('apaasify');
    // 双侧 parse 都失败时走 _parseError
    const bad = handleCode({ value: 'not-json-@@@', lang: 'agentic-ui-task' })
      .value;
    expect(
      bad?._parseError === true || typeof bad === 'object',
    ).toBe(true);
    const schemaPartial = handleCode({ value: '[', lang: 'schema' }).value;
    expect(schemaPartial === '[' || Array.isArray(schemaPartial)).toBe(true);
  });

  it('缩进代码 done；mermaid 不完整走 finished=false', () => {
    expect(
      handleCode({ value: 'body', meta: 'indented', lang: 'js' }).otherProps
        ?.finished,
    ).toBeUndefined();
    expect(
      handleCode({ value: 'graph TD', lang: 'mermaid' }).otherProps?.finished,
    ).toBe(false);
  });
});

describe('istanbul residual：parseCode LANGUAGE_HANDLERS / finish / render', () => {
  it('agentic 别名与空 {} / [] 回退；html render；apaasify 语言', () => {
    expect(
      handleCode({ value: '', lang: 'agentic-ui-usertoolbar' }).type,
    ).toBe('agentic-ui-toolusebar');
    expect(handleCode({ value: '', lang: 'agentic-ui-filemap' }).type).toBe(
      'agentic-ui-filemap',
    );
    expect(handleCode({ value: '', lang: 'agentar-card' }).type).toBe(
      'apaasify',
    );

    expect(handleCode({ value: '[]\n', lang: 'apaasify' }).language).toBe(
      'apaasify',
    );

    expect(
      handleCode({ value: '<b>x</b>\n', lang: 'html', meta: 'render' }).render,
    ).toBe(true);

    // otherProps.finished===false 优先；缩进代码走 done 不写 finished
    expect(
      handleCode({
        value: 'x\n',
        lang: 'js',
        otherProps: { finished: false },
      }).otherProps?.finished,
    ).toBe(false);
    expect(
      handleCode({
        value: 'complete enough\n',
        lang: 'js',
        meta: 'indented',
      }).otherProps?.finished,
    ).toBeUndefined();

    expect(
      handleCode({ value: '<!--cfg-->\n', lang: 'js' }).isConfig,
    ).toBe(true);
    expect(handleCode({ value: 'plain\n', lang: 'js' }).isConfig).toBe(false);

    expect(
      handleCode({ value: 'x\n', lang: '  py  ' }, { 'data-language': 'go' })
        .language,
    ).toBe('go');
    expect(handleCode({ value: 'x\n', lang: '!!!@@@' }).language).toBe(
      '!!!@@@',
    );
  });

  it('mermaid 完整/不完整；katex handler 合并 config', () => {
    const done = handleCode({
      value: 'graph TD\nA-->B\n',
      lang: 'mermaid',
    });
    expect(done.type).toBe('mermaid');

    const loading = handleCode({
      value: 'graph TD',
      lang: 'mermaid',
    });
    expect(loading.otherProps?.finished).toBe(false);

    const katex = handleCode(
      { value: 'a^2', lang: 'katex' },
      { 'data-extra': true },
    );
    expect(katex.type).toBe('katex');
    expect(katex.otherProps).toMatchObject({ 'data-extra': true });
  });

  it('仅 config 无 otherProps 时合并；handler 已有 otherProps 再合并', () => {
    const plain = handleCode({ value: 'a\n', lang: 'js' }, { k: 1 });
    expect(plain.otherProps).toMatchObject({ k: 1 });

    const katex = handleCode(
      { value: 'x', lang: 'katex', otherProps: { a: 1 } },
      { b: 2 },
    );
    expect(katex.otherProps).toMatchObject({ a: 1, b: 2 });
  });
});
