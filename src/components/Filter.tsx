import { Select } from "@navikt/ds-react";
import { Datepicker, isISODateString } from "nav-datovelger";
import React from "react";
import TimePicker from "react-time-picker";
import styles from "../MessagesTable.module.scss";
export type FilterKeys = "role" | "service" | "action" | "status";

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
  onFilterChange: (key: K, value: T[K]) => void;
  filterKeys?: K[];
};

const Filter = <T, K extends keyof T>({
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
  filterKeys = ["role", "service", "action", "status"] as K[],
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
            onChange={(value) =>
              typeof value === "string"
                ? onFromTimeChange(value)
                : onFromTimeChange(value.toLocaleTimeString())
            }
            value={fromTime}
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
          onChange={(event) =>
            onFilterChange(
              "role" as K,
              event.currentTarget.value as unknown as T[K]
            )
          }
        >
          <option value="">Velg rolle</option>
          {uniqueFilters["role" as K].map((role) => {
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
          onChange={(event) =>
            onFilterChange(
              "service" as K,
              event.currentTarget.value as unknown as T[K]
            )
          }
        >
          <option value="">Velg service</option>
          {uniqueFilters["service" as K].map((service) => {
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
            onChange={(value) =>
              typeof value === "string"
                ? onToTimeChange(value)
                : onToTimeChange(value.toLocaleTimeString())
            }
            value={toTime}
          />
        </div>
      </div>
      {filterKeys.includes("action" as K) && (
        <Select
          label="Action"
          size="small"
          onChange={(event) =>
            onFilterChange(
              "action" as K,
              event.currentTarget.value as unknown as T[K]
            )
          }
          style={{ gridArea: "action" }}
        >
          <option value="">Velg action</option>
          {uniqueFilters["action" as K].map((action) => {
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
    </div>
  );
};

export default Filter;
