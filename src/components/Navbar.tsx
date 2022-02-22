import {Back} from "@navikt/ds-icons";
import {Heading} from "@navikt/ds-react";
import clsx from "clsx";
import React, {useContext} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {NavbarContext} from "../App";
import styles from "./Navbar.module.scss";
import MessagesTable from "../MessagesTable";
import EventsTable from "../EventsTable";
import MottakIdSok from "../MottakIdSok";
import FeilStatistikk from "../FeilStatistikk";

type NavbarProps = {};

type Page = {
  title: string;
  path: string;
  element: React.ReactNode;
};

export const pages: Page[] = [
  { title: "Meldinger", path: "/", element: <MessagesTable /> }, // TODO: Rename to "/meldinger"
  { title: "Hendelser", path: "/hendelser", element: <EventsTable /> },
  { title: "Mottakid Søk", path: "/mottakidsok", element: <MottakIdSok /> },
  { title: "Feilstatistikk", path: "/feilstatistikk", element: <FeilStatistikk /> }
];

const Navbar: React.FC<NavbarProps> = () => {
  const { state: isOpen, setState: setIsOpen } = useContext(NavbarContext);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className={clsx(styles.container, {
        [styles.open]: isOpen,
        [styles.closed]: !isOpen,
      })}
    >
      <Heading
        className={styles.header}
        size="medium"
        onClick={() => {
          navigate("/");
        }}
      >
        <img
          src={process.env.PUBLIC_URL + "/nav.svg"}
          alt="nav logo in svg format"
          style={{ maxWidth: "70px" }}
        />
        <span>eMottak Monitor</span>
      </Heading>
      <nav style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {pages.map((page) => (
          <Link
            key={page.path}
            className={clsx(styles.navLink, {
              [styles.active]: location.pathname === page.path,
            })}
            to={page.path}
          >
            <p className={styles.linkText}>{page.title}</p>
          </Link>
        ))}
      </nav>
      <button className={styles.toggleButton} onClick={() => setIsOpen(false)}>
        <Back />
      </button>
    </div>
  );
};

export default Navbar;
