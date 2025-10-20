function trim(str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}


jQuery.extend(jQuery.fn.dataTableExt.oSort, {
	"formatted-num-pre" : function(a) {
		a = (a === "-" || a === "") ? 0 : a.replace(/[^\d-\.,]/, "")
		          .replace(/,/, ".")
		          .replace(/\.(?=.*?\.)/,'');
		return parseFloat(a);
	},
	"formatted-num-asc" : function(a, b) {
		return a - b;
	},
	"formatted-num-desc" : function(a, b) {
		return b - a;
	},
	"euro-date-pre": function(a) {
		if (trim(a) != '') {
			if (a.match(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.(19[0-9][0-9]|2[0-9][0-9][0-9]) ([01][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9](.[0-9]{3})?)?$/)) { 
				// dd.mm.yyyy ...
				var dateTimeParts = trim(a).split(' ');
				var dateParts = dateTimeParts[0].split('.');
				return dateParts[2] + dateParts[1] + dateParts[0] + dateTimeParts[1];
			} else {
				return a;
			}
		} else {
			return a;
		}
	},
	"euro-date-asc": function(a, b) {
		return ((a < b) ? -1 : ((a > b) ? 1 : 0));
	},
	"euro-date-desc": function(a, b) {
		return ((a < b) ? 1 : ((a > b) ? -1 : 0));
	},
	"file-size-pre": function ( a ) {
		var x = a.replace(/[^\d\-,]/g, "").replace(/,/, ".");
		var u = a.substring(a.length - 2, a.length);
		var x_unit = (u == "Kb" ? 1024 : (u == "Mb" ? 1048576 : (u == "Gb" ? 1073741824 : (u == "Tb" ? 1099511627776 : 1))));
		return parseInt( x * x_unit, 10 );
	},
	"file-size-asc": function ( a, b ) {
		return ((a < b) ? -1 : ((a > b) ? 1 : 0));
	},	
	"file-size-desc": function ( a, b ) {
		return ((a < b) ? 1 : ((a > b) ? -1 : 0));
	}
});

