import { useState } from "react";

export type Filter<T, K extends keyof T> = Record<K, T[K]>;

const useFilter = <T, K extends keyof T>(items: T[], filterKeys: K[]) => {
  const handleFilterChange = (key: K, value: T[K]) => {
    setFilters((prevVal) => ({ ...prevVal, [key]: value }));
  };

  const [filters, setFilters] = useState<Filter<T, K>>(
    filterKeys.reduce(
      (prevVal, filterKey) => ({
        ...prevVal,
        [filterKey]: "",
      }),
      {} as Filter<T, K>
    )
  );

  const filteredItems = items.filter((item) => {
    // Check if all current filters applies to the message
    return filterKeys.reduce<boolean>((prevVal, filterKey) => {
      return (
        (filters[filterKey] === ("" as unknown as T[K]) ||
          filters[filterKey] === item[filterKey]) &&
        prevVal
      );
    }, true);
  });

  return { filteredItems, handleFilterChange };
};

export default useFilter;
