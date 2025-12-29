interface TemplateData {
  [key: string]: string | number | boolean;
}

export class TemplateEngine {
  private static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static render(template: string, data: TemplateData): string {
    // 首先转义所有的数据值
    const escapedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? this.escapeHtml(value) : value;

      if (typeof value === 'object' && value !== null && value !== undefined) {
        acc[key] = JSON.stringify(value);
      }
      return acc;
    }, {} as TemplateData);

    // 替换模板中的变量
    const rendered = Object.entries(escapedData).reduce(
      (html, [key, value]) => {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        return html.replace(placeholder, String(value));
      },
      template,
    );

    return rendered;
  }
}
