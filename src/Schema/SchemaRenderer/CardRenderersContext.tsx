import React, { createContext, useContext } from 'react';
import { RenderElementProps } from 'slate-react';

export type CardRenderer = (props: RenderElementProps) => React.ReactNode;

export type CardRenderers = Record<string, CardRenderer>;

export const CardRenderersContext = createContext<CardRenderers | undefined>(
  undefined,
);

export const useCardRenderers = () => {
  return useContext(CardRenderersContext);
};
