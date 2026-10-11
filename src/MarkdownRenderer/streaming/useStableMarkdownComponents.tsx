import React, { createContext, useContext, useMemo, useState } from 'react';
import type { RendererBlockProps } from '../types';

type ComponentMap = Record<string, React.ComponentType<RendererBlockProps>>;

interface MarkdownComponentRuntime {
  renderers: ComponentMap;
  overrides?: ComponentMap;
}

export const MarkdownComponentContext =
  createContext<MarkdownComponentRuntime | null>(null);

const createComponentBridge = (tagName: string) => {
  const ComponentBridge = (props: RendererBlockProps): React.ReactNode => {
    const runtime = useContext(MarkdownComponentContext);
    if (!runtime) return null;
    const Override = runtime.overrides?.[tagName];
    if (Override) return <Override {...props} />;
    const render = runtime.renderers[tagName];
    if (render) {
      // buildEditorAlignedComponents creates hook-free render functions. Invoke
      // those inside a stable component instead of replacing their React type
      // on each callback/configuration update. User components retain normal
      // React component boundaries above, including their own hooks and state.
      return (render as (props: RendererBlockProps) => React.ReactNode)(props);
    }
    const { node: _node, ...nativeProps } = props;
    return React.createElement(tagName, nativeProps);
  };
  ComponentBridge.displayName = `MarkdownComponent(${tagName})`;
  return ComponentBridge;
};

/** Stable tag types keep cached blocks alive while context refreshes behavior. */
export const useStableMarkdownComponents = (
  renderers: ComponentMap,
  overrides?: ComponentMap,
) => {
  const [registry, setRegistry] = useState<ComponentMap>(() =>
    Object.fromEntries(
      Object.keys(renderers).map((key) => [key, createComponentBridge(key)]),
    ),
  );
  let components = registry;
  const missing = Object.keys(renderers).filter(
    (key) => !Object.prototype.hasOwnProperty.call(registry, key),
  );
  if (missing.length) {
    components = { ...registry };
    for (const key of missing) components[key] = createComponentBridge(key);
    // Persist new keys through React state so abandoned concurrent renders
    // cannot replace types already used by the committed document.
    setRegistry(components);
  }
  const runtime = useMemo(
    () => ({ renderers, overrides }),
    [renderers, overrides],
  );
  return { components, runtime };
};
