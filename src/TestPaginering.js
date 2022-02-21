import React, { useMemo, useState } from "react";
import { Input, Select } from "nav-frontend-skjema";
import Pagination from "paginering";
import meldinger from "./data/meldinger.json";
import TestDataDisplay from "./TestDataDisplay";

const TestPaginering = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfItems] = useState(meldinger.length);
  const [pageSize, setPageSize] = useState(10);
  const antallMeldinger = meldinger.length;

  const selectedData = useMemo(() => {
    let firstPageIndex = Number((currentPage - 1) * pageSize);
    let lastPageIndex = Number(firstPageIndex) + Number(pageSize);
    if (firstPageIndex > meldinger.length) {
      firstPageIndex = 0;
      lastPageIndex = pageSize;
      setCurrentPage(1);
    }
    return [...meldinger.slice(firstPageIndex, lastPageIndex)];
  }, [currentPage, pageSize]);

  return (
    <div className="App">
      <h1>Test side !!!</h1>
      <TestDataDisplay JsonData={selectedData} />

      <table>
        <tr>
          <th>
            <Input label="Gjeldende side" bredde="XS" value={currentPage} />
          </th>
          <th>
            <Select
              label="Antall rader per side"
              value={pageSize}
              onChange={(size) => setPageSize(size.target.value)}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </Select>
          </th>
        </tr>
        <tr>
          <td>
            <Pagination
              currentPage={currentPage}
              numberOfItems={numberOfItems}
              itemsPerPage={pageSize}
              onChange={(page) => setCurrentPage(page)}
            />
          </td>
        </tr>
        <tr>
          <caption>
            {antallMeldinger === 1 ? (
              <p>1 melding</p>
            ) : (
              <p>{antallMeldinger} meldinger</p>
            )}
          </caption>
        </tr>
      </table>
    </div>
  );
};

export default TestPaginering;
