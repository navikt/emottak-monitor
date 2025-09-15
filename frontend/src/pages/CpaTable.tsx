import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
import tableStyles from "../styles/Table.module.scss";

type CpaDetails = {
  partnerid: string;
  navn: string;
  partnerherid: string;
  partnerorgnummer: string;
};

const CpaTable = () => {
  const { cpaid } = useParams();

  const { fetchState, callRequest } = useFetch<CpaDetails[]>(
    `/v1/hentcpa?cpaId=${cpaid}`
  );

  const { loading, error, data: cpaInfo } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = useTableSorting(cpaInfo ?? []);

  return (
    <div>
      <h1>CPA info for cpa-id : {cpaid}</h1>
      <Table className={tableStyles.table}>
        <Table.Header className={tableStyles.tableHeader}>
          <Table.Row>
            <Table.HeaderCell>Partner-ID</Table.HeaderCell>
            <Table.HeaderCell>Navn</Table.HeaderCell>
            <Table.HeaderCell>HER-ID</Table.HeaderCell>
            <Table.HeaderCell>Organisajonsnummer</Table.HeaderCell>
          </Table.Row>
          </Table.Header>
        <Table.Body>
          {!loading &&
            items.map((cpaDetails) => {
              return (
                <Table.Row key={cpaDetails.partnerorgnummer}>
                  <Table.DataCell className="tabell__td--sortert">
                    {cpaDetails.partnerid}
                  </Table.DataCell>
                  <Table.DataCell>{cpaDetails.navn}</Table.DataCell>
                  <Table.DataCell>{cpaDetails.partnerherid}</Table.DataCell>
                  <Table.DataCell>{cpaDetails.partnerorgnummer}</Table.DataCell>
                </Table.Row>
              );
            })}
        </Table.Body>
        <caption>CPA informasjon</caption>
      </Table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </div>
  );
};
export default CpaTable;
