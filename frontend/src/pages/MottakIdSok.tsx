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

type MottakIdInfo = {
  action: string;
  antall: number;
  avsender: string;
  cpaid: string;
  datomottat: string;
  mottakid: string;
  referanse: string;
  role: string;
  service: string;
  status: string;
};
const MottakIdSok = () => {
  const [messageId, setMessageId] = useState("");

 const { fetchState, callRequest } = useFetch<MottakIdInfo[]>(
    `/v1/hentmessageinfo?mottakId=${messageId}`
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


  const getClassNamesFor = (name: keyof MottakIdInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const headers: { key: keyof MottakIdInfo; name: string }[] = [
    { key: "datomottat", name: "Mottatt" },
    { key: "mottakid", name: "Mottak-id" },
    { key: "role", name: "Role" },
    { key: "service", name: "Service" },
    { key: "action", name: "Action" },
    { key: "referanse", name: "Referanse" },
    { key: "avsender", name: "Avsender" },
    { key: "cpaid", name: "CPA-id" },
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
                    key={detail.mottakid + index}
                    className={clsx({ [styles.coloredRow]: index % 2 })}
                  >
                    <Table.DataCell className="tabell__td--sortert">
                      {detail.datomottat.substring(0, 23)}
                    </Table.DataCell>
                    <Table.DataCell>
                      <Lenke href={`/logg/${detail.mottakid}`}>
                        {detail.mottakid}{" "}
                      </Lenke>
                    </Table.DataCell>
                  <Table.DataCell>{detail.role}</Table.DataCell>
                  <Table.DataCell>{detail.service}</Table.DataCell>
                  <Table.DataCell>{detail.action}</Table.DataCell>
                  <Table.DataCell>{detail.referanse}</Table.DataCell>
                  <Table.DataCell>{detail.avsender}</Table.DataCell>
                  <Table.DataCell>
                    <Lenke href={`/cpa/${detail.cpaid}`}>{detail.cpaid} </Lenke>
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
export default MottakIdSok;
