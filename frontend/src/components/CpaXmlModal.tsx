import { Button, Modal } from "@navikt/ds-react";
import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CpaXmlDetail from "../pages/CpaXmlDetail";

const CpaXmlModal = () => {
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
              navigate(location.pathname + location.search, {
                replace: true,
                state: null,
              });
            }}
          >
            Åpne som egen side
          </Button>
          <CpaXmlDetail />
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default CpaXmlModal;
