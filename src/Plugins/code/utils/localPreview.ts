/**
 * @fileoverview 本地预览工具函数
 * 支持在新窗口打开 HTML 或 Markdown（转为 HTML 后）内容
 */

import { markdownToHtml } from '../../../MarkdownEditor/editor/utils/markdownToHtml';

const MARKDOWN_PREVIEW_STYLE = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #24292e;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
    background: #fff;
  }
  h1, h2, h3, h4, h5, h6 {
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }
  pre {
    background: #f6f8fa;
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
  }
  code {
    background: rgba(175, 184, 193, 0.2);
    border-radius: 3px;
    font-size: 85%;
    padding: 0.2em 0.4em;
  }
  pre code {
    background: transparent;
    padding: 0;
    font-size: inherit;
  }
  blockquote {
    border-left: 4px solid #d0d7de;
    color: #57606a;
    margin: 0;
    padding: 0 1em;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #d0d7de;
    padding: 6px 13px;
  }
  tr:nth-child(even) {
    background: #f6f8fa;
  }
  img {
    max-width: 100%;
  }
  a {
    color: #0969da;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  hr {
    border: none;
    border-top: 1px solid #d0d7de;
  }
`;

function buildHtmlDocument(body: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous" />
</head>
<body>
${body}
</body>
</html>`;
}

function openBlobInNewTab(html: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    // 在新窗口加载完毕后释放 Blob URL
    win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
  } else {
    // 弹窗被拦截时延迟释放
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

/**
 * 在新标签页打开 HTML 内容的本地预览（允许执行 JavaScript）
 */
export function openHtmlLocalPreview(htmlCode: string): void {
  const needsDocumentWrapper =
    !/<html[\s>]/i.test(htmlCode) && !/<!DOCTYPE/i.test(htmlCode);

  const fullHtml = needsDocumentWrapper
    ? buildHtmlDocument(htmlCode, 'HTML Preview')
    : htmlCode;

  openBlobInNewTab(fullHtml);
}

/**
 * 将 Markdown 转换为 HTML 后在新标签页打开本地预览
 */
export async function openMarkdownLocalPreview(markdownCode: string): Promise<void> {
  const bodyHtml = await markdownToHtml(markdownCode, undefined, {
    openLinksInNewTab: true,
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Markdown Preview</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous" />
  <style>${MARKDOWN_PREVIEW_STYLE}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  openBlobInNewTab(fullHtml);
}
