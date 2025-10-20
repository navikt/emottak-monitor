// common stuff for statistics

var type = '';
export function setDefaultFromDate() {
	resetFields();
	setFromDate(-86400000);
}

export function setLastHourFromDate() {
	setFromDate(-3600000);
	$('[name=period]').val('HH');
}

export function initFields() {
	initDateFields();
	initField('[name=period]', 'period', 'MM');
	initField('[name=statustype]', 'statustype', '-1');
	populateAndSelectRSA();
	enableOrDisableInputOnChange('input.search');
	enableOrDisableInputOnChange('input.excel');
}

export function resetFields() {
	clr();
	clearSelectedDropdownlistValues(['role','service','action','period']);
	resetDropdowns(
		['[name=role]', '[name=service]', '[name=action]', '[name=period]', '[name=statustype]'],
		['', '', '', 'MM', '-1']
	);
	console.log('Parviz');
}

export function getDtFormat() {
	var f = $('[name=period]').val();
	var fmt = 'MM.yyyy';
	if (f == 'YY') {
		fmt = 'yyyy';
	} else if (f == "DD") {
		fmt = 'dd.MM.yyyy';
	} else if (f == "HH" || f == "MI" || f == "XX") {
		fmt = 'dd.MM.yyyy HH:mm:ss';
	}
	return fmt;
}

export function graphit() {
	graphData = [];
	var length = oTable.fnSettings().aoData.length;
	if (length == 0) {
		$("#graph").hide();
	} else {
		var bw = 3600000; // 1 hour barwidth;
		bw = bw * periodWidth[$('[name=period]').get(0).selectedIndex];
		$("#graph").show();
		for (var i = 0; i < length; i++) {
			var aRow = oTable.fnGetData(i);
			var aTmp = [aRow[1], aRow[2]];
			graphData.push(aTmp);
		}
		$.plot($("#graph"), [{data: graphData, bars: {show: true, fill: true, barWidth: bw, lineWidth: 1}}], graphOptions);
	}
}

var oTable;
var graphData = [];
var graphOptions = {
	colors: ["#13a", "#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
	crosshair: { mode: "x" },
	grid: {hoverable: true, autoHighlight: false, borderWidth: 1},
	xaxis: {mode: "time", monthNames: ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"] }
}
var periodWidth = [24 * 365, 24 * 90, 24 * 28, 24, 1, 0.016];
var previousPoint = null;
export function showTooltip(x, y, contents) {
	$('<div id="graphttip">' + contents + '</div>').css( {
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#fee',
		opacity: 0.80,
		'font-size': '10px'
	}).appendTo("body").fadeIn(200);
}

export function initTable() {
	initFields();
	populateAndSelectRSA();
	populateAndSelectDropdownlist('period', '[name=period]', 'secure/stat/j/periods.json', false, 'MM', false, true);
	populateAndSelectDropdownlist('statustype', '[name=statustype]', 'secure/weblog/j/statustypes.json', true, '-1', false, true);
	oTable = $('#stat').dataTable({
		"aaSorting": [[0, 'desc']],
		"iDisplayLength": 500,
		"aLengthMenu": [10, 25, 50, 100, 250, 500, 1000],
		"bServerSide": true,
		"sDom": '<"top"lpir>t<"spacer"><"bottom"lpir>',
		"sAjaxSource": "secure/stat/j/stat.json",
		"fnServerData": function(sSource, aoData, fnCallback) {
			aoData.push({"name": "type", "value": type});
			aoData.push({"name": "fromdate", "value": $('[name=fromdate]').val()});
			aoData.push({"name": "fromtime", "value": $('[name=fromtime]').val()});
			aoData.push({"name": "todate", "value": $('[name=todate]').val()});
			aoData.push({"name": "totime", "value": $('[name=totime]').val()});
			aoData.push({"name": "role", "value": exist($('[name=role] option:selected').val(), '')});
			aoData.push({"name": "service", "value": exist($('[name=service] option:selected').val(), '')});
			aoData.push({"name": "action", "value": exist($('[name=action] option:selected').val(), '')});
			aoData.push({"name": "period", "value": exist($('[name=period] option:selected').val(), 'MM')});
			aoData.push({"name": "statustype", "value": exist($('[name=statustype] option:selected').val(), '')});
			$.ajax({
				"dataType": 'json',
				"type": "POST",
				"url": sSource,
				"data": aoData,
				"success": fnCallback
			});
		},
		"fnDrawCallback": function(oSettings) {
			graphit();
		},
		"fnFooterCallback": function(nRow, aaData, iStart, iEnd, aiDisplay) {
			var iTotal = 0;
			for (var i = 0; i < aaData.length; i++) {
				iTotal += aaData[i][2] * 1;
			}
			var nCells = nRow.getElementsByTagName('th');
			nCells[1].innerHTML = iTotal;
		},
		"aoColumns": [
			/* date */ { "sClass": "right" },
			/* hidden timestamp */ { bVisible: false },
			/* count */  { "sClass": "right" }

		]
	});
	$('#excel').on('click', function() {
		var url = 'secure/stat/download.htm';
		postToUrl(url, {
			"fromdate": $('[name=fromdate]').val(),
			"fromtime": $('[name=fromtime]').val(),
			"todate": $('[name=todate]').val(),
			"totime": $('[name=totime]').val(),
			"role": $('[name=role] option:selected').val(),
			"service": $('[name=service] option:selected').val(),
			"action": $('[name=action] option:selected').val(),
			"period": $('[name=period] option:selected').val(),
			"status": $('[name=statustype] option:selected').val(),
			"type": type
		});
	});


	$("#graph").on("plothover", function (event, pos, item) {
		$("#x").text(pos.x);
		$("#y").text(pos.y);

		if (item) {
			if (previousPoint != item.dataIndex) {
				previousPoint = item.dataIndex;
				$("#graphttip").remove();
				var x = item.datapoint[0],
					y = item.datapoint[1];

				showTooltip(item.pageX, item.pageY, dateFormat(new Date(x), getDtFormat())+ ": " + y);
			}
		} else {
			$("#graphttip").remove();
			previousPoint = null;
		}
	});

	$(window).resize(function(){
		graphit();
	});
}