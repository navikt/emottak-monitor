import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TableSorting from "./TableSorting";

type LogDetails = {
  hendelsesdato: string;
  hendelsesbeskrivelse: string;
  hendelsesid: string;
};

const LoggTable = () => {
  const { mottakid } = useParams();
  const [loggMessages, setLoggMessages] = useState<LogDetails[]>([]);

  useEffect(() => {
    if (mottakid) {
      axios
        .get<LogDetails[]>(`/v1/hentlogg?mottakId=${mottakid}`)
        .then((response) => {
          setLoggMessages(response.data);
        });
    }
  }, [mottakid]);

  const { items } = TableSorting(loggMessages);

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
          {items.map((logDetails) => {
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
      </table>
    </div>
  );
};
export default LoggTable;
