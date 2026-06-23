export type TableChromePosition = {
  rowIndex?: number;
  columnIndex?: number;
} | null;

function chromePositionEqual(
  a: TableChromePosition,
  b: TableChromePosition,
): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  return a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex;
}

export type TableChromeStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => TableChromePosition;
  setPosition: (position: TableChromePosition) => void;
};

export function createTableChromeStore(
  initial: TableChromePosition = null,
): TableChromeStore {
  let snapshot: TableChromePosition = initial;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    setPosition(position) {
      if (chromePositionEqual(snapshot, position)) {
        return;
      }
      snapshot = position;
      listeners.forEach((listener) => listener());
    },
  };
}
