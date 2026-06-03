import type { Element, Node } from 'slate';

export enum ListType {
  ORDERED = 'numbered-list',
  UNORDERED = 'bulleted-list',
}

export interface ListsSchema {
    isConvertibleToListTextNode(node: Node): boolean;

    isDefaultTextNode(node: Node): boolean;

    isListNode(node: Node, type?: ListType): boolean;

    isListItemNode(node: Node): boolean;

    isListItemTextNode(node: Node): boolean;

    createDefaultTextNode(props?: Partial<Element>): Element;

    createListNode(type?: ListType, props?: Partial<Element>): Element;

    createListItemNode(props?: Partial<Element>): Element;

    createListItemTextNode(props?: Partial<Element>): Element;
}
