import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "nav-frontend-tabell-style";
import React, {createContext, PropsWithChildren, useState} from "react";
import {Route, Routes} from "react-router-dom";
import "./App.css";
import Navbar, {pages} from "./components/Navbar";
import CpaTable from "./CpaTable";
import LoggTable from "./LoggTable";
import IsAlive from "./IsAlive";
import IsReady from "./IsReady";

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
          {pages.map((page) => <Route path={page.path} element={page.element}/>)}
          <Route path="/logg/:mottakid" element={<LoggTable />} />
          <Route path="/cpa/:cpaid" element={<CpaTable />} />
          <Route path="/isalive" element={<IsAlive />} />
          <Route path="/isready" element={<IsReady/>} />
          <Route path="/metrics" element={<div>Metrics</div>} />
        </Routes>
      </NavbarContextProvider>
    </div>
  );
}
