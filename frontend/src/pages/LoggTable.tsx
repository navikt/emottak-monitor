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
import GrafanaLogg from "../components/GrafanaLogg";
import {formatDatetime} from "../util";

type MessageLogData = {
  meldingsdetaljer: MottakIdInfo;
  meldingslogg: MessageLogInfo[];
  warning?: string;
};

type MottakIdInfo = {
  datoMottatt: string;
  mottakId: string;
  requestId?: string;
  role?: string;
  service?: string;
  action?: string;
  ebcomnavn?: string;
  cpaId?: string;
  status?: string;
  meldingsparam?: string;
  refparam?: string;
  avsenderparam?: string;
  conversationId?: string;
  messageId?: string;
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

const parseJsonDetails = (details: string): [string, unknown][] | null => {
  try {
    const parsed: unknown = JSON.parse(details);
    return parsed !== null && typeof parsed === "object"
      ? Object.entries(parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

const formatJsonValue = (value: unknown): string =>
  typeof value === "string" ? value : JSON.stringify(value) ?? String(value);

const jsonDetails = (entries: [string, unknown][]) => (
  <ul className={logStyles.detailsList}>
    {entries.map(([key, value]) => (
      <li key={key}>
        <b>{key}:</b> {formatJsonValue(value)}
      </li>
    ))}
  </ul>
);

const textDetails = (details: string) => (
  <div
    className={details.length > 120 ? logStyles.truncate : undefined}
    onClick={details.length > 120
      ? (e) => e.currentTarget.classList.remove(logStyles.truncate)
      : undefined}
  >
    {details}
  </div>
);

const LoggTable = (props: LoggTableProps) => {
  const params = useParams();
  const mottakId = props.mottakid ?? params.mottakid;
  const url = props.ebms ? `/v1/hentloggebms?id=${mottakId}` : `/v1/hentlogg?mottakId=${mottakId}`;

  // Kolonnenavn gamle vs nye emottak:
  const mottakIdName = props.ebms ? "ReadableId" : "MottakId";
  const requestIdName = props.ebms ? "RequestId" : "";
  const conversationIdName = props.ebms ? "ConversationId" : "EbConversationId";
  const messageIdName = props.ebms ? "MessageId" : "EbMessageId";

  const { fetchState, callRequest } = useFetch<MessageLogData>(url);

  const { loading, error, data: data } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = useTableSorting(data?.meldingslogg ?? []);

  if (!mottakId) {
    return <div>Ingen gyldig {mottakIdName}</div>;
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
                  <td><b>{mottakIdName}</b></td>
                  <td>{data?.meldingsdetaljer?.mottakId}</td>
                  <td><b>{requestIdName}</b></td>
                  <td>{data?.meldingsdetaljer.requestId}</td>
                  <td><b>Mottatt</b></td>
                  <td>{formatDatetime(data?.meldingsdetaljer.datoMottatt)}</td>
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
                  <td>{data?.meldingsdetaljer.cpaId}</td>
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
                  <td><b>{conversationIdName}</b></td>
                  <td>
                    {data?.meldingsdetaljer.conversationId && (
                        <a
                            href={GrafanaLogg({
                              service_name: "ebms-async",
                              fromDate: data.meldingsdetaljer.datoMottatt.substring(0, 23),
                              conversationId: data.meldingsdetaljer.conversationId,
                              messageId: "",
                              requestId: data.meldingsdetaljer.requestId ?? "",
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                          {data.meldingsdetaljer.conversationId}
                        </a>
                    )}
                  </td>
                  <td><b>{messageIdName}</b></td>
                  <td>{data?.meldingsdetaljer.messageId && (
                      <a
                          href={GrafanaLogg({
                            service_name: "ebms-async",
                            fromDate: data.meldingsdetaljer.datoMottatt.substring(0, 23),
                            conversationId: "",
                            messageId: data.meldingsdetaljer.messageId,
                            requestId: data.meldingsdetaljer.requestId ?? "",
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                      >
                        {data.meldingsdetaljer.messageId}
                      </a>
                  )}</td>
                  <td></td>
                  <td></td>
                </tr>
                {!props.ebms && /* Felter kun for gamle emottak: */
                    <>
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
                    </>
                }
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
                              {formatDatetime(logDetails.hendelsesdato)}
                            </Table.DataCell>
                            <Table.DataCell style={{fontWeight: "bold"}}>
                              {logDetails.hendelsesbeskrivelse}
                            </Table.DataCell>
                            <Table.DataCell>
                              {(() => {
                                const details = logDetails.hendelsesdetaljer;
                                if (!details) return null;
                                if (!props.ebms) return textDetails(details);
                                else {
                                  const entries = parseJsonDetails(details);
                                  return entries ? jsonDetails(entries) : textDetails(details);
                                }
                              })()}
                            </Table.DataCell>
                            <Table.DataCell>{logDetails.hendelsesid}</Table.DataCell>
                          </Table.Row>
                      );
                    })}
              </Table.Body>
              {loading && <NavFrontendSpinner/>}
              {error?.message && <p>{error.message}</p>}
            </Table>
            {data?.meldingsdetaljer?.conversationId && (
                <AssociatedMessages
                    mottakId={data.meldingsdetaljer.mottakId}
                    conversationId={data.meldingsdetaljer.conversationId}
                    ebms={props.ebms}
                />
            )}
          </>
      )}
    </div>
  );
};
export default LoggTable;
