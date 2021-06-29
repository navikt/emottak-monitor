import React from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
import axios from "axios"

const getMessages = async () => {
    return await axios.get('https://emottak-monitor.dev.intern.nav.no/v1/hentmeldinger?fromDate=01-01-2021%2010:10:10&toDate=01-01-2021%2010:16:10');
}

export default function App() {
    return (
        <div className="App">
            <Switch>
                <Route exact path="/">
                    <h1>eMottak meldinger</h1>
                    {/*<MessagesTable messages={DBMessages}/>*/}
                    <MessagesTable messages={getMessages().data.message}/>
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
