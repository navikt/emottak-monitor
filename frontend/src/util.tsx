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

function ISODate(date: Date = new Date()) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let dayString = day < 10 ? "0" + day : day.toString();
  let monthString = month < 10 ? "0" + month : month.toString();
  return year + "-" + monthString + "-" + dayString;
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

export const isProdEnv = import.meta.env.VITE_DEPLOY_TARGET === 'prod';
