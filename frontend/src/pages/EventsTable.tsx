import {Button, Table} from "@navikt/ds-react";
import axios from "axios";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, {useEffect, useState} from "react";
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

type RelatedMessage = {
  action: string;
  avsender: string | null;
  datomottat: string;
  mottakid: string;
  referanse: string | null;
  role: string;
  service: string;
  status: string;
};

type RelatedMessagesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; messages: RelatedMessage[] };

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

type FilterKey = "role" | "service" | "action" | "hendelsedeskr";

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
  const [relatedMessagesByConversation, setRelatedMessagesByConversation] =
      useState<Record<string, RelatedMessagesState>>({});

  const fetchRelatedMessages = async (conversationId: string) => {
    if (!conversationId || relatedMessagesByConversation[conversationId]) return;
    setRelatedMessagesByConversation(prev => ({ ...prev, [conversationId]: { status: "loading" } }));
    try {
      const res = await axios.get<{ content: RelatedMessage[] }>(
          `/v1/hentmeldinger?fromDate=1970-01-01%2000:00&toDate=2100-01-01%2000:00&conversationId=${encodeURIComponent(conversationId)}`
      );
      setRelatedMessagesByConversation(prev => ({
        ...prev,
        [conversationId]: { status: "loaded", messages: res.data.content ?? [] },
      }));
    } catch {
      setRelatedMessagesByConversation(prev => ({ ...prev, [conversationId]: { status: "error" } }));
    }
  };

  const toggleGroup = (key: string, conversationId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    fetchRelatedMessages(conversationId);
  };

  const [fromTimeDraft, setFromTimeDraft] = useState(initialTime(""));
  const [toTimeDraft, setToTimeDraft] = useState(initialTime(""));
  const [fromDate, setFromDate] = useState(initialFromDate(""));
  const [toDate, setToDate] = useState(initialToDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);
  const [role, setRole] = useState("");
  const [service, setService] = useState("");
  const [action, setAction] = useState("");
  const [hendelsedeskr, setHendelsedeskr] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { fetchState, callRequest } = useFetch<Page>(
    `/v1/henthendelser?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&role=${role}&service=${service}&action=${action}&hendelsedeskr=${encodeURIComponent(hendelsedeskr)}` +
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
  }, [debouncedFromDate, debouncedFromTime, debouncedToDate, debouncedToTime, role, service, action, hendelsedeskr]);

  const filterSetters: Record<FilterKey, (value: string) => void> = {
    role: setRole,
    service: setService,
    action: setAction,
    hendelsedeskr: setHendelsedeskr,
  };

  const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
    events ?? [],
    ["role", "service", "action", "hendelsedeskr"]
  );

  const onFilterChange = (key: FilterKey, value: EventInfo[FilterKey]) => {
    handleFilterChange(key, value);
    filterSetters[key]?.(value as string);
  };

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
            onFilterChange={onFilterChange}
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
                  const canExpand = !!event.ebconversid;
                  const relatedState = event.ebconversid
                      ? relatedMessagesByConversation[event.ebconversid]
                      : undefined;
                  const relatedMessages: RelatedMessage[] =
                      relatedState?.status === "loaded"
                          ? Array.from(
                              relatedState.messages
                                  .filter((msg) => msg.mottakid !== event.mottakid)
                                  .reduce((acc, msg) => {
                                    const existing = acc.get(msg.mottakid);
                                    if (!existing || msg.datomottat > existing.datomottat) {
                                      acc.set(msg.mottakid, msg);
                                    }
                                    return acc;
                                  }, new Map<string, RelatedMessage>())
                                  .values()
                          ).sort((a, b) => b.datomottat.localeCompare(a.datomottat))
                          : [];

                  return (
                      <Table.Row key={rowKey} className={ clsx({[tableStyles.coloredRow]: rowIndex % 2}, tableStyles.cellTextAtTop) } >
                        <Table.DataCell>
                          {
                            (event.statuslevel === "ok") ? (
                                <img src={ok} alt="ok" title="Meldingen er ferdigbehandlet" />
                            ) : (event.statuslevel === "info") ? (
                                <img src={info} alt="info" title="Meldingen er under behandling" />
                            ) : (event.statuslevel === "error") ? (
                                <img src={err} alt="error" title="Meldingen feilet under behandling" />
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
                          {canExpand && (
                              <Button
                                  variant="primary"
                                  size="xsmall"
                                  onClick={() => toggleGroup(rowKey, event.ebconversid)}
                              >
                                {isExpanded ? "-" : "+"}
                              </Button>
                          )}
                        </Table.DataCell>
                        <Table.DataCell>
                          <Link
                              to={`/logg/${event.mottakid}`}
                              state={{backgroundLocation: location}}
                          >
                            {event.mottakid}
                          </Link>
                          { isExpanded && (
                              relatedState?.status === "loading" ? (
                                  <div style={{padding: "4px"}}><NavFrontendSpinner type="XS" /></div>
                              ) : relatedState?.status === "error" ? (
                                  <div style={{padding: "4px"}}>Kunne ikke hente relaterte meldinger</div>
                              ) : relatedState?.status === "loaded" && relatedMessages.length === 0 ? (
                                  <div style={{padding: "4px"}}>Ingen relaterte meldinger funnet</div>
                              ) : (
                              <table className={tableStyles.expandableTable}>
                                <tbody>
                                {relatedMessages.map((msg, msgIndex) => (
                                    <tr key={`${msg.mottakid}-${msg.datomottat}-${msgIndex}`}>
                                      <td>
                                        {
                                          (msg.status === "ok") ? (
                                              <img src={ok} alt="ok" title="Meldingen er ferdigbehandlet" />
                                          ) : (msg.status === "info") ? (
                                              <img src={info} alt="info" title="Meldingen er under behandling" />
                                          ) : (msg.status === "error") ? (
                                              <img src={err} alt="error" title="Meldingen feilet under behandling" />
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
