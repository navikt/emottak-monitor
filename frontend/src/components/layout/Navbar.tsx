import { Back, Next } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import clsx from "clsx";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// @ts-ignore
import styles from "./Navbar.module.scss";
import MessagesTable from "../../pages/MessagesTable";
import EventsTable from "../../pages/EventsTable";
import MottakIdSok from "../../pages/MottakIdSok";
import CpaIdSok from "../../pages/CpaIdSok";
import EBEMessageIdInfoSok from "../../pages/EBMessageIdSok";
import FeilStatistikk from "../../pages/FeilStatistikk";
import PartnerIdSok from "../../pages/PartnerIdSok";
import EventsTableEbms from "../../pages/EventsTableEbms";
import MessagesTableEbms from "../../pages/MessagesTableEbms";
import ReadableIdSokEbms from "../../pages/ReadableIdSokEbms";
import PartnerTable from "../../pages/PartnerTable";
import CpaTable from "../../pages/CpaTable";


type Page = {
  title: string;
  path: string;
  element: React.ReactNode;
};

export const pages: Page[] = [
  { title: "Meldinger", path: "/meldinger", element: <MessagesTable /> },
  { title: "Meldinger ebms", path: "/meldingerebms", element: <MessagesTableEbms /> },
  { title: "Hendelser", path: "/hendelser", element: <EventsTable /> },
  { title: "Hendelser ebms", path: "/hendelserebms", element: <EventsTableEbms /> },
  { title: "Mottak-id søk", path: "/mottakidsok", element: <MottakIdSok /> },
  { title: "Mottak-id søk ebms", path: "/readableidsokebms", element: <ReadableIdSokEbms /> },
  { title: "EBMessage-id søk", path: "/ebmessageidsok", element: <EBEMessageIdInfoSok /> },
  { title: "CPA-id søk", path: "/cpaidsok", element: <CpaIdSok /> },
  {title: "Partner-id søk", path: "/partnersok", element: <PartnerIdSok /> },
  {title: "Partnerliste", path: "/PartnerTable", element: <PartnerTable /> },
  {title: "Cpaliste", path: "/cpaliste", element: <CpaTable /> },
  { title: "Feilstatistikk", path: "/feilstatistikk", element: <FeilStatistikk /> },
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
            src={"/nav.svg"}
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
