import { Heading } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { routes } from "../../App";
import styles from "./PageWrapper.module.scss";

type PageWrapperProps = PropsWithChildren<{}>;

const PageWrapper: React.FC<PageWrapperProps> = (props: PageWrapperProps) => {
  const { children } = props;
  const location = useLocation();

  const title = routes.find((route) => location.pathname === route.path)?.title;

  return (
    <div className={styles.pageWrapper}>
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
    </div>
  );
};

export default PageWrapper;
