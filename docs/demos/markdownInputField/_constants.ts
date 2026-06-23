import type { CSSProperties } from 'react';

export const TEMPLATE_VALUE =
  '帮我查询`${placeholder:目标企业}` `${placeholder:近3年;initialValue:近6年}`的`${placeholder:资产总额}`。';

/** demo-0：Tag（$ / 占位符）+ Mark（@ /）初始内容 */
export const TAG_MARK_DEMO_INITIAL = [
  '<mark label="@">@客服助理</mark> ',
  '请继续编辑：$ 打开 tag；@ / 插入 mark。',
  '',
  TEMPLATE_VALUE,
].join('\n');

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

/** 通用模拟上传：返回一个临时 blob URL，并附加可控延时 */
export const mockUpload = async (file: File, delay = 800): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return URL.createObjectURL(file);
};

/** 通用模拟删除：清理 blob URL，避免内存泄漏 */
export const mockDelete = async (file: {
  url?: string;
  previewUrl?: string;
}): Promise<void> => {
  const fileUrl = typeof file.url === 'string' ? file.url : undefined;
  const previewUrl =
    typeof file.previewUrl === 'string' ? file.previewUrl : undefined;
  if (fileUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(fileUrl);
  }
  if (previewUrl?.startsWith('blob:') && previewUrl !== fileUrl) {
    URL.revokeObjectURL(previewUrl);
  }
};
