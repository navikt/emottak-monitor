import { Button, Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useMemo, useState } from "react";
import Filter from "../components/Filter";
import RowWithContent from "../components/RowWithContent";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useFilter from "../hooks/useFilter";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";
import Pagination from "../components/Pagination";
import { initialDate, initialTime } from "../util";
import {Link, useLocation} from "react-router-dom";
import filterStyles from "../components/Filter.module.scss";
import {Input} from "nav-frontend-skjema";

type MessageInfo = {
  action: string;
  antall: number;
  avsender: string;
  cpaid: string;
  datomottat: string;
  mottakid: string;
  mottakidliste: string;
  referanse: string;
  role: string;
  service: string;
  status: string;
};

type Page = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: MessageInfo[];
};

const MessagesTable = () => {
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
  const yesterday = new Date();

  const [fromDate, setFromDate] = useState("");
  useEffect(() => {
    // 1. Get today's date
    const date = new Date();
    // 2. Subtract one day
    date.setDate(date.getDate() - 1 );

    // 3. Format to dd/mm/yyyy using British English locale (en-GB)
    const formatted = date.toLocaleDateString('en-GB', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric'
        }).replace(/\//g, '.'); // Replace / with . to match dd.mm.yyyy

        setFromDate(formatted);
    }, []);

  const [toDate, setToDate] = useState(initialDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

  const [mottakId, setMottakId] = useState("");
  const [cpaId, setCpaId] = useState("");
  const [messageId, setMessageId] = useState("");

  // using debounce to not use value until there has been no new changes
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);
  const debouncedMottakId = useDebounce(mottakId, 1000);
  const debouncedCpaId = useDebounce(cpaId, 1000);
  const debouncedMessageId = useDebounce(messageId, 1000);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortOrder, setSortOrder] = useState("DESC");

  const url = `/v1/hentmeldinger?fromDate=${debouncedFromDate}%20${debouncedFromTime}` +
      `&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&mottakId=${debouncedMottakId}&cpaId=${debouncedCpaId}&messageId=${debouncedMessageId}` +
      `&page=${currentPage}&size=${pageSize}&sort=${sortOrder}`;


  const { fetchState, callRequest } = useFetch<Page>(url);

  const onFromDateChange = (value: string) => { setCurrentPage(1); setFromDate(value); };
  const onToDateChange   = (value: string) => { setCurrentPage(1); setToDate(value); };
  const commitFromTime   = () => { setCurrentPage(1); setFromTime(fromTimeDraft); };
  const commitToTime     = () => { setCurrentPage(1); setToTime(toTimeDraft); };

  const { loading, error, data } = fetchState;
  const messages = data?.content ?? [];
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

  const { filteredItems: filteredMessages, handleFilterChange } = useFilter(
    messages ?? [],
    ["role", "service", "action", "status"]
  );

  const {
    items: filteredAndSortedMessages,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredMessages);

  const groupedMessages = useMemo(() => {
    const map = new Map<string, MessageInfo[]>();
    for (const msg of filteredAndSortedMessages) {
      const key = (msg.mottakidliste ?? msg.mottakid ?? "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
          .sort()
          .join(",");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(msg);
    }
    return Array.from(map.entries()).map(([key, group]) => ({
      key,
      messages: [...group].sort((a, b) => a.datomottat.localeCompare(b.datomottat)),
    }));
  }, [filteredAndSortedMessages]);

  const getClassNamesFor = (name: keyof MessageInfo) => {
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

  const headers: { key: keyof MessageInfo | "collapse"; name: string }[] = [
    { key: "datomottat", name: "Mottatt" },
    { key: "collapse", name: "" },
    { key: "mottakidliste", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referanse", name: "Referanse" },
    { key: "avsender", name: "Avsender" },
    { key: "cpaid", name: "CPA-id" },
    { key: "status", name: "Status" },
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage =
    !loading && !error?.message && messages?.length === 0;
  const showData = !loading && !error?.message && !!messages?.length;

  const totalFilterCount = filteredAndSortedMessages.length ?? 0;
  const totalMessagess = data?.totalElements;
  let showTo = pageSize * currentPage;
  const showFrom = showTo - (pageSize-1);
  if (showTo > totalFilterCount) showTo = totalFilterCount;
  let pageLabel = `Viser ${showFrom} til ${showTo} av ${totalFilterCount}`;
  if (totalMessagess != totalFilterCount) pageLabel += ` (filtrert fra totalt ${totalMessagess} melding'er)`;

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
            messages={messages ?? []}
            onFilterChange={handleFilterChange}
        />
        <div className={clsx(filterStyles.gridContainer, filterStyles.gridContainerIds)}>
          <div style={{gridArea: "mottakId"}}>
            <Input
                id="mottakId-input"
                label="Mottak-Id"
                className="navds-form-field navds-form-field--small"
                bredde={"XXL"}
                inputClassName={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                onChange={(event) => setMottakId(event.target.value)}
                value={mottakId}
            />
          </div>
          <div style={{gridArea: "cpaId"}}>
            <Input
                id="cpaId-input"
                label="CPA-Id"
                className="navds-form-field navds-form-field--small"
                bredde={"L"}
                inputClassName={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                onChange={(event) => setCpaId(event.target.value)}
                value={cpaId}
            />
          </div>
          <div style={{gridArea: "messageId"}}>
            <Input
                id="messageId-input"
                label="Message-Id"
                className="navds-form-field navds-form-field--small"
                bredde={"XXL"}
                inputClassName={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                onChange={(event) => setMessageId(event.target.value)}
                value={messageId}
            />
          </div>
        </div>
        {/**
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0"}}>
          <span>{totalCount} hendelser</span>
          <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
            <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
              <span>Sorteringsrekkefølge</span>
              <select value={sortOrder} onChange={onSortOrderChange}>
                <option value="DESC">Nyeste først</option>
                <option value="ASC">Eldste først</option>
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
      **/}

        <fieldset style={{width: "100%", borderWidth: "2px", borderColor: "grey", borderStyle: "solid", padding: "5px", margin: "0px 0px 7px 0px" }}>
          <legend>Sideinformasjon:</legend>
          <table style={{ border: "0px", width: "100%" }}>
            <tbody>
            <tr>
              <td style={{ width: "33%" }}>
                <span>Rader per side </span>
                <select value={pageSize} onChange={onPageSizeChange}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </td>
              <td style={{  width: "33%", textAlign: "center" }}>
                <Pagination
                    totalCount={totalCount}
                    pageSize={pageSize}
                    siblingCount={1}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
              </td>
              <td style={{  width: "33%", textAlign: "center" }}>
                {pageLabel}
              </td>
            </tr>
            </tbody>
          </table>
          {/* Form fields */}
          {/* error.message && <p style={{ color: 'red' }}>{error.message}</p>*/}
        </fieldset>
        <Table className={tableStyles.table}>
          <Table.Header className={tableStyles.tableHeader}>
            <Table.Row>
              {headers.map(({key, name}) => (
                  <Table.HeaderCell
                      key={key}
                      onClick={() => key !== "collapse" && requestSort(key)}
                      className={key !== "collapse" ? getClassNamesFor(key) : undefined}
                      style={key === "collapse" ? {width: "1px", padding: "0 4px", whiteSpace: "nowrap"} : undefined}
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
            {showNoDataMessage && <RowWithContent>Ingen meldinger funnet !</RowWithContent>}
            {showData &&
                groupedMessages.flatMap(({ key, messages }, groupIndex) => {
                  const isExpanded = expandedGroups.has(key);
                  const ids = key.split(",");
                  const displayMessages = isExpanded ? messages : [messages[messages.length - 1]];

                  return displayMessages.map((msg, msgIndex) => {
                    return (
                        <Table.Row key={`${key}-${msgIndex}`} className={clsx({[tableStyles.coloredRow]: groupIndex % 2})}>
                          <Table.DataCell className="tabell__td--sortert">
                            {msgIndex === 0 ? msg.datomottat.substring(0, 23) : ""}
                          </Table.DataCell>
                          <Table.DataCell style={{width: "1px", padding: "0 1px", whiteSpace: "nowrap"}}>
                            {msgIndex === 0 && ids.length > 1 && (
                                <Button
                                    variant="primary"
                                    size="xsmall"
                                    onClick={() => toggleGroup(key)}
                                >
                                  {isExpanded ? "-" : "+"}
                                </Button>
                            )}
                          </Table.DataCell>
                          <Table.DataCell>
                            <Link
                                to={`/logg/${msg.mottakid}`}
                                state={{backgroundLocation: location}}
                            >{msg.mottakid}</Link>
                          </Table.DataCell>
                          <Table.DataCell>{msg.role}</Table.DataCell>
                          <Table.DataCell>{msg.service}</Table.DataCell>
                          <Table.DataCell>{msg.action}</Table.DataCell>
                          <Table.DataCell>{msg.referanse}</Table.DataCell>
                          <Table.DataCell>{msg.avsender}</Table.DataCell>
                          <Table.DataCell>
                            <Link
                                to={`/cpa/${msg.cpaid}`}
                                state={{backgroundLocation: location}}
                            >{msg.cpaid}</Link>
                          </Table.DataCell>
                          <Table.DataCell>{msg.status}</Table.DataCell>
                        </Table.Row>
                    );
                  });
                })}
          </Table.Body>
        </Table>
      </>
  );
};
export default MessagesTable;
