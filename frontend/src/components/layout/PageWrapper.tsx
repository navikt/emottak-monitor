import { Heading } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";
import { useRouteLocation } from "../RouteLocationContext";
import { pages } from "./Navbar";
import styles from "./PageWrapper.module.scss";

type PageWrapperProps = PropsWithChildren<{}>;

const PageWrapper: React.FC<PageWrapperProps> = (props: PageWrapperProps) => {
  const { children } = props;
  const location = useRouteLocation(); // For å holde styr på den faktiske bakgrunnssiden når man er i en modal.

    const title = pages.find((page) => location.pathname === page.path)?.title;
    const enableHeader = pages.find((page) => location.pathname === page.path)?.enableHeader ?? (title !== undefined);

  return (
    <div className={styles.pageWrapper}>
        {enableHeader &&
            <Heading
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: "2em",
                }}
                size="xlarge"
            >
                {title}
            </Heading>}
      {children}
    </div>
  );
};

export default PageWrapper;
