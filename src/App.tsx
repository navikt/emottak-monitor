import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import "nav-frontend-tabell-style";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout/Layout";
import CpaTable from "./CpaTable";
import EventsTable from "./EventsTable";
import FeilStatistikk from "./FeilStatistikk";
import LoggTable from "./LoggTable";
import MessagesTable from "./MessagesTable";
import MottakIdSok from "./MottakIdSok";

type RouteType = {
  path: string;
  title: string;
  element: React.ReactNode;
};

export const routes: RouteType[] = [
  { path: "/meldinger", title: "Meldinger", element: <MessagesTable /> },
  { path: "/hendelser", title: "Hendelser", element: <EventsTable /> },
  { path: "/mottakidsok", title: "Mottakid Søk", element: <MottakIdSok /> },
  {
    path: "/feilStatistikk",
    title: "Feilstatistikk",
    element: <FeilStatistikk />,
  },
];

export default function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          {routes.map((route) => (
            <Route path={route.path} element={route.element} />
          ))}
          <Route path="/" element={<Navigate to="/meldinger" />} />
        </Route>
        <Route path="/logg/:mottakid" element={<LoggTable />} />
        <Route path="/cpa/:cpaid" element={<CpaTable />} />
        <Route path="/isalive" element={<div>The app is alive</div>}></Route>
        <Route path="/isready" element={<div>The app is ready</div>}></Route>
        <Route path="/metrics" element={<div>Metrics</div>}></Route>
      </Routes>
    </div>
  );
}
