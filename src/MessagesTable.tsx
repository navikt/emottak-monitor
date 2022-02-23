import { Select, Table } from "@navikt/ds-react";
import clsx from "clsx";
import { Datepicker, isISODateString } from "nav-datovelger";
import Lenke from "nav-frontend-lenker";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import TimePicker from "react-time-picker";
import useFetch from "./hooks/useFetch";
import useTableSorting from "./hooks/useTableSorting";
import styles from "./MessagesTable.module.scss";
import Pagination from "./Pagination";
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
  const { search } = useLocation();

  let PageSize = 10;
  const fomParam = new URLSearchParams(search).get("fromDate");
  const tomParam = new URLSearchParams(search).get("toDate");
  const fromTimeParam = new URLSearchParams(search).get("fromTime");
  const toTimeParam = new URLSearchParams(search).get("toTime");
  const roleParam = new URLSearchParams(search).get("role");
  const serviceParam = new URLSearchParams(search).get("service");
  const actionParam = new URLSearchParams(search).get("action");
  const statusParam = new URLSearchParams(search).get("status");

  const [visibleMessages, setVisibleMessages] = useState<MessageInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  //const [pageSize, setPageSize] = useState(10);

  const [fom, setFom] = useState(initialDate(fomParam));
  const [tom, setTom] = useState(initialDate(tomParam));
  const [fromTime, setFromTime] = useState(initialTime(fromTimeParam));
  const [toTime, setToTime] = useState(initialTime(toTimeParam));

  const { fetchState, callRequest } = useFetch<MessageInfo[]>(
    `/v1/hentmeldinger?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`
  );

  const { loading, error, data: messages } = fetchState;

  //const numberOfItems = visibleMessages.length;
  //const numberOfPages = pageSize > 0 ? Math.ceil(numberOfItems / pageSize) : 1

  let [filters, setFilters] = useState<Record<FilterKey, string>>({
    role: initialFilter(roleParam) ?? "",
    service: initialFilter(serviceParam) ?? "",
    action: initialFilter(actionParam) ?? "",
    status: initialFilter(statusParam) ?? "",
  });

  const filterMessages = (key: FilterKey, selectedValue: string) => {
    setFilters((oldFilters) => ({ ...oldFilters, [key]: selectedValue }));
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
    // TODO: Sette currentPage til 0?
    setVisibleMessages(filteredMessages ?? []);
  }, [filters, messages]);

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

  const { items, requestSort, sortConfig } = useTableSorting(visibleMessages);
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

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return items.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, PageSize, items]);

  const headers: { key: keyof MessageInfo; name: string }[] = [
    { key: "datomottat", name: "Mottatt" },
    { key: "mottakidliste", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referanse", name: "Referanse" },
    { key: "avsender", name: "Avsender" },
    { key: "cpaid", name: "CPA-id" },
    { key: "status", name: "Status" },
  ];

  const rowWithMessage = (message: string) => (
    <Table.Row>
      <Table.DataCell style={{ textAlign: "center" }} colSpan={9}>
        {message}
      </Table.DataCell>
    </Table.Row>
  );

  return (
    <>
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
              value={fom}
              onChange={setFom}
              inputProps={{
                name: "dateInput",
                "aria-invalid": fom !== "" && isISODateString(fom) === false,
              }}
              calendarSettings={{ showWeekNumbers: false }}
              showYearSelector={true}
            />
            <TimePicker
              onChange={(value) =>
                typeof value === "string"
                  ? setFromTime(value)
                  : setFromTime(value.toLocaleTimeString())
              }
              value={toTime}
            />
          </div>
        </div>
        <Select
          style={{
            textAlign: "left",
            gridArea: "role",
          }}
          label="Rolle"
          size="small"
          onChange={(event) =>
            filterMessages("role", event.currentTarget.value)
          }
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
        <Select
          style={{
            gridArea: "service",
          }}
          label="Service"
          size="small"
          onChange={(event) =>
            filterMessages("service", event.currentTarget.value)
          }
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
              value={tom}
              onChange={setTom}
              inputProps={{
                name: "dateInput",
                "aria-invalid": tom !== "" && isISODateString(tom) === false,
              }}
              calendarSettings={{ showWeekNumbers: false }}
              showYearSelector={true}
            />
            <TimePicker
              onChange={(value) =>
                typeof value === "string"
                  ? setToTime(value)
                  : setToTime(value.toLocaleTimeString())
              }
              value={toTime}
            />
          </div>
        </div>
        <Select
          label="Action"
          size="small"
          onChange={(event) =>
            filterMessages("action", event.currentTarget.value)
          }
          style={{ gridArea: "action" }}
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
        <Select
          label="Status"
          size="small"
          onChange={(event) =>
            filterMessages("status", event.currentTarget.value)
          }
          style={{ gridArea: "status" }}
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
      </div>
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {messagesLength} meldinger
      </span>
      <Table className={styles.table} style={{ width: "100%" }}>
        <Table.Header className={styles.tableHeader}>
          <Table.Row>
            {headers.map(({ key, name }) => (
              <Table.HeaderCell
                key={key}
                onClick={() => requestSort(key)}
                className={getClassNamesFor(key)}
              >
                {name}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <NavFrontendSpinner />
          ) : (
            currentTableData.map((message, index) => {
              return (
                <Table.Row
                  key={message.cpaid + index}
                  className={clsx({ [styles.coloredRow]: index % 2 })}
                >
                  <Table.DataCell className="tabell__td--sortert">
                    {message.datomottat.substring(0, 23)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {message.mottakidliste.split(",").map((mottakid) => (
                      <Lenke key={mottakid} href={`/logg/${mottakid}`}>
                        {mottakid}{" "}
                      </Lenke>
                    ))}
                  </Table.DataCell>
                  <Table.DataCell>{message.role}</Table.DataCell>
                  <Table.DataCell>{message.service}</Table.DataCell>
                  <Table.DataCell>{message.action}</Table.DataCell>
                  <Table.DataCell>{message.referanse}</Table.DataCell>
                  <Table.DataCell>{message.avsender}</Table.DataCell>
                  <Table.DataCell>
                    <Lenke href={`/cpa/${message.cpaid}`}>
                      {message.cpaid}{" "}
                    </Lenke>
                  </Table.DataCell>
                  <Table.DataCell>{message.status}</Table.DataCell>
                </Table.Row>
              );
            })
          )}
          {!loading &&
            !error &&
            messages?.length === 0 &&
            rowWithMessage("No messages")}
          {error?.message && rowWithMessage(error.message)}
        </Table.Body>
      </Table>
      <Pagination
        totalCount={visibleMessages.length}
        pageSize={PageSize}
        siblingCount={1}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
};
export default MessagesTable;
