function ISODate() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let dayString = day < 10 ? "0" + day : day.toString();
  let monthString = month < 10 ? "0" + month : month.toString();

  return year + "-" + monthString + "-" + dayString;
}

function initialDate(dateParam: string | null) {
  if (dateParam) {
    return dateParam;
  } else {
    return ISODate();
  }
}

function initialTime(timeParam: string | null) {
  if (timeParam) {
    return timeParam;
  } else {
    return new Date().toLocaleTimeString();
  }
}

function initialFilter(filterString: string | null) {
  if (filterString) {
    return filterString;
  } else {
    return "";
  }
}

const isDevelopmentEnv = () => process.env.NODE_ENV === "development";

export { initialDate, initialTime, initialFilter, isDevelopmentEnv };
