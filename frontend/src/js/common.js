function $(x) {
	return document.getElementById(x);
}

export function toggleAll(chkbx, selector) {
	var checked = chkbx.checked;
	$(selector).each(function() {
		this.checked = checked;
	});
}

// unchecks checkboxes
export function uncheckAll(selector) {
	$(selector).each(function() {
		this.checked = false;
	});
}

// remove spaces in string, leading, trailing and inside
export function removeSpaces(str) {
	return str.replace(/\s\s*/g, '');
}

// is this an integer
export function isInteger(n) {
	return !isNaN(parseInt(n)) && isFinite(n);
}

// is this a hexadecimal number
export function isHex(n) {
	return !isNaN(parseInt(n, 16)) && isFinite(n);
}

// converts a formatted number to a float
export function toFloat(s) {
	s = (s === "-" || s === "") ? 0 : s.replace(/[^\d-\.,]/, "")
		.replace(/,/, ".")
		.replace(/\.(?=.*?\.)/,'');
	return parseFloat(s);
}

// externalizes links
export function externalizeLinks() {
	$('a[rel=external]').each(function() {
		this.target = "_blank";
	});
}

// gets request parameter
export function getParam(name) {
	var value = queryString[name];
	return value == null ? "" : value;
}

//checks if request parameter is present
export function hasParam(name) {
	return queryString[name] != null;
}

// sets value in input field
export function initField(selector, param, value) {
	if ($(selector).length == 0) {
		return;
	}
	var v = getParam(param);
	$(selector).val(v == '' ? value : v);
}

// decodes html
export function htmlDecode(value) {
	return $('<div/>').html(value).text();
}

//decodes html
export function htmlEncode(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/&/g, '&amp;');
}

// posts to url
export function postToUrl(path, params, method) {
	method = method || "post";
	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);
	for (var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
}

// hides errors
export function hideErrors() {
	const kk = 'kul';
	console.log(`lis${kk}`);
	$('#errors').html('');
	$('#errors').hide();
	console.log('mach');
}

// resets a tables filter event handler so it won't filter until return is pressed
export function resetFilterEventHandler(sTableId, oTable) {
	var selector = sTableId + '_wrapper div div.dataTables_filter input';
	var f = selector;
	$(selector).off();
	$(selector).on('keyup', function(e) {
		if (e.keyCode == 13) {
			oTable.fnFilter(this.value);
		}
	});
}

export function enableOrDisableBasedOnCheckedCheckboxesBinder(selector, table) {
	$(document).on('click', ':checkbox', function() {
		enableOrDisableBasedOnCheckedCheckboxes(selector, table);
	});
	enableOrDisableBasedOnCheckedCheckboxes(selector, table);
}

export function enableOrDisableBasedOnCheckedCheckboxes(selector, table) {
	var	o = getCheckedCheckboxesInTable(table);
	if (o.length == 0) {
		$(selector).attr('disabled', true).addClass('disabled');
	} else {
		$(selector).attr('disabled', false).removeClass('disabled');
	}
}

export function getCheckedCheckboxesInTable(table) {
	return table.$(':checkbox:checked', {'filter':'applied'}, 'current', 'current', 'current');
}


export function exist(value, defvalue) {
	return (undefined != value) ? value : defvalue;
}

/**
 * saves a session variable with the value from the select box
 * @param key the key of the selected value
 * @param selector the selector of the select box
 */
export function saveSelectedDropdownlistValue(key, selector) {
	var name = 'drpdwn_' + window.location.pathname + '_' + key;
	var s = selector + ' option:selected';
	sessvars[name] = $(s).val();
}

/**
 * resets dropdown boxes, including filter stuff in datatables
 * @param selector the selectors
 * @param values the values
 * @param tables the datatables
 */
export function resetDropdownsAndFilterSelections(selector, values, tables) {
	resetDropdowns(
		selector.concat('[name=filtercolumns]','[name=filtermethods]'),
		values.concat('', 'EQUALS'));
	$('[name=filtercaseinsensitive]').prop('checked', false);
	for (var i = 0; i < tables.length; i++) {
		tables[i].fnFilter('');
	}
}

/**
 * resets dropdown boxes
 * @param selector the selectors
 * @param values the values
 */
export function resetDropdowns(selector, values) {
	for (var i = 0; i < selector.length; i++) {
		$(selector[i]).val(values[i]).change();
	}
}

/**
 * clears a session variable with the value from the select boxes
 * @param keys the keys of the selected values
 */
export function clearSelectedDropdownlistValues(keys) {
	for (var key in keys) {
		clearSelectedDropdownlistValue(key);
	}
}

/**
 * clears a session variable with the value from the select box
 * @param key the key of the selected value
 */
export function clearSelectedDropdownlistValue(key) {
	var name = 'drpdwn_' + window.location.pathname + '_' + key;
	sessvars[name] = undefined;
}


/**
 * populates a select box with values from server, getting the selected from a session variable or a default if key isn't found
 * @param key the key of the selected value
 * @param selector the selector of the select box
 * @param url where to find the values
 * @param sorted true if it should be sorted ascending on numerical key
 * @param defval default value if key is empty, optional
 * @param async async or sync ajax call, optional defaults to false
 * @param cachable cache result, optional defaults to false
 * @param params parameters to the ajax call, optional
 */
export function populateAndSelectDropdownlist(key, selector, url, sorted, defval, async, cachable, params) {
	if ($(selector).length == 0) {
		return;
	}
	if(typeof(async) != "boolean") async = false;
	if(typeof(cachable) != "boolean") cachable = false;
	if(typeof(params) != "object") params = {};
	$(selector).on('change', function() {
		saveSelectedDropdownlistValue(key, selector);
	});
	var name = 'drpdwn_' + window.location.pathname + '_' + key;
	if (cachable && (params === undefined || params.length === undefined || params.length == 0) && admCache.has(name)) {
		$(selector).html(admCache.get(name));
		return;
	}
	var value = sessvars[name];
	if (value === undefined) {
		value = defval;
	}
	if (value !== undefined || sorted) {
		$(selector).ajaxAddOption(url, params, false, async, function(arg) {
			if (sorted) {
				$(selector).sortOptionsNumericalKey(true);
			}
			if (value != undefined) {
				$(selector).selectOptions(value);
			}
		});
	} else {
		$(selector).ajaxAddOption(url, params, false);
	}
	if (cachable && (params === undefined || params.length === undefined || params.length == 0)) {
		admCache.set(name, $(selector).html());
	}
}

export function sortoptions(sort) {
	var $this = $(this);
	$this.sortOptions(sort.dir == 'asc' ? true : false);
}

/*
 * toggles a prepopulated expandle div
 * dom looks like this:
 * <td class="evtid-link"><span>
 * 	<img class="expandable" src="images/expand.gif" style="border: 0">
 *  <img class="expandable collapsible" src="images/collapse.gif" style="border: 0; display:none;">txt
 *  <div style="display: none" class="expanded-content">more txt</div>
 * </span></td>
 */
export function togglePopulatedExpandableDiv(image) {
	if ($(image).hasClass('collapsible')) {
		$(image).hide();
		$(image).prev().show();
		$(image).next("div").hide();
	} else {
		$(image).hide();
		$(image).next().show();
		$(image).next().next("div").show();
	}
}

/*
 * toggles and populates an expandable list
 * dom looks like this:
 * <td class="msgid-link">
 * 	<img class="expandable" src="images/expand.gif" style="border: 0">
 *  <img class="expandable collapsible" src="images/collapse.gif" style="border: 0; display:none;">
 *  <a href="url?id=txt">txt</a>
 *  <ul style="display: none" class="expanded-content"></ul>
 * </td>
 */
export function toggleAndPopulateExpandableList(image, table, jsonUrl, idVar, idPos, idVar2, idPos2, func) {
	var p = $(image).parent();
	var o = $(image).siblings("ul");
	var iPos = table.fnGetPosition(image.parentNode);
	var aData = table.fnGetData(iPos[0]);
	if ($(image).hasClass('collapsible')) {
		$(image).hide();
		$(image).prev().show();
		$(o).hide();
	} else {
		$(image).hide();
		$(image).next().show();
		if ($(o).children().length == 0) {
			var aoData = [];
			aoData.push({"name": idVar, "value": aData[idPos]});
			if (idVar2 !== undefined && idVar2 !== null) {
				aoData.push({"name": idVar2, "value": aData[idPos2]});
			}

			$.ajax({
				type: "POST",
				url: jsonUrl,
				context: o,
				data: aoData,
				success: function(msg) {
					var sChildren = '';
					for (var i = 0; i < msg.length; i++) {
						if (msg[i].length == 2) {
							sChildren += '<li class="' + msg[i][1] + '">' + msg[i][0] + '</li>';
						} else {
							sChildren += '<li>' + msg[i][0] + '</li>';
						}
					}
					$(this).html(sChildren);
					if (typeof func === 'function') {
						func($(this));
					}
				}
			});
		}
		$(o).show();
	}
}

/**
 * resets the toggler image
 * @param caption
 */
export function resetExpandableListToggler(parent, toggle) {
	if (toggle) {
		$(parent).children('img').last().click();
	} else {
		var exp = $(parent).children('img').first();
		if (!$(exp).is(':visible')) {
			$(parent).children('img').last().hide();
			$(exp).show();
		}
	}
}

// adds event handler for trimming pasted value
export function trimInputWhenPasting(selector, removeSpacesInTheMiddle) {
	$(document).on('change', selector, function(event) {
		var tmp = removeSpacesInTheMiddle ? removeSpaces($(this).val()) : $.trim($(this).val());
		$(this).val(tmp);
		$(this).keyup();
	});
}

//toggles expandables
export function toggleAllExpandables(image, selector) {
	if ($(image).hasClass('collapsible')) {
		$(image).hide();
		$(image).prev().show();
	} else {
		$(image).hide();
		$(image).next().show();
	}
	$(selector).each(function() {
		this.click();
	});
}

// workaround fix for change introduced in jquery-ui 1.9
// base element makes anchor appear without the query string making tabs to believe that the tabs have remote content
// causing invalid ajax request
export function jqueryUiTabsBaseWorkaround() {
	var baseElements = document.getElementsByTagName("base");
	var href;
	if (baseElements.length > 0) {
		href = baseElements[0].href;
		baseElements[0].href = document.location.href;
	}
	return href;
}

/**
 * populates role, service and action select boxes with values from server, getting the selected from a session variable or a default if key isn't found
 */
export function populateAndSelectRSA() {
	populateAndSelectDropdownlist('role', '[name=role]', 'secure/weblog/j/roles.json', false, '', false, true);
	populateAndSelectService();

	$(document).on('change', '[name=role]', function() {
		populateAndSelectService();
	});

	$(document).on('change', '[name=service]', function() {
		populateAndSelectAction();
	});

}

export function populateAndSelectService() {
	var aoData = [];
	aoData.push({"name": "role", "value": exist($('[name=role] option:selected').val(), '')});
	$('[name=service]').removeOption(/./);
	populateAndSelectDropdownlist('service', '[name=service]', 'secure/weblog/j/services.json', false, '', false, false, aoData);
	populateAndSelectAction();
}

export function populateAndSelectAction() {
	var aoData = [];
	aoData.push({"name": "role", "value": exist($('[name=role] option:selected').val(), '')});
	aoData.push({"name": "service", "value": exist($('[name=service] option:selected').val(), '')});
	$('[name=action]').removeOption(/./);
	populateAndSelectDropdownlist('action', '[name=action]', 'secure/weblog/j/actions.json', false, '', false, false, aoData);
}

// triggers change event on the filter
export function triggerTableFilterInputChange(tbl) {
	var sel = tbl.selector + '_filter input';
	tbl.fnFilter($(sel).val());
}