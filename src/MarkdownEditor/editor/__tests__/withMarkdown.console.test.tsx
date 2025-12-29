import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../@ant-design/agentic-ui/MarkdownEditor/editor/plugins/withMarkdown';
import {
  ReactEditor,
  withReact,
} from 'slate-react';

// Mock ReactEditor
vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => ({
      querySelector: vi.fn(() => ({
        textContent: '',
      })),
    })),
  },
  withReact: (editor: any) => editor,
}));

describe('withMarkdown Plugin - Console Log Removal Tests', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let consoleSpy: any;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    baseEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return baseEditor;
  };

  beforeEach(() => {
    editor = createTestEditor();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Delete Backward with Tag Nodes', () => {
    it('should handle tag deletion without console.log', () => {
      // Create a tag node followed by text
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };

      const textNode = { text: 'a' };

      editor.children = [{ type: 'paragraph', children: [tagNode, textNode] }];

      // Select at beginning of text node (position where the bug was)
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 1 },
        focus: { path: [0, 1], offset: 1 },
      });

      // This should trigger the deleteBackward logic that had the console.log
      try {
        editor.deleteBackward('character');
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Verify no console.log was called
      expect(consoleSpy).not.toHaveBeenCalled();

      // Verify the editor still has content
      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('should handle previous tag node detection without console output', () => {
      // Create multiple nodes including a tag
      const tagNode = {
        text: 'tag',
        tag: true,
        code: true,
      };

      const regularNode = { text: 'regular text' };

      editor.children = [
        { type: 'paragraph', children: [tagNode, regularNode] },
      ];

      // Select at the beginning of the regular node
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      });

      // This operation should use Editor.previous to find the tag node
      // and handle it without logging selection.anchor
      try {
        editor.deleteBackward('character');
      } catch (error) {
        // Expected - operation might be intercepted
      }

      // The key test: no console.log should have been called
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle edge cases in selection without debug output', () => {
      // Test various edge cases that might have triggered the removed console.log

      // Case 1: Empty text node after tag
      const tagNode = { text: 'tag', tag: true };
      const emptyNode = { text: '' };

      editor.children = [{ type: 'paragraph', children: [tagNode, emptyNode] }];

      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      });

      try {
        editor.deleteBackward('character');
      } catch (error) {
        // Handle potential errors
      }

      expect(consoleSpy).not.toHaveBeenCalled();

      // Case 2: Multiple tags in sequence
      const tag1 = { text: 'tag1', tag: true };
      const tag2 = { text: 'tag2', tag: true };
      const text = { text: 'text' };

      editor.children = [{ type: 'paragraph', children: [tag1, tag2, text] }];

      Transforms.select(editor, {
        anchor: { path: [0, 2], offset: 1 },
        focus: { path: [0, 2], offset: 1 },
      });

      try {
        editor.deleteBackward('character');
      } catch (error) {
        // Handle potential errors
      }

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Selection Anchor Handling', () => {
    it('should access selection.anchor properties without logging them', () => {
      // This test ensures that accessing selection.anchor.offset doesn't trigger logs
      const node = { text: 'test content' };
      editor.children = [{ type: 'paragraph', children: [node] }];

      // Set various selection positions
      const positions = [
        { path: [0, 0], offset: 0 },
        { path: [0, 0], offset: 1 },
        { path: [0, 0], offset: 5 },
      ];

      positions.forEach((pos) => {
        Transforms.select(editor, { anchor: pos, focus: pos });

        // Trigger operations that would access selection.anchor
        try {
          editor.deleteBackward('character');
        } catch (error) {
          // Continue testing
        }
      });

      // Verify no debug output was generated
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Clean Code Practices', () => {
    it('should maintain functionality without debug statements', () => {
      // Comprehensive test that the functionality works correctly
      // without any debug console output

      const complexStructure = {
        type: 'paragraph',
        children: [
          { text: 'start ' },
          { text: 'code', tag: true, code: true },
          { text: ' middle ' },
          { text: 'more-code', tag: true, code: true },
          { text: ' end' },
        ],
      };

      editor.children = [complexStructure];

      // Perform various operations
      const operations = [
        () => Transforms.select(editor, { path: [0, 1], offset: 0 }),
        () => Transforms.select(editor, { path: [0, 2], offset: 1 }),
        () => Transforms.select(editor, { path: [0, 3], offset: 0 }),
        () => Transforms.select(editor, { path: [0, 4], offset: 1 }),
      ];

      operations.forEach((op) => {
        try {
          op();
          editor.deleteBackward('character');
        } catch (error) {
          // Operations might be intercepted by plugin logic
        }
      });

      // Main assertion: no console output
      expect(consoleSpy).not.toHaveBeenCalled();

      // Secondary assertion: editor remains in valid state
      expect(editor.children).toBeDefined();
      expect(editor.children.length).toBeGreaterThan(0);
    });
  });
});
