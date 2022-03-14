import NavFrontendSpinner from "nav-frontend-spinner";
import React, {useEffect, useMemo, useState} from "react";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import { initialDate, initialTime } from "../util";
import {Table} from "@navikt/ds-react"
import styles from "../styles/Table.module.scss";
import RowWithContent from "../components/RowWithContent";
import useDebounce from "../hooks/useDebounce";
import Filter from "../components/Filter";
import useFilter from "../hooks/useFilter";
import Pagination from "../components/Pagination";
import clsx from "clsx";

type StatistikkInfo = {
  hendelsesbeskrivelse: string;
  antall_feil: string;
};

type MappedStatistikkInfo = {
    hendelsesbeskrivelse: string;
    antall_feil: number;
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

  const mappedStatistikkInfo = (statistikkInfo: StatistikkInfo[]) =>
        statistikkInfo.map(
            (el) =>
                ({
                    hendelsesbeskrivelse: el.hendelsesbeskrivelse,
                    antall_feil: parseInt(el.antall_feil),
                } as MappedStatistikkInfo)
        );

  const { loading, error, data } = fetchState;
  const statistikkInfoList = data ? mappedStatistikkInfo(data) : [];

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

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage = !loading && !error?.message && statistikkInfoList?.length === 0;
  const showData = !loading && !error?.message && !!statistikkInfoList?.length;

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
            {showSpinner && (
                <RowWithContent>
                    <NavFrontendSpinner />
                </RowWithContent>
            )}

            {showErrorMessage && <RowWithContent>{error.message}</RowWithContent>}
            {showNoDataMessage && <RowWithContent>No statistics</RowWithContent>}
            {showData &&
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
            }
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
