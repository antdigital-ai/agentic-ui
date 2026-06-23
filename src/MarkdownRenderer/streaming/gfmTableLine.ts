/** GFM 表格行：`| a | b |` */
const GFM_TABLE_ROW_PATTERN = /^\s*\|(.+\|)+\s*$/;

/** GFM 表格分隔行：`| --- | --- |` 或 `|:---|:---:|---:|` */
const GFM_TABLE_SEPARATOR_PATTERN = /^\s*\|(\s*:?-+:?\s*\|)+\s*$/;

export const isGfmTableLine = (line: string): boolean =>
  GFM_TABLE_ROW_PATTERN.test(line) || GFM_TABLE_SEPARATOR_PATTERN.test(line);

/** 流式末块是否仍在 GFM 表格行内（从末尾向前扫描连续表格行） */
export const endsInsideGfmTable = (source: string): boolean => {
  const lines = source.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line === '') {
      continue;
    }
    return isGfmTableLine(line);
  }
  return false;
};
