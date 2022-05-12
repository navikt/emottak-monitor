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

type PartnerIdInfo = {
  partnerid: string;
  navn: string;
  herid: string;
  orgnummer: string;
  kommunikasjonssystemid: string;
  beskrivelse: string;
};
const PartnerIdSok = () => {
  const [partnerId, setPartnerId] = useState("");

 const { fetchState, callRequest } = useFetch<PartnerIdInfo[]>(
    `/v1/hentpartneridinfo?partnerId=${partnerId}`
  );

  useEffect(() => {
  callRequest();
  }, [callRequest]);

  const { loading, error, data: ebmessageInfo } = fetchState;

  const { filteredItems: filteredMessageInfo } = useFilter(
      ebmessageInfo ?? [],
      []
  );

  const {
    requestSort,
    sortConfig,
  } = useTableSorting(filteredMessageInfo);


  const getClassNamesFor = (name: keyof PartnerIdInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const headers: { key: keyof PartnerIdInfo; name: string }[] = [
    { key: "partnerid", name: "Partner-id" },
    { key: "navn", name: "Navn" },
    { key: "herid", name: "Her-id" },
    { key: "orgnummer", name: "Organisasjonsnummer" },
    { key: "kommunikasjonssystemid", name: "Kommunikasjons system-id" },
    { key: "beskrivelse", name: "Beskrivelse" },
  ];

  return (
    <>
      <Input
          bredde={"L"}
          onChange={(event) => setPartnerId(event.target.value)}
          value={partnerId}
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
                      key={detail.partnerid + index}
                      className={clsx({ [styles.coloredRow]: index % 2 })}
                  >
                    <Table.DataCell className="tabell__td--sortert">
                      {detail.partnerid}
                    </Table.DataCell>
                    <Table.DataCell>{detail.navn}</Table.DataCell>
                    <Table.DataCell>{detail.herid}</Table.DataCell>
                    <Table.DataCell>{detail.orgnummer}</Table.DataCell>
                    <Table.DataCell>{detail.kommunikasjonssystemid}</Table.DataCell>
                    <Table.DataCell>{detail.beskrivelse}</Table.DataCell>
                  </Table.Row>
              );
            })
          )}
          {!loading && !error && ebmessageInfo?.length === 0 && (
              <RowWithContent>Ingen Partner ident informasjon funnet !</RowWithContent>
          )}
          {error?.message && <RowWithContent>{error.message}</RowWithContent>}
        </Table.Body>
      </Table>
      </>
  );
};
export default PartnerIdSok;
