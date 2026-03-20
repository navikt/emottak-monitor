import {Table} from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Pagination from "../components/Pagination";
import RowWithContent from "../components/RowWithContent";
import tableStyles from "../styles/Table.module.scss";
import clsx from "clsx";
import {
    ConversationStatusDto,
    ConversationStatusSearchParams,
    useConversationStatusSearch
} from "../hooks/useConversationStatusSearch";
import ConversationStatusFilterForm, {STATUS_OPTIONS} from "../components/ConversationStatusFilter";

const ConversationStatusTable = () => {
    const location = useLocation();

    const defaultFilters: ConversationStatusSearchParams = {
        statuses: STATUS_OPTIONS[1], // "Feil" default valgt
        cpaIdPattern: "",
        service: "",
        currentPage: 1,
        pageSize: 10,
        sortOrder: "DESC"
    };
    const { data, loading, error, params, setParams, triggerSearch, goToPage } = useConversationStatusSearch(defaultFilters);
    const messages = data?.content ?? [];
    const totalCount = data?.totalElements ?? 0;

    const handleSearch = (newParams: ConversationStatusSearchParams) => {
        setParams(newParams);
        triggerSearch(newParams);
    };

    const headers: { key: keyof ConversationStatusDto; name: string }[] = [
        { key: "createdAt", name: "Mottatt" },
        { key: "readableIdList", name: "Mottak-id" },
        { key: "service", name: "Service" },
        { key: "cpaId", name: "CPA-id" },
        { key: "statusAt", name: "Statusdato" },
        { key: "latestStatus", name: "Status" },
    ];

    const showSpinner = loading;
    const showErrorMessage = !loading && error?.message;
    const showNoDataMessage =
        !loading && !error?.message && messages?.length === 0;
    const showData = !loading && !error?.message && !!messages?.length;


    return (
        <>
            <ConversationStatusFilterForm onSearch={handleSearch} currentParams={params} totalCount={totalCount} />
            <Table className={tableStyles.table}>
                <Table.Header className={tableStyles.tableHeader}>
                    <Table.Row>
                        {headers.map(({key, name}) => (
                            <Table.HeaderCell>{name}</Table.HeaderCell>
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
                    {showNoDataMessage && <RowWithContent>Ingen conversations funnet!</RowWithContent>}
                    {showData &&
                        messages.map((message, index) => {
                            return (
                                <Table.Row
                                    key={message.cpaId + index}
                                    className={clsx({[tableStyles.coloredRow]: index % 2})}
                                >
                                    <Table.DataCell className="tabell__td--sortert">
                                        {message.createdAt.substring(0, 23)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {message.readableIdList.split(",").map((readableId, idx, arr) => (
                                            <React.Fragment key={readableId}>
                                                <Link
                                                    key={readableId}
                                                    to={`/loggebms/${readableId}`}
                                                    state={{backgroundLocation: location}}
                                                >{readableId}</Link>
                                                {idx < arr.length - 1 && ', '}
                                            </React.Fragment>
                                        ))}
                                    </Table.DataCell>
                                    <Table.DataCell>{message.service}</Table.DataCell>
                                    <Table.DataCell>
                                        <Link
                                            key={message.cpaId}
                                            to={`/cpa/${message.cpaId}`}
                                            state={{backgroundLocation: location}}
                                        >{message.cpaId}</Link>
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {message.statusAt.substring(0, 23)}
                                    </Table.DataCell>
                                    <Table.DataCell>{message.latestStatus}</Table.DataCell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>
            </Table>
            <Pagination
                totalCount={totalCount}
                pageSize={params.pageSize}
                siblingCount={1}
                currentPage={params.currentPage}
                onPageChange={goToPage}
            />
        </>
    );
}
export default ConversationStatusTable;