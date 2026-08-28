import { Button, Modal } from "@navikt/ds-react";
import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoggTable from "../pages/LoggTable";

type LoggTableModalProps = {
  ebms: boolean;
};

const LoggTableModal = (props: LoggTableModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onClose = () => {
    navigate(-1);
  };

  useEffect(() => {
    Modal.setAppElement?.("body");
  }, []);

  return (
    <Modal open={true} onClose={onClose}>
      <Modal.Content>
        <div>
          <Button
            onClick={() => {
              navigate(location, { replace: true, state: location });
            }}
          >
            Åpne som egen side
          </Button>
          <LoggTable ebms={props.ebms} />
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default LoggTableModal;
