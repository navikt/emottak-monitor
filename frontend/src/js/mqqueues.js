var manager = -1;
var type = -1;
var oTable;
$(document).ready(function() {
	$('#menu_diag').addClass('active-menu');
	populateAndSelectDropdownlist('qmanager', '[name=manager]', 'secure/mq/j/qmanagers.json', true, "-1", false, true);
	populateAndSelectDropdownlist('qtype', '[name=type]', 'secure/mq/j/qtypes.json', true, "-1", false, true);
	oTable = $('#queues').dataTable({
		"iDisplayLength": 50,
		"bStateSave": true,
		"aaSorting": [[4, 'desc']],
		"sAjaxSource": "secure/mq/j/queues.json",
		"aoColumns": [
			/* icon */ { "bSortable": false, "sClass": "center status unsortable" },
			/* name. */ null,
			/* manager. */ null,
			/* type */ { "sWidth": "70px" },
			/* depth */ { "sClass": "right", "sWidth": "35px", "sType": "numeric" },
			/* maxdepth */ { "sClass": "right", "sWidth": "35px", "sType": "numeric" },
			/* openincputcount */ { "sClass": "right", "sWidth": "35px", "sType": "numeric" },
			/* maxmsglength */ { "sClass": "right", "sWidth": "35px", "sType": "numeric" },
			/* error  */ null
		],
		"fnServerData": function(sSource, aoData, fnCallback) {
			aoData = []; // this must be set when using bServerSide is false
			aoData.push({"name": "manager", "value": exist($('[name=manager] option:selected').val(), -1)});
			aoData.push({"name": "type", "value": exist($('[name=type] option:selected').val(), 1)});
			$.ajax({
				"dataType": 'json',
				"type": "POST",
				"url": sSource, 
				"data": aoData,
				"success": fnCallback
			});
		}
	});
	
	$('[name=manager]').change(function() {
		refreshMQ();
	});

	$('[name=type]').change(function() {
		refreshMQ();
	});
});

function refreshMQ() {
	// reload the data based on selection
	var aoNewData = [
		["manager", $('[name=manager] option:selected').val()], 
		["type", $('[name=type] option:selected').val()]
	];
	oTable.fnAddDataAndReloadAjax(aoNewData);
}

