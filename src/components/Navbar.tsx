import { Heading } from "@navikt/ds-react";
import clsx from "clsx";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.scss";

type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();

  return (
    <nav className={styles.container}>
      <div className={styles.header}>
        <img
          src={process.env.PUBLIC_URL + "/nav.svg"}
          alt="nav logo in svg format"
          style={{ maxWidth: "80px" }}
        />
        <Heading size="medium">eMottak Monitor</Heading>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Link
          className={clsx(styles.navLink, {
            [styles.active]: location.pathname === "/",
          })}
          to="/"
        >
          <p className={styles.linkText}>Meldinger</p>
        </Link>
        {/* TODO: Make path /meldinger */}
        <Link
          className={clsx(styles.navLink, {
            [styles.active]: location.pathname === "/hendelser",
          })}
          to="/hendelser"
        >
          <p className={styles.linkText}>Hendelser</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
