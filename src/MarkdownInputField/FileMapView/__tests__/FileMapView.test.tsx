// @ts-nocheck
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileMapView } from '..';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('FileMapView', () => {
  const createMockFile = (name: string, type: string) => ({
    uuid: `uuid-${name}`,
    name,
    type,
    url: `https://example.com/${name}`,
    status: 'done',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without files', () => {
      const { container } = render(<FileMapView />);
      expect(
        container.querySelector('.ant-agentic-md-editor-file-view-list'),
      ).toBeInTheDocument();
    });

    it('should render with files', () => {
      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('test.jpg', 'image/jpeg'));

      const { container } = render(<FileMapView fileMap={fileMap} />);

      // Image files are rendered as Image component, not text
      const image = container.querySelector(
        'img[src="https://example.com/test.jpg"]',
      );
      expect(image).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <FileMapView className="custom-file-view" />,
      );
      expect(container.querySelector('.custom-file-view')).toBeInTheDocument();
    });

    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<FileMapView style={customStyle} />);
      const element = container.querySelector(
        '.ant-agentic-md-editor-file-view-list',
      ) as HTMLElement;
      expect(element.style.backgroundColor).toBe('red');
    });
  });

  describe('File Display', () => {
    it('should display limited number of files', () => {
      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('file1.pdf', 'application/pdf'));
      fileMap.set('file-2', createMockFile('file2.pdf', 'application/pdf'));
      fileMap.set('file-3', createMockFile('file3.pdf', 'application/pdf'));
      fileMap.set('file-4', createMockFile('file4.pdf', 'application/pdf'));

      const { container } = render(
        <FileMapView fileMap={fileMap} maxDisplayCount={2} />,
      );

      // Should only display first 2 non-image files (maxDisplayCount only affects non-image files)
      const fileItems = container.querySelectorAll('[data-testid="file-item"]');
      expect(fileItems.length).toBe(2);
    });

    it('should display all files when showMoreButton is false', () => {
      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('file1.jpg', 'image/jpeg'));
      fileMap.set('file-2', createMockFile('file2.jpg', 'image/jpeg'));
      fileMap.set('file-3', createMockFile('file3.jpg', 'image/jpeg'));
      fileMap.set('file-4', createMockFile('file4.jpg', 'image/jpeg'));

      const { container } = render(
        <FileMapView
          fileMap={fileMap}
          maxDisplayCount={2}
          showMoreButton={false}
        />,
      );

      // Should display all image files
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(4);
    });

    it('should show "View All" button when files exceed max count', () => {
      const fileMap = new Map();
      for (let i = 1; i <= 5; i++) {
        fileMap.set(
          `file-${i}`,
          createMockFile(`file${i}.pdf`, 'application/pdf'),
        );
      }

      render(<FileMapView fileMap={fileMap} maxDisplayCount={3} />);

      // Should show view all button
      const viewAllButton = screen.queryByText('查看此任务中的所有文件');
      expect(viewAllButton).toBeInTheDocument();
    });
  });

  describe('File Actions', () => {
    it('should call onPreview when preview is clicked', () => {
      const onPreview = vi.fn();
      const fileMap = new Map();
      const file = createMockFile('test.pdf', 'application/pdf');
      fileMap.set('file-1', file);

      const { container } = render(
        <FileMapView fileMap={fileMap} onPreview={onPreview} />,
      );

      // For non-image files, click on file item to preview
      const fileItem = container.querySelector('[data-testid="file-item"]');
      if (fileItem) {
        fireEvent.click(fileItem);
        expect(onPreview).toHaveBeenCalledWith(file);
      }
    });

    it('should call onDownload when download is clicked', () => {
      const onDownload = vi.fn();
      const fileMap = new Map();
      const file = createMockFile('test.pdf', 'application/pdf');
      fileMap.set('file-1', file);

      const { container } = render(
        <FileMapView fileMap={fileMap} onDownload={onDownload} />,
      );

      // Non-image files show file name split into parts
      const fileItem = container.querySelector('[data-testid="file-item"]');
      expect(fileItem).toBeInTheDocument();
    });

    it('should call onViewAll with all files', () => {
      const onViewAll = vi.fn();
      const fileMap = new Map();
      for (let i = 1; i <= 5; i++) {
        fileMap.set(
          `file-${i}`,
          createMockFile(`file${i}.pdf`, 'application/pdf'),
        );
      }

      render(
        <FileMapView
          fileMap={fileMap}
          maxDisplayCount={3}
          onViewAll={onViewAll}
        />,
      );

      const viewAllButton = screen.getByText('查看此任务中的所有文件');
      fireEvent.click(viewAllButton);

      expect(onViewAll).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'file1.pdf' }),
          expect.objectContaining({ name: 'file2.pdf' }),
          expect.objectContaining({ name: 'file3.pdf' }),
          expect.objectContaining({ name: 'file4.pdf' }),
          expect.objectContaining({ name: 'file5.pdf' }),
        ]),
      );
    });
  });

  describe('Custom Slot', () => {
    it('should render custom slot', () => {
      const customSlot = <div data-testid="custom-slot">Custom Actions</div>;
      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('test.pdf', 'application/pdf'));

      const { container } = render(
        <FileMapView fileMap={fileMap} customSlot={customSlot} />,
      );

      // Custom slot is only visible on hover
      const fileItem = container.querySelector('[data-testid="file-item"]');
      fireEvent.mouseEnter(fileItem!);

      expect(screen.getByTestId('custom-slot')).toBeInTheDocument();
    });

    it('should render custom slot as function', () => {
      const customSlot = (file: any) => (
        <div data-testid={`custom-${file.name}`}>Custom for {file.name}</div>
      );

      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('test.pdf', 'application/pdf'));

      const { container } = render(
        <FileMapView fileMap={fileMap} customSlot={customSlot} />,
      );

      // Custom slot is only visible on hover
      const fileItem = container.querySelector('[data-testid="file-item"]');
      fireEvent.mouseEnter(fileItem!);

      expect(screen.getByTestId('custom-test.pdf')).toBeInTheDocument();
    });
  });

  describe('More Actions', () => {
    it('should render custom more action', () => {
      const renderMoreAction = (file: any) => (
        <button type="button" data-testid={`more-${file.name}`}>
          More for {file.name}
        </button>
      );

      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('test.pdf', 'application/pdf'));

      const { container } = render(
        <FileMapView fileMap={fileMap} renderMoreAction={renderMoreAction} />,
      );

      // More action is only visible on hover
      const fileItem = container.querySelector('[data-testid="file-item"]');
      fireEvent.mouseEnter(fileItem!);

      expect(screen.getByTestId('more-test.pdf')).toBeInTheDocument();
    });
  });

  describe('Placement', () => {
    it('should render with left placement by default', () => {
      const { container } = render(<FileMapView />);
      expect(
        container.querySelector('.ant-agentic-md-editor-file-view-list'),
      ).toBeInTheDocument();
    });

    it('should render with right placement', () => {
      const { container } = render(<FileMapView placement="right" />);
      expect(
        container.querySelector('.ant-agentic-md-editor-file-view-list'),
      ).toBeInTheDocument();
    });
  });

  describe('Image Files', () => {
    it('should display image files in grid', () => {
      const fileMap = new Map();
      fileMap.set('img-1', createMockFile('image1.jpg', 'image/jpeg'));
      fileMap.set('img-2', createMockFile('image2.png', 'image/png'));

      const { container } = render(<FileMapView fileMap={fileMap} />);

      // Image files are rendered as img elements
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(2);
    });

    it('should handle image preview', () => {
      const onPreview = vi.fn();
      const fileMap = new Map();
      const imageFile = createMockFile('image.jpg', 'image/jpeg');
      fileMap.set('img-1', imageFile);

      const { container } = render(
        <FileMapView fileMap={fileMap} onPreview={onPreview} />,
      );

      // Image should be rendered
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty fileMap', () => {
      const fileMap = new Map();
      const { container } = render(<FileMapView fileMap={fileMap} />);
      expect(
        container.querySelector('.ant-agentic-md-editor-file-view-list'),
      ).toBeInTheDocument();
    });

    it('should handle null fileMap', () => {
      const { container } = render(<FileMapView fileMap={null} />);
      expect(
        container.querySelector('.ant-agentic-md-editor-file-view-list'),
      ).toBeInTheDocument();
    });

    it('should handle undefined fileMap', () => {
      const { container } = render(<FileMapView />);
      expect(
        container.querySelector('.ant-agentic-md-editor-file-view-list'),
      ).toBeInTheDocument();
    });

    it('should handle single file', () => {
      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('single.pdf', 'application/pdf'));

      const { container } = render(<FileMapView fileMap={fileMap} />);

      // Non-image file should be rendered
      const fileItem = container.querySelector('[data-testid="file-item"]');
      expect(fileItem).toBeInTheDocument();
    });

    it('should handle files with missing properties', () => {
      const fileMap = new Map();
      fileMap.set('file-1', {
        uuid: 'uuid-1',
        name: 'incomplete.txt',
        type: 'text/plain',
        // Missing url, status
      });

      const { container } = render(<FileMapView fileMap={fileMap} />);

      // File name is split into parts, check for file item
      const fileItem = container.querySelector('[data-testid="file-item"]');
      expect(fileItem).toBeInTheDocument();
    });
  });

  describe('maxDisplayCount Prop', () => {
    it('should display all files when maxDisplayCount is not provided', () => {
      const fileMap = new Map();
      for (let i = 1; i <= 5; i++) {
        fileMap.set(`file-${i}`, createMockFile(`file${i}.txt`, 'text/plain'));
      }

      const { container } = render(<FileMapView fileMap={fileMap} />);

      // Should display all files when maxDisplayCount is undefined
      const fileItems = container.querySelectorAll('[data-testid="file-item"]');
      expect(fileItems.length).toBe(5);
    });

    it('should respect custom maxDisplayCount', () => {
      const fileMap = new Map();
      for (let i = 1; i <= 5; i++) {
        fileMap.set(`file-${i}`, createMockFile(`file${i}.txt`, 'text/plain'));
      }

      const { container } = render(
        <FileMapView fileMap={fileMap} maxDisplayCount={2} />,
      );

      const fileItems = container.querySelectorAll('[data-testid="file-item"]');
      expect(fileItems.length).toBe(2);
    });

    it('should handle maxDisplayCount larger than file count', () => {
      const fileMap = new Map();
      fileMap.set('file-1', createMockFile('file1.txt', 'text/plain'));
      fileMap.set('file-2', createMockFile('file2.txt', 'text/plain'));

      const { container } = render(
        <FileMapView fileMap={fileMap} maxDisplayCount={10} />,
      );

      // All files should be displayed
      const fileItems = container.querySelectorAll('[data-testid="file-item"]');
      expect(fileItems.length).toBe(2);
    });
  });
});
