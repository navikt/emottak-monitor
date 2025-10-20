import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import clsx from "clsx";
import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
// @ts-ignore
import tableStyles from "../styles/Table.module.scss";
import useFilter from "../hooks/useFilter";
import {Input} from "nav-frontend-skjema";

type PartnerDetails = {
    partnerID: string;
    name: string;
    herId: string;
    orgnummer: string;
    beskrivelse: string;
};

const PartnerTable = () => {
    const [partnerID, setPartnerID] = useState("");

    const url = `/v1/hentpartnerlist`;
    const { fetchState, callRequest } = useFetch<PartnerDetails[]>(url);


    const { loading, error, data: partnerInfo } = fetchState;

    const { filteredItems: filteredPartnerInfo } = useFilter(
        partnerInfo ?? [],
        []
    );

    const {
        requestSort,
        sortConfig,
    } = useTableSorting(filteredPartnerInfo);


    const getClassNamesFor = (name: keyof PartnerDetails) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    useEffect(() => {
        callRequest();
    }, [callRequest]);


    const { items } = useTableSorting(partnerInfo ?? []);

    const headers: { key: keyof PartnerDetails; name: string }[] = [
        { key: "partnerID", name: "partner-ID" },
        { key: "name", name: "Navn" },
        { key: "herId", name: "Her-ID" },
        { key: "orgnummer", name: "Org. nummer" },
        { key: "beskrivelse", name: "Leverandør" },
    ];

    return (
        <>
            <Input
                bredde={"L"}
                onChange={(event) => setPartnerID(event.target.value)}
                value={partnerID}
            />
            <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredPartnerInfo.length} messageInfo
      </span>
            <Table className={tableStyles.table}>

                <Table.Header className={tableStyles.tableHeader}>
                    <Table.Row>
                        {headers.map(({ key, name }) => (
                            <Table.HeaderCell
                                key={key}
                            >
                                {name}
                            </Table.HeaderCell>
                        ))}
                    </Table.Row>
                </Table.Header>




                <Table.Body>
                    {!loading &&
                        items.map((PartnerDetails, index) => {
                            return (
                                <Table.Row
                                    key={PartnerDetails.partnerID + index}
                                    className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                                >
                                    <Table.DataCell className="tabell__td--sortert">
                                        {PartnerDetails.partnerID}
                                    </Table.DataCell>
                                    <Table.DataCell>{PartnerDetails.name}</Table.DataCell>
                                    <Table.DataCell>{PartnerDetails.herId}</Table.DataCell>
                                    <Table.DataCell>{PartnerDetails.orgnummer}</Table.DataCell>
                                    <Table.DataCell>{PartnerDetails.beskrivelse}</Table.DataCell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>





            </Table>
        </>
    );
};
export default PartnerTable;
