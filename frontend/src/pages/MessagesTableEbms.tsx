import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useState } from "react";
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
import PrepopulatedFilter from "../components/PrepopulatedFilter";

type MessageInfo = {
  action: string;
  count: number;
  senderName: string;
  cpaId: string;
  receivedDate: string;
  readableIdList: string;
  referenceParameter: string;
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

  const [fromTimeDraft, setFromTimeDraft] = useState(initialTime(""));
  const [toTimeDraft, setToTimeDraft] = useState(initialTime(""));

  const [fromDate, setFromDate] = useState(initialDate(""));
  const [toDate, setToDate] = useState(initialDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

  const [mottakId, setMottakId] = useState("");
  const [cpaId, setCpaId] = useState("");
  const [messageId, setMessageId] = useState("");
  const [role, setRole] = useState("");
  const [service, setService] = useState("");
  const [action, setAction] = useState("");

  // using debounce to not use value until there has been no new changes
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);
  const debouncedMottakId = useDebounce(mottakId, 1000);
  const debouncedCpaId = useDebounce(cpaId, 1000);
  const debouncedMessageId = useDebounce(messageId, 1000);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState("DESC");

  const url = `/v1/hentmeldingerebms?fromDate=${debouncedFromDate}%20${debouncedFromTime}` +
      `&toDate=${debouncedToDate}%20${debouncedToTime}` +
      `&mottakId=${debouncedMottakId}&cpaId=${debouncedCpaId}&messageId=${debouncedMessageId}` +
      `&role=${role}&service=${service}&action=${action}` +
      `&page=${currentPage}&size=${pageSize}&sort=${sortOrder}`;

  const { fetchState, callRequest } = useFetch<Page>(url);

  const onFromDateChange  = (value: string) => { setCurrentPage(1); setFromDate(value); };
  const onToDateChange    = (value: string) => { setCurrentPage(1); setToDate(value); };
  const onRoleChange      = (value: string) => { setCurrentPage(1); setRole(value); };
  const onServiceChange   = (value: string) => { setCurrentPage(1); setService(value); };
  const onActionChange    = (value: string) => { setCurrentPage(1); setAction(value); };
  const onMottakIdChange  = (value: string) => { setCurrentPage(1); setMottakId(value); };
  const onCpaIdChange     = (value: string) => { setCurrentPage(1); setCpaId(value); };
  const onMessageIdChange = (value: string) => { setCurrentPage(1); setMessageId(value); };
  const commitFromTime    = () => { setCurrentPage(1); setFromTime(fromTimeDraft); };
  const commitToTime      = () => { setCurrentPage(1); setToTime(toTimeDraft); };

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
  }, [debouncedFromDate, debouncedFromTime, debouncedToDate, debouncedToTime, debouncedMottakId, debouncedCpaId, debouncedMessageId, role, service, action, sortOrder]);

  const { filteredItems: filteredMessages, handleFilterChange } = useFilter(
    messages ?? [],
    ["role", "service", "action", "status"]
  );

  const {
    items: filteredAndSortedMessages,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredMessages);

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

  const headers: { key: keyof MessageInfo; name: string }[] = [
    { key: "receivedDate", name: "Mottatt" },
    { key: "readableIdList", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referenceParameter", name: "Referanse" },
    { key: "senderName", name: "Avsender" },
    { key: "cpaId", name: "CPA-id" },
    { key: "status", name: "Status" },
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage =
    !loading && !error?.message && messages?.length === 0;
  const showData = !loading && !error?.message && !!messages?.length;

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
            messages={messages ?? []}
            onFilterChange={handleFilterChange}
            onRoleChange={onRoleChange}
            onServiceChange={onServiceChange}
            onActionChange={onActionChange}
        />
        <div className={clsx(filterStyles.gridContainer, filterStyles.gridContainerIds)}>
          <div style={{gridArea: "mottakId"}}>
            <Input
                id="mottakId-input"
                label="Mottak-Id"
                className="navds-form-field navds-form-field--small"
                bredde={"XXL"}
                inputClassName={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                onChange={(event) => onMottakIdChange(event.target.value)}
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
                onChange={(event) => onCpaIdChange(event.target.value)}
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
                onChange={(event) => onMessageIdChange(event.target.value)}
                value={messageId}
            />
          </div>
        </div>
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
            {showNoDataMessage && <RowWithContent>Ingen meldinger funnet !</RowWithContent>}
            {showData &&
                filteredAndSortedMessages.map((message, index) => {
                  return (
                      <Table.Row
                          key={message.cpaId + index}
                          className={clsx({[tableStyles.coloredRow]: index % 2})}
                      >
                        <Table.DataCell className="tabell__td--sortert">
                          {message.receivedDate.substring(0, 23)}
                        </Table.DataCell>
                        <Table.DataCell>
                          {message.readableIdList.split(",").map((readableId, idx, arr) => (
                              <React.Fragment key={readableId}>
                                <Link
                                    key={readableId}
                                    to={`/loggebms/${readableId}`}
                                    state={{backgroundLocation: location}}
                                >{readableId}</Link>
                                {idx < arr.length - 1 && ', '}
                              </React.Fragment>
                          ))}
                        </Table.DataCell>
                        <Table.DataCell>{message.role}</Table.DataCell>
                        <Table.DataCell>{message.service}</Table.DataCell>
                        <Table.DataCell>{message.action}</Table.DataCell>
                        <Table.DataCell>{message.referenceParameter}</Table.DataCell>
                        <Table.DataCell>{message.senderName}</Table.DataCell>
                        <Table.DataCell>
                          <Link
                              key={message.cpaId}
                              to={`/cpa/${message.cpaId}`}
                              state={{backgroundLocation: location}}
                          >{message.cpaId}</Link>
                        </Table.DataCell>
                        <Table.DataCell>{message.status}</Table.DataCell>
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
export default MessagesTable;
