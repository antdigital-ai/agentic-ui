import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { history } from 'styled-components';
import { ONE_TOKEN_URL } from '../../../constants';
import componentIconBg from '../../assets/component-icon.png';
import componentMobileBg from '../../assets/component-mobile-bg.png';
import componentsBg from '../../assets/components-bg.png';
import visualAssetsBg from '../../assets/visual-assets-bg.png';
import ChevronDownIcon from '../../icons/chevron-down.svg';
import LinkIcon from '../../icons/link.svg';
import LogoIcon from '../../icons/logo.svg';
import SearchIcon from '../../icons/search.svg';
import { PCComponentsMenu } from './components';
import SearchDropdown from './components/SearchDropdown';
import { useImagePreload } from './hooks/useImagePreload';
import {
  DropdownMenu,
  DropdownWrapper,
  HeaderWrapper,
  Logo,
  LogoContainer,
  LogoText,
  MenuItem,
  MenuItemWithDropdown,
  NavMenu,
  SearchContainer,
  StyledInput,
  StyledLinkIcon,
  StyledSearchIcon,
} from './style';

interface MenuItemConfig {
  name: string;
  path?: string;
  hasDropdown?: boolean;
  dropdownItems?: string[];
  dropdownNode?: ReactNode;
  hasLinkIcon?: boolean;
  disabled?: boolean;
  link?: string;
}

const Header: React.FC = () => {
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchDropdownVisible, setSearchDropdownVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 预加载 dropdown 中的图片
  const dropdownImages = [
    componentsBg,
    visualAssetsBg,
    componentMobileBg,
    componentIconBg,
  ];
  useImagePreload(dropdownImages);

  const handleDropdownMouseEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdownKey(key);
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdownKey(null);
    }, 150);
  };

  // 搜索框变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setSearchDropdownVisible(value.length > 0);
  };

  // 点击外部关闭搜索下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 从完整路径中提取相对路径（去掉 base）
  const getRelativePath = () => {
    const BASE = '/page/agentic-website';
    let fullPath = '';

    // 优先使用 history
    if (history?.location?.pathname) {
      fullPath = history.location.pathname;
    } else {
      // Fallback: 从 window.location 获取
      fullPath = window.location.pathname;
    }

    // 如果路径以 base 开头，去掉 base 部分
    if (fullPath.startsWith(BASE)) {
      const relativePath = fullPath.slice(BASE.length);
      // 如果去掉 base 后是空字符串，说明是 base 根路径，返回 '/'
      return relativePath || '/';
    }

    // 如果路径不以 base 开头，直接返回（可能是开发环境或没有 base 的情况）
    return fullPath;
  };

  const relativePath = getRelativePath();

  const menuItems: MenuItemConfig[] = [
    { name: '首页', path: '/home' },
    {
      name: 'PC 组件',
      hasDropdown: true,
      dropdownNode: <PCComponentsMenu />,
    },
    { name: '样板间', path: '/showroom', disabled: true },
    {
      name: 'OneToken',
      link: ONE_TOKEN_URL,
      hasLinkIcon: true,
    },
  ];

  // 判断是否为当前激活的路由
  const isActive = (path?: string) => {
    if (!path) return false;
    // 使用相对路径进行比较（已经去掉了 base）
    const normalizedPath = relativePath || '/';

    // 首页特殊处理：/home 对应根路径 '/' 或 '/home'
    if (path === '/home') {
      return (
        normalizedPath === '/' ||
        normalizedPath === '/home' ||
        normalizedPath.startsWith('/home/')
      );
    }

    // 其他路由：精确匹配或作为前缀
    return normalizedPath === path || normalizedPath.startsWith(`${path}/`);
  };

  return (
    <HeaderWrapper>
      <LogoContainer>
        <Logo src="https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/fmt.webp" />
        <LogoText>
          <img src={LogoIcon} alt="Agentic UI" style={{ height: '24px' }} />
        </LogoText>
      </LogoContainer>

      <NavMenu>
        {menuItems.map((item) => {
          const itemKey = item.path || item.name;
          const isDropdownOpen = openDropdownKey === itemKey;

          if (item.hasDropdown && item.dropdownNode) {
            return (
              <DropdownWrapper
                key={item.name}
                onMouseEnter={() => {
                  if (!item.disabled) {
                    handleDropdownMouseEnter(itemKey);
                  }
                }}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <MenuItemWithDropdown
                  onClick={(e) => {
                    e.preventDefault();
                    // 有 dropdown 时不处理点击动作
                  }}
                  href="#"
                  $active={isActive(item.path)}
                  $disabled={item.disabled}
                >
                  <span>{item.name}</span>
                  <img
                    src={ChevronDownIcon}
                    alt=""
                    style={{
                      width: '12px',
                      height: '12px',
                      transform: isDropdownOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </MenuItemWithDropdown>
                <AnimatePresence>
                  {isDropdownOpen && !item.disabled && (
                    <DropdownMenu
                      as={motion.div}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      $isOpen={isDropdownOpen}
                      onMouseEnter={() => {
                        if (!item.disabled) {
                          handleDropdownMouseEnter(itemKey);
                        }
                      }}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      {item.dropdownNode}
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </DropdownWrapper>
            );
          }

          if (item.hasDropdown && item.dropdownItems) {
            // 其他 dropdown 暂时保持原样，后续可以类似处理
            return (
              <MenuItemWithDropdown
                key={item.name}
                $disabled={item.disabled}
                onClick={(e) => {
                  e.preventDefault();
                  // 有 dropdown 时不处理点击动作
                }}
                href="#"
                $active={isActive(item.path)}
              >
                <span>{item.name}</span>
                <img
                  src={ChevronDownIcon}
                  alt=""
                  style={{ width: '12px', height: '12px' }}
                />
              </MenuItemWithDropdown>
            );
          }

          return (
            <MenuItem
              key={item.name}
              onClick={(e) => {
                e.preventDefault();
                if (!item.disabled) {
                  if (item.link) {
                    // 如果有 link，使用 window.open 打开新链接
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                  } else if (item.path) {
                    // 如果有 path，使用 history.push 进行路由跳转
                    history?.push(item.path);
                  }
                }
              }}
              href={item.link || item.path || '#'}
              $active={isActive(item.path)}
              $disabled={item.disabled}
            >
              {item.name}
              {item.hasLinkIcon && (
                <StyledLinkIcon>
                  <img
                    src={LinkIcon}
                    alt=""
                    style={{ width: '6px', height: '6px' }}
                  />
                </StyledLinkIcon>
              )}
            </MenuItem>
          );
        })}
      </NavMenu>

      <SearchContainer ref={searchContainerRef}>
        <StyledSearchIcon>
          <img
            src={SearchIcon}
            alt=""
            style={{ width: '10px', height: '10px' }}
          />
        </StyledSearchIcon>
        <StyledInput
          placeholder="搜索内容"
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={() => searchValue && setSearchDropdownVisible(true)}
        />
        {/* <AIBadge>AI</AIBadge> */}
        <SearchDropdown
          visible={searchDropdownVisible}
          searchValue={searchValue}
          onClose={() => setSearchDropdownVisible(false)}
        />
      </SearchContainer>
    </HeaderWrapper>
  );
};

export default Header;
