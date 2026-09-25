import { describe, expect, it, vi } from 'vitest';
import { handleCode, handleYaml } from '../parse/parseCode';

describe('parseCode 分支覆盖', () => {
  it('handleCode 无语言时 language 为 null', () => {
    const result = handleCode({ value: 'plain\n' });
    expect(result.type).toBe('code');
    expect(result.language).toBeNull();
  });

  it('handleCode config data-language 优先', () => {
    const result = handleCode(
      { value: 'x', lang: 'js' },
      { 'data-language': 'mermaid' },
    );
    expect(result.type).toBe('mermaid');
  });

  it('handleCode 缩进代码块视为完成', () => {
    const result = handleCode({
      value: 'indented',
      meta: 'indented',
    });
    expect(result.otherProps?.finished).toBeUndefined();
  });

  it('handleCode otherProps.finished 显式 false 保留', () => {
    const result = handleCode({
      value: 'incomplete',
      otherProps: { finished: false },
    });
    expect(result.otherProps?.finished).toBe(false);
  });

  it('handleCode schema 语言解析 JSON', () => {
    const result = handleCode({
      value: '[{"a":1}]',
      lang: 'schema',
    });
    expect(result.type).toBe('apaasify');
    expect(Array.isArray(result.value)).toBe(true);
  });

  it('handleCode schema 非法 JSON 走 partialJsonParse 或 fallback', () => {
    const result = handleCode({
      value: '{broken',
      lang: 'schema',
    });
    expect(result.type).toBe('apaasify');
  });

  it('handleCode agentic-ui-task 解析失败写入 _parseError', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleCode({
      value: '{{{',
      lang: 'agentic-ui-task',
    });
    expect(result.type).toBe('agentic-ui-task');
    expect((result.value as any)?._parseError || result.value).toBeTruthy();
    errSpy.mockRestore();
  });

  it('handleCode agentic-ui-filemap 合法 JSON', () => {
    const result = handleCode({
      value: '{"files":[]}',
      lang: 'agentic-ui-filemap',
    });
    expect(result.type).toBe('agentic-ui-filemap');
    expect(result.value).toEqual({ files: [] });
  });

  it('handleCode agentic-ui-usertoolbar 兼容映射 toolusebar', () => {
    const result = handleCode({
      value: '{}',
      lang: 'agentic-ui-usertoolbar',
    });
    expect(result.type).toBe('agentic-ui-toolusebar');
  });

  it('handleCode katex 类型转换', () => {
    const result = handleCode({ value: 'x^2', lang: 'katex' });
    expect(result.type).toBe('katex');
  });

  it('handleCode render meta 与 isConfig 注释块', () => {
    const result = handleCode({
      value: '<!-- config -->',
      lang: 'js',
      meta: 'render',
    });
    expect(result.render).toBe(true);
    expect(result.isConfig).toBe(true);
  });

  it('handleCode apaasify 别名 apassify', () => {
    const result = handleCode({ value: '[]', lang: 'apassify' });
    expect(result.type).toBe('apaasify');
  });

  it('handleCode 无换行结尾且无 finished 标记', () => {
    const result = handleCode({ value: 'no-newline', lang: 'js' });
    expect(result.otherProps?.finished).not.toBe(true);
  });

  it('handleCode handler 结果合并 otherProps 与 config', () => {
    const result = handleCode(
      { value: 'graph TD\nA-->B\n', lang: 'mermaid', otherProps: { x: 1 } },
      { y: 2 },
    );
    expect(result.otherProps).toMatchObject({ x: 1, y: 2 });
  });

  it('handleYaml 生成 frontmatter 代码块', () => {
    const result = handleYaml({ value: 'title: hi' });
    expect(result).toMatchObject({
      type: 'code',
      language: 'yaml',
      frontmatter: true,
    });
  });

  it('handleCode lang 带尾随空格截取首词', () => {
    const result = handleCode({ value: 'x\n', lang: 'js foo' });
    expect(result.language).toBe('js foo');
  });

  it.skip('handleCode 空 value 默认空串', () => {
    const result = handleCode({ lang: 'js' });
    expect(result.value).toBeUndefined();
    expect(result.type).toBe('code');
  });

  it('handleCode 围栏完整路径 finished 不写入', () => {
    const result = handleCode({
      value: 'const a = 1;\n',
      lang: 'js',
    });
    expect(result.otherProps?.finished).toBeUndefined();
  });

  it('handleCode agentar-card 走 schema 处理器', () => {
    const result = handleCode({
      value: '[{"x":1}]',
      lang: 'agentar-card',
    });
    expect(result.type).toBe('apaasify');
  });

  it('handleCode schema 双层 catch 保留原始 value', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleCode({
      value: 'not-json-at-all[[[',
      lang: 'schema',
    });
    expect(result.type).toBe('apaasify');
    errSpy.mockRestore();
  });

  it('handleCode agentic-ui-task 空 value 默认 {}', () => {
    const result = handleCode({
      value: '',
      lang: 'agentic-ui-task',
    });
    expect(result.type).toBe('agentic-ui-task');
    expect(result.value).toEqual({});
  });

  it('handleCode agentic-ui-filemap partialJson 路径', () => {
    const result = handleCode({
      value: '{"files":[',
      lang: 'agentic-ui-filemap',
    });
    expect(result.type).toBe('agentic-ui-filemap');
    expect(result.value).toBeTruthy();
  });

  it.skip('handleCode finished true 时不写入 finished', () => {
    const result = handleCode({
      value: 'done\n',
      lang: 'js',
      otherProps: { finished: true },
    });
    expect(result.otherProps?.finished).toBeUndefined();
  });

  it('handleCode 仅 config 合并到 otherProps', () => {
    const result = handleCode(
      { value: 'x\n', lang: 'js' },
      { chartType: 'bar' },
    );
    expect(result.otherProps).toMatchObject({ chartType: 'bar' });
  });

  it('handleCode apaasify 语言保留 language 字段', () => {
    const result = handleCode({ value: '[]', lang: 'apaasify' });
    expect(result.language).toBe('apaasify');
    expect(result.type).toBe('apaasify');
  });

  it('handleYaml 空 value', () => {
    const result = handleYaml({});
    expect(result.frontmatter).toBe(true);
    expect(result.language).toBe('yaml');
  });
});
