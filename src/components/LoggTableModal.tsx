import { Button, Modal } from "@navikt/ds-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoggTable from "../LoggTable";

const LoggTableModal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onClose = () => {
    navigate(-1);
  };
  return (
    <Modal open={true} onClose={onClose}>
      <div style={{ margin: "50px" }}>
        <Button
          onClick={() => {
            navigate(location, { replace: true, state: location });
          }}
        >
          Åpne som egen side
        </Button>
        <LoggTable />
      </div>
    </Modal>
  );
};

export default LoggTableModal;
