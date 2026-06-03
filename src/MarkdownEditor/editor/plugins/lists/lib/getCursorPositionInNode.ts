import type { Editor } from 'slate';
import { type Path, Point } from 'slate';

export function getCursorPositionInNode(
    editor: Editor,
    cursorLocation: Point,
    nodePath: Path,
) {
    const nodeStartPoint = editor.start(nodePath);
    const nodeEndPoint = editor.end(nodePath);
    const isStart = Point.equals(cursorLocation, nodeStartPoint);
    const isEnd = Point.equals(cursorLocation, nodeEndPoint);
    return { isEnd, isStart };
}
