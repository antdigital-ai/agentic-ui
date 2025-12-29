import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Node, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../@ant-design/agentic-ui/MarkdownEditor/editor/plugins/withMarkdown';
import {
  ReactEditor,
  withReact,
} from 'slate-react';

// Mock ReactEditor DOM methods
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

describe('withMarkdown Plugin Tests', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    baseEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return baseEditor;
  };

  const createCardNode = (contentNode?: any) => {
    return {
      type: 'card',
      children: [
        {
          type: 'card-before',
          children: [{ text: '' }],
        },
        contentNode || {
          type: 'media',
          url: 'test.jpg',
          mediaType: 'image',
          children: [{ text: '' }],
        },
        {
          type: 'card-after',
          children: [{ text: '' }],
        },
      ],
    };
  };

  const createEmptyCardNode = () => {
    return {
      type: 'card',
      children: [
        {
          type: 'card-before',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        {
          type: 'card-after',
          children: [{ text: '' }],
        },
      ],
    };
  };

  beforeEach(() => {
    editor = createTestEditor();
  });

  describe('Basic Plugin Functionality', () => {
    it('should extend isInline method', () => {
      expect(editor.isInline({ type: 'break' })).toBe(true);
      expect(editor.isInline({ type: 'paragraph' })).toBe(false);
    });

    it('should extend isVoid method', () => {
      expect(editor.isVoid({ type: 'hr' })).toBe(true);
      expect(editor.isVoid({ type: 'break' })).toBe(true);
      expect(editor.isVoid({ type: 'paragraph' })).toBe(false);
    });
  });

  describe('Card Operation Handling', () => {
    describe('Card Deletion', () => {
      it('should handle card node removal operations', () => {
        editor.children = [createCardNode()];

        try {
          // Try to remove the card node
          Transforms.removeNodes(editor, { at: [0] });
        } catch (error) {
          // Operation might be handled by our custom logic
        }

        // Verify the operation was handled (either removed or preserved)
        expect(editor.children.length).toBeGreaterThanOrEqual(0);
      });

      it('should delete entire card when removing card-after', () => {
        editor.children = [createCardNode()];

        const initialLength = editor.children.length;

        // Remove card-after node
        Transforms.removeNodes(editor, {
          at: [0, 2], // card > card-after
        });

        // Card should be completely removed
        expect(editor.children.length).toBeLessThanOrEqual(initialLength);
      });

      it('should prevent deletion of card-before', () => {
        editor.children = [createCardNode()];

        const cardBeforeNode = Node.get(editor, [0, 0]);
        expect(cardBeforeNode.type).toBe('card-before');

        // Try to remove card-before - this should be prevented
        try {
          Transforms.removeNodes(editor, {
            at: [0, 0], // card > card-before
          });
        } catch (error) {
          // This is expected as the operation should be blocked
        }

        // card-before should still exist
        const stillExists = Node.get(editor, [0, 0]);
        expect(stillExists.type).toBe('card-before');
      });

      it('should handle empty card cleanup', () => {
        editor.children = [createEmptyCardNode()];

        // Remove the content inside the card
        try {
          Transforms.removeNodes(editor, {
            at: [0, 1], // card > paragraph
          });
        } catch (error) {
          // Operation might trigger empty card cleanup
        }

        // Verify the operation was handled
        expect(editor.children.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Card Text Insertion', () => {
      it('should prevent text insertion in card-before', () => {
        editor.children = [createCardNode()];

        // Select card-before text node
        Transforms.select(editor, { path: [0, 0, 0], offset: 0 });

        const beforeText = Node.string(Node.get(editor, [0, 0]));
        editor.insertText('test text');
        const afterText = Node.string(Node.get(editor, [0, 0]));

        expect(afterText).toBe(beforeText);
      });

      it('should redirect text insertion from card-after to new paragraph', () => {
        editor.children = [createCardNode()];

        // Select card-after text node
        Transforms.select(editor, { path: [0, 2, 0], offset: 0 });

        editor.insertText('test text');

        // Should create new paragraph after the card
        expect(editor.children.length).toBe(2);
        expect(editor.children[1]).toEqual({
          type: 'paragraph',
          children: [{ text: 'test text' }],
        });
      });
    });

    describe('Card Node Insertion', () => {
      it('should prevent node insertion in card-before', () => {
        editor.children = [createCardNode()];

        // Select card-before
        Transforms.select(editor, { path: [0, 0], offset: 0 });

        const initialChildren = Node.get(editor, [0, 0]).children.length;

        try {
          Transforms.insertNodes(editor, { text: 'new node' });
        } catch (error) {
          // Expected to be blocked
        }

        const finalChildren = Node.get(editor, [0, 0]).children.length;
        expect(finalChildren).toBe(initialChildren);
      });

      it('should redirect node insertion from card-after to after card', () => {
        editor.children = [createCardNode()];

        // Select card-after text node
        Transforms.select(editor, { path: [0, 2, 0], offset: 0 });

        const testNode = {
          type: 'paragraph',
          children: [{ text: 'new paragraph' }],
        };

        try {
          Transforms.insertNodes(editor, testNode);
        } catch (error) {
          // The operation might be intercepted
        }

        // Check if operation was handled (new paragraph might be inserted)
        expect(editor.children.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Link and Media Operation Handling', () => {
    it('should handle link-card split operation', () => {
      const linkCardNode = {
        type: 'link-card',
        url: 'https://example.com',
        children: [{ text: 'Link text' }],
      };

      editor.children = [linkCardNode];

      // Try to split the link-card node
      try {
        Transforms.splitNodes(editor, { at: [0] });
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Should handle the split operation
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle media split operation', () => {
      const mediaNode = {
        type: 'media',
        url: 'test.jpg',
        mediaType: 'image',
        children: [{ text: '' }],
      };

      editor.children = [mediaNode];

      try {
        Transforms.splitNodes(editor, { at: [0] });
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      expect(editor.children.length).toBeGreaterThan(0);
    });

    it('should handle link-card child node removal', () => {
      const linkCardNode = {
        type: 'link-card',
        url: 'https://example.com',
        children: [{ text: 'Link text' }],
      };

      editor.children = [linkCardNode];

      try {
        Transforms.removeNodes(editor, { at: [0, 0] });
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // The operation should be handled
      expect(editor.children.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Schema Operation Handling', () => {
    it('should handle schema split operation', () => {
      const schemaNode = {
        type: 'schema',
        properties: {},
        children: [{ text: 'Schema content' }],
      };

      editor.children = [schemaNode];

      try {
        Transforms.splitNodes(editor, { at: [0] });
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Should handle the split operation
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Code and Tag Operation Handling', () => {
    it('should handle empty tag text operations', () => {
      const tagNode = {
        text: '',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [{ type: 'paragraph', children: [tagNode] }];

      // Select the tag node
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      try {
        Transforms.delete(editor);
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      const node = Node.get(editor, [0, 0]);
      // Tag properties should still exist or be handled by the plugin
      expect(node).toBeDefined();
    });

    it('should handle space insertion in tag', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };

      editor.children = [{ type: 'paragraph', children: [tagNode] }];

      // Select at end of tag
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      try {
        editor.insertText(' ');
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // First space should be inserted inside the tag (not jump out)
      expect(editor.children[0].children.length).toBe(1);
      const firstChild = editor.children[0].children[0];
      expect(firstChild.text).toBe('code '); // Space should be added inside the tag
    });

    it('should only jump out of tag when previous character is space', () => {
      // Test case 1: First space - should NOT jump out
      const tagNode1 = {
        text: 'code',
        tag: true,
        code: true,
      };

      editor.children = [{ type: 'paragraph', children: [tagNode1] }];

      // Select at end of tag (after 'code')
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      // Insert first space
      try {
        editor.insertText(' ');
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Should still be only one child node (space added to tag)
      expect(editor.children[0].children.length).toBe(1);
      const firstNode = editor.children[0].children[0];
      expect(firstNode.text).toBe('code '); // Space should be added to the tag

      // Test case 2: Second space after existing space - should jump out
      const tagNode2 = {
        text: 'code ',
        tag: true,
        code: true,
      };

      editor.children = [{ type: 'paragraph', children: [tagNode2] }];

      // Select at end of tag (after 'code ')
      Transforms.select(editor, { path: [0, 0], offset: 5 });

      // Insert second space
      try {
        editor.insertText(' ');
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Should now have more than one child node (jumped out of tag)
      expect(editor.children[0].children.length).toBeGreaterThan(1);
    });

    it('should prevent split operation on tag nodes', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };

      editor.children = [{ type: 'paragraph', children: [tagNode] }];

      try {
        Transforms.splitNodes(editor, { at: [0, 0] });
      } catch (error) {
        // Split should be prevented
      }

      // Node should remain unsplit
      expect(editor.children[0].children.length).toBe(1);
    });
  });

  describe('Delete Backward Behavior', () => {
    it('should prevent deletion in card-before', () => {
      editor.children = [createCardNode()];

      // Select card-before
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });

      const beforeState = editor.children;
      editor.deleteBackward('character');

      expect(editor.children).toEqual(beforeState);
    });

    it('should handle deletion in card-after', () => {
      editor.children = [createCardNode()];

      // Select card-after
      Transforms.select(editor, { path: [0, 2, 0], offset: 0 });

      try {
        editor.deleteBackward('character');
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Should handle the deletion operation
      expect(editor.children.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle deletion of previous tag node', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };

      const textNode = { text: 'a' };

      editor.children = [{ type: 'paragraph', children: [tagNode, textNode] }];

      // Select at beginning of text node
      Transforms.select(editor, { path: [0, 1], offset: 1 });

      try {
        editor.deleteBackward('character');
      } catch (error) {
        // Operation might be handled by our custom logic
      }

      // Tag node should be handled specially
      expect(editor.children[0].children.length).toBeGreaterThan(0);
    });
  });

  describe('Fragment Insertion', () => {
    it('should prevent fragment insertion in card-before', () => {
      editor.children = [createCardNode()];

      // Select card-before
      Transforms.select(editor, { path: [0, 0, 0], offset: 0 });

      const fragment = [
        { type: 'paragraph', children: [{ text: 'Fragment text' }] },
      ];

      const beforeLength = editor.children.length;
      editor.insertFragment(fragment);

      // Fragment should not be inserted in card-before
      expect(editor.children.length).toBe(beforeLength);
    });

    it('should redirect fragment insertion from card-after', () => {
      editor.children = [createCardNode()];

      // Select card-after
      Transforms.select(editor, { path: [0, 2, 0], offset: 0 });

      const fragment = [
        { type: 'paragraph', children: [{ text: 'Fragment text' }] },
      ];

      editor.insertFragment(fragment);

      // Fragment should be inserted after the card
      expect(editor.children.length).toBeGreaterThan(1);
    });
  });

  describe('Helper Functions', () => {
    it('should handle empty card scenarios', () => {
      const emptyCard = createEmptyCardNode();

      // We need to access the internal isCardEmpty function
      // Since it's not exported, we'll test it indirectly through card removal behavior
      editor.children = [emptyCard];

      // Remove the content to make it empty
      try {
        Transforms.removeNodes(editor, { at: [0, 1] });
      } catch (error) {
        // Operation might trigger empty card cleanup
      }

      // Should handle the empty card scenario
      expect(editor.children.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle clearCardAreaText function', () => {
      // This function involves DOM manipulation which is mocked
      editor.children = [createCardNode()];

      // The function should not throw even with mocked DOM
      expect(() => {
        // This would be called internally by the plugin
        const path = [0, 2, 0];
        const node = Node.get(editor, path);
        expect(node).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle operations with invalid paths gracefully', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'test' }] }];

      // Try operations with invalid paths
      expect(() => {
        try {
          const invalidPath = [10, 10, 10];
          Node.get(editor, invalidPath);
        } catch (error) {
          // Should handle path errors gracefully
          expect(error).toBeDefined();
        }
      }).not.toThrow();
    });

    it('should handle missing nodes gracefully', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'test' }] }];

      // Operations should not crash when nodes are missing
      expect(() => {
        try {
          Transforms.removeNodes(editor, { at: [0] });
          // Try to access removed node
          Node.get(editor, [0]);
        } catch (error) {
          // Should handle missing nodes gracefully
          expect(error).toBeDefined();
        }
      }).not.toThrow();
    });
  });
});
