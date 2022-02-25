import { Datepicker, isISODateString } from "nav-datovelger";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TimePicker from "react-time-picker";
import useFetch from "./hooks/useFetch";
import useTableSorting from "./hooks/useTableSorting";
import { initialDate, initialTime } from "./util";

type StatistikkInfo = {
  hendelsesbeskrivelse: string;
  antall_feil: string | number;
};

const FeilStatistikk = () => {
  const search = useLocation().search;
  const fomParam = new URLSearchParams(search).get("fromDate");
  const tomParam = new URLSearchParams(search).get("toDate");
  const fromTimeParam = new URLSearchParams(search).get("fromTime");
  const toTimeParam = new URLSearchParams(search).get("toTime");

  const [fom, setFom] = useState(initialDate(fomParam));
  const [tom, setTom] = useState(initialDate(tomParam));
  let [fromTime, setFromTime] = useState(initialTime(fromTimeParam));
  let [toTime, setToTime] = useState(initialTime(toTimeParam));

  const { fetchState, callRequest } = useFetch<StatistikkInfo[]>(
    `/v1/hentfeilstatistikk?fromDate=${fom}%20${fromTime}&toDate=${tom}%20${toTime}`
  );

  useEffect(() => {
    callRequest();
  }, [callRequest]);

  const { loading, error, data: statistikkInfoList } = fetchState;

  const getClassNamesFor = (name: keyof StatistikkInfo) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const { items, requestSort, sortConfig } = useTableSorting<StatistikkInfo>(
    statistikkInfoList
      ? statistikkInfoList.map((item) => {
          if (typeof item.antall_feil === "string")
            item.antall_feil = parseInt(item.antall_feil);
          return item;
        })
      : null
  );

  return (
    <div className="App">
      <div className="row">
        <div className="column">
          <table id={"timetable"}>
            <tr>
              <th>Fra og med dato:</th>
              <th>
                <Datepicker
                  locale={"nb"}
                  inputId="datepicker-input-fom"
                  value={fom}
                  onChange={setFom}
                  inputProps={{
                    name: "dateInput",
                    "aria-invalid":
                      fom !== "" && isISODateString(fom) === false,
                  }}
                  calendarSettings={{ showWeekNumbers: false }}
                  showYearSelector={true}
                />
              </th>
              <th>
                <TimePicker
                  onChange={(value) =>
                    typeof value === "string"
                      ? setFromTime(value)
                      : setFromTime(value.toLocaleTimeString())
                  }
                  value={fromTime}
                />
              </th>
            </tr>
            <tr>
              <th>Til og med:</th>
              <th>
                <Datepicker
                  locale={"nb"}
                  inputId="datepicker-input-tom"
                  value={tom}
                  onChange={setTom}
                  inputProps={{
                    name: "dateInput",
                    "aria-invalid":
                      tom !== "" && isISODateString(tom) === false,
                  }}
                  calendarSettings={{ showWeekNumbers: false }}
                  showYearSelector={true}
                />
              </th>
              <th>
                <TimePicker
                  onChange={(value) =>
                    typeof value === "string"
                      ? setToTime(value)
                      : setToTime(value.toLocaleTimeString())
                  }
                  value={toTime}
                />
              </th>
            </tr>
          </table>
        </div>
      </div>
      <table className="tabell tabell--stripet">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                onClick={() => requestSort("hendelsesbeskrivelse")}
                className={getClassNamesFor("hendelsesbeskrivelse")}
              >
                Hendelse
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => requestSort("antall_feil")}
                className={getClassNamesFor("antall_feil")}
              >
                Antall
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            items.map((message, index) => {
              return (
                <tr>
                  <td>{message.hendelsesbeskrivelse}</td>
                  <td>{message.antall_feil}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {loading && <NavFrontendSpinner />}
      {error?.message && <p>{error.message}</p>}
    </div>
  );
};

export default FeilStatistikk;
