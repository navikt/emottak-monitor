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
	            	 var val = $(oTbl).parent().find('[name=filtermethods]').find('option:selected').eq(0).val();
	            	 aoData.push({"name": "sFilterMethod", "value": val});
	            	 if (fnServerDataOriginal != null) {
	                     fnServerDataOriginal(sSource, aoData, fnCallback);
	                 }
	                 else {
	                     $.getJSON(sSource, aoData, function (json) {
	                         fnCallback(json);
	                     });
	                 }
	             }
			 }	
		}
	}
	
	function getselect(oDTSettings) {
		var sTxt = oDTSettings.oLanguage.oFilterMethod.sMethod === undefined ? 'which ' : oDTSettings.oLanguage.oFilterMethod.sMethod;
		var sEquals = oDTSettings.oLanguage.oFilterMethod.sEquals === undefined ? 'equals' : oDTSettings.oLanguage.oFilterMethod.sEquals;
		var sStartsWith = oDTSettings.oLanguage.oFilterMethod.sStartsWith === undefined ? 'starts with' : oDTSettings.oLanguage.oFilterMethod.sStartsWith;
		var sContains = oDTSettings.oLanguage.oFilterMethod.sContains === undefined ? 'contains' : oDTSettings.oLanguage.oFilterMethod.sContains;
		var txt = "<select name='filtermethods'><option value='EQUALS'>";
		txt += sEquals + "</option><option value='STARTSWITH'>";
		txt += sStartsWith + "</option><option value='CONTAINS'>";
		txt += sContains + "</option></select>";
		sTxt = (sTxt.indexOf('_INPUT_') !== -1) ?
			sTxt.replace('_INPUT_', txt) :
			sTxt === "" ? txt : sTxt + txt;
		var ltxt = "<label> " + sTxt + " </label>";
		var nSelect = document.createElement('div');
		nSelect.className = 'dataTables_filtermethod';
		nSelect.innerHTML = ltxt;
		var nqSlct = $('select', nSelect);
		// Store a reference to the select element, so other input elements could be
        // added to the filter wrapper if needed
		nSelect._DT_Select = nqSlct[0];
		var selected = oDTSettings.oLoadedState != null && oDTSettings.oLoadedState.sFilterMethod !== undefined ? oDTSettings.oLoadedState.sFilterMethod : 'EQUALS';
		$(nSelect._DT_Select).val(selected);
		$(nqSlct).on('change', function(e) {
			var n = oDTSettings.aanFeatures.M;
			var val = $(this).has('option:selected').val();
            for (var i = 0, iLen = n.length; i < iLen; i++) {
            	if (n[i] != $(this).parents('div.dataTables_filtermethods')[0]) {
            		$(n[i]._DT_Select).val(val);
                }
            }
		});
		oDTSettings.oInstance.on('stateSaveParams', function(e, oSettings, oData) {
			oData.sFilterMethod = $(oSettings.nTable).parent().find('[name=filtermethods] option:selected').eq(0).val();
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
			"cFeature" : "M",
			"sFeature" : "FilterMethod"
		});
	} else {
		alert("Warning: FilterMethod requires DataTables 1.9.0 or greater - www.datatables.net/download");
	}
})(jQuery, window, document);
