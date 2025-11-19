/**
 * @fileoverview 代码编辑器插件主文件
 * 提供基于 Ace Editor 的代码编辑功能，支持多种编程语言语法高亮
 * @author Code Plugin Team
 */

import React from 'react';
import { BaseMarkdownEditor } from '../../MarkdownEditor';
import { useEditorStore } from '../../MarkdownEditor/editor/store';
import { CodeNode, ElementProps } from '../../MarkdownEditor/el';
import { CodeRenderer } from './components';

function csvToMarkdownTable(csv: string | undefined) {
  if (!csv) return '';
  // 处理不同换行符
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        // 双引号转义或开/关引号
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++; // 跳过下一个引号
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    rows.push(cells.map((c) => c.trim()));
  }

  if (rows.length === 0) return '';

  // 列数取最大
  const colCount = rows.reduce((max, r) => Math.max(max, r.length), 0);

  // 规范每行列数
  for (const r of rows) {
    while (r.length < colCount) r.push('');
  }

  // 第一行为表头
  const header = rows[0];
  const body = rows.slice(1);

  const escapeCell = (s: string) => s.replace(/\|/g, '\\|');

  const headerLine = `| ${header.map(escapeCell).join(' | ')} |`;
  const sepLine = `|:${new Array(colCount).fill('---').join(' | ')} |`;
  const bodyLines = body.map((r) => `| ${r.map(escapeCell).join(' | ')} |`);

  return [headerLine, sepLine, ...bodyLines].join('\n');
}
/**
 * 代码编辑器组件
 * 已重构为更小的组件，提升可维护性
 */

export function CodeElement(props: ElementProps<CodeNode>) {
  const { readonly } = useEditorStore();
  if (!props.element) {
    return null;
  }
  // readonly 模式下，空代码块不展示
  if (readonly && !props.element.value) {
    return null;
  }
  if (readonly && props.element.language === 'csv') {
    return (
      <BaseMarkdownEditor
        contentStyle={{
          padding: 0,
          paddingTop: 32,
        }}
        style={{
          padding: 0,
        }}
        initValue={csvToMarkdownTable(props.element?.value)}
        readonly
      />
    );
  }

  return <CodeRenderer {...props} />;
}
