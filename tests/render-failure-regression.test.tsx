/**
 * 渲染失败回归测试 - 针对上个大版本引入的变更导致的渲染问题
 *
 * 覆盖场景（参考 changelog v2.29.56 - v2.30.1）:
 * - 仅 ::: 容器为指令；行内 :foo 为普通文本
 * - 语雀文档格式（表格+时间格式如 02:20:31 被误解析为 directive）
 * - Bubble EXCEPTION 状态下空、null、undefined 内容
 * - MarkdownRenderer 流式渲染
 * - ::: 容器语法
 */
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  AIBubble,
  MarkdownEditor,
  MarkdownRenderer,
  markdownToHtmlSync,
} from '../src';

describe('render-failure-regression', () => {
  describe('MarkdownEditor - textDirective/语雀/容器不应导致渲染失败', () => {
    it('应正确渲染包含 :icon[check] 普通文本（不作为指令）', () => {
      expect(() => {
        render(
          <MarkdownEditor
            readonly
            initValue="文本中有 :icon[check] 这样的行内指令"
            reportMode
          />,
        );
      }).not.toThrow();
    });

    it('应正确渲染语雀文档（含文档信息表、时间格式、有序列表）', () => {
      const yuqueMarkdown = `| 字段 | 内容 |
|------|------|
| 标题 | 跟业务侧的对接 |
| slug | mgipy1eta0o1l13b |
| 字数 | 258 |
| 创建时间 | 2026-03-18 02:20:31 |
| 更新时间 | 2026-03-18 04:53:36 |

1. **317跟平台科技对接**（参会人：一啊，小雪，谷水拉的会）
   1. 主要沟通了整个平台科技和创新孵化的产品流程
   2. 平台科技提供：https://example.com`;

      expect(() => {
        render(
          <MarkdownEditor readonly initValue={yuqueMarkdown} reportMode />,
        );
      }).not.toThrow();
    });

    it('应正确渲染 ::: 容器语法（info/warning/success/error）', () => {
      const containerMarkdown = `:::info

这是信息提示块。

:::

:::warning

警告内容

:::`;

      expect(() => {
        render(
          <MarkdownEditor readonly initValue={containerMarkdown} reportMode />,
        );
      }).not.toThrow();
    });

    it('应正确渲染 :: 双冒号容器语法（::warning 等同于 :::warning）', () => {
      const twoColonMarkdown = `::warning
No API key found for provider "anthropic". Auth store: /home/node/.openclaw/agents/main/agent/auth-profiles.json
Logs: openclaw logs --follow

:::`;

      expect(() => {
        render(
          <MarkdownEditor
            readonly
            initValue={twoColonMarkdown}
            reportMode
          />,
        );
      }).not.toThrow();
    });

    it('应正确渲染混合表格与列表内容', () => {
      const mixedMarkdown = `# 标题

| 列1 | 列2 |
| --- | --- |
| 值1 | 值2 |

1. 第一项
2. 第二项`;

      expect(() => {
        render(
          <MarkdownEditor readonly initValue={mixedMarkdown} reportMode />,
        );
      }).not.toThrow();
    });

    it('应正确渲染含时间格式的文本（避免 02:20:31 被误解析为 directive）', () => {
      const timeMarkdown = `会议时间：2026-03-18 02:20:31 至 04:53:36`;
      expect(() => {
        render(
          <MarkdownEditor readonly initValue={timeMarkdown} reportMode />,
        );
      }).not.toThrow();
    });

    it('应正确渲染图片卡片（![](url) 解析为 card+media）', () => {
      expect(() => {
        render(
          <MarkdownEditor readonly initValue="![](test.jpg)" reportMode />,
        );
      }).not.toThrow();
    });

    it('应正确渲染表格卡片（表格被 wrapperCardNode 包装）', () => {
      const tableMarkdown = `| 列1 | 列2 |
| --- | --- |
| a   | b   |`;
      expect(() => {
        render(
          <MarkdownEditor readonly initValue={tableMarkdown} reportMode />,
        );
      }).not.toThrow();
    });

    it('应正确渲染视频卡片', () => {
      expect(() => {
        render(
          <MarkdownEditor
            readonly
            initValue={'<video src="test.mp4" controls />'}
            reportMode
          />,
        );
      }).not.toThrow();
    });
  });

  describe('Bubble - EXCEPTION 状态下空/null/undefined 内容不应导致渲染失败', () => {
    const baseOriginData = {
      role: 'bot' as const,
      content: '',
      isFinished: true,
    };

    it('EXCEPTION 状态 + content 为空字符串时应正常渲染', () => {
      expect(() => {
        render(
          <ConfigProvider>
            <AIBubble
              originData={{
                ...baseOriginData,
                content: '',
                extra: { answerStatus: 'EXCEPTION' as const },
              }}
            />
          </ConfigProvider>,
        );
      }).not.toThrow();
    });

    it('EXCEPTION 状态 + content 为 undefined 时应正常渲染', () => {
      expect(() => {
        render(
          <ConfigProvider>
            <AIBubble
              originData={{
                ...baseOriginData,
                content: undefined as unknown as string,
                extra: { answerStatus: 'EXCEPTION' as const },
              }}
            />
          </ConfigProvider>,
        );
      }).not.toThrow();
    });

    it('EXCEPTION 状态 + content 为 null 时应正常渲染', () => {
      expect(() => {
        render(
          <ConfigProvider>
            <AIBubble
              originData={{
                ...baseOriginData,
                content: null as unknown as string,
                extra: { answerStatus: 'EXCEPTION' as const },
              }}
            />
          </ConfigProvider>,
        );
      }).not.toThrow();
    });

    it('answerStatus 存在且 content 缺失时应走 EXCEPTION 分支并正常渲染', () => {
      expect(() => {
        render(
          <ConfigProvider>
            <AIBubble
              originData={{
                ...baseOriginData,
                content: undefined as unknown as string,
                extra: { answerStatus: 'error' as const },
              }}
            />
          </ConfigProvider>,
        );
      }).not.toThrow();
    });
  });

  describe('MarkdownRenderer - 流式/只读渲染不应失败', () => {
    it('应正确渲染基础 Markdown', () => {
      expect(() => {
        render(<MarkdownRenderer content="# Hello\n\nWorld" />);
      }).not.toThrow();
    });

    it('应正确渲染含 :icon[check] 普通文本的 Markdown', () => {
      expect(() => {
        render(
          <MarkdownRenderer content="文本中有 :icon[check] 这样的行内指令" />,
        );
      }).not.toThrow();
    });

    it('应正确渲染 ::: 容器', () => {
      expect(() => {
        render(
          <MarkdownRenderer
            content={`:::info

提示内容

:::`}
          />,
        );
      }).not.toThrow();
    });

    it('应正确渲染 :: 双冒号容器（::warning 语法）', () => {
      expect(() => {
        render(
          <MarkdownRenderer
            content={`::warning
No API key found.
Logs: openclaw logs --follow

:::`}
          />,
        );
      }).not.toThrow();
    });

    it('流式模式下应正常渲染', async () => {
      let result: { container: HTMLElement } | null = null;
      expect(() => {
        result = render(
          <MarkdownRenderer content="# Title" streaming isFinished={false} />,
        );
      }).not.toThrow();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result?.container).toBeTruthy();
    });

    it('空 content 时应正常渲染', () => {
      expect(() => {
        render(<MarkdownRenderer content="" />);
      }).not.toThrow();
    });
  });

  describe('markdownToHtml - 行内文本/语雀内容转换不应抛错', () => {
    it('行内 :icon[check] 转 HTML 时应保留原文', () => {
      expect(() => {
        const html = markdownToHtmlSync(
          '文本中有 :icon[check] 这样的行内指令',
        );
        expect(html).toContain(':icon[check]');
      }).not.toThrow();
    });

    it('语雀文档（含时间格式）转 HTML 时应不抛错', () => {
      const yuque = `| 创建时间 | 2026-03-18 02:20:31 |
| 更新时间 | 2026-03-18 04:53:36 |`;
      expect(() => {
        const html = markdownToHtmlSync(yuque);
        expect(html).toContain('2026-03-18');
      }).not.toThrow();
    });
  });
});
