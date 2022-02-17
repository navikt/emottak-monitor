import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import Panel from "nav-frontend-paneler";
import "nav-frontend-tabell-style";
import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import CpaTable from "./CpaTable";
import EventsTable from "./EventsTable";
import LoggTable from "./LoggTable";
import MessagesTable from "./MessagesTable";

export default function App() {
  return (
    <div className="App" style={{ display: "flex" }}>
      <Navbar />

      <Panel
        border
        style={{
          borderTop: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        <Routes>
          <Route path="/" element={<MessagesTable />} />
          <Route path="/hendelser" element={<EventsTable />} />
          <Route path="/logg/:mottakid" element={<LoggTable />} />
          <Route path="/cpa/:cpaid" element={<CpaTable />} />

          <Route path="/isalive" element={<div>The app is alive</div>}></Route>
          <Route path="/isready" element={<div>The app is ready</div>}></Route>
          <Route path="/metrics" element={<div>Metrics</div>}></Route>
        </Routes>
      </Panel>
    </div>
  );
}
