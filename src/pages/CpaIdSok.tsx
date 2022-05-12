import React, {useEffect, useMemo, useState} from "react";
import { Input } from "nav-frontend-skjema";
import Lenke from "nav-frontend-lenker";
import NavFrontendSpinner from "nav-frontend-spinner";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import styles from "../styles/Table.module.scss";
import {Table} from "@navikt/ds-react";
import useFilter from "../hooks/useFilter";
import clsx from "clsx";
import RowWithContent from "../components/RowWithContent";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import {initialDate, initialTime} from "../util";
import Filter from "../components/Filter";
import tableStyles from "../styles/Table.module.scss";

type CpaIdInfo = {
  action: string;
  antall: number;
  avsender: string;
  cpaid: string;
  datomottat: string;
  mottakid: string;
  referanse: string;
  role: string;
  service: string;
  status: string;
};
const CpaIdSok = () => {
  const [fromDate, setFromDate] = useState(initialDate(""));
  const [toDate, setToDate] = useState(initialDate(""));
  const [fromTime, setFromTime] = useState(initialTime(""));
  const [toTime, setToTime] = useState(initialTime(""));

    // using debounce to not use value until there has been no new changes
  const debouncedFromDate = useDebounce(fromDate, 200);
  const debouncedToDate = useDebounce(toDate, 200);
  const debouncedFromTime = useDebounce(fromTime, 200);
  const debouncedToTime = useDebounce(toTime, 200);

    const [cpaId, setCpaId] = useState("");
    const { fetchState, callRequest } = useFetch<CpaIdInfo[]>(
    `/v1/hentcpaidinfo?cpaId=${cpaId}&fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}`
  );

  useEffect(() => {
  callRequest();
  }, [callRequest]);

  const { loading, error, data: cpaIdInfo } = fetchState;

  const { filteredItems: filteredCpaIdInfo, handleFilterChange } = useFilter(
      cpaIdInfo ?? [],
      ["role", "service", "action", "status"]
  );

  const getClassNamesFor = (name: keyof CpaIdInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  let pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const {
    items: filteredAndSortedMessages,
    requestSort,
    sortConfig,
    } = useTableSorting(filteredCpaIdInfo);

  const cpaIdInfoData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredAndSortedMessages.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredAndSortedMessages]);


    const headers: { key: keyof CpaIdInfo; name: string }[] = [
    { key: "datomottat", name: "Mottatt" },
    { key: "mottakid", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referanse", name: "Referanse" },
    { key: "avsender", name: "Avsender" },
    { key: "status", name: "Status" },
  ];

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
            messages={cpaIdInfo ?? []}
            onFilterChange={handleFilterChange}
            filterKeys={["service", "action", "role", "status"]}
        />
      <Input
          bredde={"L"}
          onChange={(event) => setCpaId(event.target.value)}
          value={cpaId}
      />
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredCpaIdInfo.length} cpaInfo
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
          {loading ? (
                <NavFrontendSpinner />
          ) : (
            cpaIdInfoData.map((detail, index) => {
              return (
                  <Table.Row
                    key={detail.cpaid + index}
                    className={clsx({ [styles.coloredRow]: index % 2 })}
                  >
                    <Table.DataCell className="tabell__td--sortert">
                      {detail.datomottat.substring(0, 23)}
                    </Table.DataCell>
                    <Table.DataCell>
                        <Lenke href={`/logg/${detail.mottakid}`}>
                            {detail.mottakid}{" "}
                        </Lenke>
                    </Table.DataCell>
                    <Table.DataCell>{detail.role}</Table.DataCell>
                    <Table.DataCell>{detail.service}</Table.DataCell>
                    <Table.DataCell>{detail.action}</Table.DataCell>
                    <Table.DataCell>{detail.referanse}</Table.DataCell>
                    <Table.DataCell>{detail.avsender}</Table.DataCell>
                    <Table.DataCell>{detail.status}</Table.DataCell>
                  </Table.Row>
              );
            })
          )}
          {!loading && !error && cpaIdInfo?.length === 0 && (
              <RowWithContent>Ingen CPA ident informasjon funnet !</RowWithContent>
          )}
          {error?.message && <RowWithContent>{error.message}</RowWithContent>}
        </Table.Body>
      </Table>
      <Pagination
          totalCount={filteredCpaIdInfo.length}
          pageSize={pageSize}
          siblingCount={1}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </>
  );
};
export default CpaIdSok;
