import classNames from 'clsx';
import React from 'react';
import { AvatarList } from '../../components/ContributorAvatar';

interface LinkCardContentProps {
  blockCls: string;
  url?: string;
  icon?: string;
  title?: string;
  name?: string;
  description?: string;
  collaborators?: Record<string, number>[];
  updateTime?: string;
}

/** Keep card metadata independent of Slate's changing children/attributes. */
export const LinkCardContent = React.memo(function LinkCardContent({
  blockCls,
  url,
  icon,
  title,
  name,
  description,
  collaborators,
  updateTime,
}: LinkCardContentProps) {
  const hasCollaborators = !!collaborators?.length;
  return (
    <div
      style={{ flex: 1 }}
      onClick={() => window.open(url)}
      className={classNames(`${blockCls}__container`, `${blockCls}__content`)}
      contentEditable={false}
    >
      {icon ? (
        <img className={`${blockCls}__icon`} src={icon} width={56} />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={url}
          className={`${blockCls}__title`}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            window.open(url);
          }}
          download={title || name || 'no title'}
        >
          {title || name || 'no title'}
        </a>
        <div className={`${blockCls}__description`}>{description || url}</div>
        {(hasCollaborators || updateTime) && (
          <div className={`${blockCls}__collaborators`}>
            {hasCollaborators && (
              <AvatarList
                displayList={collaborators.slice(0, 5).map((item) => ({
                  name: Object.keys(item)[0],
                  collaboratorNumber: Object.values(item)[0] || 0,
                }))}
              />
            )}
            {updateTime && (
              <div
                className={`${blockCls}__update-time`}
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  fontSize: 12,
                  marginInlineStart: hasCollaborators ? undefined : 'auto',
                }}
              >
                {updateTime}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
