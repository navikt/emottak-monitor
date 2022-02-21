import { Back } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import clsx from "clsx";
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavbarContext } from "../App";
import styles from "./Navbar.module.scss";

type NavbarProps = {};

type Page = {
  name: string;
  url: string;
};

const pages: Page[] = [
  { name: "Meldinger", url: "/" }, // TODO: Rename to "/meldinger"
  { name: "Hendelser", url: "/hendelser" },
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
            key={page.url}
            className={clsx(styles.navLink, {
              [styles.active]: location.pathname === page.url,
            })}
            to={page.url}
          >
            <p className={styles.linkText}>{page.name}</p>
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
