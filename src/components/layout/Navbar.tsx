import { Back, Next } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import clsx from "clsx";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.scss";
import MessagesTable from "../../pages/MessagesTable";
import EventsTable from "../../pages/EventsTable";
import MottakIdSok from "../../pages/MottakIdSok";
import FeilStatistikk from "../../pages/FeilStatistikk";

type Page = {
  title: string;
  path: string;
  element: React.ReactNode;
};

export const pages: Page[] = [
  { title: "Meldinger", path: "/meldinger", element: <MessagesTable /> },
  { title: "Hendelser", path: "/hendelser", element: <EventsTable /> },
  { title: "Mottakid Søk", path: "/mottakidsok", element: <MottakIdSok /> },
  {
    title: "Feilstatistikk",
    path: "/feilstatistikk",
    element: <FeilStatistikk />,
  },
];

type NavbarProps = {
  isNavbarOpen: boolean;
  setIsNavbarOpen: (isOpen: boolean) => void;
};

const Navbar: React.FC<NavbarProps> = ({ isNavbarOpen, setIsNavbarOpen }) => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setIsButtonVisible(true)}
      onMouseLeave={() => setIsButtonVisible(false)}
    >
      <button
        className={clsx(styles.button, styles.openButton)}
        onClick={() => setIsNavbarOpen(true)}
      >
        <Next />
      </button>
      <button
        className={clsx(styles.button, styles.closeButton, {
          [styles.closeButtonVisible]: isNavbarOpen && isButtonVisible,
          [styles.closeButtonHidden]: !isNavbarOpen || !isButtonVisible,
          [styles.closeButtonCollapsed]: !isNavbarOpen,
        })}
        onClick={() => setIsNavbarOpen(false)}
      >
        <Back />
      </button>
      <div
        className={clsx(styles.container, {
          [styles.open]: isNavbarOpen,
          [styles.closed]: !isNavbarOpen,
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
        <nav
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
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
      </div>
    </div>
  );
};

export default Navbar;
