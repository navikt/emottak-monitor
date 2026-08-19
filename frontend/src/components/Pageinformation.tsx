import Pagination from "../components/Pagination";
import React from "react";

type PageinformationProps = {
    pageSize: number;
    onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    totalCount: number;
    filterCount: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    errorMessage?: (string | null);
};

const Pageinformation = ({
    pageSize,
    onPageSizeChange,
    totalCount,
    filterCount,
    currentPage,
    setCurrentPage,
    errorMessage,
}: PageinformationProps) => {
    let showTo = pageSize * currentPage;
    const showFrom = showTo - (pageSize-1);
    if (showTo > filterCount) showTo = filterCount;
    let pageLabel = `Viser ${showFrom} til ${showTo} av ${filterCount}`;
    if (totalCount != filterCount) pageLabel += ` (filtrert fra totalt ${totalCount} rader)`;
    return (
      <>
        <fieldset style={{width: "100%", borderWidth: "2px", borderColor: "grey", borderStyle: "solid", padding: "5px", margin: "0px 0px 7px 0px" }}>
            <legend>Sideinformasjon:</legend>
            <table style={{ border: "0px", width: "100%" }}>
                <tbody>
                <tr>
                    <td style={{ width: "33%" }}>
                        <span>Rader per side </span>
                        <select value={pageSize} onChange={onPageSizeChange}>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
                            <option value={500}>500</option>
                            <option value={1000}>1000</option>
                        </select>
                    </td>
                    <td style={{  width: "33%", textAlign: "center" }}>
                        <Pagination
                            totalCount={totalCount}
                            pageSize={pageSize}
                            siblingCount={1}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </td>
                    <td style={{ width: "34%", textAlign: "right" }}>
                        {pageLabel}
                    </td>
                </tr>
                </tbody>
            </table>
        </fieldset>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </>
    );
}

export default Pageinformation;