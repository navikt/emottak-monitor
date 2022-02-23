import { Datepicker, isISODateString } from "nav-datovelger";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import Lenke from "nav-frontend-lenker";
import { Select } from "nav-frontend-skjema";
import NavFrontendSpinner from "nav-frontend-spinner";
//import Pagination from "paginering";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TimePicker, { TimePickerValue } from "react-time-picker";
import useFetch from "./hooks/useFetch";
import useTableSorting from "./hooks/useTableSorting";
import { initialDate, initialFilter, initialTime } from "./util";

type EventInfo = {
  action: string | null;
  avsender: string | null;
  hendelsedato: string;
  hendelsedeskr: string;
  mottakid: string;
  referanse: string | null;
  role: string | null;
  service: string | null;
  tillegsinfo: string | null;
};
type FilterKey = keyof Pick<EventInfo, "role" | "service" | "action">;

const EventsTable = () => {
  const search = useLocation().search;
  const fomParam = new URLSearchParams(search).get("fromDate");
  const tomParam = new URLSearchParams(search).get("toDate");
  const fromTimeParam = new URLSearchParams(search).get("fromTime");
  const toTimeParam = new URLSearchParams(search).get("toTime");
  const roleParam = new URLSearchParams(search).get("role");
  const serviceParam = new URLSearchParams(search).get("service");
  const actionParam = new URLSearchParams(search).get("action");

  const [fom, setFom] = useState(initialDate(fomParam));
  const [tom, setTom] = useState(initialDate(tomParam));
  let [fromTime, setFromTime] = useState(initialTime(fromTimeParam));
  let [toTime, setToTime] = useState(initialTime(toTimeParam));
  let [filteredEvents, setFilteredEvents] = useState<EventInfo[]>([]);

  const { fetchState, callRequest } = useFetch<EventInfo[]>(
    `/v1/henthendelser?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`
  );

  const { loading, error, data: events } = fetchState;

  let [filters, setFilters] = useState<Record<FilterKey, string>>({
    role: initialFilter(roleParam) ?? "",
    service: initialFilter(serviceParam) ?? "",
    action: initialFilter(actionParam) ?? "",
  });

  const navigate = useNavigate();

  const filterEvents = (key: FilterKey, selectedValue: string) => {
    setFilters((oldFilters) => ({ ...oldFilters, [key]: selectedValue }));
    pushQueryParam(search, key, selectedValue);
  };

  useEffect(() => {
    const tempFilteredEvents = events?.filter((event) => {
      return (
        (filters.role === "" || filters.role === event.role) &&
        (filters.service === "" || filters.service === event.service) &&
        (filters.action === "" || filters.action === event.action)
      );
    });
    setFilteredEvents(tempFilteredEvents ?? []);
  }, [filters, events]);

  const pushHistory = useCallback(() => {
    navigate(
      `/hendelser?fromDate=${fom}&fromTime=${fromTime}&toDate=${tom}&toTime=${toTime}&role=${filters.role}&service=${filters.service}&action=${filters.action}`
    );
  }, [fom, tom, filters, fromTime, toTime, navigate]);

  const pushQueryParam = (search: string, key: string, value: string) => {
    let searchParams = new URLSearchParams(search);
    searchParams.set(key, value);
    navigate(`/hendelser?${searchParams.toString()}`);
  };

  useEffect(() => {
    if (fom !== "" && tom !== "" && fromTime !== "" && toTime !== "") {
      pushHistory();
    }
  }, [fom, tom, fromTime, toTime, pushHistory]);

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  let uniqueRoles = Array.from(new Set(events?.map(({ role }) => role)));
  let uniqueServices = Array.from(
    new Set(events?.map(({ service }) => service))
  );
  let uniqueActions = Array.from(new Set(events?.map(({ action }) => action)));

  const { items, requestSort, sortConfig } = useTableSorting(filteredEvents);

  let eventsLength = 0;
  if (items.length) {
    eventsLength = items.length;
  }

  const getClassNamesFor = (name: keyof EventInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const handleTimePickerChange = (
    value: TimePickerValue,
    toOrFrom: "to" | "from"
  ) => {
    let updateValue;
    typeof value === "string"
      ? (updateValue = value)
      : (updateValue = value.toLocaleTimeString());

    toOrFrom === "to" ? setToTime(updateValue) : setFromTime(updateValue);
  };

  return (
    <>
      <div className="row">
        <div className="column">
          <table id={"timetable"}>
            <tbody>
              <tr>
                <th>Fra og med dato: </th>
                <th>
                  <Datepicker
                    locale={"nb"}
                    inputId="datepicker-event-input-fom"
                    value={fom}
                    onChange={setFom}
                    inputProps={{
                      name: "dateInput",
                      "aria-invalid":
                        fom !== "" && isISODateString(fom) === false,
                    }}
                    calendarSettings={{ showWeekNumbers: false }}
                    showYearSelector={true}
                  />
                </th>
                <th>
                  <TimePicker
                    onChange={(value) => handleTimePickerChange(value, "from")}
                    value={fromTime}
                  />
                </th>
              </tr>
              <tr>
                <th>Til og med:</th>
                <th>
                  <Datepicker
                    locale={"nb"}
                    inputId="datepicker-event-input-tom"
                    value={tom}
                    onChange={setTom}
                    inputProps={{
                      name: "dateInput",
                      "aria-invalid":
                        tom !== "" && isISODateString(tom) === false,
                    }}
                    calendarSettings={{ showWeekNumbers: false }}
                    showYearSelector={true}
                  />
                </th>
                <th>
                  <TimePicker
                    onChange={(value) => handleTimePickerChange(value, "to")}
                    value={toTime}
                  />
                </th>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="column">
          <table>
            <tbody>
              <tr>
                <th>
                  <Select
                    id={"select"}
                    onChange={(event) =>
                      filterEvents("role", event.target.value)
                    }
                    selected={filters.role}
                  >
                    <option value="">Velg rolle</option>
                    {uniqueRoles.map((role) => {
                      return (
                        role && (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        )
                      );
                    })}
                  </Select>
                </th>
                <th>
                  <Select
                    id={"select"}
                    onChange={(event) =>
                      filterEvents("service", event.target.value)
                    }
                    selected={filters.service}
                  >
                    <option value="">Velg service</option>
                    {uniqueServices.map((service) => {
                      return (
                        service && (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        )
                      );
                    })}
                  </Select>
                </th>
                <th>
                  <Select
                    id={"select"}
                    onChange={(event) =>
                      filterEvents("action", event.target.value)
                    }
                    selected={filters.action}
                  >
                    <option value="">Velg action</option>
                    {uniqueActions.map((action) => {
                      return (
                        action && (
                          <option key={action} value={action}>
                            {action}
                          </option>
                        )
                      );
                    })}
                  </Select>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                onClick={() => requestSort("hendelsedato")}
                className={getClassNamesFor("hendelsedato")}
              >
                Mottat
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("hendelsedeskr")}
                className={getClassNamesFor("hendelsedeskr")}
              >
                Hendelse1
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("mottakid")}
                className={getClassNamesFor("mottakid")}
              >
                Mottak-id
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("role")}
                className={getClassNamesFor("role")}
              >
                Role
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("service")}
                className={getClassNamesFor("service")}
              >
                Service
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("action")}
                className={getClassNamesFor("action")}
              >
                Action
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("referanse")}
                className={getClassNamesFor("referanse")}
              >
                Referanse
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("avsender")}
                className={getClassNamesFor("avsender")}
              >
                Avsender
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            items.map((event, index) => {
              return (
                <tr key={event.mottakid + index}>
                  <td className="tabell__td--sortert">{event.hendelsedato}</td>

                  <td>
                    <Ekspanderbartpanel tittel={event.hendelsedeskr}>
                      {event.tillegsinfo}
                    </Ekspanderbartpanel>
                  </td>
                  <td>
                    <Lenke href={`/logg/${event.mottakid}`}>
                      {event.mottakid}{" "}
                    </Lenke>
                  </td>
                  <td>{event.role}</td>
                  <td>{event.service}</td>
                  <td>{event.action}</td>
                  <td>{event.referanse}</td>
                  <td>{event.avsender}</td>
                </tr>
              );
            })}
        </tbody>
        <caption>{eventsLength} hendelser</caption>
      </table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </>
  );
};
export default EventsTable;
