import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "nav-frontend-tabell-style";
import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { pages } from "./components/layout/Navbar";
import LoggTableModal from "./components/LoggTableModal";
import CpaIdTable from "./pages/CpaIdTable";
import IsAlive from "./pages/IsAlive";
import IsReady from "./pages/IsReady";
import LoggTable from "./pages/LoggTable";
import LoggTableEbms from "./pages/LoggTableEbms";
import LoggTableEbmsModal from "./components/LoggTableEbmsModal";
import CpaIdTableModal from "./components/CpaIdTableModal";

export default function App() {
  const location = useLocation();

  const state = location.state as { backgroundLocation?: Location };

  return (
    <div>
      <Routes location={state?.backgroundLocation || location}>
        <Route element={<Layout />}>
          {pages.map((page) => (
            <Route key={page.path} path={page.path} element={page.element} />
          ))}
          <Route path="/" element={<Navigate to="/meldinger" />} />
          <Route path="/logg/:mottakid" element={<LoggTable />} />
          <Route path="/loggebms/:readableId" element={<LoggTableEbms />} />
        </Route>
        <Route path="/cpa/:cpaid" element={<CpaIdTable />} />
        <Route path="/isalive" element={<IsAlive />} />
        <Route path="/isready" element={<IsReady />} />
        <Route path="/metrics" element={<div>Metrics</div>} />
      </Routes>

      {/* using react router functionality for showing modal with url change */}
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/logg/:mottakid" element={<LoggTableModal />} />
          <Route path="/loggebms/:readableId" element={<LoggTableEbmsModal />} />
          <Route path="/cpa/:cpaid" element={<CpaIdTableModal />} />
        </Routes>
      )}
    </div>
  );
}
