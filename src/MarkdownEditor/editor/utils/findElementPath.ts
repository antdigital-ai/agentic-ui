import type { Node, Path } from 'slate';
import { ReactEditor } from 'slate-react';

interface FindElementPathOptions {
  cachedPath?: Path | null;
  /** Accept the current immutable version of the same logical Slate node. */
  matchKey?: boolean;
  /** Event callbacks can run before React has refreshed node-to-path maps. */
  search?: boolean;
}

/** Slate's DOM maps can retain paths for removed nodes; verify the model too. */
export function findElementPath(
  editor: ReactEditor,
  element: Node,
  { cachedPath, matchKey = false, search = false }: FindElementPathOptions = {},
): Path | undefined {
  const key = matchKey ? ReactEditor.findKey(editor, element) : undefined;
  const matches = (node: Node) =>
    node === element ||
    (key !== undefined && ReactEditor.findKey(editor, node) === key);
  const isCurrentPath = (path: Path) => {
    try {
      return matches(editor.node(path)[0]);
    } catch {
      return false;
    }
  };

  if (cachedPath && isCurrentPath(cachedPath)) return cachedPath;
  try {
    const path = ReactEditor.findPath(editor, element);
    if (isCurrentPath(path)) return path;
  } catch {
    // A detached node has no current path. Never fall back to the first block.
  }

  if (search) {
    for (const [node, path] of editor.nodes({ at: [], voids: true })) {
      if (path.length > 0 && matches(node)) return path;
    }
  }
  return undefined;
}
