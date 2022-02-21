import React from "react";

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
};

export enum SortDirection {
  "ascending" = "ascending",
  "descending" = "descending",
}

const useTableSorting = <T,>(
  items: T[] | null,
  config: SortConfig<T> | null = null
) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const sortStrings = (a: string, b: string, sortDirection: SortDirection) => {
    if (a < b) {
      return sortDirection === SortDirection.ascending ? -1 : 1;
    }
    if (a > b) {
      return sortDirection === SortDirection.ascending ? 1 : -1;
    }
    return 0;
  };

  const sortNumbers = (a: number, b: number, sortDirection: SortDirection) => {
    if (a - b > 0) {
      return sortDirection === SortDirection.ascending ? 1 : -1;
    } else if (a - b < 0) {
      return sortDirection === SortDirection.ascending ? -1 : 1;
    }
    return 0;
  };

  const sortedItems = React.useMemo(() => {
    if (!items) {
      return [];
    }
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortNumbers(valA, valB, sortConfig.direction);
        } else {
          return sortStrings(String(valA), String(valB), sortConfig.direction);
        }
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction = SortDirection.ascending;
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === SortDirection.ascending
    ) {
      direction = SortDirection.descending;
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

export default useTableSorting;
