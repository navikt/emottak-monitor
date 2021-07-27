import TableSorting from "./TableSorting";
import React from "react";
import Lenke from 'nav-frontend-lenker';

const MessagesTable = (props) => {

    const { items, requestSort, sortConfig } = TableSorting(props.messages);
    let messagesLength = 0;

    if(items.length) {messagesLength = items.length}
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
            {items.map((MessageDetails)=>{
                return  <tr>
                    <td className="tabell__td--sortert">{MessageDetails.datomottat}</td>
                    <td>
                        $(messageDetails.loggcount == 0) ? MessageDetails.mottakid :  <Lenke href={`/logg/${MessageDetails.mottakid}`}>{MessageDetails.mottakid}</Lenke>
                    </td>
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
            </caption>
        </table>
    );
};
export default MessagesTable;
