import React, {Component} from "react"
import Data from "./data/meldinger.json"
import "nav-frontend-tabell-style";

class MeldingList extends Component {
    render (){
        return (
            <div>
                <table className="tabell tabell--stripet">
                    <caption role="alert" aria-live="polite"> Tabellen er ikke sortert
                    </caption>
                    <thead>
                    <tr>
                        <th role="columnheader" aria-sort="descending" className="tabell__th--sortert-desc">
                            <button aria-label="Sorter Role synkende">Role</button>
                        </th>
                        <th role="columnheader" aria-sort="none">
                            <button aria-label="Sorter Service stigende">Service</button>
                        </th>
                        <th role="columnheader" aria-sort="none">
                            <button aria-label="Sorter Action stigende">Action</button>
                        </th>
                        <th role="columnheader" aria-sort="none">
                            <button aria-label="Sorter MottakID stigende">MottakID</button>
                        </th>
                        <th role="columnheader" aria-sort="none">
                            <button aria-label="Sorter DatoMottak stigende">DatoMottak</button>
                        </th>
                        </tr>
                    </thead>
                <tbody>
                {Data.map((meldingDetail)=>{
                    return  <tr>
                                <td className="tabell__td--sortert">{meldingDetail.role}</td>
                                <td>{meldingDetail.service}</td>
                                <td>{meldingDetail.action}</td>
                                <td>{meldingDetail.mottakid}</td>
                                <td>{meldingDetail.datomottak}</td>
                            </tr>
                })}
                </tbody>
                    </table>
            </div>
        )
    }
}
export default MeldingList