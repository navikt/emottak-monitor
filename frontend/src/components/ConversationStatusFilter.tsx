import clsx from "clsx";
import filterStyles from "./Filter.module.scss";
import {Input} from "nav-frontend-skjema";
import PrepopulatedSelectFilter, {FIELD} from "./PrepopulatedSelectFilter";
import SelectableDateTimeSelector from "./SelectableDateTimeSelector";
import React, {useState} from "react";
import {initialDate, initialTime} from "../util";
import {ConversationStatusSearchParams} from "../hooks/useConversationStatusSearch";

export const STATUS_OPTIONS = ['Informasjon', 'Feil', 'Ferdigbehandlet'];

interface Props {
    onSearch: (p: ConversationStatusSearchParams) => void;
    currentParams: ConversationStatusSearchParams;
    totalCount: number;
}

export default function ConversationStatusFilterForm({ onSearch, currentParams, totalCount }: Props) {

    // Status-checkboxes:
    const [selectedStatuses, setSelectedStatuses] = useState(currentParams.statuses.split(","));
    const handleStatusCheckboxChange = (status: string) => {
        setSelectedStatuses((prev) => {
            if (prev.includes(status)) {
                return prev.filter((s) => s !== status);
            }
            return [...prev, status];
        });
    };

    // Text- and dropdown-inputs:
    const [cpaId, setCpaId] = useState(currentParams.cpaIdPattern);
    const [service, setService] = useState(currentParams.service);
    const onCpaIdChange     = (value: string) => { setCpaId(value); };
    const onServiceChange   = (value: string) => { setService(value); };

    // Date and time-inputs:
    const [showFromField, setShowFromField] = useState(false);
    const [showToField, setShowToField] = useState(false);
    const [fromTimeDraft, setFromTimeDraft] = useState(initialTime(""));
    const [toTimeDraft, setToTimeDraft] = useState(initialTime(""));
    const [fromDate, setFromDate] = useState(initialDate(""));
    const [toDate, setToDate] = useState(initialDate(""));
    const [fromTime, setFromTime] = useState(initialTime(""));
    const [toTime, setToTime] = useState(initialTime(""));
    const onFromDateChange  = (value: string) => { setFromDate(value); };
    const onToDateChange    = (value: string) => { setToDate(value); };
    const commitFromTime    = () => { setFromTime(fromTimeDraft); };
    const commitToTime      = () => { setToTime(toTimeDraft); };

    // Page and sort-inputs:
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(currentParams.pageSize);
    const [sortOrder, setSortOrder] = useState(currentParams.sortOrder);

    const onPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value, 10);
        if (newSize !== pageSize) {
            setCurrentPage(1);
            setPageSize(newSize);
            performSearch(1, newSize, sortOrder);
        }
    };
    const onSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOrder = e.target.value;
        if (newOrder !== sortOrder) {
            setCurrentPage(1);
            setSortOrder(newOrder);
            performSearch(1, pageSize, newOrder);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        performSearch(1);
    };

    const performSearch = (currentpage: number = currentPage, pagesize: number = pageSize, sortorder: string = sortOrder) => {
        const statuses = selectedStatuses.join(",");
        const searchFilters: ConversationStatusSearchParams = {
            statuses: statuses,
            cpaIdPattern: cpaId,
            service: service,
            fromDate: showFromField ? fromDate : undefined,
            fromTime: showFromField ? fromTime : undefined,
            toDate: showToField ? toDate : undefined,
            toTime: showToField ? toTime : undefined,
            currentPage: currentpage,
            pageSize: pagesize,
            sortOrder: sortorder
        };
        onSearch(searchFilters);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className={clsx(filterStyles.gridContainer, filterStyles.gridContainerWidths)}>
                <fieldset>
                    <legend>Status:</legend>
                    {STATUS_OPTIONS.map((opt) => (
                        <label key={opt} style={{ display: "block", marginLeft: "0.5rem" }}>
                            <input
                                type="checkbox"
                                checked={selectedStatuses.includes(opt)}
                                onChange={() => handleStatusCheckboxChange(opt)}
                            /> {opt}
                        </label>
                    ))}
                </fieldset>
                <fieldset>
                    <legend>Filter:</legend>
                    <Input
                        id="cpaId-input"
                        style={{
                            gridArea: "rolle",
                        }}
                        label="CPA-id:  "
                        bredde={"L"}
                        inputClassName={[filterStyles.inputId, "navds-label navds-label--small"].join(' ')}
                        onChange={(event) => onCpaIdChange(event.target.value)}
                        value={cpaId}
                    />
                    <PrepopulatedSelectFilter
                        field={FIELD.SERVICE}
                        onFieldChange={onServiceChange}
                    />
                </fieldset>
                <fieldset>
                    <legend>Dato:</legend>
                    <SelectableDateTimeSelector
                        showFromField={showFromField}
                        showToField={showToField}
                        setShowFromField={setShowFromField}
                        setShowToField={setShowToField}
                        fromDate={fromDate}
                        fromTime={fromTime}
                        toDate={toDate}
                        toTime={toTime}
                        onFromDateChange={onFromDateChange}
                        onFromTimeChange={setFromTimeDraft}
                        onToDateChange={onToDateChange}
                        onToTimeChange={setToTimeDraft}
                        onFromTimeBlur={commitFromTime}
                        onToTimeBlur={commitToTime}
                    />
                </fieldset>
                <div style={{ display: "inline", verticalAlign: "bottom" }}><button type="submit">Send query</button></div>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0"}}>
                <span>{totalCount} conversations</span>
                <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
                    <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
                        <span>Sorteringsrekkefølge</span>
                        <select value={sortOrder} onChange={onSortOrderChange}>
                            <option value="DESC">Nyeste først</option>
                            <option value="ASC">Eldste først</option>
                        </select>
                    </label>
                    <label style={{display: "inline-flex", alignItems: "center", gap: 8}}>
                        <span>Rader per side</span>
                        <select value={pageSize} onChange={onPageSizeChange}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                </div>
            </div>
        </form>
    );
}
