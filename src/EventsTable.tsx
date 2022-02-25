import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import Lenke from "nav-frontend-lenker";
import NavFrontendSpinner from "nav-frontend-spinner";
//import Pagination from "paginering";
import React, { useEffect, useMemo, useState } from "react";
import Filter from "./components/Filter";
import useDebounce from "./hooks/useDebounce";
import useFetch from "./hooks/useFetch";
import useFilter from "./hooks/useFilter";
import useTableSorting from "./hooks/useTableSorting";
import Pagination from "./Pagination";
import { initialDate, initialTime } from "./util";

type EventInfo = {
  action: string;
  avsender: string | null;
  hendelsedato: string;
  hendelsedeskr: string;
  mottakid: string;
  referanse: string | null;
  role: string;
  service: string;
  tillegsinfo: string | null;
};

const EventsTable = () => {
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
    ["role", "service", "action"]
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
        filterKeys={["service", "action", "role"]}
      />
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredEvents.length} eventer
      </span>
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
            currentTableData.map((event, index) => {
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
      </table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
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
