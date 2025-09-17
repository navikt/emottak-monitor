import { Table } from "@navikt/ds-react";
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

const MessagesTable = () => {
  const location = useLocation();

  const [fromDateDraft, setFromDateDraft] = useState(initialDate(""));
  const [toDateDraft, setToDateDraft] = useState(initialDate(""));
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

  const [mottakId, setMottakId] = useState("");
  const [cpaId, setCpaId] = useState("");

  let pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);
  //const [pageSize, setPageSize] = useState(10);

  const url = `/v1/hentmeldingerebms?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}&mottakId=${mottakId}&cpaId=${cpaId}`;

  const { fetchState, callRequest } = useFetch<MessageInfo[]>(url);

  const commitFromDate   = () => setFromDate(fromDateDraft);
  const commitToDate     = () => setToDate(toDateDraft);
  const commitFromTime   = () => setFromTime(fromTimeDraft);
  const commitToTime     = () => setToTime(toTimeDraft);

  const { loading, error, data: messages } = fetchState;

  const { filteredItems: filteredMessages, handleFilterChange } = useFilter(
    messages ?? [],
    ["role", "service", "action", "status"]
  );

  //const numberOfItems = visibleMessages.length;
  //const numberOfPages = pageSize > 0 ? Math.ceil(numberOfItems / pageSize) : 1

  useEffect(() => {
    callRequest();
  }, [callRequest]);

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

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredAndSortedMessages.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredAndSortedMessages]);

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
      <Filter
        fromDate={debouncedFromDate}
        fromTime={debouncedFromTime}
        toDate={debouncedToDate}
        toTime={debouncedToTime}
        onFromDateChange={setFromDateDraft}
        onFromTimeChange={setFromTimeDraft}
        onToDateChange={setToDateDraft}
        onToTimeChange={setToTimeDraft}
        onFromDateBlur={commitFromDate}
        onFromTimeBlur={commitFromTime}
        onToDateBlur={commitToDate}
        onToTimeBlur={commitToTime}
        messages={messages ?? []}
        onFilterChange={handleFilterChange}
      />
      <div className={clsx(filterStyles.gridContainer, filterStyles.gridContainerIds)}>
        <div style={{ gridArea: "mottakId" }}>
          <label
            className="navds-select__label navds-label navds-label--small"
            htmlFor="mottakId-input"
          >Mottak-Id</label>
          <Input
            bredde={"XL"}
            id="mottakId-input"
            className={[filterStyles.inputId, "navds-select__label navds-label navds-label--small"].join(' ')}
            onChange={(event) => setMottakId(event.target.value)}
            value={mottakId}
          />
        </div>
        <div style={{ gridArea: "cpaId" }}>
          <label
            className="navds-select__label navds-label navds-label--small"
            htmlFor="cpaId-input"
          >CPA-Id</label>
          <Input
            bredde={"L"}
            id="cpaId-input"
            className={[filterStyles.inputId, "navds-select__label navds-label navds-label--small"].join(' ')}
            onChange={(event) => setCpaId(event.target.value)}
            value={cpaId}
          />
        </div>
      </div>
      <span style={{position: "relative", float: "left", margin: "20px 0"}}>
        {filteredMessages.length} meldinger
      </span>
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
            currentTableData.map((message, index) => {
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
        totalCount={filteredMessages.length}
        pageSize={pageSize}
        siblingCount={1}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};
export default MessagesTable;
