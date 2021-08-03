import React  from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
// import axios from "axios"
// import {Datepicker, isISODateString} from "nav-datovelger";
// import TimePicker from 'react-time-picker';
import './App.css';
// import { Select } from 'nav-frontend-skjema'
import LoggTable from "./LoggTable";
// import Lenke from "nav-frontend-lenker";

export default function App() {




    // console.log("Messages = " + messages)
    return (
        <div className="App">
            <Switch>
                <Route exact path="/" component={MessagesTable} />
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
