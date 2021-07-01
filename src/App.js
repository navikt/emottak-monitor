import React, { useState, useEffect}  from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
import axios from "axios"
//import AdvancedDatePicker from "./AdvancedDatePicker"
import {Datepicker, isISODateString} from "nav-datovelger";
import TimePicker from 'react-time-picker';


export default function App() {
    const [messages, setMessages] = useState([])
    const [fom, setFom] = useState(new Date().toLocaleDateString() + '');
    const [tom, setTom] = useState(new Date().toLocaleDateString() + '');
    const [fromTime, setFromTime] = useState('10:00');
    const [toTime, setToTime] = useState('12:00');
    const sek = ':00'

    useEffect(()=> {
        if (fom !== '' && tom !== '' && fromTime !== '' && toTime !== '') {
            axios.get(`https://emottak-monitor.dev.intern.nav.no/v1/hentmeldinger?fromDate=${fom}%20${fromTime}${sek}&toDate=${tom}%20${toTime}${sek}`)
                .then(response => { setMessages(response.data)});
        }
    },[fom, tom, fromTime, toTime])

    console.log("Messages = " + messages)
    return (
        <div className="App">
            <Switch>
                <Route exact path="/">
                    <h1>eMottak meldinger</h1>
                    <div>
                        <div>FOM:
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
                                showYearSelector={true}
                            />
                            <TimePicker
                                onChange={setFromTime}
                                value={fromTime}
                            />
                        </div>
                        <div>TOM:
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
                                showYearSelector={true}
                            />
                            <TimePicker
                                onChange={setToTime}
                                value={toTime}
                            />
                        </div>
                    </div>
                    <MessagesTable messages={messages}/>
                </Route>
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
