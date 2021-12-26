import React from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import "nav-frontend-tabell-style";
import messagesTable from "./MessagesTable";
import eventsTable from "./EventsTable";
import "./App.css";
import loggTable from "./LoggTable";
import cpaTable from "./CpaTable";
import Tabs from "nav-frontend-tabs";
import Panel from "nav-frontend-paneler";
import { useState } from "react";

export default function App() {
  const history = useHistory();
  const [tabState, setTabState] = useState(0);
  const handleTabs = (value) => {
    setTabState(value);
    if (value === 0) {
      history.push("/");
    }
    if (value === 1) {
      history.push("/events");
    }
  };
  return (
    <div className="App">
      <Tabs
        tabs={[
          { label: "Meldinger", value: 0 },
          { label: "Hendelser", value: 1 },
        ]}
        value={tabState}
        onChange={(event, value) => {
          handleTabs(value);
        }}
      />
      <Panel
        border
        style={{
          borderTop: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        <Switch>
          <Route exact path="/" component={messagesTable} />
          <Route exact path="/events" component={eventsTable} />
          <Route exact path="/logg/:mottakid" component={loggTable} />
          <Route exact path="/cpa/:cpaid" component={cpaTable} />
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
