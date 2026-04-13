import type { CSSProperties } from 'react';

export const TEMPLATE_VALUE =
  '帮我查询`${placeholder:目标企业}` `${placeholder:近3年;initialValue:近6年}`的`${placeholder:资产总额}`。';

export const TAG_ITEMS = ['tag1', 'tag2', 'tag3'].map((item) => ({
  key: item,
  label: item,
}));

export const LONG_SCROLL_SAMPLE =
  '这是一段用于演示多行滚动与换行的占位文本。重复若干次以撑满输入区域高度，便于观察滚动条与内边距表现。\n\n'.repeat(
    12,
  );

export const tagTextDisplay = (_props: unknown, text: string) =>
  text.replaceAll('$', '');

export const pageStyle: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  margin: '0 auto',
  maxWidth: 880,
  padding: '16px 12px 24px',
  width: '100%',
};

export const inputMinStyle: CSSProperties = { minHeight: 66 };
