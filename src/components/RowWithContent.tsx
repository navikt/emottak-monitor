import { Table } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";

const RowWithContent = ({ children }: PropsWithChildren<{}>) => (
  <Table.Row>
    <Table.DataCell style={{ textAlign: "center" }} colSpan={9}>
      {children}
    </Table.DataCell>
  </Table.Row>
);

export default RowWithContent;
