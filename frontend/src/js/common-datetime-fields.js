$(function() {
    /*$('.date-input').datepick({
    	dateFormat: 'dd.mm.yyyy',
    	showAnim: "show", 
    	showTrigger: '#calImg',
    	firstDay: 1,
    	useMouseWheel: true,
    	onClose: function(dates) {$(this).closest("form").change();}
    });*/
	$('.date-input').datepicker({
		showButtonPanel: true,
		changeMonth: true,
		changeYear: true,
		buttonImage: "images/calendar.gif",
		showOn: "both",
    	dateFormat: 'dd.mm.yy',
    	firstDay: 1,
    	buttonImageOnly: true
    }, $.datepicker.regional["no"]);
    $.validator.addMethod("timeInput", function(value, element) {
    	return this.optional(element) ||
    		/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value);
    }, '<spring:message code="time.validation.msg" />');
    $.validator.addMethod("dateInput", function(value, element) {
    	return this.optional(element) ||
    		/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.(19[0-9][0-9]|2[0-9][0-9][0-9])$/.test(value);
    }, '<spring:message code="date.validation.msg" />');
    $.validator.addClassRules({
    	"date-input": {
    		dateInput: true
    	},
    	"time-input": {
    		timeInput: true
    	}
    });
});

function enableOrDisableInputOnChange(inputSelector) {
	var frm = $(inputSelector).closest("form");
	$(frm).on('change keyup', function() {
		if ($(frm).validate().form()) {
			$(inputSelector).removeClass("disabled").attr('disabled', false);
		} else {
			$(inputSelector).addClass("disabled").attr('disabled', true);
		}
	});
}

function clr() {
	$('[name=todate]').val('');
	$('[name=totime]').val('');
	setDefaultFromDate();
	$('[name=todate]').closest('form').change();
}

function setDefaultFromDate() {
	setFromDate(-86400000);
}
	
function setLastHourFromDate() {
	$('[name=todate]').val('');
	$('[name=totime]').val('');
	setFromDate(-3600000);
}

function initDateFields() {
	$('[name=fromdate]').val(getParam('fromDate'));	
	$('[name=fromtime]').val(getParam('fromTime'));
	$('[name=todate]').val(getParam('toDate'));
	$('[name=totime]').val(getParam('toTime'));
	var pg = window.location.pathname;
	if ($('[name=fromdate]').val() == '') {
		if ('undefined' === typeof sessvars[pg + '.fromdate']) {
			setDefaultFromDate();
		} else {
			$('[name=fromdate]').val(sessvars[pg + '.fromdate']);
		} 
	}
	if ($('[name=fromtime]').val() == '') {
		$('[name=fromtime]').val(sessvars[pg + '.fromtime']);
	}
	if ($('[name=todate]').val() == '') {
		$('[name=todate]').val(sessvars[pg + '.todate']);
	}
	if ($('[name=totime]').val() == '') {
		$('[name=totime]').val(sessvars[pg + '.totime']);
	}
}

function storeDateTime() {
	var pg = window.location.pathname;
	sessvars[pg + '.fromdate'] = $('[name=fromdate]').val();
	sessvars[pg + '.fromtime'] = $('[name=fromtime]').val();
	sessvars[pg + '.todate'] = $('[name=todate]').val();
	sessvars[pg + '.totime'] = $('[name=totime]').val();
}


function setFromDate(v) {
	var date = new Date();
	var d = date.getTime();
	date.setTime(d + v);
	$('[name=fromdate]').val(date.format("dd.MM.yyyy"));
	$('[name=fromtime]').val(date.format("HH:mm:ss"));
	storeDateTime();
}
