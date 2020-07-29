import * as actionSDK from "action-sdk-sunny";

// var question_counter = 1
var questionCount = 0;
let questions = new Array();
let validate = true;

var question_section = $("#question-section div.container").clone();
var opt = $("div#option-section .option-div").clone();

$(document).ready(function () {    
    var dt = new Date();
    var time = ("00" + dt.getHours()).substr(-2) + ":" + ("00" + dt.getMinutes()).substr(-2);
    $('#attendance-time').val(time).prop({ 'min': time });
    removeLoader();
});

async function removeLoader() {
    await actionSDK.executeApi(new actionSDK.HideLoadingIndicator.Request());
}

$(document).on("click", ".nav-item", function(){
    if ($.trim($(this).text()).toLowerCase() == 'Present'.toLowerCase()){
        $('#present-status').prop("checked", true);
    }else{
        $('#absent-status').prop("checked", true);
    }
})


$(document).on("click", "#submit", function () {
    $('#submit').prop({ "disabled": true });

    var status = $("input[name='status']:checked").val();
    if (status == 'Absent') {
        $("#exampleModalCenter")
            .find("#exampleModalLongTitle")
            .html('<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" class="gt gs mt--4"><g><g><g><path d="M507.113,428.415L287.215,47.541c-6.515-11.285-18.184-18.022-31.215-18.022c-13.031,0-24.7,6.737-31.215,18.022L4.887,428.415c-6.516,11.285-6.516,24.76,0,36.044c6.515,11.285,18.184,18.022,31.215,18.022h439.796c13.031,0,24.7-6.737,31.215-18.022C513.629,453.175,513.629,439.7,507.113,428.415z M481.101,449.441c-0.647,1.122-2.186,3.004-5.202,3.004H36.102c-3.018,0-4.556-1.881-5.202-3.004c-0.647-1.121-1.509-3.394,0-6.007L250.797,62.559c1.509-2.613,3.907-3.004,5.202-3.004c1.296,0,3.694,0.39,5.202,3.004L481.1,443.434C482.61,446.047,481.748,448.32,481.101,449.441z"/><rect x="240.987" y="166.095" width="30.037" height="160.197" /><circle cx="256.005" cy="376.354" r="20.025" /></g></g></g > <g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg > Notice!');
        $("#exampleModalCenter")
            .find(".modal-body")
            .html("Your attendance response will be marked as 'Absent'");
        $("#exampleModalCenter")
            .find(".modal-footer")
            .html(
                '<button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal" id="back-modal">Cancel</button><button type="button" class="btn btn-primary btn-sm mark-absent">Mark Absent</button>'
            );
        $("#exampleModalCenter").modal("show");
    }else{
        submitForm();
    }
});

$(document).on('click', '.mark-absent', function() {
    submitForm();
});


$(document).on('click', '#back-modal', function () {
    $('#submit').prop("disabled", false);
});

function submitForm() {
    actionSDK
        .executeApi(new actionSDK.GetContext.Request())
        .then(function (response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            createAction(response.context.actionPackageId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

function createAction(actionPackageId) {
    var title = 'Mark Attendance';
    var attendance_time = $("#attendance-time").val();
    var attendance_date = new Date();
    var attendance_status = $("input[name='status']:checked").val();
    var address = $("#address").val();
    var lat = $("#latitude").val();
    var long = $("#longitutde").val();
    var notes = ($('#notes:visible').length > 0) ? $("#notes").val() : $("#absent-notes").val();
    
    var expiry_time = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
    var properties = [];
    properties.push(
        {
            name: "Attendance Date",
            type: "Date",
            value: attendance_date,
        },
        {
            name: "Attendance Time",
            type: "Time",
            value: attendance_time,
        },
        {
            name: "Attendance Status",
            type: "Text",
            value: attendance_status,
        },
        {
            name: "Latitude",
            type: "Text",
            value: lat,
        },
        {
            name: "Longitude",
            type: "Text",
            value: long,
        },
        {
            name: "Address",
            type: "LargeText",
            value: address,
        },
        {
            name: "Notes",
            type: "LargeText",
            value: notes,
        });

    var opt = [
        {
            name: 'Attendance Date',
            displayName: attendance_date
        },
        {
            name: 'Attendance Time',
            displayName: attendance_time
        },
        {
            name: 'Attendance Status',
            displayName: attendance_status
        },
        {
            name: 'Latitude',
            displayName: lat
        },
        {
            name: 'Longitude',
            displayName: long
        },
        {
            name: 'Address',
            displayName: address
        },
        {
            name: 'Notes',
            displayName: notes
        }
    ];

    var i = 1;
    var dataColumns = [
        {
            name: i.toString(),
            displayName: 'Mark Attendance',
            valueType: actionSDK.ActionDataColumnValueType.LargeText,
            allowNullValue: false,
            options: opt
        }
    ];
    // properties.push(getcorrectanswers);
    console.log('properties: ' + JSON.stringify(properties));
    var action = {
        id: generateGUID(),
        actionPackageId: actionPackageId,
        version: 1,
        displayName: title,
        expiryTime: expiry_time,
        customProperties: properties,
        dataTables: [{
            name: "TestDataSet",
            itemsVisibility: actionSDK.Visibility.All,
            itemsEditable: false,
            canUserAddMultipleItems: true,
            dataColumns: dataColumns,
        }],
    };
    console.log("action: ");
    console.log(JSON.stringify(action));
    var request = new actionSDK.CreateAction.Request(action);
    actionSDK
        .executeApi(request)
        .then(function (response) {
            console.info("CreateAction - Response: " + JSON.stringify(response));
        })
        .catch(function (error) {
            console.error("CreateAction - Error: " + JSON.stringify(error));
        });
}


function generateGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
