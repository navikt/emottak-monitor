import TableSorting from "./TableSorting";
import React from "react";

const LoggTable = (props) => {
    return (
        <table className="tabell tabell--stripet">
            <thead>
            <tr>
                <th/> hendelsesdato
                <th/>hendelsesbeskrivelse
                <th/>hendelsesdid
            </tr>
            </thead>
            <tbody>
            {items.map((MessageDetails)=>{
                return  <tr>
                    <td className="tabell__td--sortert">{MessageDetails.datomottat}</td>
                    <td>{MessageDetails.mottakid}</td>
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
