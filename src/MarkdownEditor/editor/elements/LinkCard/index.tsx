import React from 'react';
import { LinkCardProps, LinkCardView } from './LinkCardView';

export const LinkCard = React.memo(function LinkCard(props: LinkCardProps) {
  return <LinkCardView {...props} />;
});
