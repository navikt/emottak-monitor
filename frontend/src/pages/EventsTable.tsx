import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useState } from "react";
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
  mottakid: string;
  referanse: string | null;
  role: string;
  service: string;
  tillegsinfo: string | null;
};

type Page = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: EventInfo[];
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState("DESC");

  const { fetchState, callRequest } = useFetch<Page>(
    `/v1/henthendelser?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&page=${currentPage}&size=${pageSize}&sort=${sortOrder}`
  );

  const onFromDateChange = (value: string) => { setCurrentPage(1); setFromDate(value); };
  const onToDateChange   = (value: string) => { setCurrentPage(1); setToDate(value); };
  const commitFromTime   = () => { setCurrentPage(1); setFromTime(fromTimeDraft); };
  const commitToTime     = () => { setCurrentPage(1); setToTime(toTimeDraft); };

  const { loading, error, data } = fetchState;
  const events = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  useEffect(() => {
    if (!data) return;
    if (data.page !== currentPage) setCurrentPage(data.page);
    if (data.size !== pageSize) setPageSize(data.size);
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFromDate, debouncedFromTime, debouncedToDate, debouncedToTime, sortOrder]);


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

  const onPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== pageSize) {
      setCurrentPage(1);
      setPageSize(newSize);
    }
  };

  const onSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const order = e.target.value;
    if (order !== sortOrder) {
      setCurrentPage(1);
      setSortOrder(order);
    }
  };

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
        <Filter
            fromDate={debouncedFromDate}
            fromTime={debouncedFromTime}
            toDate={debouncedToDate}
            toTime={debouncedToTime}
            onFromDateChange={onFromDateChange}
            onFromTimeChange={setFromTimeDraft}
            onToDateChange={onToDateChange}
            onToTimeChange={setToTimeDraft}
            onFromTimeBlur={commitFromTime}
            onToTimeBlur={commitToTime}
            messages={events ?? []}
            onFilterChange={handleFilterChange}
            filterKeys={["service", "action", "role", "hendelsedeskr"]}
        />
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0"}}>
          <span>{totalCount} hendelser</span>
          <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
            <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
              <span>Sorteringsrekkefølge</span>
              <select value={sortOrder} onChange={onSortOrderChange}>
                <option value="DESC">Siste først</option>
                <option value="ASC">Tidligste først</option>
              </select>
            </label>
            <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
              <span>Rader per side</span>
              <select value={pageSize} onChange={onPageSizeChange}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        </div>
        <Table className={tableStyles.table}>
          <Table.Header className={tableStyles.tableHeader}>
            <Table.Row>
              {headers.map(({key, name}) => (
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
                  <NavFrontendSpinner/>
                </RowWithContent>
            )}

            {showErrorMessage && <RowWithContent>{error.message}</RowWithContent>}
            {showNoDataMessage && <RowWithContent>Ingen hendelser funnet !</RowWithContent>}
            {showData &&
                filteredAndSortedEvents.map((event, index) => {
                  return (
                      <Table.Row
                          key={event.hendelsedeskr + index}
                          className={clsx({[tableStyles.coloredRow]: index % 2})}
                      >
                        <Table.DataCell>{event.hendelsedato.substring(0, 23)}</Table.DataCell>
                        <Table.DataCell>
                          <Ekspanderbartpanel tittel={event.hendelsedeskr}>
                            {event.tillegsinfo}
                          </Ekspanderbartpanel>
                        </Table.DataCell>
                        <Table.DataCell>
                          <Link
                              key={event.mottakid}
                              to={`/logg/${event.mottakid}`}
                              state={{backgroundLocation: location}}
                          >
                            {event.mottakid}
                          </Link>
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
            totalCount={totalCount}
            pageSize={pageSize}
            siblingCount={1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
        />
      </>
  );
};
export default EventsTable;
