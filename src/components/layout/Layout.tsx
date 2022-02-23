import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import PageWrapper from "./PageWrapper";

const Layout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />
      <PageWrapper>
        <Outlet />
      </PageWrapper>
    </div>
  );
};

export default Layout;
