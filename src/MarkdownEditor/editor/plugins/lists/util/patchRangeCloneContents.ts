/**
 * Prezly slate-lists: patch Range.cloneContents for list copy/paste DOM structure.
 * @see https://github.com/prezly/slate/blob/main/packages/slate-lists/src/util/patchRangeCloneContents.ts
 */

function wrapInFragment(nodes: (string | Node)[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  fragment.append(...nodes);
  return fragment;
}

function wrapInList(
  nodes: (string | Node)[],
  nodeName: 'OL' | 'UL',
): HTMLElement {
  const listElement = document.createElement(nodeName);
  listElement.append(...nodes);
  return listElement;
}

function wrapInLi(nodes: (string | Node)[]): HTMLElement {
  const listItemElement = document.createElement('li');
  listItemElement.append(...nodes);
  return listItemElement;
}

export function patchRangeCloneContents() {
  const originalCloneContents = Range.prototype.cloneContents;

  Range.prototype.cloneContents = function cloneContents(): DocumentFragment {
    const contents = originalCloneContents.apply(this);

    if (
      this.commonAncestorContainer.nodeName === 'OL' ||
      this.commonAncestorContainer.nodeName === 'UL'
    ) {
      return wrapInFragment([
        wrapInList(
          [...contents.childNodes],
          this.commonAncestorContainer.nodeName as 'OL' | 'UL',
        ),
      ]);
    }

    if (
      this.commonAncestorContainer.nodeName === 'LI' &&
      this.commonAncestorContainer.parentElement &&
      (this.commonAncestorContainer.parentElement.nodeName === 'OL' ||
        this.commonAncestorContainer.parentElement.nodeName === 'UL')
    ) {
      return wrapInFragment([
        wrapInList(
          [wrapInLi([...contents.childNodes])],
          this.commonAncestorContainer.parentElement.nodeName as 'OL' | 'UL',
        ),
      ]);
    }

    return contents;
  };

  return function undo() {
    Range.prototype.cloneContents = originalCloneContents;
  };
}
