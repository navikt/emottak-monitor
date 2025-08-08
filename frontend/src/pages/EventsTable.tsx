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

type EventInfo = {
  action: string;
  avsender: string | null;
  hendelsedato: string;
  hendelsedeskr: string;
  requestid: string | null;
  mottakid: string;
  referanse: string | null;
  role: string;
  service: string;
  tillegsinfo: string | null;
};

const EventsTable = () => {
  const location = useLocation();

  const [fromDate, setFromDate] = useState(initialDate(""));
  const [toDate, setToDate] = useState(initialDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

  // using debounce to not use value until there has been no new changes
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);

  const { fetchState, callRequest } = useFetch<EventInfo[]>(
    `/v1/henthendelser?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}`
  );

  const { loading, error, data: events } = fetchState;
  let pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
    events ?? [],
    ["role", "service", "action", "hendelsedeskr"]
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
    { key: "requestid", name: "Request ID" },
    { key: "mottakid", name: "Mottak ID" },
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
      <Filter
        fromDate={debouncedFromDate}
        fromTime={debouncedFromTime}
        toDate={debouncedToDate}
        toTime={debouncedToTime}
        onFromDateChange={setFromDate}
        onFromTimeChange={setFromTime}
        onToDateChange={setToDate}
        onToTimeChange={setToTime}
        messages={events ?? []}
        onFilterChange={handleFilterChange}
        filterKeys={["service", "action", "role", "hendelsedeskr"]}
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
                  key={event.hendelsedeskr + index}
                  className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                >
                  <Table.DataCell>{event.hendelsedato.substring(0, 23)}</Table.DataCell>
                  <Table.DataCell>
                      <Ekspanderbartpanel tittel={event.hendelsedeskr}>
                        {event.tillegsinfo}
                      </Ekspanderbartpanel>
                  </Table.DataCell>
                  <Table.DataCell>{event.requestid}</Table.DataCell>
                  <Table.DataCell>
                    {event.mottakid.split(",").map((mottakid) => (
                      <Link
                        key={mottakid}
                        to={`/logg/${mottakid}`}
                        state={{ backgroundLocation: location }}
                      >
                        {mottakid}
                      </Link>
                    ))}
                  </Table.DataCell>
                  <Table.DataCell>{event.role}</Table.DataCell>
                  <Table.DataCell>{event.service}</Table.DataCell>
                  <Table.DataCell>{event.action}</Table.DataCell>
                  <Table.DataCell>{event.referanse}</Table.DataCell>
                  <Table.DataCell>{event.avsender}</Table.DataCell>
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
