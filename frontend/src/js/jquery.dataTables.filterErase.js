/*
 * erases filter, filterColumn, filterMethod and filterCaseInsensitive and resets to default settings  
 */
(function($, window, document) {
	var initialized = [];

	function addIconWithCallback(oDTSettings) {
		var ndx = oDTSettings.nTable.id;
			var nImg = document.createElement('img');
			nImg.setAttribute('src', oDTSettings.oLanguage.sFilterEraseSource === undefined ? 'images/erase.gif' : oDTSettings.oLanguage.sFilterEraseSource);
			nImg.className = 'dataTables_filtererase';
			var nqImg = $('img', nImg);
			// Store a reference to the img element, so other input elements could be
	        // added to the filter wrapper if needed
			nImg._DT_Img = nqImg[0];
			var oTbl = oDTSettings.nTable;
			$(nImg).on('click', function(e) {
				var oPar = $(oTbl).parent();
				$(oPar).find('[name=filtercolumns]').val('').change();
				$(oPar).find('[name=filtermethods]').val('EQUALS').change();
				$(oPar).find('[name=filtercaseinsensitive]').prop('checked', false);
				$(oTbl).dataTable().fnFilter('');
			});
			nqImg.attr('aria-controls', oDTSettings.sTableId)
			return nImg;
	};
	
	if (typeof $.fn.dataTable == "function"
			&& typeof $.fn.dataTableExt.fnVersionCheck == "function"
			&& $.fn.dataTableExt.fnVersionCheck('1.9.0')) {
		$.fn.dataTableExt.aoFeatures.push({
			"fnInit" : function(oDTSettings) {
				return addIconWithCallback(oDTSettings);
			},
			"cFeature" : "E",
			"sFeature" : "FilterErase"
		});
	} else {
		alert("Warning: FilterErase requires DataTables 1.9.0 or greater - www.datatables.net/download");
	}
})(jQuery, window, document);
