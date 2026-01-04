import React, { ReactNode } from 'react';

interface CardContainerProps<T = any> {
  items: T[];
  children: (props: { item: T; index: number }) => ReactNode;
}

const CardContainer = <T,>({ items, children }: CardContainerProps<T>) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        alignItems: 'start',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{children({ item, index })}</React.Fragment>
      ))}
    </div>
  );
};

export default CardContainer;
