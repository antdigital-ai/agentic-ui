/**
 * Generate a complete HTML document from content
 *
 * @param content - The HTML content string
 * @param title - The document title
 * @param styles - Additional CSS styles to include
 * @returns A complete HTML document as a string
 */
export const generateHtmlDocument = (
  content: string,
  title: string = 'Markdown Export',
  styles: string = '',
): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      padding: 12px;
      max-width: 900px;
      margin: 0 auto;
      color: #333;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 16px;
      overflow: auto;
    }
    code {
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      padding: 0.2em 0.4em;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    img {
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
      vertical-align: middle;
    }
    th {
      background-color: #f6f8fa;
    }
    @media screen and (max-width: 768px) {
      th, td {
        padding: 2px;
      }
    }
    ${styles}
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
};

/**
 * Export HTML content to a file
 *
 * @param htmlContent - The HTML content to export
 * @param filename - The name of the file to save
 */
export const exportHtml = (
  htmlContent: string,
  filename: string = 'export.html',
): void => {
  try {
    const fullHtml = generateHtmlDocument(htmlContent);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error exporting HTML:', error);
  }
};
