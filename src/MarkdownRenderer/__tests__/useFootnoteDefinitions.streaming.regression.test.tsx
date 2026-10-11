import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as extraction from '../extractFootnoteDefinitions';
import { FncRefForMarkdown } from '../FncRefForMarkdown';
import {
  FootnoteDefinitionsContext,
  useFootnoteDefinitions,
} from '../useFootnoteDefinitions';

const renderedLeaves = vi.hoisted(() => [] as string[]);
vi.mock('../../MarkdownEditor/editor/elements/FncLeaf', () => ({
  FncLeaf: ({
    leaf,
    definition,
  }: {
    leaf: { identifier: string };
    definition?: { value?: string };
  }) => {
    renderedLeaves.push(leaf.identifier);
    return (
      <span data-testid={`footnote-${leaf.identifier}`}>
        {definition?.value}
      </span>
    );
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  renderedLeaves.length = 0;
});

describe('streaming footnote consumers', () => {
  it('updates only the changed leaf among 50 different definitions', () => {
    const definitions = Array.from(
      { length: 50 },
      (_, index) => `[^${index}]: Body ${index}`,
    );
    const initial = definitions.join('\n\n');
    const View = ({ content }: { content: string }) => {
      const result = useFootnoteDefinitions(content);
      return (
        <FootnoteDefinitionsContext.Provider value={result.definitionMap}>
          {definitions.map((_, index) => (
            <FncRefForMarkdown key={index} identifier={`${index}`}>
              {index}
            </FncRefForMarkdown>
          ))}
        </FootnoteDefinitionsContext.Provider>
      );
    };
    const view = render(<View content={initial} />);
    expect(renderedLeaves).toHaveLength(50);
    const first = screen.getByTestId('footnote-0');
    renderedLeaves.length = 0;
    view.rerender(<View content={`${initial} continues`} />);
    expect(renderedLeaves).toEqual(['49']);
    expect(screen.getByTestId('footnote-0')).toBe(first);
    expect(screen.getByTestId('footnote-49')).toHaveTextContent(
      'Body 49 continues',
    );
  });

  it('publishes only committed extraction baselines across Suspense and StrictMode', () => {
    const initial = `${Array.from({ length: 15 }, (_, index) => `Paragraph ${index}`).join('\n\n')}\n\n[^a]: Original`;
    const extract = vi.spyOn(extraction, 'extractStreamingFootnoteDefinitions');
    const notify = vi.fn();
    const pending = new Promise<void>(() => {});
    let update: React.Dispatch<
      React.SetStateAction<{
        content: string;
        suspend: boolean;
      }>
    >;
    const Notes = ({ content }: { content: string }) => {
      const { definitionMap } = useFootnoteDefinitions(content, notify);
      return <p>{definitionMap.get('a')?.value}</p>;
    };
    const Suspend = ({ active }: { active: boolean }) => {
      if (active) throw pending;
      return null;
    };
    const App = () => {
      const [state, setState] = React.useState({
        content: initial,
        suspend: false,
      });
      update = setState;
      return (
        <React.StrictMode>
          <React.Suspense fallback={<p>Suspended</p>}>
            <Notes content={state.content} />
            <Suspend active={state.suspend} />
          </React.Suspense>
        </React.StrictMode>
      );
    };
    render(<App />);
    notify.mockClear();
    act(() =>
      React.startTransition(() =>
        update({
          content: `${initial} abandoned\n\n[new]: /new`,
          suspend: true,
        }),
      ),
    );
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(notify).not.toHaveBeenCalled();
    extract.mockClear();
    act(() => update({ content: `${initial} accepted`, suspend: false }));
    expect(screen.getByText('Original accepted')).toBeInTheDocument();
    expect(
      extract.mock.calls.every(([, baseline]) => baseline?.content === initial),
    ).toBe(true);
    expect(notify).toHaveBeenCalledExactlyOnceWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'a', origin_text: 'Original accepted' }),
      ]),
    );
  });
});
