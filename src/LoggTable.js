import React from "react";
import TableSorting from "./TableSorting";

const LoggTable = (props) => {
    const {items} = TableSorting(props.messages);

    return (
        <table className="tabell tabell--stripet">
            <thead>
            <tr>
                <th/> hendelsesdato
                <th/> hendelsesbeskrivelse
                <th/> hendelsesid
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
            <caption>Hendeleseslogg</caption>
        </table>
    );
};
export default LoggTable;
