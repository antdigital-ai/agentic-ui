import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfficeViewer } from '..';
import { getDefaultWasmUrl, inferOfficeFileType } from '../utils';

const loadMock = vi.fn().mockResolvedValue(undefined);
const destroyMock = vi.fn();
const docxCtorMock = vi.fn();
const xlsxCopyMock = vi.fn().mockResolvedValue({ status: 'copied' });
const pptxScrollCtorMock = vi.fn();
const presentationLoadMock = vi.fn();
const renderSlideMock = vi.fn().mockResolvedValue(undefined);
const fromPresentationMock = vi.fn();
const goToSlideMock = vi.fn();
const presentationDestroyMock = vi.fn();
const pptxViewerDestroyMock = vi.fn();

vi.mock('@silurus/ooxml/docx', () => ({
  DocxScrollViewer: class {
    load = loadMock;
    destroy = destroyMock;
    constructor(
      public container: HTMLElement,
      public opts?: Record<string, unknown>,
    ) {
      docxCtorMock(container, opts);
    }
  },
}));

vi.mock('@silurus/ooxml/xlsx', () => ({
  XlsxViewer: class {
    load = loadMock;
    destroy = destroyMock;
    copySelection = xlsxCopyMock;
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
    ) {
      pptxScrollCtorMock(container, opts);
    }
  },
  PptxPresentation: {
    load: presentationLoadMock,
  },
  PptxViewer: {
    fromPresentation: fromPresentationMock,
  },
}));

// jsdom ? ResizeObserver?rail ????????? host
global.ResizeObserver = vi.fn(function MockRO() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
}) as unknown as typeof ResizeObserver;

const SLIDE_COUNT = 3;
const presentationMock = {
  slideCount: SLIDE_COUNT,
  slideWidth: 960,
  slideHeight: 540,
  renderSlide: renderSlideMock,
  destroy: presentationDestroyMock,
};
const mainCanvasMock = document.createElement('canvas');
mainCanvasMock.className = 'ant-office-viewer-main-canvas';
const pptxViewerInstanceMock = {
  canvasElement: mainCanvasMock,
  goToSlide: goToSlideMock,
  fitPage: vi.fn().mockResolvedValue(undefined),
  getScale: vi.fn().mockReturnValue(1),
  setScale: vi.fn().mockResolvedValue(undefined),
  destroy: pptxViewerDestroyMock,
};

describe('OfficeViewer utils', () => {
  it('inferOfficeFileType ??????? OOXML', () => {
    expect(inferOfficeFileType('a.DOCX')).toBe('docx');
    expect(inferOfficeFileType('https://x.com/b.xlsx?x=1')).toBe('xlsx');
    expect(inferOfficeFileType('deck.pptx')).toBe('pptx');
    expect(inferOfficeFileType('legacy.doc')).toBeNull();
    expect(inferOfficeFileType('sheet.csv')).toBeNull();
  });

  it('getDefaultWasmUrl ??? CDN ??', () => {
    expect(getDefaultWasmUrl('docx')).toContain('docx_parser_bg.wasm');
    expect(getDefaultWasmUrl('xlsx')).toContain('xlsx_parser_bg.wasm');
    expect(getDefaultWasmUrl('pptx')).toContain('pptx_parser_bg.wasm');
  });
});

describe('OfficeViewer', () => {
  beforeEach(() => {
    loadMock.mockClear();
    destroyMock.mockClear();
    pptxScrollCtorMock.mockClear();
    presentationLoadMock.mockClear();
    renderSlideMock.mockClear();
    fromPresentationMock.mockClear();
    goToSlideMock.mockClear();
    presentationDestroyMock.mockClear();
    pptxViewerDestroyMock.mockClear();
    presentationLoadMock.mockResolvedValue(presentationMock);
    fromPresentationMock.mockReturnValue(pptxViewerInstanceMock);
  });

  it('?? fileType ?? DocxScrollViewer ??? wasmUrl', async () => {
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

  it('??????????? onError', async () => {
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

  it('??? file ???? idle ???? load', async () => {
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

  it('DOCX ?????????????', async () => {
    render(
      <ConfigProvider>
        <OfficeViewer file="/sample.docx" fileType="docx" />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(loadMock).toHaveBeenCalled();
    });
    expect(docxCtorMock).toHaveBeenCalled();
    expect(docxCtorMock.mock.calls[0][1]).toMatchObject({
      enableTextSelection: true,
    });
  });

  it('XLSX ??? Ctrl/Cmd+C ?? copySelection', async () => {
    render(
      <ConfigProvider>
        <OfficeViewer file="/sample.xlsx" fileType="xlsx" />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(loadMock).toHaveBeenCalled();
    });

    const host = document.querySelector(
      '[data-testid="ant-office-viewer-host"]',
    ) as HTMLElement;
    expect(host).toBeTruthy();

    host.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'c',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await waitFor(() => {
      expect(xlsxCopyMock).toHaveBeenCalled();
    });
  });

  describe('PPTX slide rail', () => {
    it('??????????? PptxPresentation + PptxViewer????????', async () => {
      render(
        <ConfigProvider>
          <OfficeViewer file="/deck.pptx" fileType="pptx" />
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(fromPresentationMock).toHaveBeenCalled();
      });
      expect(presentationLoadMock).toHaveBeenCalledTimes(1);
      // ????????
      expect(pptxScrollCtorMock).not.toHaveBeenCalled();

      const cards = document.querySelectorAll('.ant-office-viewer-rail-card');
      expect(cards).toHaveLength(SLIDE_COUNT);
      // ??? button???????????
      cards.forEach((card) => {
        expect(card.tagName).toBe('BUTTON');
        expect(card.getAttribute('aria-label')).toBeTruthy();
      });
      expect(
        document.querySelectorAll('.ant-office-viewer-rail-canvas'),
      ).toHaveLength(SLIDE_COUNT);

      // ?????? goToSlide
      cards[1].dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      await waitFor(() => {
        expect(goToSlideMock).toHaveBeenCalledWith(1);
      });
    });

    it('Enter/Space ?????????button ???', async () => {
      render(
        <ConfigProvider>
          <OfficeViewer file="/deck.pptx" fileType="pptx" />
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(fromPresentationMock).toHaveBeenCalled();
      });
      const cards = document.querySelectorAll('.ant-office-viewer-rail-card');

      fireEvent.keyDown(cards[2], { key: 'Enter' });
      await waitFor(() => {
        expect(goToSlideMock).toHaveBeenCalledWith(2);
      });
      fireEvent.keyDown(cards[0], { key: ' ' });
      await waitFor(() => {
        expect(goToSlideMock).toHaveBeenCalledWith(0);
      });
    });

    it('?????????????? presentation / viewer', async () => {
      const { unmount } = render(
        <ConfigProvider>
          <OfficeViewer file="/deck.pptx" fileType="pptx" />
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(renderSlideMock).toHaveBeenCalledTimes(SLIDE_COUNT);
      });

      unmount();
      // viewer ??? presentation ?? effect cleanup ??
      expect(presentationDestroyMock).toHaveBeenCalled();
      expect(pptxViewerDestroyMock).toHaveBeenCalled();
    });

    it('enableSlideRail=false ???? PptxScrollViewer ????', async () => {
      render(
        <ConfigProvider>
          <OfficeViewer
            file="/deck.pptx"
            fileType="pptx"
            enableSlideRail={false}
          />
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(pptxScrollCtorMock).toHaveBeenCalled();
      });
      expect(presentationLoadMock).not.toHaveBeenCalled();
      expect(fromPresentationMock).not.toHaveBeenCalled();
      expect(document.querySelector('.ant-office-viewer-rail')).toBeNull();
    });

    it('URL ? query ?????? PPTX ?????', async () => {
      render(
        <ConfigProvider>
          <OfficeViewer file="/files/deck.pptx?token=abc" />
        </ConfigProvider>,
      );

      await waitFor(() => {
        expect(presentationLoadMock).toHaveBeenCalled();
      });
    });
  });
});
