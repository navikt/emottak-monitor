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
	            	 var val = $(oTbl).parent().find('[name=filtercolumns]').find('option:selected').eq(0).val();
	            	 aoData.push({"name": "sFilterColumn", "value": val});
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
	
	function getselect(oDTSettings) {
		var sTxt = oDTSettings.oLanguage.sFilterColumnsIn === undefined ? 'in ' : oDTSettings.oLanguage.sFilterColumnsIn;
		var txt = "<select name='filtercolumns'><option value=''></option>";
		for (var i = 0; i < oDTSettings.aoColumns.length; i++) {
			var col = oDTSettings.aoColumns[i];
			if (col.bSearchable && col.sName !== '') {
				var sDisp = col.sDisplayName !== undefined ? col.sDisplayName : col.sName;
				txt += "<option value='" + col.sName + "'>" + sDisp + "</option>"
			}
		}
		txt += "</select>";
		sTxt = (sTxt.indexOf('_INPUT_') !== -1) ?
			sTxt.replace('_INPUT_', txt) :
			sTxt === "" ? txt : sTxt + txt;
		var ltxt = "<label> " + sTxt + " </label>";
		var nSelect = document.createElement('div');
		nSelect.className = 'dataTables_filtercols';
		nSelect.innerHTML = ltxt;
		var nqSlct = $('select', nSelect);
		// Store a reference to the select element, so other input elements could be
        // added to the filter wrapper if needed
		nSelect._DT_Select = nqSlct[0];
		var selected = oDTSettings.oLoadedState != null && oDTSettings.oLoadedState.sFilterColumn !== undefined ? oDTSettings.oLoadedState.sFilterColumn : '';
		$(nSelect._DT_Select).val(selected);
		$(nqSlct).on('change', function(e) {
			var n = oDTSettings.aanFeatures.C;
			var val = $(this).has('option:selected').val();
            for (var i = 0, iLen = n.length; i < iLen; i++) {
            	if (n[i] != $(this).parents('div.dataTables_filtercols')[0]) {
            		$(n[i]._DT_Select).val(val);
                }
            }
		});
		oDTSettings.oInstance.on('stateSaveParams', function(e, oSettings, oData) {
			oData.sFilterColumn = $(oSettings.nTable).parent().find('[name=filtercolumns] option:selected').eq(0).val();
		});
		nqSlct.attr('aria-controls', oDTSettings.sTableId)
		addCallbacks(oDTSettings);
		return nSelect;
	};
	
	if (typeof $.fn.dataTable == "function"
			&& typeof $.fn.dataTableExt.fnVersionCheck == "function"
			&& $.fn.dataTableExt.fnVersionCheck('1.9.0')) {
		$.fn.dataTableExt.aoFeatures.push({
			"fnInit" : function(oDTSettings) {
				if (!oDTSettings.oFeatures.bServerSide) {
					return;
				}
				return getselect(oDTSettings);
			},
			"cFeature" : "C",
			"sFeature" : "FilterColumns"
		});
	} else {
		alert("Warning: FilterColumns requires DataTables 1.9.0 or greater - www.datatables.net/download");
	}
})(jQuery, window, document);
