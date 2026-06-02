export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeMarkdownSearchText(searchText: string): string[] {
  if (!searchText.trim()) return [];

  const searchVariants: Set<string> = new Set();
  searchVariants.add(searchText.trim());

  let cleanText = searchText
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^#+\s+(.*)$/gm, '$1')
    .replace(/^>\s*(.*)$/gm, '$1')
    .replace(/^[\s]*[-*+]\s+(.*)$/gm, '$1')
    .replace(/^\s*\d+\.\s+(.*)$/gm, '$1')
    .trim();

  if (cleanText && cleanText !== searchText.trim()) {
    searchVariants.add(cleanText);
  }

  const words = cleanText.split(/\s+/).filter((word) => word.length > 1);
  if (words.length > 1) {
    words.forEach((word) => searchVariants.add(word));
  }

  return Array.from(searchVariants).filter((text) => text.length > 0);
}
