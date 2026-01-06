import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import useFilter from "../hooks/useFilter";
import useTableSorting from "../hooks/useTableSorting";
// @ts-ignore
import buttonStyles from "../styles/Button.module.css";
// @ts-ignore
import tableStyles from "../styles/Table.module.scss";
import {Input} from "nav-frontend-skjema";
import Pagination from "../components/Pagination";
import RowWithContent from "../components/RowWithContent";
import NavFrontendSpinner from "nav-frontend-spinner";
// @ts-ignore
import search from "../images/search.gif";
// @ts-ignore
import erase from "../images/erase.gif";

type CpaDetails = {
    partnerSubjectDN: string;
    partnerID: string;
    herID: string;
    orgNummer: string;
    cpaID: string;
    navCppID: string;
    partnerCppID: string;
    partnerEndpoint: string;
    komSystem: string;
    lastUsed: string;
    lastUsedEbms: string;
};

type Page = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: CpaDetails[];
};

const CpaTable = () => {
    const [selectedColnValue, setSelectedColnValue] = useState('');
    const [selectedCEqualValue, SetSelectedCEqualValue] = useState('er lik');
    const [innValue, SetInnValue] = useState('');
    const [searchColmn, setSearchColmn] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const url = `/v1/hentcpaliste?searchColmn=${searchColmn}&page=${currentPage}&size=${pageSize}`;
    const { fetchState, callRequest } = useFetch<Page>(url);

    const { loading, error, data } = fetchState;
    const cpaInfo = data?.content ?? [];
    const totalCount = data?.totalElements ?? 0;

    useEffect(() => {
    callRequest();
  }, [callRequest]);

  useEffect(() => {
    if (error) {
      console.error('Fetch error:', error.message);
    }
    if (!data) return;
    console.log('useEffect:currentPage:', currentPage, " data.page:", data.page, " pageSize:", pageSize, " data.size:", data.size, " : ", searchColmn );
    if (data.page !== currentPage) setCurrentPage(data.page);
    if (data.size !== pageSize) setPageSize(data.size);
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchColmn]);

  const { filteredItems: filteredCpaInfo, handleFilterChange } = useFilter(
      cpaInfo ?? [],
      ["partnerSubjectDN", "partnerID", "herID", "orgNummer", "cpaID", "navCppID", "partnerCppID", "partnerEndpoint", "komSystem", "lastUsed"]
  );

  const {
    items: filteredAndSortedCpas,
    requestSort,
    sortConfig,
  } = useTableSorting(filteredCpaInfo);

  const getClassNamesFor = (name: keyof CpaDetails) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const onPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    console.log(newSize, ' !== ', pageSize,' -> ', currentPage);
    if (newSize !== pageSize) {
      setCurrentPage(1);
      setPageSize(newSize);
    }
  };


  const handleInputChange = (event: React.FormEvent<HTMLFormElement>) => {
    SetInnValue(event.currentTarget.value)
  };
  const onSelectColn = (event: React.FormEvent<HTMLFormElement>) => {
    setSelectedColnValue(event.currentTarget.value);
  };
  const onSelectEqual = (event: React.FormEvent<HTMLFormElement>) => {
    SetSelectedCEqualValue(event.currentTarget.value);
  };
  const handleBtnNullstil = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage('')
      setSearchColmn('')
      SetInnValue('')
      setSelectedColnValue("")
      SetSelectedCEqualValue("er lik") //TODO: First option
  };


  const handleBtnSearch = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage('')
      const result: string = innValue + ";" + selectedCEqualValue + ";" +  selectedColnValue
      if (result.endsWith("PARTNER_ID")) {
          if (innValue === '' || Number.isInteger(Number(innValue))) {
              setErrorMessage("")
              setSearchColmn(result)
          } else {
              // If not an integer, set an error message
              setErrorMessage("Partner_id skal være nummer!");
              setSearchColmn(999999 + result)
              return
          }
      }  else
            setSearchColmn(result)
  };

  const headers: { key: keyof CpaDetails; name: string }[] = [
      { key: "partnerSubjectDN", name: "Navn" },
      { key: "partnerID", name: "PartnerID" },
      { key: "herID", name: "HerID" },
      { key: "orgNummer", name: "Org.Nummer" },
      { key: "cpaID", name: "CpaID" },
      { key: "navCppID", name: "NavCpp" },
      { key: "partnerCppID", name: "AdminID" },
      { key: "partnerEndpoint", name: "Endpoint" },
      { key: "komSystem", name: "KomSystem" },
      { key: "lastUsed", name: "Sist brukt" },
  ];

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage =
      !loading && !error?.message && cpaInfo?.length === 0;
  const showData = !loading && !error?.message && !!cpaInfo?.length;

  // @ts-ignore
    return (
      <>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0"}}>
          <div style={{gridArea: "cpaId"}}>

            <form>
            <label style={{display: "inline-flex", alignItems: "center", gap: 16}}>
              <span>Søk: </span>
              <Input
                  //defaultValue="test" {...register("partnerID")}
                  name="innValue"
                  value={innValue}
                  className="navds-form-field navds-form-field--small"
                  bredde={"L"}
                  onChange={handleInputChange}
              />
            </label>
                &nbsp;&nbsp;&nbsp;
            <span> Som </span>
          <label style={{display: "inline-flex", alignItems: "right", gap: 20}}>
            <select value={selectedCEqualValue}  onChange={onSelectEqual}>
              <option id={"er lik"} value={"er lik"}>er lik</option>
              <option id={"starter med"} value={"starter med"}>starter med</option>
              <option id={"inneholder"} value={"inneholder"}>inneholder</option>
            </select>
          </label>
            <label htmlFor="coln-select"  style={{display: "inline-flex", alignItems: "center", gap: 20}}>
                &nbsp;&nbsp;&nbsp;&nbsp;i
              <select id="coln-select"  value={selectedColnValue} onChange={onSelectColn}>
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
              <button className={buttonStyles.button} type="submit" onClick={handleBtnSearch}>
                  <img src={search}/>
                  <span style={{display:"center"}}>Søk</span>
              </button>
                &nbsp;&nbsp;&nbsp;
              <button  className={buttonStyles.button} type="submit" onClick={handleBtnNullstil}>
                  <img  src={erase} />Nullstil
              </button>

            </form>
          </div>
          <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
            <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
              <span>Rader per side</span>
              <select value={pageSize} onChange={onPageSizeChange}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </label>
          </div>
          <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
            Totalt antall {totalCount} CPA'er
          </span>
        </div>
          {/* Form fields */}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Pagination
              totalCount={totalCount}
              pageSize={pageSize}
              siblingCount={1}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
          />
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
            {showErrorMessage && <RowWithContent>{error}</RowWithContent>}
            {showNoDataMessage && <RowWithContent>Ingen data funnet !</RowWithContent>}
            {showData &&
                filteredAndSortedCpas.map((message, index) => {
                  return (
                      <Table.Row
                          key={message.cpaID + index}
                          className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                      >
                          <Table.DataCell>{message.partnerSubjectDN}</Table.DataCell>
                          <Table.DataCell>{message.partnerID}</Table.DataCell>
                          <Table.DataCell>{message.herID}</Table.DataCell>
                          <Table.DataCell>{message.orgNummer}</Table.DataCell>
                          <Table.DataCell>{message.cpaID}</Table.DataCell>
                          <Table.DataCell>{message.navCppID}</Table.DataCell>
                          <Table.DataCell>{message.partnerCppID}</Table.DataCell>
                          <Table.DataCell>{message.partnerEndpoint}</Table.DataCell>
                          <Table.DataCell>{message.komSystem}</Table.DataCell>
                          <Table.DataCell>{message.lastUsed}</Table.DataCell>
                      </Table.Row>
                  );
                })}
          </Table.Body>
        </Table>
        <!--<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0"}}>
          <Pagination
            totalCount={totalCount}
            pageSize={pageSize}
            siblingCount={1}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
            Totalt antall {totalCount} CPA'er
          </span>
        </div>-->
      </>
  );
};
export default CpaTable;
