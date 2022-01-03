import { Datepicker, isISODateString } from "nav-datovelger";
import Lenke from "nav-frontend-lenker";
import { Select } from "nav-frontend-skjema";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TimePicker from "react-time-picker";
import { useFetch } from "./hooks/useFetch";
import TableSorting from "./TableSorting";
import { initialDate, initialFilter, initialTime } from "./util";

type MessageInfo = {
  action: string;
  antall: number;
  avsender: string;
  cpaid: string;
  datomottat: string;
  mottakidliste: string;
  referanse: string;
  role: string;
  service: string;
  status: string;
};
type FilterKey = keyof Pick<
  MessageInfo,
  "role" | "service" | "action" | "status"
>;

const MessagesTable = () => {
  const search = useLocation().search;

  const fomParam = new URLSearchParams(search).get("fromDate");
  const tomParam = new URLSearchParams(search).get("toDate");
  const fromTimeParam = new URLSearchParams(search).get("fromTime");
  const toTimeParam = new URLSearchParams(search).get("toTime");
  const roleParam = new URLSearchParams(search).get("role");
  const serviceParam = new URLSearchParams(search).get("service");
  const actionParam = new URLSearchParams(search).get("action");
  const statusParam = new URLSearchParams(search).get("status");

  const [fom, setFom] = useState(initialDate(fomParam));
  const [tom, setTom] = useState(initialDate(tomParam));
  let [fromTime, setFromTime] = useState(initialTime(fromTimeParam));
  let [toTime, setToTime] = useState(initialTime(toTimeParam));
  let [visibleMessages, setVisibleMessages] = useState<MessageInfo[]>([]);

  const { fetchState, callRequest } = useFetch<MessageInfo[]>(
    `/v1/hentmeldinger?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`
  );

  const { loading, error, data: messages } = fetchState;

  let [filters, setFilters] = useState<Record<FilterKey, string>>({
    role: initialFilter(roleParam) ?? "",
    service: initialFilter(serviceParam) ?? "",
    action: initialFilter(actionParam) ?? "",
    status: initialFilter(statusParam) ?? "",
  });

  const navigate = useNavigate();

  const filterMessages = (key: FilterKey, selectedValue: string) => {
    setFilters((oldFilters) => ({ ...oldFilters, [key]: selectedValue }));
    pushQueryParam(search, key, selectedValue);
  };

  useEffect(() => {
    const filteredMessages = messages?.filter((message) => {
      return (
        (filters.role === "" || filters.role === message.role) &&
        (filters.service === "" || filters.service === message.service) &&
        (filters.action === "" || filters.action === message.action) &&
        (filters.status === "" || filters.status === message.status)
      );
    });
    setVisibleMessages(filteredMessages ?? []);
  }, [filters, messages]);

  const pushHistory = useCallback(() => {
    navigate(
      `/?fromDate=${fom}&fromTime=${fromTime}&toDate=${tom}&toTime=${toTime}&role=${filters.role}&service=${filters.service}&action=${filters.action}&status=${filters.status}`
    );
  }, [fom, tom, filters, fromTime, toTime, navigate]);

  const pushQueryParam = (search: string, key: string, value: string) => {
    let searchParams = new URLSearchParams(search);
    searchParams.set(key, value);
    navigate(`?${searchParams.toString()}`);
  };

  useEffect(() => {
    if (fom !== "" && tom !== "" && fromTime !== "" && toTime !== "") {
      pushHistory();
    }
  }, [fom, tom, fromTime, toTime, pushHistory]);

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  let uniqueRoles = Array.from(new Set(messages?.map(({ role }) => role)));
  let uniqueServices = Array.from(
    new Set(messages?.map(({ service }) => service))
  );
  let uniqueActions = Array.from(
    new Set(messages?.map(({ action }) => action))
  );
  let uniqueStatus = Array.from(new Set(messages?.map(({ status }) => status)));

  const { items, requestSort, sortConfig } = TableSorting(visibleMessages);
  let messagesLength = 0;

  if (items.length) {
    messagesLength = items.length;
  }
  const getClassNamesFor = (name: keyof MessageInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <div>
      <h1>Meldinger</h1>
      <div className="row">
        <div className="column">
          <table id={"timetable"}>
            <tbody>
              <tr>
                <th>Fra og med dato: </th>
                <th>
                  <Datepicker
                    locale={"nb"}
                    inputId="datepicker-input-fom"
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
                    onChange={(value) =>
                      typeof value === "string"
                        ? setFromTime(value)
                        : setFromTime(value.toLocaleTimeString())
                    }
                    value={fromTime}
                  />
                </th>
              </tr>
              <tr>
                <th>Til og med:</th>
                <th>
                  <Datepicker
                    locale={"nb"}
                    inputId="datepicker-input-tom"
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
                    onChange={(value) =>
                      typeof value === "string"
                        ? setToTime(value)
                        : setToTime(value.toLocaleTimeString())
                    }
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
                      filterMessages("role", event.target.value)
                    }
                    selected={filters.role}
                  >
                    <option value="">Velg rolle</option>
                    {uniqueRoles.map((role) => {
                      return (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      );
                    })}
                  </Select>
                </th>
                <th>
                  <Select
                    id={"select"}
                    onChange={(event) =>
                      filterMessages("service", event.target.value)
                    }
                    selected={filters.service}
                  >
                    <option value="">Velg service</option>
                    {uniqueServices.map((service) => {
                      return (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      );
                    })}
                  </Select>
                </th>
                <th>
                  <Select
                    id={"select"}
                    onChange={(event) =>
                      filterMessages("action", event.target.value)
                    }
                    selected={filters.action}
                  >
                    <option value="">Velg action</option>
                    {uniqueActions.map((action) => {
                      return (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      );
                    })}
                  </Select>
                </th>
                <th>
                  <Select
                    id={"select"}
                    onChange={(event) =>
                      filterMessages("status", event.target.value)
                    }
                    selected={filters.status}
                  >
                    <option value="">Velg status</option>
                    {uniqueStatus.map((status) => {
                      return (
                        <option key={status} value={status}>
                          {status}
                        </option>
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
                onClick={() => requestSort("datomottat")}
                className={getClassNamesFor("datomottat")}
              >
                Mottat
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("mottakidliste")}
                className={getClassNamesFor("mottakidliste")}
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
            <th>
              <button
                type="button"
                onClick={() => requestSort("cpaid")}
                className={getClassNamesFor("cpaid")}
              >
                CPA-id
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("status")}
                className={getClassNamesFor("status")}
              >
                Status
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            items.map((message, index) => {
              return (
                <tr key={message.cpaid + index}>
                  <td className="tabell__td--sortert">
                    {message.datomottat.substring(0, 23)}
                  </td>
                  <td>
                    {message.mottakidliste.split(",").map((mottakid) => (
                      <Lenke key={mottakid} href={`/logg/${mottakid}`}>
                        {mottakid}{" "}
                      </Lenke>
                    ))}
                  </td>
                  <td>{message.role}</td>
                  <td>{message.service}</td>
                  <td>{message.action}</td>
                  <td>{message.referanse}</td>
                  <td>{message.avsender}</td>
                  <td>
                    <Lenke href={`/cpa/${message.cpaid}`}>
                      {message.cpaid}{" "}
                    </Lenke>
                  </td>
                  <td>{message.status}</td>
                </tr>
              );
            })}
        </tbody>
        <caption>{messagesLength} meldinger</caption>
      </table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </div>
  );
};
export default MessagesTable;
