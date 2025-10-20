/*
 * sends bUnknownTableSize value to server (only relevant if bServerSide is true)
 */
(function($, window, document) {
	var initialized = [];
	
	function addCallbacks(oDTSettings) {
		var ndx = oDTSettings.nTable.id;
		if (initialized[ndx] === undefined) {
			initialized[ndx] = true;
			if (oDTSettings.oFeatures.bServerSide) {
	            var fnServerDataOriginal = oDTSettings.fnServerData;
	            oDTSettings.fnServerData = function (sSource, aoData, fnCallback) {
	            	aoData.push({"name": "bUnknownTableSize", "value": true});
	            	if (fnServerDataOriginal != null) {
	                    fnServerDataOriginal(sSource, aoData, fnCallback);
	                } else {
	                    $.getJSON(sSource, aoData, function (json) {
	                        fnCallback(json);
	                    });
	                }
	             }
			 }	
		}
	}
	
	if (typeof $.fn.dataTable == "function"
			&& typeof $.fn.dataTableExt.fnVersionCheck == "function"
			&& $.fn.dataTableExt.fnVersionCheck('1.9.0')) {
		$.fn.dataTableExt.aoFeatures.push({
			"fnInit" : function(oDTSettings) {
				if (oDTSettings.oFeatures.bServerSide) {
					addCallbacks(oDTSettings);
				}
				return;
			},
			"cFeature" : "U",
			"sFeature" : "UnknownTableSize"
		});
	} else {
		alert("Warning: UnknownTableSize requires DataTables 1.9.0 or greater - www.datatables.net/download");
	}
})(jQuery, window, document);
