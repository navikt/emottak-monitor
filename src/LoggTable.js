import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import TableSorting from "./TableSorting";
import axios from "axios";

const LoggTable = (props) => {
    const { mottakid } = useParams();
    const [loggMessages, setLoggMessages] = useState([])

    useEffect(()=> {
        if(mottakid) {
            axios.get(`https://emottak-monitor.dev.intern.nav.no/v1/hentlogg?mottakId=${mottakid}`)
                .then(response => {
                    setLoggMessages(response.data);
                });
        }
    },[mottakid])

    const {items} = TableSorting(loggMessages);

    return (
        <div>
            <h1>Hendelsesdetaljer for mottak-id : ${mottakid}</h1>
            <table className="tabell tabell--stripet">
                <thead>
                <tr>
                    <th>Dato</th>
                    <th>Beskrivelse</th>
                    <th>ID</th>
                </tr>
                </thead>
                <tbody>
                {items.map((LogDetails)=>{
                    return  <tr>
                        <td className="tabell__td--sortert">{LogDetails.hendelsesdato}</td>
                        <td>{LogDetails.hendelsesbeskrivelse}</td>
                        <td>{LogDetails.hendelsesid}</td>
                    </tr>
                })}
                </tbody>
                <caption>Hendeleseslogg</caption>
            </table>
        </div>
    );
};
export default LoggTable;
