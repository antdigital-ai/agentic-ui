import React from 'react';
import { LinkCardProps, LinkCardView } from './LinkCardView';

export const ReadonlyLinkCard = React.memo(function ReadonlyLinkCard(
  props: LinkCardProps,
) {
  return <LinkCardView {...props} readonly />;
});
