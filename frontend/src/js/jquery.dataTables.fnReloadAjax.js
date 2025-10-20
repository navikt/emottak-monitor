// assumes bServerSide = false and ajax method is post
$.fn.dataTableExt.oApi.fnAddDataAndReloadAjax = function (oSettings, aoNewData, sNewSource) {
	if (typeof sNewSource != 'undefined') {
		oSettings.sAjaxSource = sNewSource;
	}
	this.oApi._fnProcessingDisplay( oSettings, true );
	var that = this;
	if (typeof aoNewData != 'undefined' && aoNewData.length > 0) {
		var i = 0;
		oSettings.aoData = [];
		for (i = 0; i < aoNewData.length; i++) {
			oSettings.aoData.push({"name": aoNewData[i][0], "value": aoNewData[i][1]});	
		}
	}
	$.ajax({
		"dataType": 'json',
		"type": "POST",
		"url": oSettings.sAjaxSource, 
		"data": oSettings.aoData,
		"success": function(json) {
			that.fnClearTable(that);
			hideErrors();
			// got the data, add it the table
			if ( typeof json.iTotalDisplayRecords == "number" && json.iTotalDisplayRecords > 0) {
				if ( typeof json.aaData[0] == "object" ) {
					for ( var i=0 ; i<json.aaData.length ; i++ ) {
						that.oApi._fnAddData( oSettings, json.aaData[i] );
					}
				} else {
					 that.oApi._fnAddData( oSettings, json.aaData );
				}
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			}
			that.fnDraw(that);
			that.oApi._fnProcessingDisplay( oSettings, false );
		}
	});
	
}

// assumes bServerSide = false and ajax method is post
$.fn.dataTableExt.oApi.fnReloadAjax = function (oSettings, sNewSource) {
	if (typeof sNewSource != 'undefined') {
		oSettings.sAjaxSource = sNewSource;
	}
	this.oApi._fnProcessingDisplay( oSettings, true );
	var that = this;
	that.fnClearTable(that);
	$.ajax({
		"dataType": 'json',
		"type": "POST",
		"url": oSettings.sAjaxSource, 
		"data": oSettings.aoData,
		"success": function(json) {
			that.fnClearTable(that);
			// got the data, add it the table
			if ( typeof json.aaData[0] == "object" ) {
				for ( var i=0 ; i<json.aaData.length ; i++ ) {
					that.oApi._fnAddData( oSettings, json.aaData[i] );
				}
			} else {
				 that.oApi._fnAddData( oSettings, json.aaData );
			}
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			that.fnDraw(that);
			that.oApi._fnProcessingDisplay( oSettings, false );
		}
	});
	
}

export default test