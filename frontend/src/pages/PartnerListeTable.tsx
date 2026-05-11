import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import React, {useEffect, useMemo, useState} from "react";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";
import {Input} from "nav-frontend-skjema";
import Pagination from "../components/Pagination";
import RowWithContent from "../components/RowWithContent";
import NavFrontendSpinner from "nav-frontend-spinner";
import search from "../images/search.gif";
import erase from "../images/erase.gif";
import collapse from "../images/collapse.gif";
import expand from "../images/expand.gif";

import { toggleAllExpandables } from "../util";
import "../styles/style.scss";
import filterStyles from "../components/Filter.module.scss";
import buttonStyles from "../styles/Button.module.scss";
import inputStyles from "../styles/Input.module.scss";
import $ from 'jquery';

type PartnerDetails = {
    partnerName: string;
    partnerSubjectDN: string | null;
    partnerID: string;
    herID: string;
    orgNummer: string;
    cpaID: string | null;
    navCppID: string | null;
    partnerCppID: string | null;
    partnerEndpoint: string | null;
    komSystem: string | null;
    lastUsed: string | null;
    lastUsedEbms: string | null;
};

type CpaListeData = {
    partnerCpaListe: PartnerDetails[],
    totalNumberOfEntries: number
}

const PartnerListeTable = () => {
    const [selectedColnValue, setSelectedColnValue] = useState('');
    const [selectedCEqualValue, setSelectedCEqualValue] = useState('er lik');
    const [innValue, setInnValue] = useState('');
    const [searchColmn, setSearchColmn] = useState('');

    const [months, setMonths] = useState(0);
    const [thresholdDate, setThresholdDate] = useState(new Date());
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const url = `/v1/hentpartnerliste?searchColmn=${searchColmn}`;
    const { fetchState, callRequest } = useFetch<CpaListeData>(url);

    const { loading, error, data } = fetchState;
    const cpaInfo = data?.partnerCpaListe ?? [];

    useEffect(() => {
    callRequest();
  }, [callRequest]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchColmn]);

  // Filtrer ut CPA'er som har vært i bruk siste X antall måneder:
  const filteredCpaInfo = (cpaInfo ?? []).filter(
      e => {
          if (e.lastUsed == null && e.lastUsedEbms == null) return true;
          let lastUsed = (e.lastUsed != null) ? new Date(e.lastUsed) : null;
          let lastUsedEbms = (e.lastUsedEbms != null) ? new Date(e.lastUsedEbms) : null;
          if (lastUsed != null && lastUsed > thresholdDate) return false;
          if (lastUsedEbms != null && lastUsedEbms > thresholdDate) return false;
          return true;
      }
  );

  const {
    items: filteredAndSortedCpas,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredCpaInfo);

  const getClassNamesFor = (name: keyof PartnerDetails) => {
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInnValue(event.currentTarget.value)
  };
      const onSelectColn = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColnValue(event.currentTarget.value);
  };
  const onSelectEqual = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCEqualValue(event.currentTarget.value);
  };
  const handleBtnNullstil = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setErrorMessage('')
      setSearchColmn('')
      setInnValue('')
      setSelectedColnValue("")
      setSelectedCEqualValue("er lik") //TODO: First option
  };

  const handleBtnSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setErrorMessage('');
      const result: string = innValue + "¤" + selectedCEqualValue + "¤" +  selectedColnValue;
      if (result.endsWith("PARTNER_ID")) {
          if (innValue === '' || Number.isInteger(Number(innValue))) {
              setErrorMessage("");
              setSearchColmn(result);
          } else {
              // If not an integer, set an error message
              setErrorMessage("Partner_id skal være nummer!");
              setSearchColmn(999999 + result);
              return
          }
      }  else
            setSearchColmn(result);
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

  const groupedData = filteredAndSortedCpas.reduce((acc: Map<string, PartnerDetails[]>, obj) => {
    const key = obj.partnerID;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(obj);
    return acc;
  }, new Map<string, PartnerDetails[]>());

  const currentTableMap = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    let slicedMap = new Map<string, PartnerDetails[]>()
    let index = 0;
    // @ts-ignore
      for (const [key, value] of groupedData) {
        if (index >= lastPageIndex) break;
        if (index >= firstPageIndex) {
            slicedMap.set(key, value);
        }
        index++;
    }
    return slicedMap;
  }, [currentPage, pageSize, groupedData]);

  const headers: { key: keyof PartnerDetails; name: string }[] = [
      { key: "partnerName", name: "Navn"},
      { key: "partnerID", name: "PartnerID" },
      { key: "herID", name: "HerID" },
      { key: "orgNummer", name: "Org.Nummer" },
      { key: "navCppID", name: "NavCpp" },
      { key: "partnerCppID", name: "AdminID" },
      { key: "komSystem", name: "KomSystem" }
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage =
      !loading && !error?.message && cpaInfo?.length === 0;
  const showData = !loading && !error?.message && !!cpaInfo?.length;

  const totalPartners = data?.totalNumberOfEntries;
  const totalFilterCount = groupedData.size;
  let showTo = pageSize * currentPage;
  const showFrom = showTo - (pageSize-1);
  if (showTo > totalFilterCount) showTo = totalFilterCount;
  let pageLabel = `Viser ${showFrom} til ${showTo} av ${totalFilterCount}`;
  if (totalPartners != totalFilterCount) pageLabel += ` (filtrert fra totalt ${totalPartners} partnere)`;

    return (
      <>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <fieldset style={{width: "100%", borderWidth: "2px", borderColor: "grey", borderStyle: "solid", padding: "5px", margin: "0px" }}>
            <legend>Søk:</legend>
            <form>
              <div className="navds-form-field--small" style={{padding: "5px", position: "relative", textAlign: "right"}}>
                  <label style={{display: "inline-flex", alignItems: "center", gap: 16}}>
                      <span>Søk: </span>
                      <Input
                          //defaultValue="test" {...register("partnerID")}
                          name="innValue"
                          value={innValue}
                          className={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                          bredde={"L"}
                          onChange={handleInputChange}
                      />
                  </label>
                  &nbsp;&nbsp;&nbsp;
                  <span> Som </span>
                  <label style={{display: "inline-flex", alignItems: "right", gap: 20}}>
                      <select className={inputStyles.input} value={selectedCEqualValue}  onChange={onSelectEqual}>
                          <option id={"er lik"} value={"er lik"}>er lik</option>
                          <option id={"starter med"} value={"starter med"}>starter med</option>
                          <option id={"inneholder"} value={"inneholder"}>inneholder</option>
                      </select>
                  </label>
                  <label htmlFor="coln-select"  style={{display: "inline-flex", alignItems: "center", gap: 20}}>
                      &nbsp;&nbsp;&nbsp;&nbsp;i
                      <select className={inputStyles.input} id="coln-select"  value={selectedColnValue} onChange={onSelectColn}>
                          <option value={"TOMT"}></option>
                          <option value={"CPA_ID"}>CPA_ID</option>
                          <option value={"PARTNER_ID"}>PARTNER_ID</option>
                          <option value={"OrgNr"}>OrgNr</option>
                          <option value={"HerId"}>HerId</option>
                          <option value={"PARTNER_ENDPOINT"}>PARTNER_ENDPOINT</option>
                          <option value={"PARTNER_SUBJECTDN"}>PARTNER_SUBJECTDN</option>
                          <option value={"KomSystem"}>KOMM_SYSTEM</option>
                      </select>
                  </label>
                  &nbsp;&nbsp;&nbsp;
                  Skjul brukte siste <input
                  id="months-input"
                  type="number"
                  style={{width: "50px"}}
                  className={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                  onChange={(event) => onMonthsChange(event.target.value)}
                  value={months}
              /> måneder
              </div>
              <div className="navds-form-field--small" style={{padding: "20px 75px 5px 5px", position: "relative", textAlign: "right" }}>
              <button className={buttonStyles.button} type="submit" onClick={handleBtnSearch}>
                  <img src={search}/>
                  <span style={{display:"center"}}>Søk</span>
              </button>
                &nbsp;&nbsp;&nbsp;
              <button className={buttonStyles.button} type="submit" onClick={handleBtnNullstil}>
                  <img src={erase} />Nullstil
              </button>
            </div>
            </form>
          </fieldset>
        </div>
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
                            totalCount={totalFilterCount}
                            pageSize={pageSize}
                            siblingCount={1}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </td>
                    <td style={{  width: "34%", textAlign: "right" }}>
                        <span>{pageLabel}</span>
                    </td>
                  </tr>
                </tbody>
            </table>
        </fieldset>

          {/* Form fields */}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <Table className={tableStyles.table}>
          <Table.Header className={tableStyles.tableHeader}>
            <Table.Row>
              <Table.HeaderCell colSpan={11} style={{textAlign:"center"}}>
                  CPA-LISTE
              </Table.HeaderCell>
            </Table.Row>
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
              <Table.HeaderCell>Antall CPA</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {showSpinner && (
                <RowWithContent>
                  <NavFrontendSpinner />
                </RowWithContent>
            )}
            {showErrorMessage && <RowWithContent>{error}</RowWithContent>}
            {showNoDataMessage && <RowWithContent>Ingen data funnet !</RowWithContent>}
            {showData &&
                Array.from(currentTableMap.keys()).map((partnerId, index) => {
                    const messages = currentTableMap.get(partnerId)!!;
                    const firstMessage = messages[0]; // Brukes til info i hovedraden
                    const isExpanded = expandedRows[partnerId];
                  return (
                      <React.Fragment key={partnerId}>
                      <Table.Row
                          key={partnerId}
                          className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                          title={firstMessage.partnerSubjectDN ?? firstMessage.partnerName}
                      >

                          <Table.DataCell>
                              <div style={{ display: "flex", gap: "5px"}}>
                              <img
                                  className="expandable collapsible"
                                  src={isExpanded ? collapse : expand}
                                  style={{ width: "15px", height: "15px", border: "0px none", display: isExpanded ? "none" : "inline", cursor: "pointer" }}
                                  onClick={(e) => {
                                      toggleRow(firstMessage.partnerID);
                                      toggleAllExpandables($(e.currentTarget), $("#events td img.expandable:not(.collapsible)"));
                                  }}
                              />
                              <img
                                  className="collapsible"
                                  src={collapse}
                                  style={{ width: "15px", height: "15px", order: "0px none", display: isExpanded ? "inline" : "none", cursor: "pointer" }}
                                  onClick={(e) => {
                                      toggleRow(firstMessage.partnerID);
                                      toggleAllExpandables($(e.currentTarget), $("#events td img.collapsible"));
                                  }}
                              />
                              {firstMessage.partnerName}
                              </div>
                          </Table.DataCell>
                          <Table.DataCell>{firstMessage.partnerID}</Table.DataCell>
                          <Table.DataCell>{firstMessage.herID}</Table.DataCell>
                          <Table.DataCell>{firstMessage.orgNummer}</Table.DataCell>
                          <Table.DataCell>{firstMessage.navCppID}</Table.DataCell>
                          <Table.DataCell>{firstMessage.partnerCppID}</Table.DataCell>
                          <Table.DataCell>{firstMessage.komSystem}</Table.DataCell>
                          <Table.DataCell>{currentTableMap.get(partnerId)!!.length}</Table.DataCell>
                      </Table.Row>
                          {isExpanded &&
                              messages.map((message: any, subIndex: any) => (
                          <Table.Row  key={subIndex} style={{backgroundColor: "beige"}}>
                              <Table.DataCell colSpan={1}>
                                  {message.cpaID}
                              </Table.DataCell>
                              <Table.DataCell colSpan={2}>
                                  Sist brukt gamle emottak: {message.lastUsed}
                              </Table.DataCell>
                              <Table.DataCell colSpan={5}>
                                  Sist brukt nye emottak: {message.lastUsedEbms}
                              </Table.DataCell>
                          </Table.Row>
                      ))}
                      </React.Fragment>
                  );
                })}
          </Table.Body>
        </Table>
      </>
  );
};
export default PartnerListeTable;
