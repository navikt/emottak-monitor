/*
 * adds a checkbox indicating case-insensitive search (only relevant if bServerSide is true) and sends variable bCaseInsesitiveSearch to the server 
 */
(function($, window, document) {
	var initialized = [];
	
	function addCallbacks(oDTSettings) {
		var ndx = oDTSettings.nTable.id;
		if (initialized[ndx] === undefined) {
			initialized[ndx] = true;
			if (oDTSettings.oFeatures.bServerSide) {
	            var fnServerDataOriginal = oDTSettings.fnServerData;
	            var oTbl = oDTSettings.nTable;
	            oDTSettings.fnServerData = function (sSource, aoData, fnCallback) {
	            	var val = $(oTbl).parent().find('[name=filtercaseinsensitive]').eq(0).prop('checked');
	            	aoData.push({"name": "bFilterCaseInsensitive", "value": val});
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
	
	function getchkbx(oDTSettings) {
		var sTxt = oDTSettings.oLanguage.sFilterCaseInsensitive === undefined ? 'in' : oDTSettings.oLanguage.sFilterCaseInsensitive;
		var txt = "<input type='checkbox' name='filtercaseinsensitive'/>";
		sTxt = (sTxt.indexOf('_INPUT_') !== -1) ?
			sTxt.replace('_INPUT_', txt) :
			sTxt === "" ? txt : sTxt + txt;
		var ltxt = "<label> " + sTxt + " </label>";
		var nChkbx = document.createElement('div');
		nChkbx.className = 'dataTables_filtercase';
		nChkbx.innerHTML = ltxt;
		var nqChkbx = $('input', nChkbx);
		nChkbx._DT_Check = nqChkbx[0];
		var checked = oDTSettings.oLoadedState != null && oDTSettings.oLoadedState.bFilterCaseInsensitive !== undefined ? oDTSettings.oLoadedState.bFilterCaseInsensitive : false;
		$(nChkbx._DT_Check).prop('checked', checked);
		$(nqChkbx).on('change', function(e) {
			var n = oDTSettings.aanFeatures.I;
			var val = $(this).prop('checked');
            for (var i = 0, iLen = n.length; i < iLen; i++) {
            	if (n[i] != $(this).parents('div.dataTables_filtercase')[0]) {
            		$(n[i]._DT_Check).prop('checked', val);
                }
            }
		});
		oDTSettings.oInstance.on('stateSaveParams', function(e, oSettings, oData) {
			oData.bFilterCaseInsensitive = $(oDTSettings.nTable).parent().find('[name=filtercaseinsensitive]').eq(0).prop('checked');
		});
		nqChkbx.attr('aria-controls', oDTSettings.sTableId)
		addCallbacks(oDTSettings);
		return nChkbx;
	};
	
	if (typeof $.fn.dataTable == "function"
			&& typeof $.fn.dataTableExt.fnVersionCheck == "function"
			&& $.fn.dataTableExt.fnVersionCheck('1.9.0')) {
		$.fn.dataTableExt.aoFeatures.push({
			"fnInit" : function(oDTSettings) {
				if (!oDTSettings.oFeatures.bServerSide) {
					return;
				}
				return getchkbx(oDTSettings);
			},
			"cFeature" : "I",
			"sFeature" : "FilterCaseInsensitive"
		});
	} else {
		alert("Warning: FilterCaseInsensitive requires DataTables 1.9.0 or greater - www.datatables.net/download");
	}
})(jQuery, window, document);
