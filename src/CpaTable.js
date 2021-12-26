import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TableSorting from "./TableSorting";
import axios from "axios";

const CpaTable = (props) => {
  const { cpaid } = useParams();
  const [cpaInfo, setCpaInfo] = useState([]);

  useEffect(() => {
    if (cpaid) {
      axios.get(`/v1/hentcpa?cpaId=${cpaid}`).then((response) => {
        setCpaInfo(response.data);
      });
    }
  }, [cpaid]);

  const { items } = TableSorting(cpaInfo);

  return (
    <div>
      <h1>CPA info for cpa-id : {cpaid}</h1>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>Parter-ID</th>
            <th>Navn</th>
            <th>HER-ID</th>
            <th>Organisajonsnummer</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cpaDetails) => {
            return (
              <tr>
                <td className="tabell__td--sortert">{cpaDetails.partnerid}</td>
                <td>{cpaDetails.navn}</td>
                <td>{cpaDetails.partnerherid}</td>
                <td>{cpaDetails.partnerorgnummer}</td>
              </tr>
            );
          })}
        </tbody>
        <caption>CPA informasjon</caption>
      </table>
    </div>
  );
};
export default CpaTable;
