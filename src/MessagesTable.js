import TableSorting from "./TableSorting";
import React, {useEffect, useState} from "react";
import Lenke from 'nav-frontend-lenker';
import {useParams} from "react-router-dom";
import axios from "axios";

const MessagesTable = (props) => {

    const { mottakid } = useParams();
    const [loggdetails, setLoggDdetails] = useState([])

    useEffect(()=> {
        if(mottakid) {
            axios.get(`https://emottak-monitor.dev.intern.nav.no/v1/hentlogg?mottakId=${mottakid}`)
                .then(response => {
                    setLoggDdetails(response.data);
                });
        }
    },[mottakid])

    const {loggItems} = TableSorting(loggdetails);
    let logginstance = false;
    if (loggItems > 0){
        logginstance = true
    }

    const {items, requestSort, sortConfig} = TableSorting(props.messages);
    let messagesLength = 0;

    if (items.length) {
        messagesLength = items.length
    }
    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <table className="tabell tabell--stripet">
            <thead>
            <tr>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('datomottat')}
                        className={getClassNamesFor('datomottat')}>Mottat
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('mottakid')}
                        className={getClassNamesFor('mottakid')}>Mottak-id
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('role')}
                        className={getClassNamesFor('role')}>Role
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('service')}
                        className={getClassNamesFor('service')}>Service
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('action')}
                        className={getClassNamesFor('action')}>Action
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('referanse')}
                        className={getClassNamesFor('referanse')}>Referanse
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('avsender')}
                        className={getClassNamesFor('avsender')}>Avsender
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('cpaid')}
                        className={getClassNamesFor('cpaid')}>CPA-id
                    </button>
                </th>
            </tr>
            </thead>
            <tbody>
            {items.map((MessageDetails) => {
                return <tr>
                    <td className="tabell__td--sortert">{MessageDetails.datomottat}</td>
                    logginstance
                    loggdetails
                    <td>${ logginstance ? MessageDetails.mottakid : <Lenke href={`/logg/${MessageDetails.mottakid}`}>{MessageDetails.mottakid} </Lenke> }</td>
                    <td>{MessageDetails.role}</td>
                    <td>{MessageDetails.service}</td>
                    <td>{MessageDetails.action}</td>
                    <td>{MessageDetails.referanse}</td>
                    <td>{MessageDetails.avsender}</td>
                    <td>{MessageDetails.cpaid}</td>
                </tr>
            })}
            </tbody>
            <caption>
                {messagesLength} meldinger
                {loggdetails.length} logg innslag
            </caption>
        </table>
    );
};
export default MessagesTable;
