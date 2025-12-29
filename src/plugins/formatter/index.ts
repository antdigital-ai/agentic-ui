/* eslint-disable no-useless-escape */
/**
 * 格式化 Markdown 文本
 * 1. 规范化段落之间的换行符（确保段落之间只有两个换行符）
 * 2. 添加盘古之白（中英文之间添加空格）
 */
export class MarkdownFormatter {
  /**
   * 规范化段落之间的换行符
   * @param text Markdown 文本
   * @returns 格式化后的文本
   */
  static normalizeParagraphs(text: string): string {
    // 将所有的换行符统一为 \n
    let normalizedText = text?.replace(/\r\n/g, '\n')?.replace(/\r/g, '\n');

    // 清理开头和结尾的空白字符
    normalizedText = normalizedText.trim();

    // 将连续的空白行（包括只包含空格的行）替换为单个换行符
    normalizedText = normalizedText?.replace(/\n[\s\n]+/g, '\n');

    // 保护表格内容：识别表格行并保持它们的单行换行符
    const lines = normalizedText.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      result.push(currentLine);

      // 如果不是最后一行，决定添加什么样的换行符
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];

        // 检查当前行和下一行是否是表格行
        const isCurrentTableRow = /^\s*\|.*\|\s*$/.test(currentLine);
        const isNextTableRow = /^\s*\|.*\|\s*$/.test(nextLine);

        // 如果当前行和下一行都是表格行，只添加一个换行符
        // 否则添加两个换行符（段落分隔）
        if (isCurrentTableRow && isNextTableRow) {
          // 表格行之间保持单换行符
          // 不添加额外的换行符，join会自动添加一个
        } else {
          // 段落之间添加额外的空行
          result.push('');
        }
      }
    }

    return result.join('\n')?.replace(/\n+$/, '');
  }

  /**
   * 在中英文之间添加空格（盘古之白）
   * @param text Markdown 文本
   * @returns 格式化后的文本
   */
  static addPanguSpacing(text: string): string {
    // 保存 HTML 内容、Markdown 特殊语法
    const placeholders: { [key: string]: string } = {};
    let counter = 0;

    // 临时替换需要保护的内容
    const preservedText = text
      // 保存代码块
      ?.replace(/```[\s\S]*?```/g, (match) => {
        const placeholder = `__CODEBLOCK_${counter}__`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
      })
      // 保存 HTML 注释
      ?.replace(/(<!--[\s\S]*?-->)/g, (match) => {
        const placeholder = `__COMMENT_${counter}__`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
      })
      // 保存 Markdown 链接（包含 HTML 标签的情况）
      ?.replace(/\[([^\]]*<[^>]+>[^\]]*)\]\([^)]+\)/g, (match) => {
        const placeholder = `__LINK_HTML_${counter}__`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
      })
      // 保存完整的 HTML 标签块（包括内容）
      ?.replace(/(<[^>]+>.*?<\/[^>]+>|<[^>]+>)/g, (match) => {
        const placeholder = `__HTML_${counter}__`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
      })
      // 保存普通 Markdown 链接
      ?.replace(/(\[([^\]]+)\]\([^)]+\))/g, (match) => {
        const placeholder = `__LINK_${counter}__`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
      })
      // 保存行内代码
      ?.replace(/(`[^`]+`)/g, (match) => {
        const placeholder = `__CODE_${counter}__`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
      });

    // 添加空格
    let spacedText = preservedText
      // 在中文和英文之间添加空格
      ?.replace(/([\u4e00-\u9fa5])([A-Za-z])/g, '$1 $2')
      ?.replace(/([A-Za-z])([\u4e00-\u9fa5])/g, '$1 $2')
      // 在中文和数字之间添加空格
      ?.replace(/([\u4e00-\u9fa5])(\d+)/g, '$1 $2')
      ?.replace(/(\d+)([\u4e00-\u9fa5])/g, '$1 $2')
      // 在中文和括号之间添加空格
      ?.replace(/([\u4e00-\u9fa5])([\(\)])/g, '$1 $2')
      ?.replace(/([\(\)])([\u4e00-\u9fa5])/g, '$1 $2')
      // 修复可能出现的多余空格，但保留换行符
      ?.replace(/([^\s\n])\s+([^\s\n])/g, '$1 $2');

    // 还原所有保护的内容
    Object.entries(placeholders).forEach(([placeholder, original]) => {
      spacedText = spacedText?.replace(
        new RegExp(`(\\s*)${placeholder}(\\s*)`),
        (_, before, after) => {
          // 确保特殊语法前后有空格
          const needSpaceBefore =
            before === '' &&
            /[\u4e00-\u9fa5]$/.test(spacedText.split(placeholder)[0]);
          const needSpaceAfter =
            after === '' &&
            /^[\u4e00-\u9fa5]/.test(spacedText.split(placeholder)[1]);
          return `${needSpaceBefore ? ' ' : ''}${original}${needSpaceAfter ? ' ' : ''}`;
        },
      );
    });

    return spacedText;
  }

  /**
   * 格式化 Markdown 文本
   * @param text Markdown 文本
   * @returns 格式化后的文本
   */
  static format(text: string): string {
    // 首先保存代码块内容
    const codeBlocks: { [key: string]: string } = {};
    let counter = 0;
    if (!text) {
      return '';
    }

    // 保存代码块内容
    const textWithoutCodeBlocks = text?.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODEBLOCK_${counter}__`;
      codeBlocks[placeholder] = match;
      counter++;
      return placeholder;
    });

    // 处理段落格式
    const paragraphsFixed = this.normalizeParagraphs(textWithoutCodeBlocks);

    // 添加盘古之白，按行处理以保持换行格式
    const lines = paragraphsFixed.split('\n');
    const formattedLines = lines.map((line) => this.addPanguSpacing(line));
    let result = formattedLines.join('\n');

    // 还原代码块内容
    Object.entries(codeBlocks).forEach(([placeholder, original]) => {
      result = result?.replace(placeholder, original);
    });

    return result || '';
  }
}

export default MarkdownFormatter;
