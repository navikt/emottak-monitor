    var oTable;
    var id = "";
    var oldid = "";
    var cpaid = "";
    var action = "";
    $(document).ready(function() {
    $('#menu_cpa').addClass('active-menu');

    oTable = $('#partner').dataTable({
    "bStateSave": true,
    "aaSorting": [[2, 'asc']],
    "bServerSide": true,
    "sAjaxSource": "secure/cpa/j/partners.json",
    "fnServerData": function(sSource, aoData, fnCallback) {
    aoData.push({"name": "action", "value": action});
    aoData.push({"name": "id", "value": id});
    aoData.push({"name": "oldid", "value": oldid});
    aoData.push({"name": "cpaid", "value": cpaid});
    $.ajax({
    "dataType": 'json',
    "type": "POST",
    "url": sSource,
    "data": aoData,
    "success": fnCallback
});
},
    "aoColumns": [
    /* id */ {"bVisible": false },
    /* checkbox */ { "sClass": "unsortable", "bSortable": false, "sWidth": "15px", "bVisible": isOperator },
    /* name */ { "sName": "navn", "sDisplayName": '<spring:message code="cpa.partners.table.header.name" />' },
    /* partnerid */ {"sName": "partner_id", "sDisplayName": '<spring:message code="cpa.partners.table.header.partnerid" />', "sClass": "right" },
    /* herid */ { "sName": "her_id", "sDisplayName": '<spring:message code="cpa.partners.table.header.herid" />', "sClass": "right" },
    /* orgno */ { "sName": "orgnummer", "sDisplayName": '<spring:message code="cpa.partners.table.header.orgno" />', "sClass": "right" },
    /* commsystemid */ {"bVisible": false },
    /* commsystem */ { "sName": "beskrivelse", "sDisplayName": '<spring:message code="cpa.partners.table.header.csystem" />' },
    /* subscriber */ {"bSortable": false, "sClass": "center", "sWidth": "14px"  },
    /* cpacount */ {"sName": "cpacount", "bSearchable": false, "sClass": "right"  }
    ],
    "fnInitComplete": function() {
    oTable.fnSetFilteringDelay(<spring:message code="filter.delay" />);
},
    "fnRowCallback": function(nRow, aData, iDisplayIndex) {
    if (aData[9] > 0) {
    $('td:eq(0)', nRow).prop('disabled', true).addClass('disabled');
}
    return nRow;
},
    "fnDrawCallback": function(oSettings) {
    action = "";
    id = "";
    oldid = "";
    cpaid = "";
    enableOrDisableBasedOnCheckedCheckboxesBinder('.needchkbx', this);
    resetExpandableListToggler($(oTable).children('caption'));
    $('a.partner').droppable({
    tolerance: 'touch',
    drop: function(event, ui) {
    $('.droppable').removeClass('droppable');
    var mt = getDragAndDropMetaData(this, ui);
    var tcid = "'" + mt.cid + "'";
    if (mt.orgpid != mt.pid) {
    $(this).addClass('droppable');
    jConfirm(
    '<spring:message code="cpa.partner.movecpa.msg"/>'.replace('{0}', tcid).replace('{1}', mt.orgpname).replace('{2}', mt.orgpid).replace('{3}', mt.pname).replace('{4}', mt.pid),
    '<spring:message code="cpa.partner.movecpa.header"/>'.replace('{0}', tcid), function(r) {
    if (r) {
    oldid = mt.orgpid;
    id = mt.pid;
    cpaid = mt.cid;
    action = 'move';
    oTable.fnDraw(false);
}
    $('.draggable').removeClass('draggable');
    $('.droppable').removeClass('droppable');
});
} else {
    $('.draggable').removeClass('draggable');
}
},
    activate: function(event, ui) {
    $('.draggable').removeClass('draggable');
    $('.droppable').removeClass('droppable');
    $(ui.draggable).addClass('draggable');
    $(ui.helper).addClass('draggable');
},
    out: function(event, ui) {
    $('.droppable').removeClass('droppable');
},
    over: function(event, ui) {
    $('.droppable').removeClass('droppable');
    var mt = getDragAndDropMetaData(this, ui);
    if (mt != null && mt.pid != mt.orgpid) {
    $(this).addClass('droppable');
}
}
});
}
});
    enableOrDisableBasedOnCheckedCheckboxesBinder('.needchkbx', oTable);

    $(document).on('click', 'td img.expandable', function() {
    toggleAndPopulateExpandableList(this, oTable, "secure/cpa/j/cpareflist.json", "id", 0, null, 0, addStuff);
});

    $('#new').click(function() {
    postToUrl('secure/cpa/partner.htm');
});

    $('#delete').click(function() {
    id = "";
    action = "delete";
    var o = getCheckedCheckboxesInTable(oTable).serializeArray();
    jQuery.each(o, function(i, field) {
    id += field.value + ",";
});
    if (id.length == 0) {
    return;
}
    uncheckAll('th input[type=checkbox]');
    oTable.fnDraw(false);
});



});

    function getDragAndDropMetaData(that, ui) {
    var uri = $(that).attr('href');
    if (uri !== undefined) {
    var pname = "'" + $(that).html() + "'";
    var pid = uri.split('=')[1];
    var hlp = ui.helper;
    var orgpartner = $(hlp).parent().parent().parent().prev().prev();
    var orgpname = "'" + $(orgpartner).text() + "'";
    var uri = $(orgpartner).attr('href');
    var orgpid = uri.split('=')[1];
    var cid = $(hlp).attr('cpaid');
    return {cid: cid, orgpname: orgpname, orgpid: orgpid, pname: pname, pid: pid};
}
    return null;
}


    function addStuff(arg) {
    addDraggable();
    addAdmLink(arg);
}

    function addDraggable() {
    $('a.cpa').draggable({
        containment: 'tbody',
        cursor: 'move',
        helper: 'clone',
        snap: 'a.partner',
        start: function(event, ui) {
            $(this).addClass('draggable');
            var cpaid = $(ui.helper).html();
            var orgpartner = $(this).parent().parent().parent().prev();
            var pname = $(orgpartner).html();
            var uri = $(orgpartner).attr('href');
            var pid = uri.split('=')[1];
            $(ui.helper).attr('cpaid', cpaid).attr('pname', pname).attr('pid', pid)
        }
    });
}

    function addAdmLink(arg) {
    var srchtxt = '';
    $(arg).find('a.cpa').each(function(index){
    srchtxt += $(this).text() + ',';
});
    var l = '<a href="secure/t1/cpa.htm?search=' + srchtxt + '&sFilterColumn=cpaid&sFilterMethod=EQUALS&bFilterCaseInsensitive=false"><img src="images/wrench.png" style="border: 0px none;"></a>';
    $(arg).before(l);
}

    function resetFields() {
    resetDropdownsAndFilterSelections([],[], [oTable]);
}