/**
 * Check if a string contains Markdown formatting
 * @param text String to check
 * @returns Boolean indicating if the text contains Markdown formatting
 */
export function isMarkdown(text: string): boolean {
  if (!text || text.trim() === '') {
    return false;
  }

  // Check for Markdown headers
  if (/^#+\s+.+/m.test(text)) {
    return true;
  }

  // Check for Markdown tables
  if (/\|.+\|[\r\n]+\|[\s-:]+\|/m.test(text)) {
    return true;
  }

  // Check for Markdown images (before links: ![alt](url) also matches link pattern)
  if (/!\[.+\]\(.+\)/.test(text)) {
    return true;
  }

  // Check for Markdown links
  if (/\[.+\]\(.+\)/.test(text)) {
    return true;
  }

  // Check for Markdown code blocks
  if (/```[\s\S]*```/.test(text)) {
    return true;
  }

  // Check for Markdown inline code
  if (/`.+`/.test(text)) {
    return true;
  }

  // Check for Markdown blockquotes
  if (/^>\s+.+/m.test(text)) {
    return true;
  }

  // Check for Markdown bold text
  if (/\*\*.+\*\*/.test(text) || /__.+__/.test(text)) {
    return true;
  }

  // Check for Markdown italic text (only *italic* format, not _italic_)
  if (/\*.+\*/.test(text) && !/^\*$/.test(text)) {
    return true;
  }

  // Check for Markdown strikethrough
  if (/~~.+~~/.test(text)) {
    return true;
  }

  // Check for Markdown horizontal rules
  if (/^(---|===|\*\*\*)$/m.test(text)) {
    return true;
  }

  // Simplified table check
  if (/[^\\|]\|[^\\|][\r\n]+[-|]+[\r\n]+[^\\|]\|[^\\|]/.test(text)) {
    return true;
  }

  return false;
}
