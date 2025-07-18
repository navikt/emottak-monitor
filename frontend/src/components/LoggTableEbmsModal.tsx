import { Button, Modal } from "@navikt/ds-react";
import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoggTableModal from "./LoggTableModal";
import LoggTableEbms from "../pages/LoggTableEbms";

const LoggTableEbmsModal = () => {
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
          <LoggTableEbms />
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default LoggTableEbmsModal;
