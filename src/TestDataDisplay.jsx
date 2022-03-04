import React from "react";
import SortableData from "./SortableData";

const TestDataDisplay = (props) => {
  console.log("Test " + props.JsonData.length);
  const { items, requestSort, sortConfig } = SortableData(props.JsonData, null);

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const DisplayData = items.map((info) => {
    return (
      <tr>
        <td className="tabell__td--sortert">{info.datomottat.substring(0, 23)}</td>
        <td>{info.mottakid}</td>
        <td>{info.role}</td>
        <td>{info.service}</td>
        <td>{info.action}</td>
      </tr>
    );
  });
  return (
    <div>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                onClick={() => requestSort("dato")}
                className={getClassNamesFor("dato")}
              >
                Dato
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("mottakid")}
                className={getClassNamesFor("mottakid")}
              >
                Mottak-id
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("role")}
                className={getClassNamesFor("role")}
              >
                Role
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("service")}
                className={getClassNamesFor("service")}
              >
                Service
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("action")}
                className={getClassNamesFor("action")}
              >
                Action
              </button>
            </th>
          </tr>
        </thead>
        <tbody>{DisplayData}</tbody>
      </table>
    </div>
  );
};

export default TestDataDisplay;
