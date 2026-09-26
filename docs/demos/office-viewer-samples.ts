/** 文档站 public/office-samples 下的三件套样例（仅用于 demo） */
export const OFFICE_SAMPLE_BASE = '/office-samples';

export const OFFICE_SAMPLES = {
  docx: {
    url: `${OFFICE_SAMPLE_BASE}/sample.docx`,
    fileName: 'sample.docx',
    label: 'Word (.docx)',
  },
  xlsx: {
    url: `${OFFICE_SAMPLE_BASE}/sample.xlsx`,
    fileName: 'sample.xlsx',
    label: 'Excel (.xlsx)',
  },
  pptx: {
    url: `${OFFICE_SAMPLE_BASE}/sample.pptx`,
    fileName: 'sample.pptx',
    label: 'PowerPoint (.pptx)',
  },
} as const;

export type OfficeSampleKey = keyof typeof OFFICE_SAMPLES;
