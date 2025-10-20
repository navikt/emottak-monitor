	/*
	 * Type:        Plugin for DataTables (www.datatables.net) JQuery plugin.
	 * Name:        dataTableExt.oApi.fnSetFilteringDelay
	 * Version:     2.2.1
	 * Description: Enables filtration delay for keeping the browser more
	 *              responsive while searching for a longer keyword.
	 * Inputs:      object:oSettings - dataTables settings object
	 *              integer:iDelay - delay in miliseconds
	 * Returns:     JQuery
	 * Usage:       $('#example').dataTable().fnSetFilteringDelay(250);
	 * Requires:	  DataTables 1.6.0+
	 *
	 * Author:      Zygimantas Berziunas (www.zygimantas.com) and Allan Jardine (v2)
	 * Created:     7/3/2009
	 * Language:    Javascript
	 * License:     GPL v2 or BSD 3 point style
	 * Contact:     zygimantas.berziunas /AT\ hotmail.com
	 * 
	 * modified by Dag Framstad
	 * triggers filtering on CR (keyCode 13) and checks if search text has changed 
	 */
	/* modified, supports chaining */

jQuery.fn.dataTableExt.oApi.fnSetFilteringDelay = function ( oSettings, iDelay ) {
	var _that = this;
	this.each( function ( i ) {
		$.fn.dataTableExt.iApiIndex = i;
		iDelay  = (iDelay && (/^[0-9]+$/.test(iDelay))) ? iDelay : 250;
		
		var $this = this, lastval, oTimerId;
		var anControl = $( 'input', _that.fnSettings().aanFeatures.f );
		
		anControl.off( 'keyup' ).on( 'keyup', function(event) {
			window.clearTimeout(oTimerId);
			
			if (event.keyCode == '13') {
				// CR, we filter immediately
				$.fn.dataTableExt.iApiIndex = i;
				lastval = $(this).val();
				_that.fnFilter(lastval);
			} else {
				// not CR, set new timer, but only if search text changed
				var searchtxt = $(this).val();
				if (searchtxt != lastval) {
					lastval = searchtxt;
					oTimerId = window.setTimeout(function() {
						$.fn.dataTableExt.iApiIndex = i;
						_that.fnFilter( searchtxt );
					}, iDelay);
				}
			}
			
		});
		
		return this;
	} );
	return this;
}





