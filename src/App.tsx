import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "nav-frontend-tabell-style";
import React from "react";

import { pages } from "./components/layout/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CpaTable from "./CpaTable";
import LoggTable from "./LoggTable";
import IsAlive from "./IsAlive";
import IsReady from "./IsReady";

export default function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          {pages.map((page) => (
            <Route key={page.path} path={page.path} element={page.element} />
          ))}
          <Route path="/" element={<Navigate to="/meldinger" />} />
        </Route>
        <Route path="/logg/:mottakid" element={<LoggTable />} />
        <Route path="/cpa/:cpaid" element={<CpaTable />} />
        <Route path="/isalive" element={<IsAlive />} />
        <Route path="/isready" element={<IsReady />} />
        <Route path="/metrics" element={<div>Metrics</div>} />
      </Routes>
    </div>
  );
}
