import * as actionSDK from "action-sdk-sunny";

// ActionSDK.APIs.actionViewDidLoad(true /*success*/ );

// Fetching HTML Elements in Variables by ID.
var root = document.getElementById("root");
var $root = $("#root");
let row = {};
let actionInstance = null;

// *********************************************** HTML ELEMENT***********************************************
$(document).ready(function () {
    OnPageLoad();
});

function OnPageLoad() {
    actionSDK
        .executeApi(new actionSDK.GetContext.Request())
        .then(function (response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            getActionInstance(response.context.actionId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

function getActionInstance(actionId) {
    actionSDK
        .executeApi(new actionSDK.GetAction.Request(actionId))
        .then(function (response) {
            console.info("Response: " + JSON.stringify(response));
            actionInstance = response.action;
            checkExpiry();
        })
        .catch(function (error) {
            console.log("Error: " + JSON.stringify(error));
        });
}

function checkExpiry() {
    var current_time = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

    if (actionInstance.expiryTime < current_time) {
        $('div.container:first').html('');
        $('div.container:first').html('<div class="card"><div class="form-group"><h4>Action is closed</h4></div></div>');
    } else {
        $('#location-section').show();
    }
}

$(document).on('click', '#share-locations', function () {
    $('#location-section').hide();
    if (actionInstance.properties[2].value == 'Yes') {
        $('#photo-section').show();
    } else {
        $('#notes-section').show();
        $('#photo-previous').hide();    // hide previous button
    }
});

$(document).on('click', '#photo-next', function () {
    if ($.trim($('#b64').html()).length > 0) {
        $('#photo-section').hide();
        $('#notes-section').show();
    } else {
        alert('Please Upload Photo to Mark Attendance');
    }

    /* Set pic at input in  base 64 */


});


document.getElementById("mypic").addEventListener("change", readFile);


function readFile() {

    if (this.files && this.files[0]) {

        var FR = new FileReader();

        FR.addEventListener("load", function (e) {
            $("#b64").html(e.target.result);
        });

        FR.readAsDataURL(this.files[0]);
    } else {
        $("#b64").html('');
    }

}

$(document).on('click', '#photo-previous', function () {
    $('#notes-section').hide();
    if (actionInstance.properties[2].value == 'Yes') {
        $('#photo-section').show();
    }
})


$(document).on('click', '#submit', function () {
    submitForm();
})

// *********************************************** HTML ELEMENT END***********************************************

// *********************************************** SUBMIT ACTION***********************************************

function submitForm() {
    actionSDK
        .executeApi(new actionSDK.GetContext.Request())
        .then(function (response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            addDataRows(response.context.actionId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

function generateGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function addDataRows(actionId) {
    var addDataRowRequest = new actionSDK.AddActionDataRow.Request(
        getDataRow(actionId)
    );
    var closeViewRequest = new actionSDK.CloseView.Request();
    var batchRequest = new actionSDK.BaseApi.BatchRequest([
        addDataRowRequest,
        closeViewRequest,
    ]);
    actionSDK
        .executeBatchApi(batchRequest)
        .then(function (batchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
        })
        .catch(function (error) {
            console.error("Error: " + JSON.stringify(error));
        });
}

function getDataRow(actionId) {
    row = {};
    var dt = [
        { 'lat': $('#latitude').val() },
        { 'long': $('#longitutde').val() },
        { 'photo': $('#b64').html() },
        { 'notes': $('#notes').val() },
        { 'address': $('#address').html() },
    ];

    row[1] = JSON.stringify(dt);

    var data = {
        id: generateGUID(),
        actionId: actionId,
        dataTableId: "TestDataSet",
        columnValues: row,
    };
    console.log("data-:  " + JSON.stringify(data));
    console.log(data);
    return data;
}

$(document).on('click', '#photo', function () {
    $('#mypic').click();
});

/* Show image at canvas */
var input = document.querySelector('input[type=file]'); // see Example 4
input.onchange = function () {
    var file = input.files[0];
    //upload(file);
    drawOnCanvas(file);   // see Example 6
    //displayAsImage(file); // see Example 7
};

function upload(file) {
    var form = new FormData(),
        xhr = new XMLHttpRequest();

    form.append('image', file);
    xhr.open('post', 'server.php', true);
    xhr.send(form);
}

function drawOnCanvas(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var dataURL = e.target.result,
            c = document.querySelector('canvas'), // see Example 4
            ctx = c.getContext('2d'),
            img = new Image();

        img.onload = function () {
            c.width = img.width;
            c.height = img.height;
            ctx.drawImage(img, 0, 0);
        };

        img.src = dataURL;
    };

    reader.readAsDataURL(file);
}

function displayAsImage(file) {
    var imgURL = URL.createObjectURL(file),
        img = document.createElement('img');

    img.onload = function () {
        URL.revokeObjectURL(imgURL);
    };

    img.src = imgURL;
    document.body.appendChild(img);
}

// *********************************************** SUBMIT ACTION END***********************************************