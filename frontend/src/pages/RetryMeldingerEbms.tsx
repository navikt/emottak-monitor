import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useMemo, useState } from "react";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import {initialToDate, initialTime, formatDatetime, toTimestamp, initialDateXDaysAgo} from "../util";
import { Table } from "@navikt/ds-react";
import styles from "../styles/Table.module.scss";
import RowWithContent from "../components/RowWithContent";
import Filter from "../components/Filter";
import useFilter from "../hooks/useFilter";
import clsx from "clsx";
import {MottakIdInfo} from "../models/MottakIdInfo";
import Pageinformation from "../components/Pageinformation";
import tableStyles from "../styles/Table.module.scss";
import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import {Link, useLocation} from "react-router-dom";

type RetryMessageData = {
  retryMessages: RetryMessage[];
  warning: string | null;
};

type RetryMessage = {
  requestId: string;
  timestamp: string;
  senderAddress: string;
  retryCount: string;
  retryReason: string;
  retryableAfter: string;
  message?: MottakIdInfo;
};

type RetryMessageDisplay = {
  requestId: string;
  timestamp: string;
  senderAddress: string;
  retryCount: string;
  retryReason: string;
  retryableAfter: string;
  datoMottatt?: string;
  mottakId?: string;
  role?: string;
  service?: string;
  action?: string;
  cpaId?: string;
  refparam?: string;
  conversationId?: string;
  messageId?: string;
};

const RetryMeldingerEbms = () => {
  const location = useLocation();

  const [fromDate, setFromDate] = useState(initialDateXDaysAgo(31));
  const [toDate, setToDate] = useState(initialToDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

  const [role, setRole] = useState("");
  const [service, setService] = useState("");
  const [action, setAction] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { fetchState, callRequest } = useFetch<RetryMessageData>(`/v1/hentretrymeldinger`);
  const { loading, error, data } = fetchState;
  const retryMessages = data?.retryMessages ?? [];
  const warning = data?.warning ?? "";

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  // Bygg flat visningsstruktur for sortering:
  const retryMessagesFlat = (retryMessages ?? []).reduce<RetryMessageDisplay[]>((acc, retryMessage) => {
    acc.push({
      requestId: retryMessage.requestId,
      timestamp: retryMessage.timestamp,
      senderAddress: retryMessage.senderAddress,
      retryCount: retryMessage.retryCount,
      retryReason: retryMessage.retryReason,
      retryableAfter: retryMessage.retryableAfter,
      datoMottatt: retryMessage.message?.datoMottatt ?? undefined,
      mottakId: retryMessage.message?.mottakId ?? undefined,
      role: retryMessage.message?.role ?? undefined,
      service: retryMessage.message?.service ?? undefined,
      action: retryMessage.message?.action ?? undefined,
      cpaId: retryMessage.message?.cpaId ?? undefined,
      refparam: retryMessage.message?.refparam ?? undefined,
      conversationId: retryMessage.message?.conversationId ?? undefined,
      messageId: retryMessage.message?.messageId ?? undefined,
    });
    return acc;
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, fromTime, toDate, toTime, role, service, action]);

  const { filteredItems: filteredMessages, handleFilterChange } = useFilter(
      retryMessagesFlat ?? [],
      ["role", "service", "action"]
  );

  const fromDateTime = fromDate
      ? new Date(`${fromDate}T${fromTime || "00:00:00"}`).getTime()
      : -Infinity;
  const toDateTime = toDate
      ? new Date(`${toDate}T${toTime || "23:59:59.999"}`).getTime()
      : Infinity;

  const dateTimeFilteredMessages = filteredMessages.filter((message) => {
    if (message.datoMottatt === null || message.datoMottatt === undefined) {
      return true;
    }
    // Keep the UTC offset, but remove Java's bracketed zone ID before parsing.
    const receivedAt = new Date(message.datoMottatt.replace(/\[[^\]]+\]$/, "")).getTime();
    return receivedAt >= fromDateTime && receivedAt <= toDateTime;
  });

  const {
    items: filteredAndSortedMessages,
    requestSort,
    sortConfig,
  } = useTableSorting(dateTimeFilteredMessages);

  const getClassNamesFor = (name: keyof RetryMessageDisplay) => {
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

  const onPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== pageSize) {
      setCurrentPage(1);
      setPageSize(newSize);
    }
  };

  const headers: { key: keyof RetryMessageDisplay; name: string }[] = [
    { key: "mottakId", name: "mottakId (requestId)" },
    { key: "timestamp", name: "timestamp" },
    { key: "senderAddress", name: "senderAddress" },
    { key: "retryCount", name: "retryCount" },
    { key: "retryReason", name: "retryReason" },
    { key: "retryableAfter", name: "retryableAfter" },
    { key: "datoMottatt", name: "Dato mottatt" },
    { key: "role", name: "Rolle" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "cpaId", name: "Cpa-id" },
    //{ key: "refparam", name: "refparam" },
    { key: "conversationId", name: "Conversation" },
    //{ key: "messageId", name: "messageId" },
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage =
    !loading && !error?.message && retryMessagesFlat?.length === 0;
  const showData = !loading && !error?.message && !!retryMessagesFlat?.length;

  return (
    <>
      <Filter
        fromDate={fromDate}
        fromTime={fromTime}
        toDate={toDate}
        toTime={toTime}
        onFromDateChange={setFromDate}
        onFromTimeChange={setFromTime}
        onToDateChange={setToDate}
        onToTimeChange={setToTime}
        messages={retryMessagesFlat ?? []}
        onFilterChange={handleFilterChange}
        filterKeys={["service", "action", "role"]}
      />
      <Pageinformation
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          totalCount={retryMessages.length ?? 0}
          filterCount={filteredAndSortedMessages.length ?? 0}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          errorMessage={warning}
      />
      <Table className={styles.table} style={{ width: "100%" }}>
        <Table.Header className={styles.tableHeader}>
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
            <RowWithContent colSpan={headers.length}>
              <NavFrontendSpinner />
            </RowWithContent>
          )}

          {showErrorMessage && <RowWithContent colSpan={headers.length}>{error.message}</RowWithContent>}
          {showNoDataMessage && <RowWithContent colSpan={headers.length}>Ingen meldinger på retry-kø!</RowWithContent>}
          {showData &&
            currentTableData.map((message, index) => {
              return (
                  <Table.Row
                      key={message.requestId}
                      className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                  >
                    <Table.DataCell>
                      {message.mottakId && (
                          <Ekspanderbartpanel tittel={message.mottakId ?? message.requestId}>
                            {message.requestId}
                          </Ekspanderbartpanel>
                      )}
                      {!message.mottakId && (
                          <>{message.requestId}</>
                      )}
                    </Table.DataCell>
                    <Table.DataCell>{toTimestamp(message.timestamp)}</Table.DataCell>
                    <Table.DataCell>{message.senderAddress}</Table.DataCell>
                    <Table.DataCell>{message.retryCount}</Table.DataCell>
                    <Table.DataCell>{message.retryReason}</Table.DataCell>
                    <Table.DataCell>{formatDatetime(message.retryableAfter)}</Table.DataCell>
                    <Table.DataCell>{formatDatetime(message.datoMottatt)}</Table.DataCell>
                    <Table.DataCell>{message.role}</Table.DataCell>
                    <Table.DataCell>{message.service}</Table.DataCell>
                    <Table.DataCell>{message.action}</Table.DataCell>
                    <Table.DataCell>
                      <Link
                          to={`/cpa/${message.cpaId}`}
                          state={{backgroundLocation: location}}
                      >{message.cpaId}</Link>
                    </Table.DataCell>
                    <Table.DataCell>
                      <Link
                          to={`/conversation/${message.conversationId}/readableId/${message.mottakId}`}
                          state={{backgroundLocation: location}}
                      >Tilhørende meldinger</Link>
                    </Table.DataCell>
                  </Table.Row>
              );
            })}
        </Table.Body>
      </Table>
    </>
  );
};

export default RetryMeldingerEbms;
