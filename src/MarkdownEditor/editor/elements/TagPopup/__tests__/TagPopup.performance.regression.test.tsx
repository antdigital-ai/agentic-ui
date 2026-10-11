import { render } from '@testing-library/react';
import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionContext } from '../../../../../MarkdownInputField/Suggestion/SuggestionContext';
import { TagPopup } from '../index';

describe('TagPopup render isolation', () => {
  it('does not rerender 50 independent dropdowns when the shared panel opens', () => {
    const editor = withReact(createEditor());
    const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }];
    const tagRender = vi.fn((_props, dom: React.ReactNode) => dom);
    const onChange = vi.fn();
    const context = {
      open: false,
      isRender: true,
      setOpen: vi.fn(),
      onSelectRef: { current: undefined },
      triggerNodeContext: { current: undefined },
    };
    const tags = Array.from({ length: 50 }, (_, index) => (
      <TagPopup
        key={index}
        type="dropdown"
        text={`Tag ${index}`}
        tagRender={tagRender}
        onChange={onChange}
      >
        {`Tag ${index}`}
      </TagPopup>
    ));
    const view = (open: boolean) => (
      <Slate editor={editor} initialValue={initialValue}>
        <SuggestionContext.Provider value={{ ...context, open }}>
          {tags}
        </SuggestionContext.Provider>
      </Slate>
    );
    const { rerender } = render(view(false));
    tagRender.mockClear();
    onChange.mockClear();

    rerender(view(true));

    expect(tagRender).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies a static menu update in one render while keeping its trigger DOM', () => {
    const editor = withReact(createEditor());
    const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }];
    const tagRender = vi.fn((_props, dom: React.ReactNode) => dom);
    const view = (items: { key: string; label: string }[]) => (
      <Slate editor={editor} initialValue={initialValue}>
        <TagPopup
          type="dropdown"
          text="Tag"
          items={items}
          tagRender={tagRender}
        >
          Tag
        </TagPopup>
      </Slate>
    );
    const { container, rerender } = render(view([]));
    const trigger = container.querySelector('[data-tag-popup-input]');
    tagRender.mockClear();

    rerender(view([{ key: 'new', label: 'New' }]));

    expect(tagRender).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-tag-popup-input]')).toBe(trigger);
    expect(trigger?.className).toContain('has-arrow');
  });

  it('retains shared panel notifications for panel tags', () => {
    const editor = withReact(createEditor());
    const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }];
    const onChange = vi.fn();
    const context = { isRender: true, setOpen: vi.fn() };
    const tag = <TagPopup type="panel" text="Panel" onChange={onChange} />;
    const view = (open: boolean) => (
      <Slate editor={editor} initialValue={initialValue}>
        <SuggestionContext.Provider value={{ ...context, open }}>
          {tag}
        </SuggestionContext.Provider>
      </Slate>
    );
    const { rerender } = render(view(false));
    onChange.mockClear();

    rerender(view(true));

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
