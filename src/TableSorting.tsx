import React from "react";

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
};

export enum SortDirection {
  "ascending" = "ascending",
  "descending" = "descending",
}

const TableSorting = <T,>(items: T[], config: SortConfig<T> | null = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === SortDirection.ascending ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === SortDirection.ascending ? 1 : -1;
        }
        return 0;
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
export default TableSorting;
