import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyListItem } from '../ReadonlyListItem';

describe('ReadonlyListItem residual branches', () => {
  it('renders a plain list item without task controls', () => {
    render(<ReadonlyListItem attributes={{}} element={{ type: 'list-item', children: [{ text: '' }] } as any}>plain</ReadonlyListItem>);
    expect(screen.getByRole('listitem')).not.toHaveClass('task');
  });

  it('renders checked task mentions, including only HTTP avatars', () => {
    render(
      <ReadonlyListItem
        attributes={{}}
        element={{
          type: 'list-item',
          checked: true,
          mentions: [{ id: 'a', name: 'Ada', avatar: 'https://avatar' }, { id: 'b', name: 'Bob', avatar: '/local' }],
          children: [{ text: '' }],
        } as any}
      >
        task
      </ReadonlyListItem>,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByAltText('Ada')).toBeInTheDocument();
    expect(screen.queryByAltText('Bob')).not.toBeInTheDocument();
  });
});
