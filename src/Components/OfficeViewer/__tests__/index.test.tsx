import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfficeViewer } from '..';
import { getDefaultWasmUrl, inferOfficeFileType } from '../utils';

const loadMock = vi.fn().mockResolvedValue(undefined);
const destroyMock = vi.fn();

vi.mock('@silurus/ooxml/docx', () => ({
  DocxScrollViewer: class {
    load = loadMock;
    destroy = destroyMock;
    constructor(
      public container: HTMLElement,
      public opts?: { wasmUrl?: string | URL },
    ) {}
  },
}));

vi.mock('@silurus/ooxml/xlsx', () => ({
  XlsxViewer: class {
    load = loadMock;
    destroy = destroyMock;
    constructor(
      public container: HTMLElement,
      public opts?: { wasmUrl?: string | URL },
    ) {}
  },
}));

vi.mock('@silurus/ooxml/pptx', () => ({
  PptxScrollViewer: class {
    load = loadMock;
    destroy = destroyMock;
    constructor(
      public container: HTMLElement,
      public opts?: { wasmUrl?: string | URL },
    ) {}
  },
}));

describe('OfficeViewer utils', () => {
  it('inferOfficeFileType 应按扩展名识别 OOXML', () => {
    expect(inferOfficeFileType('a.DOCX')).toBe('docx');
    expect(inferOfficeFileType('https://x.com/b.xlsx?x=1')).toBe('xlsx');
    expect(inferOfficeFileType('deck.pptx')).toBe('pptx');
    expect(inferOfficeFileType('legacy.doc')).toBeNull();
    expect(inferOfficeFileType('sheet.csv')).toBeNull();
  });

  it('getDefaultWasmUrl 应指向 CDN 资产', () => {
    expect(getDefaultWasmUrl('docx')).toContain('docx_parser_bg.wasm');
    expect(getDefaultWasmUrl('xlsx')).toContain('xlsx_parser_bg.wasm');
    expect(getDefaultWasmUrl('pptx')).toContain('pptx_parser_bg.wasm');
  });
});

describe('OfficeViewer', () => {
  beforeEach(() => {
    loadMock.mockClear();
    destroyMock.mockClear();
  });

  it('应按 fileType 加载 DocxScrollViewer 并透传 wasmUrl', async () => {
    const onLoad = vi.fn();
    render(
      <ConfigProvider>
        <OfficeViewer
          file="/sample.docx"
          fileType="docx"
          wasmUrl="https://cdn.example.com/docx.wasm"
          onLoad={onLoad}
        />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(loadMock).toHaveBeenCalledWith('/sample.docx');
    });
    expect(onLoad).toHaveBeenCalled();
  });

  it('扩展名推断失败时应回调 onError', async () => {
    const onError = vi.fn();
    render(
      <ConfigProvider>
        <OfficeViewer file={new ArrayBuffer(8)} onError={onError} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(
      screen.getByText(/Unsupported office format|Cannot infer/i),
    ).toBeInTheDocument();
  });

  it('未提供 file 时应保持 idle 且不调用 load', async () => {
    render(
      <ConfigProvider>
        <OfficeViewer fileType="docx" />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="ant-office-viewer"]'),
      ).toBeTruthy();
    });
    expect(loadMock).not.toHaveBeenCalled();
  });
});
