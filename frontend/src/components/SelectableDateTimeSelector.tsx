import { Datepicker, isISODateString } from "nav-datovelger";
import React, {ChangeEvent} from "react";
import TimePicker from "react-time-picker";

type FilterProps<T, K extends keyof T> = {
  showFromField: boolean;
  showToField: boolean;
  setShowFromField: (value: boolean) => void;
  setShowToField: (value: boolean) => void;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  onFromDateChange: (value: string) => void;
  onFromTimeChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onToTimeChange: (value: string) => void;
  onFromTimeBlur?: () => void;
  onToTimeBlur?: () => void;
};

const SelectableDateTimeSelector = <T, K extends keyof T>({
  showFromField,
  showToField,
  setShowFromField,
  setShowToField,
  fromDate,
  fromTime,
  toDate,
  toTime,
  onFromDateChange,
  onFromTimeChange,
  onToDateChange,
  onToTimeChange,
  onFromTimeBlur,
  onToTimeBlur
}: FilterProps<T, K>) => {
    const handleCheckboxChange =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setter(e.target.checked);
            };
  return (
    <div>
        <input
            id="checkbox-input-fom"
            type="checkbox"
            checked={ showFromField }
            onChange={ handleCheckboxChange(setShowFromField) } />
        <label
            className="navds-select__label navds-label navds-label--small"
            htmlFor="checkbox-input-fom"
        >Fra og med</label>
        {showFromField && (
          <div
            style={{
              gridArea: "fromTime",
            }}
          >
            <div style={{ display: "flex", marginTop: "0.5rem" }}>
              <Datepicker
                locale={"nb"}
                inputId="datepicker-input-fom"
                value={fromDate}
                onChange={onFromDateChange}
                inputProps={{
                  name: "dateInput",
                  "aria-invalid":
                    fromDate !== "" && isISODateString(fromDate) === false,
                }}
                calendarSettings={{ showWeekNumbers: false }}
                showYearSelector={true}
              />
              <TimePicker
                onChange={(value) => {
                  if (value !== null) {
                    typeof value === "string"
                      ? onFromTimeChange(value)
                      : onFromTimeChange(value.toLocaleTimeString());
                  }
                }}
                onBlur={onFromTimeBlur ?? (() => {})}
                value={fromTime}
                format="HH:mm"
              />
            </div>
          </div>
        )}
        <br/>
        <input
            id="checkbox-input-tom"
            type="checkbox"
            checked={ showToField }
            onChange={ handleCheckboxChange(setShowToField) } />
        <label
            className="navds-select__label navds-label navds-label--small"
            htmlFor="checkbox-input-tom"
        >Til og med</label>
        {showToField && (
          <div
            style={{
              gridArea: "toTime",
            }}
          >
            <div style={{ display: "flex", marginTop: "0.5rem" }}>
              <Datepicker
                locale={"nb"}
                inputId="datepicker-input-tom"
                value={toDate}
                onChange={onToDateChange}
                inputProps={{
                  name: "dateInput",
                  "aria-invalid":
                    toDate !== "" && isISODateString(toDate) === false,
                }}
                calendarSettings={{ showWeekNumbers: false }}
                showYearSelector={true}
              />
              <TimePicker
                onChange={(value) => {
                  if (value !== null) {
                    typeof value === "string"
                      ? onToTimeChange(value)
                      : onToTimeChange(value.toLocaleTimeString());
                  }
                }}
                onBlur={onToTimeBlur ?? (() => {})}
                value={toTime}
                format="HH:mm"
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default SelectableDateTimeSelector;
