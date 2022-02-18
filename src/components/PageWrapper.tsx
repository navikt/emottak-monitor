import { Next } from "@navikt/ds-icons";
import { ContentContainer, Heading } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";
import { useContext } from "react";
import { NavbarContext } from "../App";

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
      <Next
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          margin: "20px",
          transitionDelay: "1s",
          visibility: isOpen ? "hidden" : "visible",
        }}
        onClick={() => setIsOpen((oldVal) => !oldVal)}
      />
    </ContentContainer>
  );
};

export default PageWrapper;
