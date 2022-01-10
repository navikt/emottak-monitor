import Panel from "nav-frontend-paneler";
import "nav-frontend-tabell-style";
import Tabs from "nav-frontend-tabs";
import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

import CpaTable from "./CpaTable";
import EventsTable from "./EventsTable";
import LoggTable from "./LoggTable";
import MessagesTable from "./MessagesTable";

export default function App() {
  let navigate = useNavigate();

  const handleTabChange = (index: number) => {
    if (index === 0) {
      navigate("/");
    }
    if (index === 1) {
      navigate("/events");
    }
  };

  return (
    <div className="App">
      <Tabs
        tabs={[
          { label: "Meldinger", tabIndex: 0 },
          { label: "Hendelser", tabIndex: 1 },
        ]}
        defaultAktiv={0}
        onChange={(_event, index) => {
          handleTabChange(index);
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
        <Routes>
          <Route path="/" element={<MessagesTable />} />
          <Route path="/events" element={<EventsTable />} />
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
