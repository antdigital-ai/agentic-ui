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
      const avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toBeInTheDocument();
    });

    it('should render avatar with correct background color based on index', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      const avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toHaveStyle('background-color: rgb(245, 106, 0)');
    });

    it('should cycle through color list based on index', () => {
      const { rerender } = renderWithProvider(
        <ContributorAvatar
          item={mockItem}
          index={6} // Should cycle back to index 0 color
          className="test-avatar"
        />,
      );

      let avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toHaveStyle('background-color: rgb(245, 106, 0)'); // Same as index 0

      rerender(
        <ConfigProvider>
          <ContributorAvatar
            item={mockItem}
            index={1}
            className="test-avatar"
          />
        </ConfigProvider>,
      );

      avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toHaveStyle('background-color: rgb(114, 101, 230)');
    });

    it('should handle names with different lengths', () => {
      const shortName = { name: 'A', collaboratorNumber: 1 };
      const { rerender } = renderWithProvider(
        <ContributorAvatar
          item={shortName}
          index={0}
          className="test-avatar"
        />,
      );

      expect(screen.getByText('A')).toBeInTheDocument();

      const longName = { name: 'Very Long Name', collaboratorNumber: 1 };
      rerender(
        <ConfigProvider>
          <ContributorAvatar
            item={longName}
            index={0}
            className="test-avatar"
          />
        </ConfigProvider>,
      );

      expect(screen.getByText('Ve')).toBeInTheDocument();
    });

    it('should handle undefined item gracefully', () => {
      renderWithProvider(
        <ContributorAvatar
          item={undefined}
          index={0}
          className="test-avatar"
        />,
      );

      const avatarContainer = document.querySelector('.test-avatar');
      expect(avatarContainer).toBeInTheDocument();
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

      const avatarContainer = document.querySelector('.test-avatar');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('should apply the provided className', () => {
      renderWithProvider(
        <ContributorAvatar
          item={mockItem}
          index={0}
          className="custom-class"
        />,
      );

      const wrapper = document.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should use default index of 0 when not provided', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} className="test-avatar" />,
      );

      const avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toHaveStyle('background-color: rgb(245, 106, 0)'); // First color
    });

    it('should have cursor pointer style', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      const avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toHaveStyle('cursor: pointer');
    });

    it('should render with correct size', () => {
      renderWithProvider(
        <ContributorAvatar item={mockItem} index={0} className="test-avatar" />,
      );

      const avatarElement = screen.getByText('Jo').closest('span.ant-avatar');
      expect(avatarElement).toHaveStyle('width: 14px');
      expect(avatarElement).toHaveStyle('height: 14px');
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
      const { container } = renderWithProvider(<AvatarList displayList={[]} />);

      // Should render the container but no avatar items
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByText('Jo')).not.toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      const customStyle = { margin: '10px', padding: '5px' };
      const { container } = renderWithProvider(
        <AvatarList displayList={mockDisplayList} style={customStyle} />,
      );

      const listContainer = container.firstChild as HTMLElement;
      expect(listContainer).toHaveStyle('margin: 10px');
      expect(listContainer).toHaveStyle('padding: 5px');
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
      const { container } = renderWithProvider(
        <AvatarList displayList={mockDisplayList} />,
      );

      const listContainer = container.firstChild;
      expect(listContainer).toHaveClass('ant-agentic-contributor-avatar-list');
    });

    it('should handle names with special characters', () => {
      const specialNames = [
        { name: 'José María', collaboratorNumber: 1 },
        { name: '张三', collaboratorNumber: 2 },
        { name: 'Müller Schmidt', collaboratorNumber: 3 },
      ];

      renderWithProvider(<AvatarList displayList={specialNames} />);

      expect(screen.getByText('Jo')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('Mü')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      const longNames = [
        {
          name: 'Very Very Very Long Name That Exceeds Normal Length',
          collaboratorNumber: 1,
        },
      ];

      renderWithProvider(<AvatarList displayList={longNames} />);

      // Should only show first 2 characters
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
