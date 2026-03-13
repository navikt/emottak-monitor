import { Select } from "@navikt/ds-react";
import React, {useEffect} from "react";
import useFetch from "../hooks/useFetch";
import NavFrontendSpinner from "nav-frontend-spinner";

type FilterProps<T, K extends keyof T> = {
  field: FIELD;
  onFieldChange: (value: string) => void;
};

export enum FIELD {
    ROLE = "Role",
    SERVICE = "Service",
    ACTION = "Action"
}

type DistinctRolesServicesActions = {
    roles: string[];
    services: string[];
    actions: string[];
    refreshedAt: string;
};

/* Lager en dropdown-liste som er populert med data fra én av kolonnene fra distinct_roles_services_action tabellen.
 * NB: Bruk heller PrepopulatedFilter hvis du trenger dropdowns for alle tre felter.
 * Brukes slik for å få en dropdown-liste over services:
 * <PrepopulatedSelectFilter field={FIELD.SERVICE} onFieldChange={onServiceChange} />
 */
const PrepopulatedSelectFilter = <T, K extends keyof T>({
  field,
  onFieldChange,
}: FilterProps<T, K>) => {

  const url = `/v1/hentrollerservicesaction`;
  const { fetchState, callRequest } = useFetch<DistinctRolesServicesActions>(url);

  useEffect(() => {
      callRequest();
  }, []);

  const { loading, error, data } = fetchState;
  let list:string[] = [];
  switch(field) {
    case FIELD.ROLE:
      list = data?.roles ?? [];
      break;
    case FIELD.SERVICE:
      list = data?.services ?? [];
      break;
    case FIELD.ACTION:
      list = data?.actions ?? [];
      break;
  }

  const showSpinner = loading;
  const showErrorMessage = !loading && error?.message;
  const showNoDataMessage = !loading && !error?.message && list?.length === 0;

  if (showSpinner)
    return <NavFrontendSpinner />
  else if (showErrorMessage)
    return <p>ERROR: {error.message}</p>
  else if (showNoDataMessage)
    return <p>Feilet med å hente filter-verdier for service!</p>
  return (
    <Select
      label={field}
      size="small"
      onChange={(event) => onFieldChange(event.target.value)}
    >
      <option value="">Velg {field.toLowerCase()}</option>
      {list.map((entry) => {
        return (
          <option key={entry} value={entry}>
            {entry}
          </option>
        );
      })}
    </Select>
  );
};

export default PrepopulatedSelectFilter;
