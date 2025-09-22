import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Filter from "../components/Filter";
import Pagination from "../components/Pagination";
import RowWithContent from "../components/RowWithContent";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useFilter from "../hooks/useFilter";
import useTableSorting from "../hooks/useTableSorting";
import { initialDate, initialTime } from "../util";
import tableStyles from "../styles/Table.module.scss";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import PrepopulatedFilter from "../components/PrepopulatedFilter";

type EventInfo = {
  action: string;
  senderName: string | null;
  eventDate: string;
  description: string;
  readableId: string;
  referenceParameter: string | null;
  role: string;
  service: string;
  eventData: string | null;
};

const EventsTable = () => {
  const location = useLocation();

  const [fromTimeDraft, setFromTimeDraft] = useState(initialTime(""));
  const [toTimeDraft, setToTimeDraft] = useState(initialTime(""));

  const [fromDate, setFromDate] = useState(initialDate(""));
  const [toDate, setToDate] = useState(initialDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

  // using debounce to not use value until there has been no new changes
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);

  const [role, setRole] = useState("");
  const [service, setService] = useState("");
  const [action, setAction] = useState("");

  const { fetchState, callRequest } = useFetch<EventInfo[]>(
    `/v1/henthendelserebms?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}&role=${role}&service=${service}&action=${action}`
  );

  const commitFromTime   = () => setFromTime(fromTimeDraft);
  const commitToTime     = () => setToTime(toTimeDraft);

  const { loading, error, data: events } = fetchState;

  let pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
    events ?? [],
    ["role", "service", "action", "description"]
  );

  const {
    items: filteredAndSortedEvents,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredEvents);

  const getClassNamesFor = (name: keyof EventInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredAndSortedEvents.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredAndSortedEvents]);

  const headers: { key: keyof EventInfo; name: string }[] = [
    { key: "hendelsedato", name: "Mottatt" },
    { key: "hendelsedeskr", name: "Hendelse" },
    { key: "mottakid", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referanse", name: "Referanse" },
    { key: "avsender", name: "Avsender" },
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage = !loading && !error?.message && events?.length === 0;
  const showData = !loading && !error?.message && !!events?.length;

  return (
    <>
      <PrepopulatedFilter
        fromDate={debouncedFromDate}
        fromTime={debouncedFromTime}
        toDate={debouncedToDate}
        toTime={debouncedToTime}
        onFromDateChange={setFromDate}
        onFromTimeChange={setFromTimeDraft}
        onToDateChange={setToDate}
        onToTimeChange={setToTimeDraft}
        onFromTimeBlur={commitFromTime}
        onToTimeBlur={commitToTime}
        messages={events ?? []}
        onFilterChange={handleFilterChange}
        filterKeys={["service", "action", "role", "description"]}
        onRoleChange={setRole}
        onServiceChange={setService}
        onActionChange={setAction}
      />
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredEvents.length} hendelser
      </span>
      <Table className={tableStyles.table}>
        <Table.Header className={tableStyles.tableHeader}>
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
          {showSpinner && (
            <RowWithContent>
              <NavFrontendSpinner />
            </RowWithContent>
          )}

          {showErrorMessage && <RowWithContent>{error.message}</RowWithContent>}
          {showNoDataMessage && <RowWithContent>Ingen hendelser funnet !</RowWithContent>}
          {showData &&
            currentTableData.map((event, index) => {
              return (
                <Table.Row
                  key={event.description + index}
                  className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                >
                  <Table.DataCell>{event.eventDate.substring(0, 23)}</Table.DataCell>
                  <Table.DataCell>
                      <Ekspanderbartpanel tittel={event.description}>
                        {event.eventData}
                      </Ekspanderbartpanel>
                  </Table.DataCell>
                  <Table.DataCell>
                      <Link
                        key={event.readableId}
                        to={`/loggebms/${event.readableId}`}
                        state={{ backgroundLocation: location }}
                      >{event.readableId}</Link>
                  </Table.DataCell>
                  <Table.DataCell>{event.role}</Table.DataCell>
                  <Table.DataCell>{event.service}</Table.DataCell>
                  <Table.DataCell>{event.action}</Table.DataCell>
                  <Table.DataCell>{event.referenceParameter}</Table.DataCell>
                  <Table.DataCell>{event.senderName}</Table.DataCell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table>

      <Pagination
        totalCount={filteredEvents.length}
        pageSize={pageSize}
        siblingCount={1}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};
export default EventsTable;
