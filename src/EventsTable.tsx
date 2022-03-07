import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import Lenke from "nav-frontend-lenker";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useMemo, useState } from "react";
import Filter from "./components/Filter";
import useDebounce from "./hooks/useDebounce";
import useFetch from "./hooks/useFetch";
import useFilter from "./hooks/useFilter";
import useTableSorting from "./hooks/useTableSorting";
import Pagination from "./components/Pagination";
import { initialDate, initialTime } from "./util";
import { Table } from "@navikt/ds-react";
import styles from "./MessagesTable.module.scss";
import clsx from "clsx";
import RowWithContent from "./components/RowWithContent";

type EventInfo = {
    action: string;
    avsender: string | null;
    hendelsedato: string;
    hendelsedeskr: string;
    mottakid: string;
    referanse: string | null;
    role: string;
    service: string;
    status: string;
    tillegsinfo: string | null;
};

const EventsTable = () => {
    const [fromDate, setFromDate] = useState(initialDate(""));
    const [toDate, setToDate] = useState(initialDate(""));
    const [fromTime, setFromTime] = useState(initialTime(""));
    const [toTime, setToTime] = useState(initialTime(""));

    // using debounce to not use value until there has been no new changes
    const debouncedFromDate = useDebounce(fromDate, 200);
    const debouncedToDate = useDebounce(toDate, 200);
    const debouncedFromTime = useDebounce(fromTime, 200);
    const debouncedToTime = useDebounce(toTime, 200);

    const { fetchState, callRequest } = useFetch<EventInfo[]>(
        `/v1/henthendelser?fromDate=${debouncedFromDate}%20${debouncedFromTime}&toDate=${debouncedToDate}%20${debouncedToTime}`
    );

    const { loading, error, data: events } = fetchState;
    let pageSize = 10;

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        callRequest();
    }, [callRequest]);

    const { filteredItems: filteredEvents, handleFilterChange } = useFilter(
        events ?? [],
        ["role", "service", "action", "status"]
    );

    const {
        items: filteredAndSortedEvents,
        requestSort,
        sortConfig,
    } = useTableSorting(filteredEvents);

    const getClassNamesFor = (name: keyof EventInfo) => {
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

    const headers: { key: keyof EventInfo; name: string }[] = [
        { key: "mottakid", name: "Mottak-id" },
        { key: "hendelsedeskr", name: "Beskrivelse" },
        { key: "role", name: "Role" },
        { key: "service", name: "Service" },
        { key: "action", name: "Action" },
        { key: "referanse", name: "Referanse" },
        { key: "avsender", name: "Avsender" },
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
                messages={events ?? []}
                onFilterChange={handleFilterChange}
                filterKeys={["service", "action", "role"]}
            />
            <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredEvents.length} eventer
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
                                    key={event.mottakid + index}
                                    className={clsx({ [styles.coloredRow]: index % 2 })}
                                >
                                    <Table.DataCell>
                                        {event.mottakid.split(",").map((mottakid) => (
                                            <Lenke key={mottakid} href={`/logg/${mottakid}`}>
                                                {mottakid}{" "}
                                            </Lenke>
                                        ))}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Ekspanderbartpanel tittel={event.hendelsedeskr}>
                                            {event.tillegsinfo}
                                        </Ekspanderbartpanel>
                                    </Table.DataCell>
                                    <Table.DataCell>{event.role}</Table.DataCell>
                                    <Table.DataCell>{event.service}</Table.DataCell>
                                    <Table.DataCell>{event.action}</Table.DataCell>
                                    <Table.DataCell>{event.referanse}</Table.DataCell>
                                    <Table.DataCell>{event.avsender}</Table.DataCell>
                                </Table.Row>
                            );
                        })
                    )}
                    {!loading && !error && events?.length === 0 && (
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
export default EventsTable;