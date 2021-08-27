import TableSorting from "./TableSorting";
import React, {useEffect, useState, useCallback } from "react";
import Lenke from "nav-frontend-lenker";
import {Datepicker, isISODateString} from "nav-datovelger";
import TimePicker from "react-time-picker";
import {Select} from "nav-frontend-skjema";
import {useHistory, useLocation} from "react-router-dom";
import axios from "axios";

const EventsTable = (props) => {
    const search = useLocation().search;
    const fomParam = new URLSearchParams(search).get('fromDate');
    const tomParam = new URLSearchParams(search).get('toDate');
    const fromTimeParam = new URLSearchParams(search).get('fromTime');
    const toTimeParam = new URLSearchParams(search).get('toTime');
    const roleParam = new URLSearchParams(search).get('role');
    const serviceParam = new URLSearchParams(search).get('service');
    const actionParam = new URLSearchParams(search).get('action');
    const statusParam = new URLSearchParams(search).get('status');

    const [events, setEvents] = useState([])
    const [fom, setFom] = useState(initialDate(fomParam));
    const [tom, setTom] = useState(initialDate(tomParam));
    let [fromTime, setFromTime] = useState(initialTime(fromTimeParam));
    let [toTime, setToTime] = useState(initialTime(toTimeParam));
    let [role, setRole] = useState(initialFilter(roleParam));
    let [service, setService] = useState(initialFilter(serviceParam));
    let [action, setAction] = useState(initialFilter(actionParam));
    let [status, setStatus] = useState(initialFilter(statusParam));
    let [visibleEvents, setVisibleEvents] = useState(events);

    const history = useHistory();

    function initialDate(dateParam) {
        if(dateParam) {
            return dateParam
        } else {
            return new Date().toLocaleDateString('nb', {
                month: '2-digit',day: '2-digit',year: 'numeric'}) + ''
        }
    }

    function initialTime(timeParam) {
        if(timeParam) {
            return timeParam
        } else {
            return new Date().toLocaleTimeString() + ''
        }
    }

    function initialFilter(filterString) {
        if(filterString) {
            return filterString
        } else {
            return ''
        }
    }

    function filterRole(selectedRole) {
        setRole(selectedRole)
        pushQueryParam(search, history, 'role', selectedRole)
        setVisibleEvents([...events.filter(function (EventDetails) {
            return ((selectedRole === '' || EventDetails.role === selectedRole) &&
                (service === '' || EventDetails.service === service) &&
                (action === '' || EventDetails.action === action) &&
                (status === '' || EventDetails.status === status))
        })]);
    }
    function filterService(selectedService) {
        setService(selectedService)
        pushQueryParam(search, history, 'service', selectedService)
        setVisibleEvents([...events.filter(function (EventDetails) {
            return ((role === '' || EventDetails.role === role) &&
                (selectedService === '' || EventDetails.service === selectedService) &&
                (action === '' || EventDetails.action === action) &&
                (status === '' || EventDetails.status === status))
        })]);
    }
    function filterAction(selectedAction) {
        setAction(selectedAction)
        pushQueryParam(search, history, 'action', selectedAction)
        setVisibleEvents([...events.filter(function (EventDetails) {
            return ((role === '' || EventDetails.role === role) &&
                (service === '' || EventDetails.service === service) &&
                (selectedAction === '' || EventDetails.action === selectedAction) &&
                (status === '' || EventDetails.status === status))
        })]);
    }

    function filterStatus(selectedStatus) {
        setStatus(selectedStatus)
        pushQueryParam(search, history, 'status', selectedStatus)
        setVisibleEvents([...events.filter(function (EventDetails) {
            return ((role === '' || EventDetails.role === role) &&
                (service === '' || EventDetails.service === service) &&
                (action === '' || EventDetails.action === action) &&
                (selectedStatus === '' || EventDetails.status === selectedStatus))
        })]);
    }

    const applyFilter = useCallback((newEvents) => {
        setVisibleEvents([...newEvents.filter(function (EventDetails) {
            return ((role === '' || EventDetails.role === role) &&
                (service === '' || EventDetails.service === service) &&
                (action === '' || EventDetails.action === action) &&
                (status === '' || EventDetails.status === status))
        })])
    }, [role, service, action, status]);

    const pushHistory = useCallback(() => {
        history.push(`/events?fromDate=${fom}&fromTime=${fromTime}&toDate=${tom}&toTime=${toTime}&role=${role}&service=${service}&action=${action}&status=${status}`)
    }, [fom, tom, fromTime, toTime, role, service, action, status, history]);

    const pushQueryParam = ((search, history, key, value) => {
        let searchParams = new URLSearchParams(search);
        searchParams.set(key, value);
        history.push(`/events?${searchParams.toString()}`);
    });

    useEffect(()=> {
        if (fom !== '' && tom !== '' && fromTime !== '' && toTime !== '') {
            pushHistory()
            axios.get(`https://emottak-monitor.dev.intern.nav.no/v1/henthendelser?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`)
                .then(response => {
                    setEvents(response.data);
                    applyFilter(response.data)
                });
        }
    },[fom, tom, fromTime, toTime, pushHistory, applyFilter])
    let uniqueRoles = [...new Set(events.map(({role})=> role))]
    let uniqueServices = [...new Set(events.map(({service})=> service))]
    let uniqueActions = [...new Set(events.map(({action})=> action))]
    let uniqueStatus = [...new Set(events.map(({status})=> status))]

    const { items, requestSort, sortConfig } = TableSorting(visibleEvents);
    let eventsLength = 0;

    if(items.length) {eventsLength = items.length}
    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div>
        <h1>Hendelser</h1>
    <div className="row">
        <div className="column">
            <table id={"timetable"}>
                <tr>
                    <th>Fra og med dato: </th>
                    <th>
                        <Datepicker
                            locale={'nb'}
                            inputId="datepicker-input-fom"
                            value={fom}
                            onChange={setFom}
                            inputProps={{
                                name: 'dateInput',
                                'aria-invalid': fom !== '' && isISODateString(fom) === false,
                            }}
                            calendarSettings={{ showWeekNumbers: false }}
                            showYearSelector={true}/>
                    </th>
                    <th>
                        <TimePicker
                            onChange={setFromTime}
                            value={fromTime}/>
                    </th>
                </tr>
                <tr>
                    <th>Til og med:</th>
                    <th>
                        <Datepicker
                            locale={'nb'}
                            inputId="datepicker-input-tom"
                            value={tom}
                            onChange={setTom}
                            inputProps={{
                                name: 'dateInput',
                                'aria-invalid': tom !== '' && isISODateString(tom) === false,
                            }}
                            calendarSettings={{ showWeekNumbers: false }}
                            showYearSelector={true}/>
                    </th>
                    <th>
                        <TimePicker
                            onChange={setToTime}
                            value={toTime}/>
                    </th>
                </tr>
            </table>
        </div>
        <div className="column">
            <table>
                <tr>
                    <th>
                        <Select id={"select"} onChange={event => filterRole(event.target.value)} selected={role}>
                            <option value="">Velg rolle</option>
                            {uniqueRoles.map((role)=>{
                                return <option value={role}>{role}</option>})}
                        </Select>
                    </th>
                    <th>
                        <Select id={"select"} onChange={event => filterService(event.target.value)} selected={service}>
                            <option value="">Velg service</option>
                            {uniqueServices.map((service)=>{
                                return <option value={service}>{service}</option>})}
                        </Select>
                    </th>
                    <th>
                        <Select id={"select"} onChange={event => filterAction(event.target.value)}  selected={action}>
                            <option value="">Velg action</option>
                            {uniqueActions.map((action)=>{
                                return <option value={action}>{action}</option>})}
                        </Select>
                    </th>
                    <th>
                        <Select id={"select"} onChange={event => filterStatus(event.target.value)} selected={status}>
                            <option value="">Velg status</option>
                            {uniqueStatus.map((status)=>{
                                return <option value={status}>{status}</option>})}
                        </Select>
                    </th>
                </tr>
            </table>
        </div>
    </div>
        <table className="tabell tabell--stripet">
            <thead>
            <tr>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('hendelsedato')}
                        className={getClassNamesFor('hendelsedato')}>Mottat
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('hendelsedeskr')}
                        className={getClassNamesFor('hendelsedeskr')}>Hendelse1
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('hendelsedeskr')}
                        className={getClassNamesFor('tilleggsinfo')}>Hendelse2
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
            </tr>
            </thead>
            <tbody>
            {items.map((EventDetails) => {
                return <tr>
                    <td className="tabell__td--sortert">{EventDetails.hendelsedato.substr(0,23)}</td>
                    <td><Lenke href={`/logg/${EventDetails.hendelsedeskr}`}>{EventDetails.hendelsedeskr} </Lenke></td>
                    <td><Lenke href={`/logg/${EventDetails.tillegsinfo}`}>{EventDetails.tillegsinfo} </Lenke></td>
                    <td><Lenke href={`/logg/${EventDetails.mottakid}`}>{EventDetails.mottakid} </Lenke></td>
                    <td>{EventDetails.role}</td>
                    <td>{EventDetails.service}</td>
                    <td>{EventDetails.action}</td>
                    <td>{EventDetails.referanse}</td>
                    <td>{EventDetails.avsender}</td>
                </tr>
            })}
            </tbody>
            <caption>
                {eventsLength} hendelser
            </caption>
        </table>
        </div>
    );
};
export default EventsTable;
