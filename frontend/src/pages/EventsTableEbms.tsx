import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Pageinformation from "../components/Pageinformation";
import RowWithContent from "../components/RowWithContent";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useFilter from "../hooks/useFilter";
import useTableSorting from "../hooks/useTableSorting";
import { initialFromDate, initialToDate, initialTime } from "../util";
import tableStyles from "../styles/Table.module.scss";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import PrepopulatedFilter from "../components/PrepopulatedFilter";

type EventDto = {
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

type PageDto = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: EventDto[];
};

const EventsTable = () => {
  const location = useLocation();

  const [fromTimeDraft, setFromTimeDraft] = useState(initialTime(""));
  const [toTimeDraft, setToTimeDraft] = useState(initialTime(""));

  const [fromDate, setFromDate] = useState(initialFromDate(""));
  const [toDate, setToDate] = useState(initialToDate(""));
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { fetchState, callRequest } = useFetch<PageDto>(
    `/v1/henthendelserebms?fromDate=${debouncedFromDate}%20${debouncedFromTime}` +
      `&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&role=${role}&service=${service}&action=${action}` +
      `&page=${currentPage}&size=${pageSize}&sort=DESC`
  );

  const onFromDateChange = (value: string) => { setCurrentPage(1); setFromDate(value); };
  const onToDateChange   = (value: string) => { setCurrentPage(1); setToDate(value); };
  const onRoleChange     = (value: string) => { setCurrentPage(1); setRole(value); };
  const onServiceChange  = (value: string) => { setCurrentPage(1); setService(value); };
  const onActionChange   = (value: string) => { setCurrentPage(1); setAction(value); };
  const commitFromTime   = () => { setCurrentPage(1); setFromTime(fromTimeDraft); };
  const commitToTime     = () => { setCurrentPage(1); setToTime(toTimeDraft); };

  const { loading, error, data } = fetchState;
  const events = data?.content ?? [];

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
  }, [debouncedFromDate, debouncedFromTime, debouncedToDate, debouncedToTime, role, service, action]);

  const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
    events ?? [],
    ["role", "service", "action", "description"]
  );

  const {
    items: filteredAndSortedEvents,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredEvents);

  const getClassNamesFor = (name: keyof EventDto) => {
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

  const headers: { key: keyof EventDto; name: string }[] = [
    { key: "eventDate", name: "Mottatt" },
    { key: "description", name: "Hendelse" },
    { key: "readableId", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referenceParameter", name: "Referanse" },
    { key: "senderName", name: "Avsender" },
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
        onFromDateChange={onFromDateChange}
        onFromTimeChange={setFromTimeDraft}
        onToDateChange={onToDateChange}
        onToTimeChange={setToTimeDraft}
        onFromTimeBlur={commitFromTime}
        onToTimeBlur={commitToTime}
        messages={events ?? []}
        onFilterChange={handleFilterChange}
        filterKeys={["service", "action", "role", "description"]}
        onRoleChange={onRoleChange}
        onServiceChange={onServiceChange}
        onActionChange={onActionChange}
      />
      <Pageinformation
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          totalCount={data?.totalElements ?? 0}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
      />
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
              filteredAndSortedEvents.map((event, index) => {
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
    </>
  );
};
export default EventsTable;
