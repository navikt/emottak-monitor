import React  from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
import EventsTable from "./EventsTable";
import './App.css';
import LoggTable from "./LoggTable";
import CpaTable from "./CpaTable";
import Tabs from "nav-frontend-tabs";
import Panel from "nav-frontend-paneler";
import { useState } from "react";

export default function App() {

    const [tabState, setTabState] = useState(0);
    const handleTabs = (value) => {
        setTabState(value);
        if (value === 0){
            return (<Route exact path="/" component={MessagesTable} />)
        }
        if (value === 1){
            return (<Route exact path="/" component={EventsTable} />)
        }
    }
    return (
        <div className="App">
            <Tabs
                tabs={[
                    {"label": "Meldinger", value:0},
                    {"label": "Hendelser", value:1}
                ]}
                value={tabState}
                onChange={(event, value) => { handleTabs(value) }}
            />
            <Panel border style={{borderTop:0, borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
            <Switch>
                <Route exact path="/" component={MessagesTable} />
                <Route exact path="/events" component={EventsTable} />
                <Route exact path="/logg/:mottakid" component={LoggTable} />
                <Route exact path="/cpa/:cpaid" component={CpaTable} />
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
            </Panel>
        </div>
    );
}
