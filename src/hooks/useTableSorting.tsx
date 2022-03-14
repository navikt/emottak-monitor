import React, { useMemo } from "react";

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
    config: SortConfig<T> | null = null ) => {
      const [sortConfig, setSortConfig] = React.useState(config);
      const sort = useMemo(
        () => (a: T[keyof T], b: T[keyof T], sortDirection: SortDirection) => {
          if (a < b) {
            return sortDirection === SortDirection.ascending ? -1 : 1;
          }
          if (a > b) {
            return sortDirection === SortDirection.ascending ? 1 : -1;
          }
          return 0;
        },
      []
      );

      const sortedItems = React.useMemo(() => {
        if (!items) {
          return [];
        }

        let sortableItems = [...items];
        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            return sort(valA, valB, sortConfig.direction);
          });
        }
        return sortableItems;
      }, [items, sortConfig, sort]);

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