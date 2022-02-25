import React, { useState } from "react";
import { Input } from "nav-frontend-skjema";
import { Hovedknapp } from "nav-frontend-knapper";
import Lenke from "nav-frontend-lenker";
import { Cog } from "./util";
import NavFrontendSpinner from "nav-frontend-spinner";
import useFetch from "./hooks/useFetch";
import useTableSorting from "./hooks/useTableSorting";

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

  /* Overflødig siden bare kan kalle setMessageId direkte
      const handleChange = (value: string) => {
          setMessageId(value);
      }
      */

  const { fetchState, callRequest } = useFetch<MottakIdInfo[]>(
    `/v1/hentmessageinfo?mottakId=${messageId}`
  );

  const { loading, error, data: mottakIdInfo } = fetchState;
  const { items, requestSort } = useTableSorting(mottakIdInfo);

  return (
    <div>
      <table>
        <tr>
          <th>Søk opp mottak-id:</th>
          <th>
            <Input
              bredde="XXL"
              onChange={(event) => setMessageId(event.target.value)}
              value={messageId}
            />
          </th>
          <th>
            <Hovedknapp onClick={() => callRequest()}>
              <Cog />
              <span>Søk</span>
            </Hovedknapp>
          </th>
        </tr>
      </table>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>
              <button type="button" onClick={() => requestSort("datomottat")}>
                Mottatt
              </button>
            </th>
            <th>
              <button type="button">Mottak-id</button>
            </th>
            <th>
              <button type="button">Role</button>
            </th>
            <th>
              <button type="button">Service</button>
            </th>
            <th>
              <button type="button">Action</button>
            </th>
            <th>
              <button type="button">Referanse</button>
            </th>
            <th>
              <button type="button">Avsender</button>
            </th>
            <th>
              <button type="button">CPA-id</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading === false &&
            items.map((detail) => {
              return (
                <tr key={detail.mottakid}>
                  <td>{detail.datomottat.slice(0, 23)}</td>
                  <td>
                    <Lenke href={`/logg/${detail.mottakid}`}>
                      {detail.mottakid}{" "}
                    </Lenke>
                  </td>
                  <td>{detail.role}</td>
                  <td>{detail.service}</td>
                  <td>{detail.action}</td>
                  <td>{detail.referanse}</td>
                  <td>{detail.avsender}</td>
                  <td>
                    <Lenke href={`/cpa/${detail.cpaid}`}>{detail.cpaid} </Lenke>
                  </td>
                </tr>
              );
            })}
        </tbody>
        <caption>
          {items.length === 1 ? <p>1 rad</p> : <p>{items.length} rader</p>}
        </caption>
      </table>
      {!loading && !error && items.length === 0 && <p>No results</p>}
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </div>
  );
};
export default MottakIdSok;
