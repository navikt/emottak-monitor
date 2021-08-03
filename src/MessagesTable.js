import TableSorting from "./TableSorting";
import React, {useEffect, useState, useCallback } from "react";
import Lenke from 'nav-frontend-lenker';
import {Datepicker, isISODateString} from "nav-datovelger";
import TimePicker from "react-time-picker";
import {Select} from "nav-frontend-skjema";
import {useHistory, useLocation} from "react-router-dom";
import axios from "axios";

const MessagesTable = (props) => {
    const search = useLocation().search;

    const fomParam = new URLSearchParams(search).get('fromDate');
    const tomParam = new URLSearchParams(search).get('toDate');
    const fromTimeParam = new URLSearchParams(search).get('fromTime');
    const toTimeParam = new URLSearchParams(search).get('toTime');

    const [messages, setMessages] = useState([])
    const [fom, setFom] = useState(initialDate(fomParam));
    const [tom, setTom] = useState(initialDate(tomParam));
    let [fromTime, setFromTime] = useState(initialTime(fromTimeParam));
    let [toTime, setToTime] = useState(initialTime(toTimeParam));
    let [role, setRole] = useState('');
    let [service, setService] = useState('');
    let [action, setAction] = useState('');
    let [status, setStatus] = useState('');
    let [visibleMessages, setVisibleMessages] = useState(messages);

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

    function filterRole(selectedRole) {
        setRole(selectedRole)
        pushHistory()
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((selectedRole === '' || MessageDetails.role === selectedRole) &&
                (service === '' || MessageDetails.service === service) &&
                (action === '' || MessageDetails.action === action) &&
                (status === '' || MessageDetails.status === status))
        })]);
    }
    function filterService(selectedService) {
        setService(selectedService)
        pushHistory()
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((role === '' || MessageDetails.role === role) &&
                (selectedService === '' || MessageDetails.service === selectedService) &&
                (action === '' || MessageDetails.action === action) &&
                (status === '' || MessageDetails.status === status))
        })]);
    }
    function filterAction(selectedAction) {
        setAction(selectedAction)
        pushHistory()
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((role === '' || MessageDetails.role === role) &&
                (service === '' || MessageDetails.service === service) &&
                (selectedAction === '' || MessageDetails.action === selectedAction) &&
                (status === '' || MessageDetails.status === status))
        })]);
    }

    function filterStatus(selectedStatus) {
        setStatus(selectedStatus)
        pushHistory()
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((role === '' || MessageDetails.role === role) &&
                (service === '' || MessageDetails.service === service) &&
                (action === '' || MessageDetails.action === action) &&
                (selectedStatus === '' || MessageDetails.status === selectedStatus))
        })]);
    }

    const pushHistory = useCallback(() => {
        history.push(`/?fromDate=${fom}&fromTime=${fromTime}&toDate=${tom}&toTime=${toTime}&role=${role}&service=${service}&action=${action}&status=${status}`)
    }, [fom, tom, fromTime, toTime, action, history]);

    useEffect(()=> {
        if (fom !== '' && tom !== '' && fromTime !== '' && toTime !== '') {
            pushHistory()
            axios.get(`https://emottak-monitor.dev.intern.nav.no/v1/hentmeldinger?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`)
                .then(response => {
                    setMessages(response.data);
                    setVisibleMessages(response.data)
                });
        }
    },[fom, tom, fromTime, toTime, pushHistory])

    let uniqueRoles = [...new Set(messages.map(({role})=> role))]
    let uniqueServices = [...new Set(messages.map(({service})=> service))]
    let uniqueActions = [...new Set(messages.map(({action})=> action))]
    let uniqueStatus = [...new Set(messages.map(({status})=> status))]

    const { items, requestSort, sortConfig } = TableSorting(visibleMessages);
    let messagesLength = 0;

    if(items.length) {messagesLength = items.length}
    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div>
        <h1>Meldinger</h1>
    <div className="row">
        <div className="column">
            <table id={"timetable"}>
                <tr>
                    <th>Fra og med dato: </th>
                    <th>
                        <Datepicker
                            locale={'nb'}
                            inputId="datepicker-input"
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
                            inputId="datepicker-input"
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
                        <Select id={"select"} onChange={event => filterRole(event.target.value)}>
                            <option value="">Velg rolle</option>
                            {uniqueRoles.map((role)=>{
                                return <option value={role}>{role}</option>})}
                        </Select>
                    </th>
                    <th>
                        <Select id={"select"} onChange={event => filterService(event.target.value)}>
                            <option value="">Velg service</option>
                            {uniqueServices.map((service)=>{
                                return <option value={service}>{service}</option>})}
                        </Select>
                    </th>
                    <th>
                        <Select id={"select"} onChange={event => filterAction(event.target.value)}>
                            <option value="">Velg action</option>
                            {uniqueActions.map((action)=>{
                                return <option value={action}>{action}</option>})}
                        </Select>
                    </th>
                    <th>
                        <Select id={"select"} onChange={event => filterStatus(event.target.value)}>
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
            {items.map((MessageDetails) => {
                return <tr>
                    <td className="tabell__td--sortert">{MessageDetails.datomottat}</td>
                    <td><Lenke href={`/logg/${MessageDetails.mottakid}`}>{MessageDetails.mottakid} </Lenke></td>
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
        </div>
    );
};
export default MessagesTable;
