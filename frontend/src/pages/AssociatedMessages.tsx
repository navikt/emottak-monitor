import { Table } from "@navikt/ds-react";
import clsx from "clsx";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, {useEffect, useState} from "react";
import RowWithContent from "../components/RowWithContent";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useFilter from "../hooks/useFilter";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";
import {Link, useLocation} from "react-router-dom";
import ok from "../images/ok.gif";
import info from "../images/info.gif";
import err from "../images/error.gif";
import {initialToDate} from "../util";

interface AssociatedMessagesProps {
    mottakid: string;
}

type MessageInfo = {
    action: string;
    antall: number;
    avsender: string;
    cpaid: string;
    datomottat: string;
    mottakid: string;
    conversationId: string;
    referanse: string;
    role: string;
    service: string;
    status: string;
};

export default function AssociatedMessages({mottakid}: AssociatedMessagesProps) {

    const debouncedMottakId = useDebounce(mottakid, 1000);

    // TODO: fromDate og toDate skal brukes
    const url = `/v1/hentmeldinger?fromDate=1970-01-01%2000:00&toDate=2100-01-01%2000:00&mottakId=${debouncedMottakId}`;


    const { fetchState, callRequest } = useFetch<{ content: MessageInfo[] }>(url);
    const { loading, error, data } = fetchState;
    const messages = data?.content ?? [];

    useEffect(() => {
        callRequest();
    }, [callRequest]);

    const { filteredItems: filteredMessages, handleFilterChange } = useFilter(
        messages ?? [],
        ["role", "service", "action", "status"]
    );

    const {
        items: filteredAndSortedMessages,
        requestSort,
        sortConfig,
    } = useTableSorting(filteredMessages);

    const showSpinner = loading;
    const showErrorMessage = !loading && error?.message;
    const showNoDataMessage =
        !loading && !error?.message && messages?.length === 0;
    const showData = !loading && !error?.message && !!messages?.length;

    const headers: { key: keyof MessageInfo; name: string }[] = [
        { key: "status", name: "" },
        { key: "datomottat", name: "Mottatt" },
        { key: "mottakid", name: "Mottak-id" },
        { key: "role", name: "Rolle" },
        { key: "service", name: "Service" },
        { key: "action", name: "Action" },
        { key: "referanse", name: "Referanse" },
        { key: "avsender", name: "Avsender" },
        { key: "cpaid", name: "CPA-id" },
    ];

    return (
        <>
            <Table className={tableStyles.table}>
                <Table.Header className={tableStyles.tableHeader}>
                    <Table.Row>
                        {headers.map(({key, name}) => (
                            <Table.HeaderCell key={key}>
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
                    {showNoDataMessage && <RowWithContent>Ingen meldinger funnet !</RowWithContent>}
                    {showData &&
                        filteredAndSortedMessages.map((message, index) => (
                            (message.mottakid != mottakid) &&   <Table.Row key={message.mottakid} className={ clsx({[tableStyles.coloredRow]: index % 2}, tableStyles.cellTextAtTop) }>
                                <Table.DataCell>
                                    {
                                        (message.status === "Ferdigbehandlet") ? (
                                            <img src={ok} alt="ok" />
                                        ) : (message.status === "Information") ? (
                                            <img src={info} alt="info" />
                                        ) : (message.status === "Feil") ? (
                                            <img src={err} alt="error" />
                                        ) : ""
                                    }
                                </Table.DataCell>
                                <Table.DataCell className="tabell__td--sortert">
                                    {message.datomottat.substring(0, 23)}
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Link
                                        to={`/logg/${message.mottakid}`}
                                        state={{backgroundLocation: location}}
                                    >{message.mottakid}</Link>
                                </Table.DataCell>
                                <Table.DataCell>{message.role}</Table.DataCell>
                                <Table.DataCell>{message.service}</Table.DataCell>
                                <Table.DataCell>{message.action}</Table.DataCell>
                                <Table.DataCell>{message.referanse}</Table.DataCell>
                                <Table.DataCell>{message.avsender}</Table.DataCell>
                                <Table.DataCell>
                                    <Link
                                        to={`/cpa/${message.cpaid}`}
                                        state={{backgroundLocation: location}}
                                    >{message.cpaid}</Link>
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                </Table.Body>
            </Table>
        </>
    );
} ;