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
import { ReactComponent as Logo } from './navLogo.svg';
import MottakIdSok from "./MottakIdSok";
import FeilStatistikk from "./FeilStatistikk";

export default function App() {
  let navigate = useNavigate();

  const handleTabChange = (index: number) => {
    if (index === 0) {
      navigate("/");
    }
    if (index === 1) {
      navigate("/events");
    }
      if (index === 2) {
          navigate("/mottakidsok");
      }
      if (index === 3) {
          navigate("/feilstatistikk");
      }
  };

  return (
    <div className="App">
        <table className={"img"}>
            <Logo />
        </table>
        <Tabs
        tabs={[
          { label: "Meldinger", tabIndex: 0 },
          { label: "Hendelser", tabIndex: 1 },
          {label: "Mottak-id søk", tabIndex: 2},
          {label: "Feil statistikk", tabIndex: 3},
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
          <Route path="/mottakidsok" element={<MottakIdSok />}/>
          <Route path="/feilStatistikk" element={<FeilStatistikk />}/>
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
