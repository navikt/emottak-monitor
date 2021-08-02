import React, { useState, useEffect }  from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
import axios from "axios"
import {Datepicker, isISODateString} from "nav-datovelger";
import TimePicker from 'react-time-picker';
import './App.css';
import { Select } from 'nav-frontend-skjema'
import LoggTable from "./LoggTable";
import Lenke from "nav-frontend-lenker";

export default function App() {
    const [messages, setMessages] = useState([])
    const [fom, setFom] = useState(new Date().toLocaleDateString('nb', {
        month: '2-digit',day: '2-digit',year: 'numeric'}) + '');
    const [tom, setTom] = useState(new Date().toLocaleDateString('nb', {
        month: '2-digit',day: '2-digit',year: 'numeric'}) + '');
    let [fromTime, setFromTime] = useState(new Date().toLocaleTimeString() + '');
    let [toTime, setToTime] = useState(new Date().toLocaleTimeString() + '');
    let [role, setRole] = useState('');
    let [service, setService] = useState('');
    let [action, setAction] = useState('');
    let [status, setStatus] = useState('');
    let [visibleMessages, setVisibleMessages] = useState(messages);

    function filterRole(selectedRole) {
        setRole(selectedRole)
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((selectedRole === '' || MessageDetails.role === selectedRole) &&
                (service === '' || MessageDetails.service === service) &&
                (action === '' || MessageDetails.action === action) &&
                (status === '' || MessageDetails.status === status))
        })]);
    }
    function filterService(selectedService) {
        setService(selectedService)
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((role === '' || MessageDetails.role === role) &&
                (selectedService === '' || MessageDetails.service === selectedService) &&
                (action === '' || MessageDetails.action === action) &&
                (status === '' || MessageDetails.status === status))
        })]);
    }
    function filterAction(selectedAction) {
        setAction(selectedAction)
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((role === '' || MessageDetails.role === role) &&
                (service === '' || MessageDetails.service === service) &&
                (selectedAction === '' || MessageDetails.action === selectedAction) &&
                (status === '' || MessageDetails.status === status))
        })]);
    }

    function filterStatus(selectedStatus) {
        setStatus(selectedStatus)
        setVisibleMessages([...messages.filter(function (MessageDetails) {
            return ((role === '' || MessageDetails.role === role) &&
                (service === '' || MessageDetails.service === service) &&
                (action === '' || MessageDetails.action === action) &&
                (selectedStatus === '' || MessageDetails.status === selectedStatus))
        })]);
    }

    useEffect(()=> {
        if (fom !== '' && tom !== '' && fromTime !== '' && toTime !== '') {
            axios.get(`https://emottak-monitor.dev.intern.nav.no/v1/hentmeldinger?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`)
                .then(response => {
                    setMessages(response.data);
                    setVisibleMessages(response.data)
                });
        }
    },[fom, tom, fromTime, toTime])

    let uniqueRoles = [...new Set(messages.map(({role})=> role))]
    let uniqueServices = [...new Set(messages.map(({service})=> service))]
    let uniqueActions = [...new Set(messages.map(({action})=> action))]
    let uniqueStatus = [...new Set(messages.map(({status})=> status))]

    console.log("Messages = " + messages)
    return (
        <div className="App">
            <p><Lenke href={`/`}>eMottak Monitor</Lenke></p>
            <Switch>
            <Route exact path="/">
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
                                    {uniqueActions.map((status)=>{
                                        return <option value={status}>{status}</option>})}
                                </Select>
                            </th>
                        </tr>
                    </table>
                </div>
                </div>
                     <MessagesTable messages={visibleMessages}/>
                </Route>
                <Route exact path="/logg/:mottakid" component={LoggTable} />
                <Route exact path="/isalive" status={200}>
                    <h1>Alive</h1>
                </Route>
                <Route exact path="/isready" status={200}>
                    <h1>Ready</h1>
                </Route>
                <Route exact path="/metrics" status={200}>
                    <h1>Metrics</h1>
                </Route>
            </Switch>
        </div>
    );
}
