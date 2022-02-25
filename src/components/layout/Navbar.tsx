import { Back, Next } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import clsx from "clsx";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routes } from "../../App";
import styles from "./Navbar.module.scss";

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
          {routes.map((route) => (
            <Link
              key={route.path}
              className={clsx(styles.navLink, {
                [styles.active]: location.pathname === route.path,
              })}
              to={route.path}
            >
              <p className={styles.linkText}>{route.title}</p>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
