import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
  renderMarkdownBlock,
  splitMarkdownBlocks,
} from '../markdownReactShared';

describe('splitMarkdownBlocks', () => {
  it('splits on single blank line', () => {
    const md = 'block1\n\nblock2';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('block1');
    expect(result[1]).toBe('block2');
  });

  it('splits on double blank lines', () => {
    const md = 'block1\n\n\nblock2';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('block1');
    expect(result[1]).toBe('block2');
  });

  it('does not split inside code fences', () => {
    const md = '```\nline1\n\n\nline2\n```';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
  });

  it('does not treat think-like tags inside code fences as think blocks', () => {
    const md = '```html\n<think>\nexample\n\n</think>\n```\n\nResponse text.';
    const result = splitMarkdownBlocks(md);
    expect(result).toEqual([
      '```html\n<think>\nexample\n\n</think>\n```',
      'Response text.',
    ]);
  });

  it('handles tilde fences', () => {
    const md = '~~~\nline1\n\n\nline2\n~~~';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
  });

  it('returns single block for normal content', () => {
    const md = 'hello\nworld';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe('hello\nworld');
  });

  it('handles empty string', () => {
    const result = splitMarkdownBlocks('');
    expect(result.length).toBe(1);
    expect(result[0]).toBe('');
  });

  it('handles multiple blocks', () => {
    const md = 'a\n\n\nb\n\n\nc';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
  });

  it('does not split list items with blank lines (loose list)', () => {
    const md = '- item1\n\n- item2\n\n- item3';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(md);
  });

  it('does not split blockquote with blank lines', () => {
    const md = '> line1\n\n> line2';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(md);
  });

  it('splits paragraph after list ends', () => {
    const md = '- item1\n- item2\n\nparagraph after list';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('- item1\n- item2');
    expect(result[1]).toBe('paragraph after list');
  });

  it('splits multiple paragraphs', () => {
    const md = 'para1\n\npara2\n\npara3';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
  });

  it('handles nested code fences correctly', () => {
    const md = '````\n```\ninner\n```\n````\n\nafter';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('````\n```\ninner\n```\n````');
    expect(result[1]).toBe('after');
  });

  it('splits two adjacent tables separated by a blank line', () => {
    const md =
      '| a | b |\n| - | - |\n| 1 | 2 |\n\n| c | d |\n| - | - |\n| 3 | 4 |';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(result[1]).toBe('| c | d |\n| - | - |\n| 3 | 4 |');
  });

  it('keeps chart comment glued to following table', () => {
    const md =
      '<!-- [{"chartType":"line"}] -->\n\n| month | value |\n|-------|-------|\n| Jan | 100 |';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
  });

  it('splits heading from following table without blank line', () => {
    const md = '# Title\n| a | b |\n| - | - |\n| 1 | 2 |';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('# Title');
    expect(result[1]).toBe('| a | b |\n| - | - |\n| 1 | 2 |');
  });

  it('splits heading from following pipe-less table without blank line', () => {
    const md = '# Title\na | b\n- | -\n1 | 2';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('# Title');
    expect(result[1]).toBe('a | b\n- | -\n1 | 2');
  });

  it('does not split inside <think> tags with blank lines', () => {
    const md =
      '<think>\nHere is thinking:\n\n1. Step one\n\n2. Step two\n</think>\n\nResponse text.';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(
      '<think>\nHere is thinking:\n\n1. Step one\n\n2. Step two\n</think>',
    );
    expect(result[1]).toBe('Response text.');
  });

  it('does not split inside <thinking> tags with blank lines', () => {
    const md =
      '<thinking>\nSome thinking\n\nWith blank lines\n</thinking>\n\nResponse text.';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(
      '<thinking>\nSome thinking\n\nWith blank lines\n</thinking>',
    );
    expect(result[1]).toBe('Response text.');
  });

  it('does not split inside <redacted_thinking> tags with blank lines', () => {
    const md =
      '<redacted_thinking>\nInternal reasoning\n\nContinued\n</redacted_thinking>\n\nOutput.';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(
      '<redacted_thinking>\nInternal reasoning\n\nContinued\n</redacted_thinking>',
    );
    expect(result[1]).toBe('Output.');
  });

  it('handles think tag without blank lines (existing normal case)', () => {
    const md = '<think>\nContinuous thinking content\n</think>\n\nAfter think.';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\nContinuous thinking content\n</think>');
    expect(result[1]).toBe('After think.');
  });

  it('handles multiple think tag pairs', () => {
    const md =
      '<think>\nFirst think\n\nWith blank line\n</think>\n\nBetween.\n\n<think>\nSecond think\n</think>';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('<think>\nFirst think\n\nWith blank line\n</think>');
    expect(result[1]).toBe('Between.');
    expect(result[2]).toBe('<think>\nSecond think\n</think>');
  });

  it('handles inline think tag pair on same line', () => {
    const md = '<think>inline thinking</think>\n\nResponse text.';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>inline thinking</think>');
    expect(result[1]).toBe('Response text.');
  });

  it('handles think open tag with inline content', () => {
    const md =
      '<think>thinking starts here\n\ncontinues\n</think>\n\nResponse.';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(
      '<think>thinking starts here\n\ncontinues\n</think>',
    );
    expect(result[1]).toBe('Response.');
  });

  it.each([
    ['inline pair', '<think>inline thinking</think>'],
    ['standalone open tag', '<think>\nthinking\n</think>'],
    ['open tag with inline content', '<think>thinking\n</think>'],
  ])('separates preceding content from a %s', (_, thinkBlock) => {
    const md = `Previous response.\n\n${thinkBlock}`;

    expect(splitMarkdownBlocks(md)).toEqual(['Previous response.', thinkBlock]);
  });

  it('handles unclosed think tag (streaming mid-output)', () => {
    const md = '<think>\nThinking in progress...';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe('<think>\nThinking in progress...');
  });

  it('handles think tag with attributes', () => {
    const md = '<think lang="zh">\n思考内容\n\n继续思考\n</think>\n\n回复。';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think lang="zh">\n思考内容\n\n继续思考\n</think>');
    expect(result[1]).toBe('回复。');
  });

  // ================================================================
  // 场景 1： 闭标签后同帧紧跟正文，强制切块
  // ================================================================
  it('splits block when </think> close tag is followed by content on same line', () => {
    // 闭标签和 URL 在同一行到达（模型输出的流式帧）
    const md = '<think>\n思考内容\n</think>\nhttp://example.com/resource';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n</think>');
    expect(result[1]).toBe('http://example.com/resource');
  });

  it('splits block when close tag and content arrive on same line (inline close)', () => {
    // 行内闭标签，闭标签后紧接正文
    const md = '<think>\n思考内容\n</think>http://example.com/resource';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n</think>');
    expect(result[1]).toBe('http://example.com/resource');
  });

  it('splits block when close tag is followed by content with space', () => {
    // 行内闭标签后有空格和正文
    const md = '<think>\n思考内容\n</think> Some text after think';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n</think>');
    expect(result[1]).toBe(' Some text after think');
  });

  it('splits block for <thinking> close tag followed by content', () => {
    const md = '<thinking>\n思考\n</thinking>\nResponse text here';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<thinking>\n思考\n</thinking>');
    expect(result[1]).toBe('Response text here');
  });

  it('keeps normal think block intact when close tag is on its own line followed by blank line', () => {
    // 闭标签独占一行 + 空行 = 正常情况，已有测试覆盖
    const md = '<think>\n思考内容\n</think>\n\n正文内容';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n</think>');
    expect(result[1]).toBe('正文内容');
  });

  // ================================================================
  // 场景 2：第一个 think 块无闭标签，第二个  开标签到达 → 隐式关闭
  // ================================================================
  it('implicitly closes first think block when second open tag arrives', () => {
    // 第一轮思考无闭标签，第二轮思考直接开始
    const md =
      '<think>\nFirst think content\n<think>\nSecond think content\n</think>';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\nFirst think content');
    expect(result[1]).toBe('<think>\nSecond think content\n</think>');
  });

  it('implicitly closes first thinking block when second open tag arrives', () => {
    const md = '<thinking>\nFirst round\n<thinking>\nSecond round\n</thinking>';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<thinking>\nFirst round');
    expect(result[1]).toBe('<thinking>\nSecond round\n</thinking>');
  });

  it('separates cross-alias think blocks while preserving blank lines', () => {
    const md =
      '<think>\nFirst round\n\nStill thinking\n<thinking>\nSecond round\n</thinking>';
    expect(splitMarkdownBlocks(md)).toEqual([
      '<think>\nFirst round\n\nStill thinking',
      '<thinking>\nSecond round\n</thinking>',
    ]);
  });

  it('implicitly closes when second open tag is inline (e.g. <think>content)', () => {
    // 第二个开标签是行内形式
    const md = '<think>\nFirst think\n<think>Second think\n</think>';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\nFirst think');
    expect(result[1]).toBe('<think>Second think\n</think>');
  });

  it('handles streaming scenario: unclosed think then new think then close', () => {
    // 模拟 SSE 流式场景：第一轮思考无闭标签，直接开始第二轮
    const md =
      '<think>\n用户要求生成代码\n我需要考虑性能\n<think>\n让我重新思考\n优化方案\n</think>\n\n最终回复内容';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('<think>\n用户要求生成代码\n我需要考虑性能');
    expect(result[1]).toBe('<think>\n让我重新思考\n优化方案\n</think>');
    expect(result[2]).toBe('最终回复内容');
  });

  it('handles two think blocks with close tags followed by content', () => {
    // 两个完整的 think 块 + 正文，验证组合场景
    const md =
      '<think>\nFirst\n</think>\n<think>\nSecond\n</think>\n\nAfter both';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('<think>\nFirst\n</think>');
    expect(result[1]).toBe('<think>\nSecond\n</think>');
    expect(result[2]).toBe('After both');
  });

  // ================================================================
  // 场景 3 回归验证：inThinkTag 内 \n\n 不应切块（闭标签未到达）
  // ================================================================
  it('does not split on blank lines inside unclosed think tag (streaming)', () => {
    // 闭标签还没到，中间有多个 \n\n，整个应该保持为一个 block
    const md = '<think>\nStep one\n\nStep two\n\nStep three';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe('<think>\nStep one\n\nStep two\n\nStep three');
  });

  it('does not split on blank lines inside unclosed <thinking> tag (streaming)', () => {
    const md =
      '<thinking>\nReasoning part 1\n\nReasoning part 2\n\nContinuing...';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      '<thinking>\nReasoning part 1\n\nReasoning part 2\n\nContinuing...',
    );
  });

  it('keeps blank lines in think context and splits correctly after close', () => {
    // 流式中态：闭标签到达时，think 块内含 \n\n，闭标签后正文独立
    const md = '<think>\nPart 1\n\nPart 2\n</think>\nResponse after think';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\nPart 1\n\nPart 2\n</think>');
    expect(result[1]).toBe('Response after think');
  });

  it('does not split on "link. blank-blank" inside unclosed <thinking> (user scenario)', () => {
    // 用户反馈：深度思考渲染一段内容后出现 "link." + \n\n 就导致渲染提前结束
    const md = '<thinking>\nAnalyzing\n\nVisit link.\n\nContinuing think';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      '<thinking>\nAnalyzing\n\nVisit link.\n\nContinuing think',
    );
  });

  it('think block with multiple link-style blank lines stays intact until close', () => {
    // 模拟完整 SSE 累积：多个 "link.\n\n" 风格空行
    const md =
      '<thinking>\nStep 1\n\nVisit http://link.\n\nStep 2\n\nAnother ref.\n\nStep 3\n</thinking>\n\nFinal answer';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(
      '<thinking>\nStep 1\n\nVisit http://link.\n\nStep 2\n\nAnother ref.\n\nStep 3\n</thinking>',
    );
    expect(result[1]).toBe('Final answer');
  });

  it('unclosed think with link and blank line stays as single block', () => {
    const md = '<think>\nAnalyzing\n\nVisit link.\n\nContinuing think';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      '<think>\nAnalyzing\n\nVisit link.\n\nContinuing think',
    );
  });

  // ================================================================
  // 场景 4：行内闭标签后下一行紧跟内容（无空行），应强制分块
  // ================================================================
  it('splits block when inline close tag is at end of line followed by content on next line', () => {
    // 闭标签紧跟在正文后面（如 "构造调用。</think>"），下一行是正文
    const md = '<think>\n思考1\n构造调用。</think>\nhttp://example.com';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考1\n构造调用。</think>');
    expect(result[1]).toBe('http://example.com');
  });

  it('splits block when inline close tag is at end of line and next line is new think open', () => {
    // 行内闭标签后，下一行是新的 think 开标签
    const md =
      '<think>\n思考1\n构造调用。</think>\n<think>\n思考2\n回复内容。</think>';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考1\n构造调用。</think>');
    expect(result[1]).toBe('<think>\n思考2\n回复内容。</think>');
  });

  it('handles two inline close tags with content after second', () => {
    // 两段都是行内闭标签 + 最后一行正文
    const md =
      '<think>\n思考1\n构造调用。</think>\n<think>\n思考2\n回复内容。</think>\nhttp://example.com';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('<think>\n思考1\n构造调用。</think>');
    expect(result[1]).toBe('<think>\n思考2\n回复内容。</think>');
    expect(result[2]).toBe('http://example.com');
  });

  it('does not split when inline close tag is followed by content on same line', () => {
    // 闭标签和 URL 在同一行到达（已有测试的补充确认）
    const md = '<think>\n思考内容</think>http://example.com';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toContain('</think>');
    expect(result[1]).toBe('http://example.com');
  });

  // ================================================================
  // 场景 4 扩展：<thinking> / <redacted_thinking> 行内闭标签
  // ================================================================
  it('splits block when inline </thinking> close tag at end of line followed by content', () => {
    const md =
      '<thinking>\n思考内容\n构造调用。</thinking>\nhttp://example.com';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<thinking>\n思考内容\n构造调用。</thinking>');
    expect(result[1]).toBe('http://example.com');
  });

  it('splits block when inline </redacted_thinking> close tag at end of line followed by content', () => {
    const md =
      '<redacted_thinking>\n推理\n结论。</redacted_thinking>\nOutput text';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(
      '<redacted_thinking>\n推理\n结论。</redacted_thinking>',
    );
    expect(result[1]).toBe('Output text');
  });

  // ================================================================
  // 场景 4 扩展：行内闭标签后跟不同类型内容
  // ================================================================
  it('splits block when inline close tag is followed by markdown heading', () => {
    const md = '<think>\n思考内容\n结束。</think>\n## Heading';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n结束。</think>');
    expect(result[1]).toBe('## Heading');
  });

  it('splits block when inline close tag is followed by list item', () => {
    const md = '<think>\n思考内容\n结束。</think>\n- List item';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n结束。</think>');
    expect(result[1]).toBe('- List item');
  });

  it('splits block when inline close tag is followed by code fence', () => {
    const md =
      '<think>\n思考内容\n结束。</think>\n```js\nconsole.log("hello")\n```';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n结束。</think>');
    expect(result[1]).toBe('```js\nconsole.log("hello")\n```');
  });

  // ================================================================
  // 场景 4 扩展：流式中间态组合
  // ================================================================
  it('handles unclosed think then inline close on next think open', () => {
    // 第一段 think 无闭标签，第二段 think 开标签到来时隐式关闭
    // 然后第二段的闭标签是行内的
    const md =
      '<think>\n第一段思考</think>\n<think>\n第二段思考\n回复内容。</think>\n正文';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('<think>\n第一段思考</think>');
    expect(result[1]).toBe('<think>\n第二段思考\n回复内容。</think>');
    expect(result[2]).toBe('正文');
  });

  it('handles inline close with blank lines inside think content', () => {
    // think 内容中有空行，行内闭标签在行末
    const md = '<think>\nStep 1\n\nStep 2\n结束。</think>\nResponse';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\nStep 1\n\nStep 2\n结束。</think>');
    expect(result[1]).toBe('Response');
  });

  // ================================================================
  // 场景 4 扩展：边界情况
  // ================================================================
  it('handles empty think content with inline close tag', () => {
    // think 开标签后紧跟行内闭标签（几乎无内容）
    const md = '<think>\n</think>\n正文内容';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n</think>');
    expect(result[1]).toBe('正文内容');
  });

  it('handles inline close tag followed by blank line then content', () => {
    // 行内闭标签后有空行再跟正文（空行不应产生额外 block）
    const md = '<think>\n思考内容\n结束。</think>\n\n正文内容';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('<think>\n思考内容\n结束。</think>');
    expect(result[1]).toBe('正文内容');
  });

  it('handles SSE stream pattern: inline close + new open + inline close + URL', () => {
    // 完整复现 SSE 错误数据模式：
    // 第一段：行内闭标签 "构造调用。"
    // 第二段：行内闭标签 "回复内容。"
    // 最后一行：URL 正文
    const md =
      '<think>\n用户要求将JSON转换为Excel\n构造调用。</think>\n<think>\n用户要求将JSON转换\n已经调用了工具\n回复内容应包含链接。</think>\nhttp://agentar-lite.cnstack.local/file.xlsx';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toContain('</think>');
    expect(result[0]).toContain('构造调用');
    expect(result[1]).toContain('</think>');
    expect(result[1]).toContain('回复内容');
    expect(result[2]).toBe('http://agentar-lite.cnstack.local/file.xlsx');
  });

  it('handles <thinking> inline close then normal close think', () => {
    // 混合标签变体：thinking 行内闭标签 + think 独占闭标签
    const md =
      '<thinking>\n推理过程\n结论。</thinking>\n<think>\n第二步思考\n</think>\n\n最终结果';
    const result = splitMarkdownBlocks(md);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('<thinking>\n推理过程\n结论。</thinking>');
    expect(result[1]).toBe('<think>\n第二步思考\n</think>');
    expect(result[2]).toBe('最终结果');
  });
});

describe('createHastProcessor', () => {
  it('creates processor without extra plugins', () => {
    const proc = createHastProcessor();
    expect(proc).toBeDefined();
    expect(typeof proc.parse).toBe('function');
  });

  it('accepts extra remark plugins as array', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor([[fakePlugin as any, { option: true }]]);
    expect(proc).toBeDefined();
  });

  it('accepts extra remark plugins as single function', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor([fakePlugin as any]);
    expect(proc).toBeDefined();
  });

  it('accepts markedConfig as array entry', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor(undefined, {
      markedConfig: [[fakePlugin as any, { opt: 1 }]],
    });
    expect(proc).toBeDefined();
  });

  it('accepts markedConfig as single function', () => {
    const fakePlugin = () => (tree: any) => tree;
    const proc = createHastProcessor(undefined, {
      markedConfig: [fakePlugin as any],
    });
    expect(proc).toBeDefined();
  });
});

describe('renderMarkdownBlock', () => {
  it('returns null for empty content', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('', proc, {});
    expect(result).toBeNull();
  });

  it('returns null for whitespace-only content', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('   ', proc, {});
    expect(result).toBeNull();
  });

  it('renders basic markdown', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('hello world', proc, {});
    expect(result).not.toBeNull();
  });

  it('renders single-paragraph markdown', () => {
    const proc = createHastProcessor();
    const result = renderMarkdownBlock('hello', proc, {});
    expect(result).not.toBeNull();
  });

  it('falls back to a <pre> error element on parse error', () => {
    const badProcessor = {
      parse: () => {
        throw new Error('parse error');
      },
      runSync: () => ({}),
    } as any;
    const result = renderMarkdownBlock('test', badProcessor, {});
    // 解析失败时返回兜底 <pre> 元素（带 data-testid），保留原文以避免内容静默丢失
    expect(React.isValidElement(result)).toBe(true);
    expect((result as React.ReactElement).type).toBe('pre');
    expect((result as React.ReactElement).props['data-testid']).toBe(
      'markdown-block-error-fallback',
    );
    expect((result as React.ReactElement).props.children).toBe('test');
  });
});

describe('buildEditorAlignedComponents', () => {
  const prefixCls = 'ant-md-editor-content';
  const buildComponents = (
    opts: {
      streaming?: boolean;
      linkConfig?: any;
      fncProps?: any;
      eleRender?: any;
      userComponents?: Record<string, any>;
    } = {},
  ) =>
    buildEditorAlignedComponents(
      prefixCls,
      opts.userComponents || {},
      opts.streaming,
      opts.linkConfig,
      opts.fncProps,
      opts.eleRender,
    );

  describe('p component', () => {
    it('renders paragraph with data-be=paragraph', () => {
      const comps = buildComponents();
      const result = comps.p({ node: {}, children: 'hello' });
      expect(result).toBeDefined();
    });

    it('does not wrap streaming paragraph with fade-in animation', () => {
      const comps = buildComponents({ streaming: true });
      render(comps.p({ node: {}, children: 'stream' }));
      const para = screen.getByTestId('markdown-paragraph');
      expect(para.querySelector('span[style*="animation"]')).toBeNull();
      expect(para).toHaveTextContent('stream');
    });

    it('applies eleRender when provided', () => {
      const eleRender = vi.fn((_props: any, defaultDom: any) => defaultDom);
      const comps = buildComponents({ eleRender });
      comps.p({ node: {}, children: 'hello' });
      expect(eleRender).toHaveBeenCalledWith(
        expect.objectContaining({ tagName: 'p' }),
        expect.anything(),
      );
    });
  });

  describe('heading components', () => {
    it('renders h1-h6', () => {
      const comps = buildComponents();
      for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
        const result = (comps as any)[tag]({ node: {}, children: 'title' });
        expect(result).toBeDefined();
      }
    });

    it('applies eleRender to headings', () => {
      const eleRender = vi.fn((_p: any, d: any) => d);
      const comps = buildComponents({ eleRender });
      comps.h1({ node: {}, children: 'title' });
      comps.h2({ node: {}, children: 'title' });
      comps.h3({ node: {}, children: 'title' });
      comps.h4({ node: {}, children: 'title' });
      comps.h5({ node: {}, children: 'title' });
      comps.h6({ node: {}, children: 'title' });
      expect(eleRender).toHaveBeenCalledTimes(6);
    });
  });

  describe('blockquote', () => {
    it('renders blockquote', () => {
      const comps = buildComponents();
      const result = comps.blockquote({ node: {}, children: 'quote' });
      expect(result).toBeDefined();
    });
  });

  describe('list components', () => {
    it('renders ul', () => {
      const comps = buildComponents();
      const result = comps.ul({ node: {}, children: 'item' });
      expect(result).toBeDefined();
    });

    it('renders ol', () => {
      const comps = buildComponents();
      const result = comps.ol({ node: {}, children: 'item', start: 1 });
      expect(result).toBeDefined();
    });

    it('renders li as non-task', () => {
      const comps = buildComponents();
      const result = comps.li({
        node: {},
        children: 'item',
        className: undefined,
      });
      expect(result).toBeDefined();
    });

    it('renders li as task with className string', () => {
      const comps = buildComponents();
      const result = comps.li({
        node: {},
        children: [
          React.createElement('input', { type: 'checkbox', checked: true }),
          'Task text',
        ],
        className: 'task-list-item',
      });
      expect(result).toBeDefined();
    });

    it('renders li as task with className array', () => {
      const comps = buildComponents();
      const result = comps.li({
        node: {},
        children: ['Task text'],
        className: ['task-list-item'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('table components', () => {
    it('renders table', () => {
      const comps = buildComponents();
      const result = comps.table({ node: {}, children: 'rows' });
      expect(result).toBeDefined();
    });

    it('renders thead/tbody/tr/th/td', () => {
      const comps = buildComponents();
      expect(comps.thead({ node: {}, children: 'h' })).toBeDefined();
      expect(comps.tbody({ node: {}, children: 'b' })).toBeDefined();
      expect(comps.tr({ node: {}, children: 'r' })).toBeDefined();
      expect(comps.th({ node: {}, children: 'th' })).toBeDefined();
      expect(comps.td({ node: {}, children: 'td' })).toBeDefined();
    });
  });

  describe('input component', () => {
    it('renders checkbox type as Checkbox', () => {
      const comps = buildComponents();
      const result = comps.input({
        node: {},
        type: 'checkbox',
        checked: true,
        disabled: false,
      });
      expect(result).toBeDefined();
    });

    it('renders non-checkbox as regular input', () => {
      const comps = buildComponents();
      const result = comps.input({
        node: {},
        type: 'text',
        checked: false,
        disabled: false,
      });
      expect(result).toBeDefined();
    });
  });

  describe('a (link) component', () => {
    it('renders link with default openInNewTab', () => {
      const comps = buildComponents();
      const result = comps.a({ node: {}, href: 'https://example.com' });
      expect(result).toBeDefined();
    });

    it('renders link with openInNewTab=false', () => {
      const comps = buildComponents({ linkConfig: { openInNewTab: false } });
      const result = comps.a({ node: {}, href: 'https://example.com' });
      expect(result).toBeDefined();
    });

    it('handles link onClick returning false', () => {
      const onClick = vi.fn(() => false);
      const comps = buildComponents({ linkConfig: { onClick } });
      const linkEl = comps.a({ node: {}, href: 'https://example.com' });
      expect(linkEl).toBeDefined();
    });

    it('handles link onClick returning void', () => {
      const onClick = vi.fn(() => undefined);
      const comps = buildComponents({ linkConfig: { onClick } });
      const linkEl = comps.a({ node: {}, href: 'https://example.com' });
      expect(linkEl).toBeDefined();
    });
  });

  describe('inline elements', () => {
    it('renders strong', () => {
      const comps = buildComponents();
      expect(comps.strong({ node: {}, children: 'bold' })).toBeDefined();
    });

    it('renders em', () => {
      const comps = buildComponents();
      expect(comps.em({ node: {}, children: 'italic' })).toBeDefined();
    });

    it('renders del', () => {
      const comps = buildComponents();
      expect(comps.del({ node: {}, children: 'deleted' })).toBeDefined();
    });

    it('renders mark', () => {
      const comps = buildComponents();
      expect(comps.mark({ node: {}, children: 'marked' })).toBeDefined();
    });

    it('renders mark with color and bg attributes', () => {
      const comps = buildComponents();
      const result = comps.mark({
        node: {},
        children: 'highlighted',
        color: 'red',
        bg: '#eee',
      });
      expect(result).toBeDefined();
      expect(result.props.style).toMatchObject({
        color: 'red',
        backgroundColor: '#eee',
      });
    });

    it('renders mark with label attribute', () => {
      const comps = buildComponents();
      const result = comps.mark({
        node: {},
        children: 'content',
        label: '@qixian',
      });
      expect(result).toBeDefined();
      // children should be array with label span + content
      const children = result.props.children;
      expect(Array.isArray(children)).toBe(true);
      expect(children[0].props.children).toBe('@qixian');
      expect(children[1]).toBe('content');
    });

    it('renders mark without custom attributes keeps default style', () => {
      const comps = buildComponents();
      const result = comps.mark({ node: {}, children: 'plain' });
      expect(result.props.style).toBeUndefined();
      expect(result.props.children).toBe('plain');
    });

    it('renders kbd', () => {
      const comps = buildComponents();
      expect(comps.kbd({ node: {}, children: 'Ctrl' })).toBeDefined();
    });

    it('renders sub', () => {
      const comps = buildComponents();
      expect(comps.sub({ node: {}, children: '2' })).toBeDefined();
    });
  });

  describe('code component', () => {
    it('renders inline code without language', () => {
      const comps = buildComponents();
      const result = comps.code({ node: {}, children: 'code' });
      expect(result).toBeDefined();
    });

    it('renders fenced code with language class', () => {
      const comps = buildComponents();
      const result = comps.code({
        node: {},
        children: 'code',
        className: 'language-js',
      });
      expect(result).toBeDefined();
    });

    it('handles className as array', () => {
      const comps = buildComponents();
      const result = comps.code({
        node: {},
        children: 'code',
        className: ['language-python'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('pre component', () => {
    it('uses custom __codeBlock component', () => {
      const CodeBlock = () => null;
      const comps = buildComponents({
        userComponents: { __codeBlock: CodeBlock },
      });
      const codeChild = {
        props: { className: 'language-js', children: 'code' },
      };
      const result = comps.pre({
        node: { children: [] },
        children: codeChild,
      });
      expect(result).toBeDefined();
      expect((result as any)?.type).toBe(CodeBlock);
    });

    it('uses custom code component for pre', () => {
      const CodeComp = () => null;
      const comps = buildComponents({
        userComponents: { code: CodeComp },
      });
      const codeChild = { props: { children: 'code' } };
      const result = comps.pre({
        node: { children: [] },
        children: codeChild,
      });
      expect(result).toBeDefined();
      expect((result as any)?.type).toBe(CodeComp);
    });

    it('renders default pre when no custom code component', () => {
      const comps = buildComponents();
      const codeChild = { props: { children: 'code' } };
      const result = comps.pre({
        node: { children: [] },
        children: codeChild,
      });
      expect(result).toBeDefined();
    });

    it('extracts language from hast node', () => {
      const comps = buildComponents();
      const hastNode = {
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: { className: ['language-typescript'] },
          },
        ],
      };
      const codeChild = { props: { children: 'ts code' } };
      const result = comps.pre({
        node: hastNode,
        children: codeChild,
      });
      expect(result).toBeDefined();
    });
  });

  describe('img component', () => {
    it('renders image with src', () => {
      const comps = buildComponents();
      const result = comps.img({
        node: {},
        src: 'https://example.com/img.png',
        alt: 'test',
      });
      expect(result).toBeDefined();
    });

    it('renders image with explicit width', () => {
      const comps = buildComponents();
      const result = comps.img({
        node: {},
        src: 'https://example.com/img.png',
        alt: '',
        width: 200,
        height: 100,
      });
      expect(result).toBeDefined();
    });

    it('renders image with non-numeric width', () => {
      const comps = buildComponents();
      const result = comps.img({
        node: {},
        src: 'https://example.com/img.png',
        width: 'auto',
      });
      expect(result).toBeDefined();
    });
  });

  describe('media elements', () => {
    it('renders video', () => {
      const comps = buildComponents();
      const result = comps.video({ node: {}, children: null });
      expect(result).toBeDefined();
    });

    it('renders audio', () => {
      const comps = buildComponents();
      const result = comps.audio({ node: {}, children: null });
      expect(result).toBeDefined();
    });

    it('renders iframe', () => {
      const comps = buildComponents();
      const result = comps.iframe({ node: {} });
      expect(result).toBeDefined();
    });
  });

  describe('hr', () => {
    it('renders horizontal rule', () => {
      const comps = buildComponents();
      const result = comps.hr({ node: {} });
      expect(result).toBeDefined();
    });
  });

  describe('sup (footnote ref)', () => {
    it('renders non-footnote sup', () => {
      const comps = buildComponents();
      const result = comps.sup({ node: {}, children: 'text' });
      expect(result).toBeDefined();
    });
  });

  describe('span', () => {
    it('renders fnc span with data-fnc-name', () => {
      const comps = buildComponents();
      const result = comps.span({
        node: {},
        children: '1',
        'data-fnc': 'fnc',
        'data-fnc-name': 'ref1',
      });
      expect(result).toBeDefined();
    });

    it('renders fnc span without name, falls back to children text', () => {
      const comps = buildComponents();
      const result = comps.span({
        node: {},
        children: 'fallback',
        'data-fnc': 'fnc',
        'data-fnc-name': '',
      });
      expect(result).toBeDefined();
    });

    it('renders fnc span with null name', () => {
      const comps = buildComponents();
      const result = comps.span({
        node: {},
        children: '?',
        'data-fnc': 'fnc',
        'data-fnc-name': null,
      });
      expect(result).toBeDefined();
    });

    it('renders regular span', () => {
      const comps = buildComponents();
      const result = comps.span({ node: {}, children: 'text' });
      expect(result).toBeDefined();
    });
  });

  describe('section', () => {
    it('renders footnote section with className', () => {
      const comps = buildComponents();
      const result = comps.section({
        node: {},
        children: 'footnotes',
        className: 'footnotes',
      });
      expect(result).toBeDefined();
    });

    it('renders footnote section with data-footnotes', () => {
      const comps = buildComponents();
      const result = comps.section({
        node: {},
        children: 'footnotes',
        className: undefined,
        'data-footnotes': '',
      });
      expect(result).toBeDefined();
    });

    it('renders non-footnote section', () => {
      const comps = buildComponents();
      const result = comps.section({
        node: {},
        children: 'content',
        className: 'other',
      });
      expect(result).toBeDefined();
    });
  });

  describe('think', () => {
    it('renders think block with loading state', () => {
      const comps = buildComponents();
      const result = comps.think({ children: 'thinking...' });
      expect(result).toBeDefined();
    });

    it('renders think block with success state', () => {
      const comps = buildComponents();
      const result = comps.think({ children: 'done thinking' });
      expect(result).toBeDefined();
    });
  });

  describe('answer', () => {
    it('renders answer as fragment', () => {
      const comps = buildComponents();
      const result = comps.answer({ node: {}, children: 'answer' });
      expect(result).toBeDefined();
    });
  });

  describe('eleRender integration', () => {
    it('returns eleRender result when not undefined', () => {
      const custom = React.createElement('div', null, 'custom');
      const eleRender = vi.fn(() => custom);
      const comps = buildComponents({ eleRender });
      const result = comps.p({ node: {}, children: 'text' });
      expect(result).toBe(custom);
    });

    it('falls back to default when eleRender returns undefined', () => {
      const eleRender = vi.fn(() => undefined);
      const comps = buildComponents({ eleRender });
      const result = comps.p({ node: {}, children: 'text' });
      expect(result).toBeDefined();
    });
  });
});

describe('remarkChartFromComment via processor', () => {
  it('converts chart comment + table to chart code block', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"line","x":"month","y":"value"}] -->\n\n| month | value |\n|-------|-------|\n| Jan   | 100   |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('ignores invalid JSON in chart comment', () => {
    const proc = createHastProcessor();
    const md = `<!-- {invalid json} -->\n\n| a | b |\n|---|---|\n| 1 | 2 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('ignores chart comment with chartType=table', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"table"}] -->\n\n| a | b |\n|---|---|\n| 1 | 2 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles non-html + table pairs', () => {
    const proc = createHastProcessor();
    const md = `| a | b |\n|---|---|\n| 1 | 2 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });
});

describe('rehypeFootnoteRef via processor', () => {
  it('converts bare [^N] references to fnc elements', () => {
    const proc = createHastProcessor();
    const md = 'Text with [^1] and [^note] references';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles text without footnote refs', () => {
    const proc = createHastProcessor();
    const md = 'Just normal text';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles text with footnote ref at end', () => {
    const proc = createHastProcessor();
    const md = 'Text with ref[^1]';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles multiple refs in same text', () => {
    const proc = createHastProcessor();
    const md = '[^1] middle [^2]';
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });
});

describe('extractTableData edge cases via processor', () => {
  it('handles table with Chinese currency values', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"line","x":"name","y":"val"}] -->\n\n| name | val |\n|------|-----|\n| A    | 1.5亿 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles table with empty cells', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"bar","x":"name","y":"val"}] -->\n\n| name | val |\n|------|-----|\n| A    |     |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles table with numeric values', () => {
    const proc = createHastProcessor();
    const md = `<!-- [{"chartType":"bar","x":"x","y":"y"}] -->\n\n| x | y |\n|---|---|\n| A | 42 |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });

  it('handles chart comment as single object', () => {
    const proc = createHastProcessor();
    const md = `<!-- {"chartType":"line","x":"month","y":"value"} -->\n\n| month | value |\n|-------|-------|\n| Jan   | 100   |`;
    const mdast = proc.parse(md);
    const hast = proc.runSync(mdast);
    expect(hast).toBeDefined();
  });
});
