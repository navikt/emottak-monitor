import React from "react";

const Cog = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M23.5 10h-2.854c-.2-.79-.454-1.667-.778-2.332L21.9 5.636a.498.498 0 0 0 0-.708l-2.83-2.826a.499.499 0 0 0-.707 0l-2.032 2.031c-.665-.324-1.542-.578-2.331-.777V.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v2.856c-.789.199-1.666.453-2.331.777L5.637 2.102a.499.499 0 0 0-.707 0L2.101 4.929a.5.5 0 0 0 0 .707l2.033 2.033c-.323.662-.578 1.54-.779 2.331H.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h2.855c.2.791.455 1.668.778 2.331L2.1 18.364a.5.5 0 0 0 0 .708L4.93 21.9c.188.188.52.188.707 0l2.032-2.032c.663.322 1.54.577 2.331.778V23.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2.854c.791-.201 1.668-.456 2.331-.778l2.034 2.032a.5.5 0 0 0 .707 0l2.827-2.828a.499.499 0 0 0 0-.707l-2.032-2.033c.323-.663.578-1.54.778-2.331H23.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.501zM12 16c-2.205 0-4-1.795-4-4s1.795-4 4-4c2.206 0 4 1.795 4 4s-1.794 4-4 4z" />
  </svg>
);

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

export { initialDate, initialTime, initialFilter, Cog };
