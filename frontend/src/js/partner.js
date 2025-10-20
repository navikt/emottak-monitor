//var jq = document.createElement("script");

//jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";
//document.querySelector("head").appendChild(jq);

var oTable;
var validator;
$(document).ready(function() {
        $('#menu_cpa').addClass('active-menu');
        $('[name=csystem]').ajaxAddOption("secure/cpa/j/csystems.json", {}, false, false, function (arg) {
            $('[name=csystem]').selectOptions($('[name=csysid]').val());
        });

        $.validator.addMethod("nonneginteger", function (value, element) {
            return this.optional(element) || /^\d+$/.test(value);
        }, '<spring:message code="cpa.partner.nonneginteger.validation.msg" />');
        $.validator.addMethod("partytypeid", function (value, element) {
            return $('[name=pherid]').val() != '' || $('[name=porgno]').val() != '';
        }, '<spring:message code="cpa.partner.partytypeid.validation.msg" />');
        var id = $('[name=ppid]').val();

        if (id === undefined || id == '') {
            $('#cpas').hide();
            if (queryString.name) {
                $('[name=name]').val(queryString.name);
            }
            if (queryString.herid) {
                $('[name=pherid]').val(queryString.herid);
            }
            if (queryString.orgno) {
                $('[name=porgno]').val(queryString.orgno);
            }
            if (queryString.csys) {
                $('[name=csys]').val(queryString.csys);
            }
            $('[name=ppid]').val(-1);
        } else {
            oTable = $('#cpas').dataTable({
                "iDisplayLength": 10,
                "sDom": '<"top"flpir>t',
                "aaSorting": [[1, 'desc']],
                "sAjaxSource": "./secure/cpa/j/partnerscpas.json",
                "fnServerData": function (sSource, aoData, fnCallback) {
                    aoData = [];
                    aoData.push({"name": "id", "value": id});
                    $.ajax({
                        "dataType": 'json',
                        "type": "POST",
                        "url": sSource,
                        "data": aoData,
                        "success": fnCallback
                    });
                },
                "aoColumns": [
                    /* partner */ {"bVisible": false},
                    /* cpaId */  null,
                    /* partner */ {"bVisible": false},
                    /* partnerCpp */ null,
                    /* navCpp */ null,
                    /* subjectdn */ null,
                    /* endpoint */ null,
                    /* lastUsed */ {"bSearchable": false, "sClass": "right date", "sWidth": "110px"}
                ]
            });
        }
        validator = $('form').validate();
        console.log(`koon...${validator}`);
        if (false) { //TODO: Parviz is operator admin or monitor; if (!isOperator) {
            $('input').prop('disabled', true).addClass('disabled');
            $('select').prop('disabled', true).addClass('disabled');
        }
        $('#psbmtbtn').prop('disabled', true).addClass('disabled');

        $('form').on('keyup mouseup', function () {
            if ($('[name=nm]').val() != $('[name=name]').val() ||
                $('[name=csysid]').val() != $('[name=csystem] option:selected').val() ||
                $('[name=her]').val() != $('[name=pherid]').val() ||
                $('[name=org]').val() != $('[name=porgno]').val()) {
                $('#psbmtbtn').prop('disabled', false).removeClass('disabled');
            } else {
                $('#psbmtbtn').prop('disabled', true).addClass('disabled');
            }
        });
        $("[name=name]").focus()
    });

export function docancel() {
        history.go(-1);
    }

export function partnersubmit() {
    //const inpObj = document.getElementById("ppid");
    //return inpObj;
        console.log('abe Koss');
        if ($('form').validate().form()) {
            var aoData = {
                "id": $('[name=ppid]').val(),
                "name": $('[name=name]').val(),
                "herid": $('[name=pherid]').val(),
                "orgno": $('[name=porgno]').val(),
                "csystem": $('[name=csystem] option:selected').val()
            };

            $.ajax({
                "dataType": 'json',
                "type": "POST",
                "url": "/v1/hentupdatepartner", //"secure/cpa/j/updatepartner.json",
                "data": aoData,
                "async": false,
                "success": function (response, responseTxt, request) {
                    var aoResult = response;
                    if (aoResult.success) {
                        console.log(response);
                        history.go(-1);
                    } else if (aoResult.failed) {
                        console.log('Forbidden')
                    }
                }
            });
        }
}