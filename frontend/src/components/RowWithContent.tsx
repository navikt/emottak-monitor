import { Table } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";

interface RowWithContentProps extends PropsWithChildren<{}> {
    colSpan?: number;
}

const RowWithContent = ({ children, colSpan = 9 }: RowWithContentProps) => (
  <Table.Row>
    <Table.DataCell style={{ textAlign: "center" }} colSpan={colSpan}>
      {children}
    </Table.DataCell>
  </Table.Row>
);

export default RowWithContent;
