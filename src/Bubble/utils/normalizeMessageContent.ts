import React from 'react';

/** Keep malformed message records from being rendered as React children. */
export const normalizeMessageContent = (
  content: React.ReactNode,
): React.ReactNode => {
  if (
    content === null ||
    typeof content !== 'object' ||
    Array.isArray(content) ||
    React.isValidElement(content)
  ) {
    return content;
  }

  const node = content as unknown as Record<PropertyKey, unknown>;
  if (
    node.$$typeof === Symbol.for('react.portal') ||
    typeof node[Symbol.iterator] === 'function'
  ) {
    return content;
  }

  return '';
};
