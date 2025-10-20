var mTable;
$(document).ready(function() {
	$('#menu_diag').addClass('active-menu');

	mTable = $('#mail').dataTable({
		"sAjaxSource": "secure/mail/j/mboxes.json",
		"aoColumns": [
			/* icon */ { "bSortable": false, "sClass": "center status unsortable" },
			/* address. */ null,
			/* folder */ null,
			/* host */ null,
			/* port  */ { "sClass": "right", "sWidth": "30px", "sType": "numeric" },
			/* protocol */ { "sWidth": "60px" },
			/* # messages */ { "sClass": "right", "sWidth": "50px", "sType": "numeric" },
			/* # new */ { "sClass": "right", "sWidth": "50px", "sType": "numeric" },
			/* # unread */ { "sClass": "right", "sWidth": "50px", "sType": "numeric" },
			/* error  */ null
		],
		"fnServerData": function(sSource, aoData, fnCallback) { 
			$.ajax({
				"dataType": 'json',
				"type": "POST",
				"url": sSource, 
				"data": aoData,
				"success": fnCallback
			});
		}
	});
});
