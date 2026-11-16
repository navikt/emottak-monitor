import { Select } from "@navikt/ds-react";
import React from "react";
import styles from "./Filter.module.scss";

export type SelectFilterOption = string | { value: string; label: string };

type SelectFilterProps = {
  gridArea: string;
  label: string;
  placeholder: string;
  options: SelectFilterOption[];
  onChange: (value: string) => void;
};

const SelectFilter = ({
  gridArea,
  label,
  placeholder,
  options,
  onChange,
}: SelectFilterProps) => (
  <Select
    className={styles.selectFilter}
    style={{ gridArea, marginTop: "0.5rem" }}
    label={label}
    size="small"
    onChange={(event) => onChange(event.currentTarget.value)}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => {
      const { value, label: optionLabel } =
        typeof option === "string" ? { value: option, label: option } : option;
      return (
        <option key={value} value={value}>
          {optionLabel}
        </option>
      );
    })}
  </Select>
);

export default SelectFilter;
