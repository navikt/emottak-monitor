import React from "react"
import "nav-frontend-tabell-style";
import Data from "./data/meldinger.json"

const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = React.useState(config);

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

const ProductTable = (props) => {
    const { items, requestSort, sortConfig } = useSortableData(props.products);
    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    return (
        <table className="tabell tabell--stripet">
            <caption>Meldinger</caption>
            <thead>
            <tr>
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
                        onClick={() => requestSort('mottakid')}
                        className={getClassNamesFor('mottakid')}>MottakId
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('datomottat')}
                        className={getClassNamesFor('datomottat')}>Datomottat
                    </button>
                </th>
            </tr>
            </thead>
            <tbody>
            {items.map((meldingDetail)=>{
                return  <tr>
                    <td className="tabell__td--sortert">{meldingDetail.role}</td>
                    <td>{meldingDetail.service}</td>
                    <td>{meldingDetail.action}</td>
                    <td>{meldingDetail.mottakid}</td>
                    <td>{meldingDetail.datomottat}</td>
                </tr>
            })}
            </tbody>
        </table>
    );
};

export default function App() {
    return (
        <div className="App">
            <h1>eMottak meldinger</h1>
            <ProductTable products={Data}/>
        </div>
    );
}
