import { Next } from "@navikt/ds-icons";
import { ContentContainer, Heading } from "@navikt/ds-react";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import { useContext } from "react";
import { NavbarContext } from "../App";
import styles from "./PageWrapper.module.scss";

type PageWrapperProps = PropsWithChildren<{ title: string }>;

const PageWrapper: React.FC<PageWrapperProps> = (props: PageWrapperProps) => {
  const { children, title } = props;
  const { state: isOpen, setState: setIsOpen } = useContext(NavbarContext);

  return (
    <ContentContainer
      style={{
        marginLeft: isOpen ? "300px" : 0,
        minHeight: "100vh",
        transition: "margin 1s",
      }}
    >
      <Heading
        style={{
          display: "flex",
          alignItems: "center",
          height: "90px",
        }}
        size="xlarge"
      >
        {title}
      </Heading>
      {children}
      <button
        className={clsx(styles.navbarButton, {
          [styles.navbarButtonOpen]: isOpen,
          [styles.navbarButtonClosed]: !isOpen,
        })}
        onClick={() => setIsOpen(true)}
      >
        <Next />
      </button>
    </ContentContainer>
  );
};

export default PageWrapper;
