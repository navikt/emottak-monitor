import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import React, {useEffect, useMemo, useState} from "react";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";
import {Input} from "nav-frontend-skjema";
import Pageinformation from "../components/Pageinformation";
import RowWithContent from "../components/RowWithContent";
import NavFrontendSpinner from "nav-frontend-spinner";
import search from "../images/search.gif";
import erase from "../images/erase.gif";
import filterStyles from "../components/Filter.module.scss";
import buttonStyles from "../styles/Button.module.scss";
import inputStyles from "../styles/Input.module.scss";

type BehandlerInfo = {
    fornavn: string;
    etternavn: string;
    hpr: string;
    herId: string;
};

type abonnementDetail = {
    partnerNavn: string;
    partnerOrgnr: string;
    partnerHerId: string;
    endretDato: string;
    sluttDato: string;
    tssId: string;
    behandlerInfo: BehandlerInfo;
    partnerId: string;
    abId: string;
    Fornavn: string;
    Familienavn: string;
    HER_Id: string;
    HPR: string;
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
    const abonnementInfo = useMemo(
        () =>
            (data?.abonnementListe ?? []).map((item) => ({
                ...item,
                Fornavn: item.behandlerInfo?.fornavn ?? "",
                Familienavn: item.behandlerInfo?.etternavn ?? "",
                HER_Id: item.behandlerInfo?.herId ?? "",
                HPR: item.behandlerInfo?.hpr ?? "",
            })),
        [data]
    );

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
        { key: "partnerNavn", name: "partnernavn" },
        { key: "partnerId", name: "partnerId" },
        { key: "partnerOrgnr", name: "orgnr" },
        { key: "partnerHerId", name: "herid" },
        { key: "endretDato", name: "endret_dato" },
        { key: "sluttDato", name: "slutt_dato" },
        { key: "tssId", name: "TssID" },
        { key: "abId", name: "AB_ID" },
        { key: "Fornavn", name: "Fornavn" },
        { key: "Familienavn", name: "Familienavn" },
        { key: "HER_Id", name: "HER-Id" },
        { key: "HPR", name: "HPR" },
    ];

    const showSpinner = loading;
    const showErrorMessage = !loading && error?.message;
    const showNoDataMessage =
        !loading && !error?.message && abonnementInfo?.length === 0;
    const showData = !loading && !error?.message && !!abonnementInfo?.length;

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
                                    <option value={"KEY"}>TssID</option>
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
            <Pageinformation
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
                totalCount={data?.totalNumberOfEntries ?? 0}
                filterCount={filteredAndSortedAbonnements.length ?? 0}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                errorMessage={errorMessage}
            />
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
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {showSpinner && (
                        <RowWithContent colSpan={12}>
                            <NavFrontendSpinner /><br />
                            Vennligst vent - tung spørring kjøres...
                        </RowWithContent>
                    )}
                    {showErrorMessage && <RowWithContent colSpan={12}>{error?.message}</RowWithContent>}
                    {showNoDataMessage && <RowWithContent colSpan={12}>Ingen data funnet !</RowWithContent>}
                    {showData &&
                        currentTableData.map((message, index) => {
                            return (
                                <Table.Row
                                    key={message.partnerId + index}
                                    className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                                >
                                    <Table.DataCell>{message.partnerNavn}</Table.DataCell>
                                    <Table.DataCell>{message.partnerId}</Table.DataCell>
                                    <Table.DataCell>{message.partnerOrgnr}</Table.DataCell>
                                    <Table.DataCell>{message.partnerHerId}</Table.DataCell>
                                    <Table.DataCell>{message.endretDato}</Table.DataCell>
                                    <Table.DataCell>{message.sluttDato}</Table.DataCell>
                                    <Table.DataCell>{message.tssId}</Table.DataCell>
                                    <Table.DataCell>{message.abId}</Table.DataCell>
                                    <Table.DataCell>{message.Fornavn}</Table.DataCell>
                                    <Table.DataCell>{message.Familienavn}</Table.DataCell>
                                    <Table.DataCell>{message.HER_Id}</Table.DataCell>
                                    <Table.DataCell>{message.HPR}</Table.DataCell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>
            </Table>
        </>
    );
};
export default AbonnementTable;
