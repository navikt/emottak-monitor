import React  from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
import './App.css';
import LoggTable from "./LoggTable";

export default function App() {

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
