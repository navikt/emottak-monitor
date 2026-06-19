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
import filterStyles from "../components/Filter.module.scss";
import buttonStyles from "../styles/Button.module.scss";
import inputStyles from "../styles/Input.module.scss";

type BehandlerInfo = {
    B_FNavn: string;
    B_FamilieNavn: string;
    B_Hpr: string;
    B_Herid: string;
};

type abonnementDetail = {
    partner_navn: string;
    partner_orgnr: string;
    partner_herid: string;
    endret_dato: string;
    slutt_dato: string;
    tssid: string;
    behandlerInfo: BehandlerInfo[];
    partner_id: string;
    ab_id: string;
};

type AbonnementData = {
    abonnementListe: abonnementDetail[],
    totalNumberOfEntries: number
}

const AbonnementTable = () => {
    const [selectedColnValue, setSelectedColnValue] = useState('');
    const [selectedCEqualValue, setSelectedCEqualValue] = useState('er lik');
    const [innValue, setInnValue] = useState('');
    const [searchColmn, setSearchColmn] = useState('');

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const url = `/v1/hentabonnementliste?sok=${searchColmn}`;
    const { fetchState, callRequest } = useFetch<AbonnementData>(url);

    const { loading, error, data } = fetchState;
    const abonnementInfo = data?.abonnementListe ?? [];

    useEffect(() => {
        callRequest();
    }, [callRequest]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchColmn]);

    const {
        items: filteredAndSortedAbonnements,
        requestSort,
        sortConfig,
    } = useTableSorting(abonnementInfo);

    const getClassNamesFor = (name: keyof abonnementDetail) => {
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
        setInnValue(event.currentTarget.value);
    };
    const onSelectColn = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedColnValue(event.currentTarget.value);
    };
    const onSelectEqual = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCEqualValue(event.currentTarget.value);
    };
    const handleBtnNullstil = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setSearchColmn('');
        setInnValue('');
        setSelectedColnValue("");
        setSelectedCEqualValue("er lik");
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

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return filteredAndSortedAbonnements.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, pageSize, filteredAndSortedAbonnements]);

    const headers: { key: keyof abonnementDetail; name: string }[] = [
        { key: "partner_navn", name: "partnernavn" },
        { key: "partner_id", name: "partnerId" },
        { key: "partner_orgnr", name: "orgnr" },
        { key: "partner_herid", name: "herid" },
        { key: "endret_dato", name: "endret_dato" },
        { key: "slutt_dato", name: "slutt_dato" },
        { key: "tssid", name: "TssID" },
        { key: "ab_id", name: "AB_ID" },
    ];

    const showSpinner = loading;
    const showErrorMessage = !loading && error?.message;
    const showNoDataMessage =
        !loading && !error?.message && abonnementInfo?.length === 0;
    const showData = !loading && !error?.message && !!abonnementInfo?.length;

    const totalFilterCount = filteredAndSortedAbonnements.length ?? 0;
    const totalAbonnements = data?.totalNumberOfEntries;
    let showTo = pageSize * currentPage;
    const showFrom = showTo - (pageSize-1);
    if (showTo > totalFilterCount) showTo = totalFilterCount;
    let pageLabel = `Viser ${showFrom} til ${showTo} av ${totalFilterCount}`;
    if (totalAbonnements != totalFilterCount) pageLabel += ` (filtrert fra totalt ${totalAbonnements} abonnementer)`;

    return (
        <>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <fieldset style={{width: "100%", borderWidth: "2px", borderColor: "grey", borderStyle: "solid", padding: "5px" }}>
                    <legend>Søk:</legend>
                    <form>
                        <div className="navds-form-field--small" style={{padding: "5px", position: "relative", textAlign: "right"}}>
                            <label style={{display: "inline-flex", alignItems: "center", gap: 16}}>
                                <span>Søk: </span>
                                <Input
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
                                    <option value={"PARTNER_NAVN"}>partnernavn</option>
                                    <option value={"PARTNER_ID"}>partnerId</option>
                                    <option value={"OrgNr"}>OrgNr</option>
                                    <option value={"HerId"}>HerId</option>
                                    <option value={"BEHANDLER_NAVN"}>Behandlers navn</option>
                                    <option value={"BEHANDLER_HERID"}>Behandlers HerId</option>
                                    <option value={"BEHANDLER_HPR"}>Behandlers HPR</option>
                                </select>
                            </label>
                        </div>
                        <div className="navds-form-field--small" style={{padding: "20px 75px 5px 5px", position: "relative", textAlign: "right" }}>
                            <button className={buttonStyles.button} type="submit" onClick={handleBtnSearch}>
                                <img src={search} alt="søk" />
                                <span style={{display:"center"}}>Søk</span>
                            </button>
                            &nbsp;&nbsp;&nbsp;
                            <button className={buttonStyles.button} type="submit" onClick={handleBtnNullstil}>
                                <img src={erase} alt="nullstill" />Nullstil
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
                {/* Form fields */}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </fieldset>
            <Table className={tableStyles.table}>
                <Table.Header className={tableStyles.tableHeader}>
                    <Table.Row>
                        <Table.HeaderCell colSpan={12} style={{textAlign:"center"}}>
                            Abonnement
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
                        <Table.HeaderCell>Fornavn</Table.HeaderCell>
                        <Table.HeaderCell>Familienavn</Table.HeaderCell>
                        <Table.HeaderCell>HER-id</Table.HeaderCell>
                        <Table.HeaderCell>HPR</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {showSpinner && (
                        <RowWithContent>
                            <NavFrontendSpinner />
                        </RowWithContent>
                    )}
                    {showErrorMessage && <RowWithContent>{error?.message}</RowWithContent>}
                    {showNoDataMessage && <RowWithContent>Ingen data funnet !</RowWithContent>}
                    {showData &&
                        currentTableData.map((message, index) => {
                            return (
                                <Table.Row
                                    key={message.partner_id + index}
                                    className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                                >
                                    <Table.DataCell>{message.partner_navn}</Table.DataCell>
                                    <Table.DataCell>{message.partner_id}</Table.DataCell>
                                    <Table.DataCell>{message.partner_orgnr}</Table.DataCell>
                                    <Table.DataCell>{message.partner_herid}</Table.DataCell>
                                    <Table.DataCell>{message.endret_dato}</Table.DataCell>
                                    <Table.DataCell>{message.slutt_dato}</Table.DataCell>
                                    <Table.DataCell>{message.tssid}</Table.DataCell>
                                    <Table.DataCell>{message.ab_id}</Table.DataCell>
                                    <Table.DataCell>
                                        {(message.behandlerInfo ?? []).map((b, i) => (
                                            <div key={i}>{b.B_FNavn}</div>
                                        ))}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {(message.behandlerInfo ?? []).map((b, i) => (
                                            <div key={i}>{b.B_FamilieNavn}</div>
                                        ))}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {(message.behandlerInfo ?? []).map((b, i) => (
                                            <div key={i}>{b.B_Herid}</div>
                                        ))}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {(message.behandlerInfo ?? []).map((b, i) => (
                                            <div key={i}>{b.B_Hpr}</div>
                                        ))}
                                    </Table.DataCell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>
            </Table>
        </>
    );
};
export default AbonnementTable;
