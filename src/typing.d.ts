declare module '*.svg';
declare module '*.webp';
declare module 'direction' {
  function direction(text: string): 'neutral' | 'ltr' | 'rtl';
  export default direction;
}

declare global {
  interface Window {
    MSStream: boolean;
  }
  interface DocumentOrShadowRoot {
    getSelection(): Selection | null;
  }

  interface CaretPosition {
    readonly offsetNode: Node;
    readonly offset: number;
    getClientRect(): DOMRect | null;
  }

  interface Document {
    caretPositionFromPoint(x: number, y: number): CaretPosition | null;
  }

  interface Node {
    getRootNode(options?: GetRootNodeOptions): Document | ShadowRoot;
  }
}
