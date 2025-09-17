import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";

type LogDetails = {
  eventDate: string;
  eventDescription: string;
  eventId: string;
};

type LoggTableEbmsProps = {
  readableId?: string;
};

const LoggTableEbms = (props: LoggTableEbmsProps) => {
  const params = useParams();
  const readableId = props.readableId ?? params.readableId;

  const { fetchState, callRequest } = useFetch<LogDetails[]>(
    `/v1/hentloggebms?readableId=${readableId}`
  );

  const { loading, error, data: logMessages } = fetchState;
  console.log(logMessages);

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = useTableSorting(logMessages ?? []);

  if (!readableId) {
    return <div>Ingen gyldig mottak-id</div>;
  }

  const headers: { key: keyof LogDetails; name: string }[] = [
    { key: "eventDate", name: "Dato" },
    { key: "eventDescription", name: "Beskrivelse" },
    { key: "eventId", name: "ID" },
  ];

  return (
    <div>
      <h1>Hendelsesdetaljer ebms for mottak-id : {readableId}</h1>
      <Table className={tableStyles.table}>
        <Table.Header className={tableStyles.tableHeader}>
          <Table.Row>
            {headers.map(({ key, name }) => (
              <Table.HeaderCell key={key}>{name}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!loading &&
            items.map((logDetails) => {
              return (
                <Table.Row key={logDetails.eventId}>
                  <Table.DataCell className="tabell__td--sortert">
                    {logDetails.eventDate.substring(0, 23)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {logDetails.eventDescription}
                  </Table.DataCell>
                  <Table.DataCell>{logDetails.eventId}</Table.DataCell>
                </Table.Row>
              );
            })}
        </Table.Body>
        {loading && <NavFrontendSpinner />}
        {error?.message && <p>{error.message}</p>}
      </Table>
    </div>
  );
};
export default LoggTableEbms;
