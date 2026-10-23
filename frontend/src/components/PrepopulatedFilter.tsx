import { Datepicker, isISODateString } from "nav-datovelger";
import React, {useEffect} from "react";
import TimePicker from "react-time-picker";
import styles from "./Filter.module.scss";
import SelectFilter from "./SelectFilter";
import useFetch from "../hooks/useFetch";
import NavFrontendSpinner from "nav-frontend-spinner";

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
  onRoleChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onHendelsedeskrChange?: (value: string) => void;
};

type DistinctRolesServicesActions = {
    roles: string[];
    services: string[];
    actions: string[];
    refreshedAt: string;
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
  onActionChange,
  onStatusChange = (value: string) => { onFilterChange(
        "status" as K,
        value as unknown as T[K]
    ) },
  onHendelsedeskrChange = (value: string) => { onFilterChange(
      "hendelsedeskr" as K,
      value as unknown as T[K]
  ) }
}: FilterProps<T, K>) => {
  const uniqueFilters = filterKeys.reduce((prevVal, filterKey) => {
    return {
      ...prevVal,
      [filterKey]: Array.from(
        new Set(messages.map((message) => message[filterKey]))
      ),
    };
  }, {} as Record<K, string[]>);

  const url = `/v1/hentrollerservicesaction`;
  const { fetchState, callRequest } = useFetch<DistinctRolesServicesActions>(url);

  useEffect(() => {
      callRequest();
  }, []);

  const { loading, error, data } = fetchState;
  const roles = data?.roles ?? [];
  const services = data?.services ?? [];
  const actions = data?.actions ?? [];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage = !loading && !error?.message && roles?.length === 0;

  if (showSpinner)
    return <NavFrontendSpinner />
  else if (showErrorMessage)
    return <p>ERROR: {error.message}</p>
  else if (showNoDataMessage)
    return <p>Feilet med å hente filter-verdier!</p>
  return (
    <div className={styles.gridContainer}>
      <div style={{ gridArea: "fromTime" }}>
        <label
          className="navds-select__label navds-label navds-label--small"
          htmlFor="datepicker-input-fom"
        >Fra og med dato</label>
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
          options={roles}
          onChange={onRoleChange}
        />
      )}
      {filterKeys.includes("service" as K) && (
        <SelectFilter
          gridArea="service"
          label="Service"
          placeholder="Velg service"
          options={services}
          onChange={onServiceChange}
        />
      )}
      <div style={{ gridArea: "toTime" }}>
        <label
          className="navds-select__label navds-label navds-label--small"
          htmlFor="datepicker-input-tom"
        >Til og med</label>
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
          options={actions}
          onChange={onActionChange}
        />
      )}
      {filterKeys.includes("status" as K) && (
        <SelectFilter
          gridArea="status"
          label="Status"
          placeholder="Velg status"
          options={[
            // { value: "created", label: "Opprettet" },
            { value: "Meldingen er under behandling", label: "ℹ️ Informasjon" },
            // { value: "manual", label: "Manuell behandling" },
            // { value: "warning", label: "Advarsel" },
            { value: "Meldingen feilet under behandling", label: "❌ Feil" },
            // { value: "fatal", label: "Fatal feil" },
            { value: "Meldingen er ferdigbehandlet", label: "✅ Ferdigbehandlet" },
          ]}
          onChange={onStatusChange}
        />
      )}
      {filterKeys.includes("hendelsedeskr" as K) && (
        <SelectFilter
          gridArea="hendelsedeskr"
          label="Hendelse"
          placeholder="Velg hendelse"
          options={uniqueFilters["hendelsedeskr" as K]}
          onChange={onHendelsedeskrChange}
        />
      )}
    </div>
  );
};

export default PrepopulatedFilter;
