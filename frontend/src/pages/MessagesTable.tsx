import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import Lenke from "nav-frontend-lenker";
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

type MessageInfo = {
  action: string;
  antall: number;
  avsender: string;
  cpaid: string;
  datomottat: string;
  mottakidliste: string;
  referanse: string;
  role: string;
  service: string;
  status: string;
};

const MessagesTable = () => {

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

  let pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);
  //const [pageSize, setPageSize] = useState(10);

  const url = `/v1/hentmeldinger?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}`;

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
    { key: "datomottat", name: "Mottatt" },
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
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredMessages.length} meldinger
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
          {showNoDataMessage && <RowWithContent>Ingen meldinger funnet !</RowWithContent>}
          {showData &&
            currentTableData.map((message, index) => {
              return (
                <Table.Row
                  key={message.cpaid + index}
                  className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                >
                  <Table.DataCell className="tabell__td--sortert">
                    {message.datomottat.substring(0, 23)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {message.mottakidliste.split(",").map((mottakid) => (
                      <Lenke key={mottakid} href={`/logg/${mottakid}`}>
                        {mottakid}{" "}
                      </Lenke>
                    ))}
                  </Table.DataCell>
                  <Table.DataCell>{message.role}</Table.DataCell>
                  <Table.DataCell>{message.service}</Table.DataCell>
                  <Table.DataCell>{message.action}</Table.DataCell>
                  <Table.DataCell>{message.referanse}</Table.DataCell>
                  <Table.DataCell>{message.avsender}</Table.DataCell>
                  <Table.DataCell>
                    <Lenke href={`/cpa/${message.cpaid}`}>
                      {message.cpaid}
                    </Lenke>
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
