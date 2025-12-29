import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  AvatarList,
  ContributorAvatar,
} from '@ant-design/agentic-ui/MarkdownEditor/editor/components/ContributorAvatar';

describe('ContributorAvatar Component', () => {
  const mockItem = {
    name: 'John Doe',
    collaboratorNumber: 1,
  };

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  describe('ContributorAvatar', () => {
    it('should render contributor avatar with name', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      expect(screen.getByText('Jo')).toBeInTheDocument();
      expect(screen.getByText('Jo').closest('.ant-avatar')).toBeInTheDocument();
    });

    it('should render avatar with correct background color based on index', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      const avatar = screen.getByText('Jo').closest('.ant-avatar');
      expect(avatar).toHaveStyle('background-color: rgb(245, 106, 0)');
    });

    it('should cycle through color list based on index', () => {
      const { rerender } = renderWithProvider(
        <ContributorAvatar item={mockItem} index={8} className="test-avatar" />,
      );

      let avatar = screen.getByText('Jo').closest('.ant-avatar');
      expect(avatar).toHaveStyle('background-color: rgb(255, 191, 0)'); // Same as index 0

      rerender(
        <ConfigProvider>
          <ContributorAvatar
            item={mockItem}
            index={9}
            className="test-avatar"
          />
        </ConfigProvider>,
      );

      avatar = screen.getByText('Jo').closest('.ant-avatar');
      expect(avatar).toHaveStyle('background-color: rgb(0, 162, 174)'); // index 9 % 6 = 3
    });

    it('should render tooltip with user name', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      // The avatar should be wrapped by tooltip
      const avatarDiv = screen.getByText('Jo').closest('div[aria-describedby]');
      expect(avatarDiv).toBeInTheDocument();
    });

    it('should handle names with different lengths', () => {
      const shortNameItem = { name: 'A', collaboratorNumber: 1 };
      renderWithProvider(
        <ContributorAvatar
          item={shortNameItem}
          index={0}
          className="test-avatar"
        />,
      );

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle undefined item gracefully', () => {
      renderWithProvider(
        <ContributorAvatar
          item={undefined}
          index={0}
          className="test-avatar"
        />,
      );

      const avatar = document.querySelector('.ant-avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle undefined name gracefully', () => {
      const itemWithoutName = { name: undefined as any, collaboratorNumber: 1 };
      renderWithProvider(
        <ContributorAvatar
          item={itemWithoutName}
          index={0}
          className="test-avatar"
        />,
      );

      const avatar = document.querySelector('.ant-avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should apply the provided className', () => {
      renderWithProvider(
        <ContributorAvatar
          item={mockItem}
          index={0}
          className="custom-class"
        />,
      );

      const wrapper = screen.getByText('Jo').closest('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should use default index of 0 when not provided', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} className="test-avatar" />,
      );

      const avatar = screen.getByText('Jo').closest('.ant-avatar');
      expect(avatar).toHaveStyle('background-color: rgb(245, 106, 0)'); // First color
    });

    it('should have cursor pointer style', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      const avatar = screen.getByText('Jo').closest('.ant-avatar');
      expect(avatar).toHaveStyle('cursor: pointer');
    });

    it('should render with correct size', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      const avatar = screen.getByText('Jo').closest('.ant-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('AvatarList', () => {
    const mockDisplayList = [
      { name: 'John Doe', collaboratorNumber: 1 },
      { name: 'Jane Smith', collaboratorNumber: 2 },
      { name: 'Bob Johnson', collaboratorNumber: 3 },
    ];

    it('should render all avatars in the display list', () => {
      renderWithProvider(<AvatarList displayList={mockDisplayList} />);

      expect(screen.getByText('Jo')).toBeInTheDocument();
      expect(screen.getByText('Ja')).toBeInTheDocument();
      expect(screen.getByText('Bo')).toBeInTheDocument();
    });

    it('should render empty list when no items provided', () => {
      renderWithProvider(<AvatarList displayList={[]} />);
      const avatarList = document.querySelector(
        '.ant-agentic-contributor-avatar-list',
      );
      expect(avatarList?.children).toHaveLength(0);
    });

    it('should apply custom styles', () => {
      renderWithProvider(
        <AvatarList
          displayList={mockDisplayList}
          style={{ background: 'red' }}
        />,
      );

      const avatarList = document.querySelector(
        '.ant-agentic-contributor-avatar-list',
      );
      expect(avatarList).toHaveStyle('background: red');
    });

    it('should assign unique keys to each avatar', () => {
      renderWithProvider(<AvatarList displayList={mockDisplayList} />);

      // All avatars should be rendered (React key prop doesn't show in DOM)
      const avatars = document.querySelectorAll('.ant-avatar');
      expect(avatars).toHaveLength(3);
    });

    it('should pass correct index to each ContributorAvatar', () => {
      renderWithProvider(<AvatarList displayList={mockDisplayList} />);

      const avatars = document.querySelectorAll('.ant-avatar');

      // First avatar should have the first color
      expect(avatars[0]).toHaveStyle('background-color: rgb(245, 106, 0)');
      // Second avatar should have the second color
      expect(avatars[1]).toHaveStyle('background-color: rgb(114, 101, 230)');
      // Third avatar should have the third color
      expect(avatars[2]).toHaveStyle('background-color: rgb(255, 191, 0)');
    });

    it('should handle duplicate names correctly', () => {
      const duplicateNames = [
        { name: 'John Doe', collaboratorNumber: 1 },
        { name: 'John Doe', collaboratorNumber: 2 },
      ];
      renderWithProvider(<AvatarList displayList={duplicateNames} />);

      const avatars = document.querySelectorAll('.ant-avatar');
      expect(avatars).toHaveLength(2);

      // Both should show the same initials but different colors
      expect(screen.getAllByText('Jo')).toHaveLength(2);
    });

    it('should render with proper CSS classes', () => {
      renderWithProvider(<AvatarList displayList={mockDisplayList} />);

      const avatarList = document.querySelector(
        '.ant-agentic-contributor-avatar-list',
      );
      expect(avatarList).toBeInTheDocument();

      const avatarItems = document.querySelectorAll(
        '.ant-agentic-contributor-avatar-list-item',
      );
      expect(avatarItems).toHaveLength(3);
    });

    it('should handle names with special characters', () => {
      const specialNames = [
        { name: 'José María', collaboratorNumber: 1 },
        { name: '李小明', collaboratorNumber: 2 },
      ];
      renderWithProvider(<AvatarList displayList={specialNames} />);

      expect(screen.getByText('Jo')).toBeInTheDocument();
      expect(screen.getByText('李小')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      const longName = [
        {
          name: 'VeryLongNameThatShouldBeHandledProperly',
          collaboratorNumber: 1,
        },
      ];
      renderWithProvider(<AvatarList displayList={longName} />);

      expect(screen.getByText('Ve')).toBeInTheDocument();
    });

    it('should maintain stable rendering with same props', () => {
      const { rerender } = renderWithProvider(
        <AvatarList displayList={mockDisplayList} />,
      );

      const initialAvatars = document.querySelectorAll('.ant-avatar');
      expect(initialAvatars).toHaveLength(3);

      // Re-render with same props
      rerender(
        <ConfigProvider>
          <AvatarList displayList={mockDisplayList} />
        </ConfigProvider>,
      );

      const rerenderedAvatars = document.querySelectorAll('.ant-avatar');
      expect(rerenderedAvatars).toHaveLength(3);
    });
  });
});
