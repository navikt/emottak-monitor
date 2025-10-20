$.fn.dataTableExt.oPagination.four_buttons = {
	"fnInit": function ( oSettings, nPaging, fnCallbackDraw ) {
		var oLang = oSettings.oLanguage.oPaginate;
		var oClasses = oSettings.oClasses;
		var fnClickHandler = function ( e ) {
			if ( oSettings.oApi._fnPageChange( oSettings, e.data.action ) )
			{
				fnCallbackDraw( oSettings );
			}
		};

		$(nPaging).append(
			'<a  tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageFirst+'">'+oLang.sFirst+'</a>'+
			'<a  tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPagePrevious+'">'+oLang.sPrevious+'</a>'+
			'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageNext+'">'+oLang.sNext+'</a>' + 
			'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageLast+'">'+oLang.sLast+'</a>'
		);
		var els = $('a', nPaging);
		var nFirst = els[0],
			nPrev = els[1],
			nNext = els[2],
			nLast = els[3];
		
		oSettings.oApi._fnBindAction( nFirst, {action: "first"},    fnClickHandler );
		oSettings.oApi._fnBindAction( nPrev,  {action: "previous"}, fnClickHandler );
		oSettings.oApi._fnBindAction( nNext,  {action: "next"},     fnClickHandler );
		oSettings.oApi._fnBindAction( nLast,  {action: "last"},     fnClickHandler );

		/* ID the first elements only */
		if ( !oSettings.aanFeatures.p )
		{
			nPaging.id = oSettings.sTableId+'_paginate';
			nFirst.id =oSettings.sTableId+'_first';
			nPrev.id =oSettings.sTableId+'_previous';
			nNext.id =oSettings.sTableId+'_next';
			nLast.id =oSettings.sTableId+'_last';
		}
	},
	"fnUpdate" : function(oSettings, fnCallbackDraw) {
		if (!oSettings.aanFeatures.p) {
			return;
		} 
		var an = oSettings.aanFeatures.p;
		for ( var i = 0, iLen = an.length; i < iLen; i++) {
			var buttons = an[i].getElementsByTagName('a');
			if (oSettings._iDisplayStart === 0) {
				buttons[0].className = "first paginate_button_disabled";
				buttons[1].className = "previous paginate_button_disabled";
			} else {
				buttons[0].className = "first paginate_button";
				buttons[1].className = "previous paginate_button";
			}
			if (oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay()) {
				buttons[2].className = "next paginate_button_disabled";
				buttons[3].className = "last paginate_button_disabled";
			} else {
				buttons[2].className = "next paginate_button";
				buttons[3].className = "last paginate_button";
			}
			if (oSettings.fnRecordsDisplay() === 9223372036854776000) {
				buttons[3].className = "last paginate_button_disabled";
			}
		}
	}
};
