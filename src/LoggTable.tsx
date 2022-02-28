import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "./hooks/useFetch";
import useTableSorting from "./hooks/useTableSorting";
import tableStyles from "./styles/Table.module.scss";

type LogDetails = {
  hendelsesdato: string;
  hendelsesbeskrivelse: string;
  hendelsesid: string;
};

type LoggTableProps = {
  mottakid?: string;
};

const LoggTable = (props: LoggTableProps) => {
  const params = useParams();
  const mottakid = props.mottakid ?? params.mottakid;

  const { fetchState, callRequest } = useFetch<LogDetails[]>(
    `/v1/hentlogg?mottakId=${mottakid}`
  );

  const { loading, error, data: logMessages } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = useTableSorting(logMessages ?? []);

  if (!mottakid) {
    return <div>Ingen gyldig mottakid</div>;
  }

  const headers: { key: keyof LogDetails; name: string }[] = [
    { key: "hendelsesdato", name: "Dato" },
    { key: "hendelsesbeskrivelse", name: "Beskrivelse" },
    { key: "hendelsesid", name: "ID" },
  ];

  return (
    <div>
      <h1>Hendelsesdetaljer for mottak-id : {mottakid}</h1>
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
                <Table.Row key={logDetails.hendelsesid}>
                  <Table.DataCell className="tabell__td--sortert">
                    {logDetails.hendelsesdato.substring(0, 23)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {logDetails.hendelsesbeskrivelse}
                  </Table.DataCell>
                  <Table.DataCell>{logDetails.hendelsesid}</Table.DataCell>
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
export default LoggTable;
