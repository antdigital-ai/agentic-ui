import { Avatar, ConfigProvider, Tooltip } from 'antd';
import classNames from 'clsx';
import React from 'react';
import { useStyle } from './style';

type AvatarListItem = {
  name: string;
  collaboratorNumber: number;
};
interface ContributorAvatarProps {
  loading?: boolean;
  item?: AvatarListItem;
  index?: number;
  className: string;
}

const COLOR_LIST = [
  '#f56a00',
  '#7265e6',
  '#ffbf00',
  '#00a2ae',
  '#f44336',
  '#87d068',
];

export const ContributorAvatar: React.FC<ContributorAvatarProps> = (props) => {
  const { item: { name } = {}, index = 0 } = props;
  return (
    <Tooltip title={name}>
      <div className={props.className}>
        <Avatar
          size={14}
          alt={name}
          style={{
            backgroundColor: COLOR_LIST[index % COLOR_LIST.length],
            cursor: 'pointer',
          }}
        >
          {name?.slice(0, 2)}
        </Avatar>
      </div>
    </Tooltip>
  );
};

export const AvatarList: React.FC<{
  displayList: AvatarListItem[];
  style?: React.CSSProperties;
}> = ({ displayList, style }) => {
  const context = React.useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-contributor-avatar-list');
  const { wrapSSR, hashId } = useStyle(baseCls);
  return wrapSSR(
    <>
      <div
        className={classNames(hashId, baseCls)}
        style={{
          ...style,
        }}
      >
        {displayList.map((item, index) => {
          return (
            <ContributorAvatar
              key={item.name}
              className={classNames(`${baseCls}-item`, hashId)}
              item={item}
              index={index}
            />
          );
        })}
      </div>
    </>,
  );
};
