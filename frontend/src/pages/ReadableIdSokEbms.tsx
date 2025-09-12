import React, {useEffect, useState} from "react";
import { Input } from "nav-frontend-skjema";
import Lenke from "nav-frontend-lenker";
import NavFrontendSpinner from "nav-frontend-spinner";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import styles from "../styles/Table.module.scss";
import {Table} from "@navikt/ds-react";
import useFilter from "../hooks/useFilter";
import clsx from "clsx";
import RowWithContent from "../components/RowWithContent";

type ReadableIdInfo = {
  action: string;
  //count: number; // Ikke i bruk?
  senderName: string;
  cpaId: string;
  receivedDate: string;
  readableId: string;
  referenceParameter: string;
  role: string;
  service: string;
  status: string;
};
const ReadableIdSokEbms = () => {
  const [messageId, setMessageId] = useState("");

 const { fetchState, callRequest } = useFetch<ReadableIdInfo[]>(
    `/v1/hentmessageinfoebms?readableId=${messageId}`
  );

  useEffect(() => {
  callRequest();
  }, [callRequest]);

  const { loading, error, data: messageInfo } = fetchState;

  const { filteredItems: filteredMessageInfo } = useFilter(
      messageInfo ?? [],
      []
  );

  const {
    requestSort,
    sortConfig,
  } = useTableSorting(filteredMessageInfo);


  const getClassNamesFor = (name: keyof ReadableIdInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const headers: { key: keyof ReadableIdInfo; name: string }[] = [
    { key: "receivedDate", name: "Mottatt" },
    { key: "readableId", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referenceParameter", name: "Referanse" },
    { key: "senderName", name: "Avsender" },
    { key: "cpaId", name: "CPA-id" },
    { key: "status", name: "Status" },
  ];

  return (
    <>
      <Input
          bredde={"L"}
          onChange={(event) => setMessageId(event.target.value)}
          value={messageId}
      />
      <span style={{ position: "relative", float: "left", margin: "20px 0" }}>
        {filteredMessageInfo.length} messageInfo
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
              filteredMessageInfo.map((detail, index) => {
              return (
                  <Table.Row
                    key={detail.readableId + index}
                    className={clsx({ [styles.coloredRow]: index % 2 })}
                  >
                    <Table.DataCell className="tabell__td--sortert">
                      {detail.receivedDate.substring(0, 23)}
                    </Table.DataCell>
                    <Table.DataCell>
                      <Lenke href={`/loggebms/${detail.readableId}`}>
                        {detail.readableId}{" "}
                      </Lenke>
                    </Table.DataCell>
                  <Table.DataCell>{detail.role}</Table.DataCell>
                  <Table.DataCell>{detail.service}</Table.DataCell>
                  <Table.DataCell>{detail.action}</Table.DataCell>
                  <Table.DataCell>{detail.referenceParameter}</Table.DataCell>
                  <Table.DataCell>{detail.senderName}</Table.DataCell>
                  <Table.DataCell>
                    <Lenke href={`/cpa/${detail.cpaId}`}>{detail.cpaId} </Lenke>
                  </Table.DataCell>
                  <Table.DataCell>{detail.status}</Table.DataCell>
                </Table.Row>
              );
            })
          )}
          {!loading && !error && messageInfo?.length === 0 && (
              <RowWithContent>Ingen mottaker ident informasjon funnet !</RowWithContent>
          )}
          {error?.message && <RowWithContent>{error.message}</RowWithContent>}
        </Table.Body>
      </Table>
      </>
  );
};
export default ReadableIdSokEbms;
