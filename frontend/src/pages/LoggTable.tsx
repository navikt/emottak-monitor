import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";
import logStyles from "../styles/Logg.module.scss";
import clsx from "clsx";
import ok from "../images/ok.gif";
import info from "../images/info.gif";
import err from "../images/error.gif";
import AssociatedMessages from "./AssociatedMessages";

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
  ebcomnavn?: string;
  avsender?: string;
  cpaid?: string;
  status?: string;
  meldingsparam?: string;
  refparam?: string;
  avsenderparam?: string;
  ebconvers_id?: string;
  ebmessage_id?: string;
  certdn?: string;
  trustdn?: string;
  docsignerdn?: string;
  docsignerissuerdn?: string;
};

type MessageLogInfo = {
  hendelsesdato: string;
  hendelsesbeskrivelse: string;
  hendelsesdetaljer?: string,
  hendelsesid: string;
  statuslevel: string;
};

type LoggTableProps = {
  mottakid?: string;
  ebms: boolean;
};

const LoggTable = (props: LoggTableProps) => {
  const params = useParams();
  const mottakid = props.mottakid ?? params.mottakid;
  const url = props.ebms ? `/v1/hentloggebms?readableId=${mottakid}` : `/v1/hentlogg?mottakId=${mottakid}`;
  const idName = props.ebms ? "ReadableId" : "MottakId";

  const { fetchState, callRequest } = useFetch<MessageLogData>(url);

  const { loading, error, data: data } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = useTableSorting(data?.meldingslogg ?? []);

  if (!mottakid) {
    return <div>Ingen gyldig {idName}</div>;
  }

  const headers: { key: keyof MessageLogInfo; name: string }[] = [
    { key: "statuslevel", name: "" },
    { key: "hendelsesdato", name: "Dato" },
    { key: "hendelsesbeskrivelse", name: "Hendelse" },
    { key: "hendelsesdetaljer", name: "Detaljer" },
    { key: "hendelsesid", name: "ID" },
  ];

  return (
      <div className={clsx(logStyles.logDiv, logStyles.small)}>
      {(!loading && (data == null || data.meldingsdetaljer == null)) ? (
          <fieldset className={logStyles.warnFieldset}><legend>Feil:</legend>Fikk ikke data tilbake fra databasen</fieldset>
      ) : (
          <>
            {data?.warning && <fieldset className={logStyles.warnFieldset}><legend>Advarsel:</legend>{data?.warning}</fieldset>}
            <fieldset className={logStyles.meldingsdetaljer}>
              <legend>Meldingsdetaljer:</legend>
              <table>
                <tbody>
                <tr>
                  <td><b>{idName}</b></td>
                  <td>{data?.meldingsdetaljer.mottakid}</td>
                  <td><b>Mottatt</b></td>
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
                  <td>{data?.meldingsdetaljer.ebcomnavn}</td>
                  <td><b>CPA-id</b></td>
                  <td>{data?.meldingsdetaljer.cpaid}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>Melding.param</b></td>
                  <td>{data?.meldingsdetaljer.meldingsparam}</td>
                  <td><b>Ref.param</b></td>
                  <td>{data?.meldingsdetaljer.refparam}</td>
                  <td><b>Avsender.param</b></td>
                  <td>{data?.meldingsdetaljer.avsenderparam}</td>
                </tr>
                <tr>
                  <td><b>EbConversationId</b></td>
                  <td>{data?.meldingsdetaljer.ebconvers_id}</td>
                  <td><b>EbMessageId</b></td>
                  <td>{data?.meldingsdetaljer.ebmessage_id}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>ebXML signer</b></td>
                  <td colSpan={5}>{data?.meldingsdetaljer.certdn}</td>
                </tr>
                <tr>
                  <td><b>Utsteder</b></td>
                  <td colSpan={5}>{data?.meldingsdetaljer.trustdn}</td>
                </tr>
                <tr>
                  <td><b>Payload signer</b></td>
                  <td colSpan={5}>{data?.meldingsdetaljer.docsignerdn}</td>
                </tr>
                <tr>
                  <td><b>Utsteder</b></td>
                  <td colSpan={5}>{data?.meldingsdetaljer.docsignerissuerdn}</td>
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
                              <img src={(logDetails.statuslevel === "ok") ? ok : (logDetails.statuslevel === "error") ? err : info} alt={logDetails.statuslevel} />
                            </Table.DataCell>
                            <Table.DataCell className="tabell__td--sortert">
                              {logDetails.hendelsesdato.substring(0, 23)}
                            </Table.DataCell>
                            <Table.DataCell style={{fontWeight: "bold"}}>
                              {logDetails.hendelsesbeskrivelse}
                            </Table.DataCell>
                            <Table.DataCell>
                              <div
                                  className={(logDetails.hendelsesdetaljer?.length ?? 0) > 120
                                      ? logStyles.truncate
                                      : undefined}
                                  onClick={(logDetails.hendelsesdetaljer?.length ?? 0) > 120
                                      ? (e) => e.currentTarget.classList.remove(logStyles.truncate)
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
            </Table>
            {data?.meldingsdetaljer && (
                <AssociatedMessages
                    mottakId={data.meldingsdetaljer.mottakid}
                    conversationId={data.meldingsdetaljer.ebconvers_id!!}
                    ebms={props.ebms}
                />
            )}
          </>
      )}
    </div>
  );
};
export default LoggTable;
