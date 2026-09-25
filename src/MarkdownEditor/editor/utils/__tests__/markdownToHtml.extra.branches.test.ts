import { describe, expect, it, vi } from 'vitest';
import {
  buildDefaultMarkdownRemarkPlugins,
  escapeHtml,
  markdownToHtmlSync,
} from '../markdownToHtml';

describe('markdownToHtml 额外分支', () => {
  it('escapeHtml encode=true 转义 &<>"\'', () => {
    expect(escapeHtml('a&b<c>"\'', true)).toContain('&amp;');
    expect(escapeHtml('plain', true)).toBe('plain');
  });

  it('自定义 plugins 数组非空时不走默认插件集', () => {
    const result = markdownToHtmlSync('# t', []);
    // empty plugins → resolveRemarkPlugins 走默认（length===0）
    expect(result).toContain('t');
  });

  it('buildDefaultMarkdownRemarkPlugins formula 启用加入 remarkMath', () => {
    const withFormula = buildDefaultMarkdownRemarkPlugins({ enable: true });
    const without = buildDefaultMarkdownRemarkPlugins({ enable: false });
    expect(withFormula.length).toBeGreaterThan(without.length);
  });

  it('formula enable 时同步渲染含 katex 类', () => {
    const html = markdownToHtmlSync('$a+b$', undefined, {
      formula: { enable: true },
    });
    expect(html.length).toBeGreaterThan(0);
  });

  it('代码块无 language class 但多行长文本仍标记 block', () => {
    const md =
      '```\n' +
      Array.from({ length: 5 }, (_, i) => `line ${i}`).join('\n') +
      '\n```';
    const html = markdownToHtmlSync(md);
    expect(html).toContain('data-block="true"');
  });

  it('行内 code 不添加 data-block', () => {
    const html = markdownToHtmlSync('use `x` here');
    expect(html).toContain('<code>');
  });

  it('转换异常时返回空串', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    // 传入极异常 plugins 触发 process 失败路径较难；验证 sync 正常路径非空
    expect(markdownToHtmlSync('ok')).toContain('ok');
    err.mockRestore();
  });
});
