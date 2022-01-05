import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFetch } from "./hooks/useFetch";
import TableSorting from "./TableSorting";

type LogDetails = {
  hendelsesdato: string;
  hendelsesbeskrivelse: string;
  hendelsesid: string;
};

const LoggTable = () => {
  const { mottakid } = useParams();

  const { fetchState, callRequest } = useFetch<LogDetails[]>(
    `/v1/hentlogg?mottakId=${mottakid}`
  );

  const { loading, error, data: logMessages } = fetchState;

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { items } = TableSorting(logMessages ?? []);

  return (
    <div>
      <h1>Hendelsesdetaljer for mottak-id : {mottakid}</h1>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>Dato</th>
            <th>Beskrivelse</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            items.map((logDetails) => {
              return (
                <tr key={logDetails.hendelsesid}>
                  <td className="tabell__td--sortert">
                    {logDetails.hendelsesdato.substring(0, 23)}
                  </td>
                  <td>{logDetails.hendelsesbeskrivelse}</td>
                  <td>{logDetails.hendelsesid}</td>
                </tr>
              );
            })}
        </tbody>
        <caption>Hendeleseslogg</caption>
        {loading && <NavFrontendSpinner />}
        {error?.message && <p>{error.message}</p>}
      </table>
    </div>
  );
};
export default LoggTable;
