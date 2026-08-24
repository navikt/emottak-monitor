import {Button, Table} from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, {useEffect, useMemo, useState} from "react";
import { Link, useLocation } from "react-router-dom";
import Filter from "../components/Filter";
import Pageinformation from "../components/Pageinformation";
import RowWithContent from "../components/RowWithContent";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useFilter from "../hooks/useFilter";
import useTableSorting from "../hooks/useTableSorting";
import { initialFromDate, initialToDate, initialTime } from "../util";
import tableStyles from "../styles/Table.module.scss";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import ok from "../images/ok.gif";
import info from "../images/info.gif";
import err from "../images/error.gif";

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
  ebconversid: string;
  statuslevel: string;
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { fetchState, callRequest } = useFetch<Page>(
    `/v1/henthendelser?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&page=${currentPage}&size=${pageSize}&sort=DESC`
  );

  const onFromDateChange = (value: string) => { setCurrentPage(1); setFromDate(value); };
  const onToDateChange   = (value: string) => { setCurrentPage(1); setToDate(value); };
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
  }, [debouncedFromDate, debouncedFromTime, debouncedToDate, debouncedToTime]);


  const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
    events ?? [],
    ["role", "service", "action", "hendelsedeskr"]
  );

  const {
    items: filteredAndSortedEvents,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredEvents);

  const conversationGroups = useMemo(() => {
    const map = new Map<string, EventInfo[]>();
    for (const msg of filteredAndSortedEvents) {
      const key = msg.ebconversid;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(msg);
    }
    return map;
  }, [filteredAndSortedEvents]);

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

  const headers: { key: keyof EventInfo | "collapse"; name: string }[] = [
    { key: "statuslevel", name: "" },
    { key: "hendelsedato", name: "Mottatt" },
    { key: "hendelsedeskr", name: "Hendelse" },
    { key: "collapse", name: "" },
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
              {headers.map(({key, name}) => (
                  <Table.HeaderCell
                      key={key}
                      onClick={() => key !== "collapse" && requestSort(key)}
                      className={key !== "collapse" ? getClassNamesFor(key) : undefined}
                      style={
                        key === "collapse" ? {width: "1px", padding: "0 4px", whiteSpace: "nowrap"} :
                            key === "hendelsedato" ? { width: "11.5em"} :
                                undefined
                      }
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
                filteredAndSortedEvents.map((event, rowIndex) => {
                  const rowKey = `${event.mottakid}-${event.hendelsedato}-${rowIndex}`;
                  const isExpanded = expandedGroups.has(rowKey);
                  // Dedupe related messages by mottakid - only need one entry per message, not every hendelse.
                  const relatedByMottakid = new Map<string, EventInfo>();
                  for (const msg of conversationGroups.get(event.ebconversid) ?? []) {
                    if (msg.mottakid === event.mottakid) continue;
                    const existing = relatedByMottakid.get(msg.mottakid);
                    if (!existing || msg.hendelsedato > existing.hendelsedato) {
                      relatedByMottakid.set(msg.mottakid, msg);
                    }
                  }
                  const relatedMessages: EventInfo[] = Array.from(relatedByMottakid.values())
                      .sort((a, b) => b.hendelsedato.localeCompare(a.hendelsedato));

                  return (
                      <Table.Row key={rowKey} className={ clsx({[tableStyles.coloredRow]: rowIndex % 2}, tableStyles.cellTextAtTop) } >
                        <Table.DataCell>
                          {
                            (event.statuslevel === "50") ? (
                                <img src={ok} alt="ok" />
                            ) : (event.statuslevel === "10") ? (
                                <img src={info} alt="info" />
                            ) : (event.statuslevel === "30") ? (
                                <img src={err} alt="error" />
                            ) : ""
                          }
                        </Table.DataCell>
                        <Table.DataCell className="tabell__td--sortert">
                          {event.hendelsedato.substring(0, 23)}
                        </Table.DataCell>
                        <Table.DataCell  className="tabell__td--sortert">
                          <Ekspanderbartpanel tittel={event.hendelsedeskr}>
                            {event.tillegsinfo}
                          </Ekspanderbartpanel>
                        </Table.DataCell>
                        <Table.DataCell style={{width: "1px", padding: "0 1px", whiteSpace: "nowrap"}}>
                          {relatedMessages.length > 0 && (
                              <Button
                                  variant="primary"
                                  size="xsmall"
                                  onClick={() => toggleGroup(rowKey)}
                              >
                                {isExpanded ? "-" : "+"}
                              </Button>
                          )}
                        </Table.DataCell>
                        <Table.DataCell>
                          <Link
                              key={event.mottakid}
                              to={`/logg/${event.mottakid}`}
                              state={{backgroundLocation: location}}
                          >
                            {event.mottakid}
                          </Link>
                          { isExpanded && (
                              <table className={tableStyles.expandableTable}>
                                <tbody>
                                {relatedMessages.map((msg, msgIndex) => (
                                    <tr key={`${msg.mottakid}-${msg.hendelsedato}-${msgIndex}`}>
                                      <td>
                                        {
                                          (event.statuslevel === "50") ? (
                                              <img src={ok} alt="ok" />
                                          ) : (event.statuslevel === "10") ? (
                                              <img src={info} alt="info" />
                                          ) : (event.statuslevel === "30") ? (
                                              <img src={err} alt="error" />
                                          ) : ""
                                        }
                                      </td>
                                      <td>
                                        <Link
                                            to={`/logg/${msg.mottakid}`}
                                            state={{backgroundLocation: location}}
                                        >{msg.mottakid}</Link>
                                      </td>
                                      <td>{msg.role}</td>
                                      <td>{msg.service}</td>
                                      <td>{msg.action}</td>
                                    </tr>
                                ))}
                                </tbody>
                              </table>
                            )
                          }
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
      </>
  );
};
export default EventsTable;
