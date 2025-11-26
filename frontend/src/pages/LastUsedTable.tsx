import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, {useEffect, useMemo, useState} from "react";
import RowWithContent from "../components/RowWithContent";
import useFetch from "../hooks/useFetch";
import tableStyles from "../styles/Table.module.scss";
import Pagination from "../components/Pagination";
import {Link, useLocation} from "react-router-dom";
import filterStyles from "../components/Filter.module.scss";
import {Input} from "nav-frontend-skjema";
import useTableSorting from "../hooks/useTableSorting";

type LastUsedCpa = {
  cpaId: string;
  lastUsed: string;
  lastUsedEbms: string;
};

const LastUsedTable = () => {
  const location = useLocation();
  const [cpaId, setCpaId] = useState("");
  const [months, setMonths] = useState(0);
  const [thresholdDate, setThresholdDate] = useState(new Date());

  const [compact, setCompact] = useState(true);
  const toggleCompact = () => setCompact(prev => !prev);
  const cellStyle = compact ? tableStyles.compactTableCell : '';

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const url = `/v1/hentsistbrukt`;

  const { fetchState, callRequest } = useFetch<LastUsedCpa[]>(url);

  const { loading, error, data } = fetchState;
  const messages = data ?? [];

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const onCpaIdChange = (value: string) => {
    setCurrentPage(1);
    setCpaId(value);
  };

  const onMonthsChange = (value: string) => {
    setCurrentPage(1);
    let m = value.replace(/[^0-9]/ig, '');
    if (m == "") m = "0";
    setMonths(parseInt(m));
    let d = new Date();
    d.setMonth(d.getMonth() - parseInt(m));
    setThresholdDate(d);
  };

  const filteredMessages = messages.filter(
    e => e.cpaId.toLocaleLowerCase().includes(cpaId.toLocaleLowerCase())
  ).filter(
    e => {
      if (e.lastUsed == null && e.lastUsedEbms == null) return true;
      let lastUsed = (e.lastUsed != null) ? new Date(e.lastUsed) : null;
      let lastUsedEbms = (e.lastUsedEbms != null) ? new Date(e.lastUsedEbms) : null;
      if (lastUsed != null && lastUsed > thresholdDate) return false;
      if (lastUsedEbms != null && lastUsedEbms > thresholdDate) return false;
      return true;
    }
  )
  const totalCount = filteredMessages.length;

  const {
    items: filteredAndSortedCpas,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredMessages);

  const getClassNamesFor = (name: keyof LastUsedCpa) => {
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

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredAndSortedCpas.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredAndSortedCpas]);

  const headers: { key: keyof LastUsedCpa; name: string }[] = [
    { key: "cpaId", name: "CPA-ID" },
    { key: "lastUsed", name: "Sist brukt i gamle emottak" },
    { key: "lastUsedEbms", name: "Sist brukt i nye emottak" },
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage =
    !loading && !error?.message && messages?.length === 0;
  const showData = !loading && !error?.message && !!messages?.length;

  return (
      <>
        <Input
          id="cpaId-input"
          label="CPA-ID: "
          className="navds-form-field--small"
          bredde={"L"}
          inputClassName={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
          onChange={(event) => onCpaIdChange(event.target.value)}
          value={cpaId}
        />
        <div className="navds-form-field--small">
          Ikke vis CPA'er som har vært i bruk siste <input
            id="months-input"
            type="number"
            size={1}
            className={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
            onChange={(event) => onMonthsChange(event.target.value)}
            value={months}
          /> måneder
        </div>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0"}}>
          <span>Totalt {totalCount} CPA'er</span>
          <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
            <a  style={{display: "inline-flex", alignItems: "center", gap: 8}}
                href="#" onClick={e => { e.preventDefault(); toggleCompact(); }}>
              {compact ? 'Vis luftigere tabell' : 'Vis kompakt tabell'}
            </a>
            <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
            <span>Rader per side</span>
              <select value={pageSize} onChange={onPageSizeChange}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
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
            {showNoDataMessage && <RowWithContent>Ingen CPA funnet!</RowWithContent>}
            {showData &&
                currentTableData.map((cpa, index) => {
                  return (
                      <Table.Row
                          key={cpa.cpaId + index}
                          className={clsx({[tableStyles.coloredRow]: index % 2})}
                      >
                        <Table.DataCell className={cellStyle}>
                          <Link
                              key={cpa.cpaId}
                              to={`/cpa/${cpa.cpaId}`}
                              state={{backgroundLocation: location}}
                          >{cpa.cpaId}</Link>
                        </Table.DataCell>
                          <Table.DataCell className={cellStyle}>{cpa.lastUsed}</Table.DataCell>
                          <Table.DataCell className={cellStyle}>{cpa.lastUsedEbms}</Table.DataCell>
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
export default LastUsedTable;
