function ISODate() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    if (month < 10) {
        month = '0' + month
    }
    let day = date.getDate()
    if (day < 10) {
        day = '0' + day
    }
    return year + '-' + month + '-' + day
}

function initialDate(dateParam) {
    if(dateParam) {
        return dateParam
    } else {
        return ISODate()
    }
}

function initialTime(timeParam) {
    if(timeParam) {
        return timeParam
    } else {
        return new Date().toLocaleTimeString() + ''
    }
}

function initialFilter(filterString) {
    if(filterString) {
        return filterString
    } else {
        return ''
    }
}


export { initialDate, initialTime, initialFilter};