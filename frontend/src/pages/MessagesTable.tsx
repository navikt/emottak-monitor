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
import Pageinformation from "../components/Pageinformation";
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
  conversationId: string;
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

  const url = `/v1/hentmeldinger?fromDate=${debouncedFromDate}%20${debouncedFromTime}` +
      `&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&mottakId=${debouncedMottakId}&cpaId=${debouncedCpaId}&messageId=${debouncedMessageId}` +
      `&page=${currentPage}&size=${pageSize}`;


  const { fetchState, callRequest } = useFetch<Page>(url);

  const onFromDateChange = (value: string) => { setCurrentPage(1); setFromDate(value); };
  const onToDateChange   = (value: string) => { setCurrentPage(1); setToDate(value); };
  const commitFromTime   = () => { setCurrentPage(1); setFromTime(fromTimeDraft); };
  const commitToTime     = () => { setCurrentPage(1); setToTime(toTimeDraft); };

  const { loading, error, data } = fetchState;
  const messages = data?.content ?? [];

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
      const key = msg.conversationId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(msg);
    }
    return Array.from(map.entries()).map(([key, group]) => ({
      key,
      messages: [...group].sort((a, b) => b.datomottat.localeCompare(a.datomottat)),
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

  const headers: { key: keyof MessageInfo | "collapse"; name: string }[] = [
    { key: "datomottat", name: "Mottatt" },
    { key: "collapse", name: "" },
    { key: "mottakid", name: "Mottak-id" },
    { key: "role", name: "Rolle" },
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
        <Pageinformation
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            totalCount={data?.totalElements ?? 0}
            filterCount={groupedMessages.length ?? 0}
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
                        key === "datomottat" ? { width: "11.5em"} :
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
            {showNoDataMessage && <RowWithContent>Ingen meldinger funnet !</RowWithContent>}
            {showData &&
                groupedMessages.flatMap(({ key, messages }, groupIndex) => {
                  const isExpanded = expandedGroups.has(key);
                  const message = messages[0];
                  const expandableMessages:MessageInfo[] = messages.slice(1);

                  return (
                      <Table.Row key={key} className={ clsx({[tableStyles.coloredRow]: groupIndex % 2}, tableStyles.cellTextAtTop) }>
                        <Table.DataCell className="tabell__td--sortert">
                          {message.datomottat.substring(0, 23)}
                        </Table.DataCell>
                        <Table.DataCell style={{width: "1px", padding: "0 1px", whiteSpace: "nowrap"}}>
                          {expandableMessages.length > 0 && (
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
                              to={`/logg/${message.mottakid}`}
                              state={{backgroundLocation: location}}
                          >{message.mottakid}</Link>
                          { isExpanded && (
                              <table className={tableStyles.expandableTable}>
                                <thead>
                                  <tr>
                                    <th>Mottak-id</th>
                                    <th>Klokkeslett</th>
                                    <th>Rolle</th>
                                    <th>Service</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                {expandableMessages.map((msg) => (
                                    <tr key={msg.mottakid}>
                                      <td>
                                        <Link
                                            to={`/logg/${msg.mottakid}`}
                                            state={{backgroundLocation: location}}
                                        >{msg.mottakid}</Link>
                                      </td>
                                      <td>{msg.datomottat.split(" ")[1].substring(0,12)}</td>
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
                        <Table.DataCell>{message.role}</Table.DataCell>
                        <Table.DataCell>{message.service}</Table.DataCell>
                        <Table.DataCell>{message.action}</Table.DataCell>
                        <Table.DataCell>{message.referanse}</Table.DataCell>
                        <Table.DataCell>{message.avsender}</Table.DataCell>
                        <Table.DataCell>
                          <Link
                              to={`/cpa/${message.cpaid}`}
                              state={{backgroundLocation: location}}
                          >{message.cpaid}</Link>
                        </Table.DataCell>
                        <Table.DataCell>{message.status}</Table.DataCell>
                      </Table.Row>
                  );
                })}
          </Table.Body>
        </Table>
      </>
  );
};
export default MessagesTable;
