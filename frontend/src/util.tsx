import React from "react";
import $ from 'jquery';

export const toggleAllExpandables = (image: JQuery, selector: JQuery): void => {
    if (image.hasClass('collapsible')) {
        image.hide();
        image.prev().show();
    } else {
        image.hide();
        image.next().show();
    }
    selector.each(function(this: HTMLElement) {
        this.click();
    });
};

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function ISODate(date: Date = new Date()) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return year + "-" + pad(month) + "-" + pad(day);
}

export function ISODatetime(date: Date = new Date()) {
    return ISODate(date) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

export function initialFromDate(dateParam: string | null) {
  if (dateParam) {
    return dateParam;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return ISODate(yesterday);
  }
}

export function initialToDate(dateParam: string | null) {
  if (dateParam) {
    return dateParam;
  } else {
    return ISODate();
  }
}

export function initialTime(timeParam: string | null) {
  if (timeParam) {
    return timeParam;
  } else {
    return new Date().toLocaleTimeString();
  }
}

export function formatDatetime(datetimeParam: string | undefined) {
  if (datetimeParam == undefined || datetimeParam.indexOf("T") == -1) return datetimeParam;
  return datetimeParam.replace("T", " ").substring(0, 23);
}

export function convertDatetimeToUTC(datetimeParam: string) {
  if (datetimeParam == undefined) return datetimeParam;
  // TODO: Lage en mer robust konvertering fra Europe/Oslo til UTC
  let dateString = datetimeParam.replace(" ", "T");
  dateString = dateString.split(".")[0] + ".000Z"; // Null ut millisekunder, og legg på Z bakerst
  let utcDate = new Date(dateString);
  utcDate.setHours(utcDate.getHours()-2); // Trekk fra 2 timer, også om vinteren..?
  return utcDate.toISOString();
}

export const isProdEnv = import.meta.env.VITE_DEPLOY_TARGET === 'prod';
