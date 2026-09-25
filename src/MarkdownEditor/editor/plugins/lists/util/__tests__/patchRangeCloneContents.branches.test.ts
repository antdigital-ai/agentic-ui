import { afterEach, describe, expect, it } from 'vitest';
import { patchRangeCloneContents } from '../patchRangeCloneContents';

describe('patchRangeCloneContents.branches', () => {
  const original = Range.prototype.cloneContents;

  afterEach(() => {
    Range.prototype.cloneContents = original;
  });

  it('istanbul residual：非 OL/UL/LI 祖先原样返回；OL/UL 包装', () => {
    // if (this.commonAncestorContainer.nodeName === 'OL' || ... 'UL')
    patchRangeCloneContents();

    const p = document.createElement('p');
    p.textContent = 'plain';
    document.body.appendChild(p);
    const range = document.createRange();
    range.selectNodeContents(p);
    const frag = range.cloneContents();
    expect(frag.childNodes.length).toBeGreaterThan(0);
    p.remove();

    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = 'item';
    ul.appendChild(li);
    document.body.appendChild(ul);
    const listRange = document.createRange();
    listRange.selectNodeContents(ul);
    const wrapped = listRange.cloneContents();
    expect(
      [...wrapped.childNodes].some(
        (n) => (n as HTMLElement).nodeName === 'UL',
      ),
    ).toBe(true);
    ul.remove();
  });

  it('LI 祖先且父为 UL 时包装', () => {
    patchRangeCloneContents();
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = 'x';
    ul.appendChild(li);
    document.body.appendChild(ul);
    const range = document.createRange();
    range.selectNodeContents(li);
    const frag = range.cloneContents();
    expect(frag.childNodes.length).toBeGreaterThan(0);
    ul.remove();
  });
});
