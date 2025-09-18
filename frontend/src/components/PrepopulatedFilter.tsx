import { Select } from "@navikt/ds-react";
import { Datepicker, isISODateString } from "nav-datovelger";
import React from "react";
import TimePicker from "react-time-picker";
import styles from "./Filter.module.scss";
import filterValues from "../data/filterValues.json";
export type FilterKeys = "role" | "service" | "action" | "status " | "hendelsedeskr";

type FilterProps<T, K extends keyof T> = {
  messages: T[];
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  onFromDateChange: (value: string) => void;
  onFromTimeChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onToTimeChange: (value: string) => void;
  onFromTimeBlur?: () => void;
  onToTimeBlur?: () => void;
  onFilterChange: (key: K, value: T[K]) => void;
  filterKeys?: K[];
  action?: string;
  onRoleChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onActionChange: (value: string) => void;
};

const PrepopulatedFilter = <T, K extends keyof T>({
  messages,
  fromDate,
  fromTime,
  toDate,
  toTime,
  onFromDateChange,
  onFromTimeChange,
  onToDateChange,
  onToTimeChange,
  onFilterChange,
  onFromTimeBlur,
  onToTimeBlur,
  filterKeys = ["role", "service", "action", "status"] as K[],
  onRoleChange,
  onServiceChange,
  onActionChange
}: FilterProps<T, K>) => {
  const uniqueFilters = filterKeys.reduce((prevVal, filterKey) => {
    return {
      ...prevVal,
      [filterKey]: Array.from(
        new Set(messages.map((message) => message[filterKey]))
      ),
    };
  }, {} as Record<K, string[]>);

  return (
    <div className={styles.gridContainer}>
      <div
        style={{
          gridArea: "fromTime",
        }}
      >
        <label
          className="navds-select__label navds-label navds-label--small"
          htmlFor="datepicker-input-fom"
        >
          Fra og med dato
        </label>
        <div style={{ display: "flex", marginTop: "0.5rem" }}>
          <Datepicker
            locale={"nb"}
            inputId="datepicker-input-fom"
            value={fromDate}
            onChange={onFromDateChange}
            inputProps={{
              name: "dateInput",
              "aria-invalid":
                fromDate !== "" && isISODateString(fromDate) === false,
            }}
            calendarSettings={{ showWeekNumbers: false }}
            showYearSelector={true}
          />
          <TimePicker
            onChange={(value) => {
              if (value !== null) {
                typeof value === "string"
                  ? onFromTimeChange(value)
                  : onFromTimeChange(value.toLocaleTimeString());
              }
            }}
            onBlur={onFromTimeBlur ?? (() => {})}
            value={fromTime}
            format="HH:mm"
          />
        </div>
      </div>
      {filterKeys.includes("role" as K) && (
        <Select
          style={{
            textAlign: "left",
            gridArea: "role",
          }}
          label="Rolle"
          size="small"
          onChange={(event) => onRoleChange(event.target.value)}
        >
          <option value="">Velg rolle</option>
          {filterValues["service"].map((role) => {
            return (
              <option key={role} value={role}>
                {role}
              </option>
            );
          })}
        </Select>
      )}
      {filterKeys.includes("service" as K) && (
        <Select
          style={{
            gridArea: "service",
          }}
          label="Service"
          size="small"
          onChange={(event) => onServiceChange(event.target.value)}
        >
          <option value="">Velg service</option>
          {filterValues["service"].map((service) => {
            return (
              <option key={service} value={service}>
                {service}
              </option>
            );
          })}
        </Select>
      )}
      <div
        style={{
          gridArea: "toTime",
        }}
      >
        <label
          className="navds-select__label navds-label navds-label--small"
          htmlFor="datepicker-input-tom"
        >
          Til og med
        </label>
        <div style={{ display: "flex", marginTop: "0.5rem" }}>
          <Datepicker
            locale={"nb"}
            inputId="datepicker-input-tom"
            value={toDate}
            onChange={onToDateChange}
            inputProps={{
              name: "dateInput",
              "aria-invalid":
                toDate !== "" && isISODateString(toDate) === false,
            }}
            calendarSettings={{ showWeekNumbers: false }}
            showYearSelector={true}
          />
          <TimePicker
            onChange={(value) => {
              if (value !== null) {
                typeof value === "string"
                  ? onToTimeChange(value)
                  : onToTimeChange(value.toLocaleTimeString());
              }
            }}
            onBlur={onToTimeBlur ?? (() => {})}
            value={toTime}
            format="HH:mm"
          />
        </div>
      </div>
      {filterKeys.includes("action" as K) && (
        <Select
          label="Action"
          size="small"
          onChange={(event) => onActionChange(event.target.value)}
          style={{ gridArea: "action" }}
        >
          <option value="">Velg action</option>
          {filterValues["action"].map((action) => {
            return (
              <option key={action} value={action}>
                {action}
              </option>
            );
          })}
        </Select>
      )}
      {filterKeys.includes("status" as K) && (
        <Select
          label="Status"
          size="small"
          onChange={(event) =>
            onFilterChange(
              "status" as K,
              event.currentTarget.value as unknown as T[K]
            )
          }
          style={{ gridArea: "status" }}
        >
          <option value="">Velg status</option>
          {uniqueFilters["status" as K].map((status) => {
            return (
              <option key={status} value={status}>
                {status}
              </option>
            );
          })}
        </Select>
      )}
        {filterKeys.includes("hendelsedeskr" as K) && (
        <Select
            label="Hendelse"
            size="small"
            onChange={(event) =>
                onFilterChange(
                    "hendelsedeskr" as K,
                    event.currentTarget.value as unknown as T[K]
                )
            }
            style={{ gridArea: "hendelsedeskr" }}
        >
            <option value="">Velg hendelse</option>
            {uniqueFilters["hendelsedeskr" as K].map((hendelsedeskr) => {
                return (
                    <option key={hendelsedeskr} value={hendelsedeskr}>
                        {hendelsedeskr}
                    </option>
                );
            })}
        </Select>
    )}
    </div>
  );
};

export default PrepopulatedFilter;
