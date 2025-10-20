import { Table } from "@navikt/ds-react";
import NavFrontendSpinner from "nav-frontend-spinner";
import clsx from "clsx";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTableSorting from "../hooks/useTableSorting";
// @ts-ignore
import tableStyles from "../styles/Table.module.scss";

type CpaDetails = {
  cpaId: string;
  partnerID: string;
  navCppID: string;
  partnerCppID: string;
  partnerSubjectDN: string;
  partnerEndpoint: string;
  lastUsed: string;
};

const CpaTable = () => {
  const { cpaid } = useParams();
  let pageSize = 10;

  const url = `/v1/hentcpaliste`;
  const { fetchState, callRequest } = useFetch<CpaDetails[]>(url);

  const { loading, error, data: cpaInfo } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);


  const { items } = useTableSorting(cpaInfo ?? []);

  const headers: { key: keyof CpaDetails; name: string }[] = [
    { key: "cpaId", name: "cpaId" },
    { key: "partnerID", name: "partnerID" },
    { key: "navCppID", name: "navCppID" },
    { key: "partnerCppID", name: "partnerCppID" },
    { key: "partnerSubjectDN", name: "partnerSubjectDN" },
    { key: "partnerEndpoint", name: "partnerEndpoint" },
    { key: "lastUsed", name: "lastUsed" },
  ];

  return (
    <div>
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
            items.map((cpaDetails, index) => {
              return (
                <Table.Row
                    key={cpaDetails.cpaId + index}
                    className={clsx({ [tableStyles.coloredRow]: index % 2 })}
                >

                  <Table.DataCell>{cpaDetails.cpaId}</Table.DataCell>
                  <Table.DataCell className="tabell__td--sortert">
                    {cpaDetails.partnerID}
                  </Table.DataCell>
                  <Table.DataCell>{cpaDetails.navCppID}</Table.DataCell>
                  <Table.DataCell>{cpaDetails.partnerCppID}</Table.DataCell>
                  <Table.DataCell>{cpaDetails.partnerSubjectDN}</Table.DataCell>
                  <Table.DataCell>{cpaDetails.partnerEndpoint}</Table.DataCell>
                  <Table.DataCell>{cpaDetails.lastUsed}</Table.DataCell>
                </Table.Row>
              );
            })}
        </Table.Body>





      </Table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </div>
  );
};
export default CpaTable;
