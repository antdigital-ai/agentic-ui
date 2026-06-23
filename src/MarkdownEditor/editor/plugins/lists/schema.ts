import { Element, type Element as SlateElement, type Node } from 'slate';
import type { BulletedListNode, NumberedListNode } from '../../../el';
import { ListType, type ListsSchema } from './types';

export const isListType = (
  node: Node,
): node is BulletedListNode | NumberedListNode => {
  return (
    Element.isElement(node) &&
    ((node as SlateElement & { type?: string }).type === ListType.UNORDERED ||
      (node as SlateElement & { type?: string }).type === ListType.ORDERED)
  );
};

/** Legacy helper: map deprecated `order` flag to list element type */
export const getListType = (
  order?: boolean,
): typeof ListType.ORDERED | typeof ListType.UNORDERED => {
  return order ? ListType.ORDERED : ListType.UNORDERED;
};

export const agenticListsSchema: ListsSchema = {
  isConvertibleToListTextNode(node: Node) {
    return (
      Element.isElement(node) && (node as { type?: string }).type === 'paragraph'
    );
  },

  isDefaultTextNode(node: Node) {
    return (
      Element.isElement(node) && (node as { type?: string }).type === 'paragraph'
    );
  },

  isListNode(node: Node, type?: ListType) {
    if (!Element.isElement(node)) {
      return false;
    }
    const nodeType = (node as { type?: string }).type;
    if (type === ListType.ORDERED) {
      return nodeType === ListType.ORDERED;
    }
    if (type === ListType.UNORDERED) {
      return nodeType === ListType.UNORDERED;
    }
    return nodeType === ListType.ORDERED || nodeType === ListType.UNORDERED;
  },

  isListItemNode(node: Node) {
    return (
      Element.isElement(node) && (node as { type?: string }).type === 'list-item'
    );
  },

  isListItemTextNode(node: Node) {
    return (
      Element.isElement(node) && (node as { type?: string }).type === 'paragraph'
    );
  },

  createDefaultTextNode(props = {}) {
    return { children: [{ text: '' }], ...props, type: 'paragraph' } as SlateElement;
  },

  createListNode(type: ListType = ListType.UNORDERED, props = {}) {
    const nodeType =
      type === ListType.ORDERED ? ListType.ORDERED : ListType.UNORDERED;
    return { children: [], ...props, type: nodeType } as SlateElement;
  },

  createListItemNode(props = {}) {
    return {
      type: 'list-item',
      checked: undefined,
      mentions: [],
      id: '',
      children: [{ text: '' }],
      ...props,
    } as SlateElement;
  },

  createListItemTextNode(props = {}) {
    return { children: [{ text: '' }], ...props, type: 'paragraph' } as SlateElement;
  },
};
