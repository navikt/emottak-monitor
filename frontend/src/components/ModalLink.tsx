import React from "react";
import { Link, LinkProps, Location, useLocation } from "react-router-dom";

type ModalLinkProps = Omit<LinkProps, "state" | "replace"> & {
  /**
   * True betyr at lenken alltid vil åpnes som en modal.
   * False betyr at lenken kun vil åpnes som en modal hvis man allerede er inni en modal.
   */
  alwaysModal?: boolean;
};

/**
 * Brukes i views som både kan vises som en "modal" og som vanlig "fullskjerm",
 * og som samtidig kan inneholde modal-lenker (slik som AssiciatedMessages.tsx).
 *
 * ModalLink sørger for at eksisterende modal erstattes av ny modal,
 * og at en lenke ikke åpnes som modal hvis man er i vanlig "fullskjerm" samtidig som alwaysModal er satt til false.
 */
const ModalLink: React.FC<ModalLinkProps> = ({ children, alwaysModal = false, ...linkProps }) => {
  const location = useLocation();
  const existingBackgroundLocation = (location.state as { backgroundLocation?: Location })
    ?.backgroundLocation;

  if (!alwaysModal && !existingBackgroundLocation) {
    // Ikke inni en modal: Navigér som en helt vanlig lenke (fullskjerm).
    return <Link {...linkProps}>{children}</Link>;
  }

  const backgroundLocation = existingBackgroundLocation ?? location;

  return (
    <Link
      {...linkProps}
      state={{ backgroundLocation }}
      replace={Boolean(existingBackgroundLocation)}
    >
      {children}
    </Link>
  );
};

export default ModalLink;
