import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFetch } from "./hooks/useFetch";
import TableSorting from "./TableSorting";

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

  const { items } = TableSorting(cpaInfo ?? []);

  return (
    <div>
      <h1>CPA info for cpa-id : {cpaid}</h1>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>Partner-ID</th>
            <th>Navn</th>
            <th>HER-ID</th>
            <th>Organisajonsnummer</th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            items.map((cpaDetails) => {
              return (
                <tr key={cpaDetails.partnerorgnummer}>
                  <td className="tabell__td--sortert">
                    {cpaDetails.partnerid}
                  </td>
                  <td>{cpaDetails.navn}</td>
                  <td>{cpaDetails.partnerherid}</td>
                  <td>{cpaDetails.partnerorgnummer}</td>
                </tr>
              );
            })}
        </tbody>
        <caption>CPA informasjon</caption>
      </table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </div>
  );
};
export default CpaTable;
