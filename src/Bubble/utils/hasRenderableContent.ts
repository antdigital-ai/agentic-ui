import React from 'react';

/** Recognize empty slots without evaluating user components. */
export const hasRenderableContent = (node: React.ReactNode): boolean => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return false;
  }
  if (typeof node === 'string') return node.length > 0;
  if (Array.isArray(node)) return node.some(hasRenderableContent);
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    if (node.type === React.Fragment) {
      return hasRenderableContent(node.props.children);
    }
  }
  return true;
};
