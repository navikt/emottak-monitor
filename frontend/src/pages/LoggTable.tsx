import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";

type MessageLogData = {
  meldingsdetaljer: MottakIdInfo;
  meldingslogg: MessageLogInfo[];
  warning?: string;
};

type MottakIdInfo = {
  datomottatt: string;
  mottakid: string;
  role?: string;
  service?: string;
  action?: string;
  referanse?: string;
  avsender?: string;
  cpaid?: string;
  status?: string;
};

type MessageLogInfo = {
  hendelsesdato: string;
  hendelsesbeskrivelse: string;
  hendelsesdetaljer?: string,
  hendelsesid: string;
};

type LoggTableProps = {
  mottakid?: string;
};

const LoggTable = (props: LoggTableProps) => {
  const params = useParams();
  const mottakid = props.mottakid ?? params.mottakid;

  const { fetchState, callRequest } = useFetch<MessageLogData>(
    `/v1/hentlogg?mottakId=${mottakid}`
  );

  const { loading, error, data: data } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = useTableSorting(data?.meldingslogg ?? []);

  if (!mottakid) {
    return <div>Ingen gyldig mottakid</div>;
  }

  const headers: { key: keyof MessageLogInfo; name: string }[] = [
    { key: "hendelsesdato", name: "Dato" },
    { key: "hendelsesbeskrivelse", name: "Beskrivelse" },
    { key: "hendelsesdetaljer", name: "Detaljer" },
    { key: "hendelsesid", name: "ID" },
  ];

  return (
      <div>
      {(data == null || data.meldingsdetaljer == null) ? (
          <fieldset className={tableStyles.warnFieldset}><legend>Feil:</legend>Fikk ikke data tilbake fra databasen</fieldset>
      ) : (
          <>
            {data?.warning && <fieldset className={tableStyles.warnFieldset}><legend>Advarsel:</legend>{data?.warning}</fieldset>}
            <fieldset style={{
              width: "100%",
              borderWidth: "2px",
              borderColor: "grey",
              borderStyle: "solid",
              padding: "5px",
              margin: "0px"
            }}>
              <legend>Meldingsdetaljer:</legend>
              <table>
                <tbody>
                <tr>
                  <td><b>MottakId</b></td>
                  <td>{data?.meldingsdetaljer.mottakid}</td>
                  <td><b>Mottatt dato</b></td>
                  <td>{data?.meldingsdetaljer.datomottatt}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>Rolle</b></td>
                  <td>{data?.meldingsdetaljer.role}</td>
                  <td><b>Service</b></td>
                  <td>{data?.meldingsdetaljer.service}</td>
                  <td><b>Action</b></td>
                  <td>{data?.meldingsdetaljer.action}</td>
                </tr>
                <tr>
                  <td><b>Avsender</b></td>
                  <td>{data?.meldingsdetaljer.avsender}</td>
                  <td><b>CPA-id</b></td>
                  <td>{data?.meldingsdetaljer.cpaid}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>Referanse</b></td>
                  <td>{data?.meldingsdetaljer.referanse}</td>
                  <td><b>Status</b></td>
                  <td>{data?.meldingsdetaljer.status}</td>
                  <td></td>
                  <td></td>
                </tr>
                </tbody>
              </table>
            </fieldset>
            <Table className={tableStyles.table}>
              <Table.Header className={tableStyles.tableHeader}>
                <Table.Row>
                  {headers.map(({key, name}) => (
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
                            <Table.DataCell>
                              <div
                                  className={(logDetails.hendelsesdetaljer?.length ?? 0) > 130
                                      ? tableStyles.truncate
                                      : undefined}
                                  onClick={(logDetails.hendelsesdetaljer?.length ?? 0) > 130
                                      ? (e) => e.currentTarget.classList.remove(tableStyles.truncate)
                                      : undefined}
                              >
                                {logDetails.hendelsesdetaljer}
                              </div>
                            </Table.DataCell>
                            <Table.DataCell>{logDetails.hendelsesid}</Table.DataCell>
                          </Table.Row>
                      );
                    })}
              </Table.Body>
              {loading && <NavFrontendSpinner/>}
              {error?.message && <p>{error.message}</p>}
            </Table></>
      )}
    </div>
  );
};
export default LoggTable;
