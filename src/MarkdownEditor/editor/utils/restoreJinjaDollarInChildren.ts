import React from 'react';
import { JINJA_DOLLAR_PLACEHOLDER } from '../parser/constants';

/** Restore parser placeholders without cloning ordinary Slate text subtrees. */
export const restoreJinjaDollarInChildren = (
  children: React.ReactNode,
): React.ReactNode => {
  if (typeof children === 'string') {
    return children.includes(JINJA_DOLLAR_PLACEHOLDER)
      ? children.split(JINJA_DOLLAR_PLACEHOLDER).join('$')
      : children;
  }

  if (Array.isArray(children)) {
    let changed = false;
    const restored = children.map((child) => {
      const next = restoreJinjaDollarInChildren(child);
      if (next !== child) changed = true;
      return next;
    });
    return changed ? restored : children;
  }

  if (
    children !== null &&
    typeof children === 'object' &&
    Symbol.iterator in children &&
    typeof children[Symbol.iterator] === 'function'
  ) {
    // Materialize once: returning a consumed generator would drop its children.
    return Array.from(
      children as Iterable<React.ReactNode>,
      restoreJinjaDollarInChildren,
    );
  }

  if (!React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return children;
  }
  const restored = restoreJinjaDollarInChildren(children.props.children);
  return restored === children.props.children
    ? children
    : React.cloneElement(children, undefined, restored);
};
