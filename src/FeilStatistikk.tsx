import NavFrontendSpinner from "nav-frontend-spinner";
import React, {useEffect, useMemo, useState} from "react";
import { useLocation } from "react-router-dom";
import useFetch from "./hooks/useFetch";
import useTableSorting from "./hooks/useTableSorting";
import { initialDate, initialTime } from "./util";
import {Table} from "@navikt/ds-react"
import styles from "./MessagesTable.module.scss";
import clsx from "clsx";
import RowWithContent from "./components/RowWithContent";
import useDebounce from "./hooks/useDebounce";
import Filter from "./components/Filter";
import useFilter from "./hooks/useFilter";
import Pagination from "./components/Pagination";

type StatistikkInfo = {
  hendelsesbeskrivelse: string;
  antall_feil: string;
};

const FeilStatistikk = () => {
  const [fromDate, setFromDate] = useState(initialDate(""));
  const [toDate, setToDate] = useState(initialDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

  // using debounce to not use value until there has been no new changes
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);

  const { fetchState, callRequest } = useFetch<StatistikkInfo[]>(
    `/v1/hentfeilstatistikk?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}`
  );

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { loading, error, data: statistikkInfoList } = fetchState;
  let pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
      statistikkInfoList ?? [],
      []
    );

    const {
        items: filteredAndSortedEvents,
        requestSort,
        sortConfig,
    } = useTableSorting(statistikkInfoList);


    const getClassNamesFor = (name: keyof StatistikkInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredAndSortedEvents.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredAndSortedEvents]);


  const headers: { key: keyof StatistikkInfo; name: string }[] = [
    { key: "hendelsesbeskrivelse", name: "Hendelse" },
    { key: "antall_feil", name: "Antall" },
  ]

  return (
      <>
      <Filter
          fromDate={debouncedFromDate}
          fromTime={debouncedFromTime}
          toDate={debouncedToDate}
          toTime={debouncedToTime}
          onFromDateChange={setFromDate}
          onFromTimeChange={setFromTime}
          onToDateChange={setToDate}
          onToTimeChange={setToTime}
          messages={statistikkInfoList ?? []}
          onFilterChange={handleFilterChange}
          filterKeys={[]}
      />
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
      </span>
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
        {loading ? (
            <NavFrontendSpinner />
        ) : (
            currentTableData.map((event, index) => {
              return (
                  <Table.Row
                      key={event.antall_feil + index}
                      className={clsx({[styles.coloredRow]: index % 2 })}
                  >
                    <Table.DataCell>{event.hendelsesbeskrivelse}</Table.DataCell>
                    <Table.DataCell>{event.antall_feil}</Table.DataCell>
                  </Table.Row>
              );
            })
        )}
        {!loading && !error && statistikkInfoList?.length === 0 && (
            <RowWithContent>No events</RowWithContent>
        )}
        {error?.message && <RowWithContent>{error.message}</RowWithContent>}
      </Table.Body>
      </Table>
          <Pagination
              totalCount={filteredEvents.length}
              pageSize={pageSize}
              siblingCount={1}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
          />
      </>
  );
};

export default FeilStatistikk;
