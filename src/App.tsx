import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "nav-frontend-tabell-style";
import React, { createContext, PropsWithChildren, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import CpaTable from "./CpaTable";
import EventsTable from "./EventsTable";
import FeilStatistikk from "./FeilStatistikk";
import LoggTable from "./LoggTable";
import MessagesTable from "./MessagesTable";
import MottakIdSok from "./MottakIdSok";

type NavbarStore = {
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NavbarContext = createContext({} as NavbarStore);

const NavbarContextProvider: React.FunctionComponent = ({
  children,
}: PropsWithChildren<{}>) => {
  const [state, setState] = useState(true);
  return (
    <NavbarContext.Provider value={{ state, setState }}>
      {children}
    </NavbarContext.Provider>
  );
};

export default function App() {
  return (
    <div className="App" style={{ display: "flex" }}>
      <NavbarContextProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<MessagesTable />} />
          <Route path="/hendelser" element={<EventsTable />} />
          <Route path="/mottakidsok" element={<MottakIdSok />} />
          <Route path="/feilStatistikk" element={<FeilStatistikk />} />
          <Route path="/logg/:mottakid" element={<LoggTable />} />
          <Route path="/cpa/:cpaid" element={<CpaTable />} />
          <Route path="/isalive" element={<div>The app is alive</div>}></Route>
          <Route path="/isready" element={<div>The app is ready</div>}></Route>
          <Route path="/metrics" element={<div>Metrics</div>}></Route>
        </Routes>
      </NavbarContextProvider>
    </div>
  );
}
