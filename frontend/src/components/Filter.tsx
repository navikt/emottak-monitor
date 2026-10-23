import { Datepicker, isISODateString } from "nav-datovelger";
import React from "react";
import TimePicker from "react-time-picker";
import styles from "./Filter.module.scss";
import SelectFilter from "./SelectFilter";

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
  onFromTimeBlur,
  onToTimeBlur,
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
              "aria-invalid": fromDate !== "" && !isISODateString(fromDate),
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
        <SelectFilter
          gridArea="role"
          label="Rolle"
          placeholder="Velg rolle"
          options={uniqueFilters["role" as K]}
          onChange={(value) =>
            onFilterChange("role" as K, value as unknown as T[K])
          }
        />
      )}
      {filterKeys.includes("service" as K) && (
        <SelectFilter
          gridArea="service"
          label="Service"
          placeholder="Velg service"
          options={uniqueFilters["service" as K]}
          onChange={(value) =>
            onFilterChange("service" as K, value as unknown as T[K])
          }
        />
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
              "aria-invalid": toDate !== "" && !isISODateString(toDate),
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
        <SelectFilter
          gridArea="action"
          label="Action"
          placeholder="Velg action"
          options={uniqueFilters["action" as K]}
          onChange={(value) =>
            onFilterChange("action" as K, value as unknown as T[K])
          }
        />
      )}
      {filterKeys.includes("status" as K) && (
        <SelectFilter
          gridArea="status"
          label="Status"
          placeholder="Velg status"
          options={[
            { value: "created", label: "🆕 Opprettet" },
            { value: "info", label: "ℹ️ Informasjon" },
            { value: "manual", label: "🔧 Manuell behandling" },
            { value: "warning", label: "⚠️ Advarsel" },
            { value: "error", label: "❌ Feil" },
            { value: "fatal", label: "🚫 Fatal feil" },
            { value: "ok", label: "✅ Ferdigbehandlet" },
          ]}
          onChange={(value) =>
            onFilterChange("status" as K, value as unknown as T[K])
          }
        />
      )}
      {filterKeys.includes("hendelsedeskr" as K) && (
        <SelectFilter
          gridArea="hendelsedeskr"
          label="Hendelse"
          placeholder="Velg hendelse"
          options={uniqueFilters["hendelsedeskr" as K]}
          onChange={(value) =>
            onFilterChange("hendelsedeskr" as K, value as unknown as T[K])
          }
        />
      )}
    </div>
  );
};

export default Filter;
