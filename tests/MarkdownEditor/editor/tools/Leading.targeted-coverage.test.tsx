import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TocHeading } from '../../../../src/MarkdownEditor/editor/tools/Leading';
import type { Elements } from '../../../../src/MarkdownEditor/el';

const mockContainerRef: { current: HTMLDivElement | null } = { current: null };
const configTargets: HTMLElement[] = [];
const offsetTopMock = vi.fn(() => 120);

vi.mock('nanoid', () => ({
  nanoid: () => 'fixed-id',
  customAlphabet: () => () => 'fixed-id',
}));

vi.mock('antd', () => {
  const flatten = (items: any[] = []) =>
    items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);

  return {
    ConfigProvider: ({ children, getPopupContainer, getTargetContainer }: any) => {
      const popup = getPopupContainer?.();
      const target = getTargetContainer?.();
      if (popup) configTargets.push(popup);
      if (target) configTargets.push(target);
      return <div data-testid="mock-config-provider">{children}</div>;
    },
    Anchor: ({ items = [], onClick }: any) => {
      const all = flatten(items);
      return (
        <div data-testid="mock-anchor">
          {all.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => onClick?.(e, { title: item.title, href: item.href })}
            >
              {item.title}
            </a>
          ))}
        </div>
      );
    },
  };
});

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownContainerRef: mockContainerRef,
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-'),
  getOffsetTop: (...args: any[]) => offsetTopMock(...args),
}));

vi.mock('../../../../src/MarkdownEditor/BaseMarkdownEditor', async () => {
  const actual = await vi.importActual('../../../../src/MarkdownEditor/BaseMarkdownEditor');
  return { ...actual, useDebounce: () => {} };
});

describe('Leading targeted coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    configTargets.length = 0;
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.style.height = '600px';
    container.scrollTo = vi.fn();
    document.body.appendChild(container);
    mockContainerRef.current = container;
    offsetTopMock.mockReset();
    offsetTopMock.mockReturnValue(120);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mockContainerRef.current = null;
  });

  const buildSchema = (): Elements[] => {
    const shared: any = {
      type: 'head',
      level: 1,
      children: [{ text: 'Shared Heading' }],
    };
    return [
      { type: 'head', level: 0, children: [{ text: 'Root Zero' }] } as any,
      shared,
      shared,
      { type: 'head', level: 2, children: [{ text: 'Sub Heading' }] } as any,
    ] as Elements[];
  };

  it('覆盖 buildTree 防御分支、容器内滚动与内部锚点分支', () => {
    const container = mockContainerRef.current!;
    container.getBoundingClientRect = vi.fn(
      () =>
        ({
          top: 10,
          bottom: 500,
          height: 490,
        }) as any,
    );

    const inContainerTarget = document.createElement('h1');
    inContainerTarget.id = 'root-zero';
    container.appendChild(inContainerTarget);

    render(<TocHeading schema={buildSchema()} useCustomContainer />);

    // getPopupContainer true 分支（返回 container）
    expect(configTargets.some((n) => n === container)).toBe(true);

    const firstLink = screen.getAllByRole('link')[0];
    fireEvent.click(firstLink);

    // 内部滚动分支
    expect(container.scrollTo).toHaveBeenCalled();
    fireEvent.scroll(container, { target: { scrollTop: 300 } });
    fireEvent.scroll(container, { target: { scrollTop: 0 } });

    vi.advanceTimersByTime(500);
  });

  it('覆盖 getPopupContainer fallback、页面滚动与容器外锚点分支', () => {
    const container = mockContainerRef.current!;
    container.getBoundingClientRect = vi.fn(
      () =>
        ({
          top: 1000,
          bottom: 1100,
          height: 100,
        }) as any,
    );

    const outTarget = document.createElement('h2');
    outTarget.id = 'shared-heading';
    outTarget.scrollIntoView = vi.fn();
    outTarget.getBoundingClientRect = vi.fn(() => ({ top: 20 }) as any);
    document.body.appendChild(outTarget);

    const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    Object.defineProperty(window, 'pageYOffset', {
      configurable: true,
      value: 150,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      value: 150,
      writable: true,
    });

    render(<TocHeading schema={buildSchema()} useCustomContainer />);

    // getPopupContainer false 分支（回退到 body）
    expect(configTargets.some((n) => n === document.body)).toBe(true);

    const links = screen.getAllByRole('link');
    fireEvent.click(links[1]); // shared-heading，在容器外
    expect(outTarget.scrollIntoView).toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(scrollBySpy).toHaveBeenCalledWith(0, -100);

    // 页面滚动分支（会经过 393/396/406-409）
    fireEvent.scroll(window);
  });
});

