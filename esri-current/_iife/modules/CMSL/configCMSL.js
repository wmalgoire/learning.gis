// ==========================================================================================
//==============                 Override core configuration                  ==============//
// ==========================================================================================
URL_VTS_AGS = URL_VTS_AGS + 'OperationalLayers/Dashboard_CMSL/MapServer';
APP_TITLE  = "Chronically Missed Settlements";

LAYERS_VISIBLE = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
LAYERS_REFRESH_DELAY = 1000;

/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [10,11,12, 14,15,16];

IDENTIFY_INFOTEMPLATES[12] =
IDENTIFY_INFOTEMPLATES[11] =
IDENTIFY_INFOTEMPLATES[10] = {
    content: "Settlement: <strong>${SettlementName}</strong> in " +
                    "<a href='javascript:void(0);' onclick='javascript:Application.zoomToExtent(\"Ward\", \"${WardCode}\");' >${WardName}</a>" + ", " +
                    "<a href='javascript:void(0);' onclick='javascript:Application.zoomToExtent(\"LGA\", \"${LgaCode}\");' >${LgaName}</a>" + ", " +
                    "<a href='javascript:void(0);' onclick='javascript:Application.zoomToExtent(\"State\", \"${StateCode}\");' >${StateName}</a>" + ", " +
                    "<br/><br/>" +
             "Details: <ul>"+
             "<li>Number of times tracked: <strong>${CountNumberOfIpds}</strong></li>" +
             "<li>Number of times missed: <strong>${CountBelow}</strong></li>" +
             "<li>Number of consecutive times missed in the last campaigns: <strong>${CountBelowLast}</strong></li></ul>",
    title: "Chronically Missed Settlement<br/>"
};

IDENTIFY_INFOTEMPLATES[16] = {
    content: function (data) {
        var ret = "State: <strong>" + data.feature.attributes.StateName + "</strong>" +
            "<br/><br/>";
        if (data.feature.attributes.CmslCount == -1) {
            ret += "State was not tracked in at least 3 campaigns.";
        } else {
            ret += "Number of chronically missed settlements: <strong>" + data.feature.attributes.CmslCount + "</strong> <br/><br/>" +
            "<a target='_blank' href='/ChronicallyMissedSettlements/Index?statecode=" + data.feature.attributes.StateCode + "'>View chronically missed settlements in state</a>";
        }

        return ret;
    },
    title: "State level CMSL information<br/>"
};
IDENTIFY_INFOTEMPLATES[15] = {
    content: function (data) { 
        var ret = "LGA: <strong>" + data.feature.attributes.LGAName + "</strong> in " +
            "<a href='javascript:void(0);' onclick='javascript:Application.zoomToExtent(\"State\", \"" + data.feature.attributes.StateCode + "\");' >" + data.feature.attributes.StateName + "</a>" +
            "<br/><br/>";
        if (data.feature.attributes.CmslCount == -1) {
            ret += "LGA was not tracked in at least 3 campaigns.";
        } else {
            ret += "Number of chronically missed settlements: <strong>" + data.feature.attributes.CmslCount + "</strong> <br/><br/>" +
            "<a target='_blank' href='/ChronicallyMissedSettlements/Index?lgacode=" + data.feature.attributes.LGACode + "'>View chronically missed settlements in LGA</a>";
        }

        return ret;
    },
    title: "LGA level CMSL information<br/>"
};
IDENTIFY_INFOTEMPLATES[14] = {
    content: function(data) { 
        var ret = "Ward: <strong>" + data.feature.attributes.WardName + "</strong> in " +
            "<a href='javascript:void(0);' onclick='javascript:Application.zoomToExtent(\"LGA\", \"" + data.feature.attributes.LGACode + "\");' >" + data.feature.attributes.LGAName + "</a>" + ", " +
            "<a href='javascript:void(0);' onclick='javascript:Application.zoomToExtent(\"State\", \"" + data.feature.attributes.StateCode + "\");' >" + data.feature.attributes.StateName + "</a>" +
            "<br/><br/>";
        if (data.feature.attributes.CmslCount == -1) {
            ret += "Ward was not tracked in at least 3 campaigns.";
        } else {
            ret += "Number of chronically missed settlements: <strong>" + data.feature.attributes.CmslCount + "</strong> <br/><br/>" +
            "<a target='_blank' href='/ChronicallyMissedSettlements/Index?wardcode=" + data.feature.attributes.WardCode + "'>View chronically missed settlements in ward</a>";
        }
       
        return ret;
    },
    title: "Ward level CMSL information<br/>"
};

// ==========================================================================================
//==============                 CMSL Specific Configuration                  ==============//
// ==========================================================================================

/** URL parameters **/
var PARAM_LAYER_TYPE = "layerType";
var PARAM_LAYER_CODE = "layerCode";

/** Layers used to retreive extent according to the feature requested **/
LAYERS_EXTENT_TYPE_CODE = {
    "State": {
        "id": 30,
        "field": "StateCode",
        "searchField": "StateCode",
        "outFields": "OBJECTID"
    },
    "LGA": {
        "id": 29,
        "field": "LGACode",
        "searchField": "LGACode",
        "outFields": "OBJECTID"
    },
    "Ward": {
        "id": 28,
        "field": "WardCode",
        "searchField": "WardCode",
        "outFields": "OBJECTID"
    },
    "BUA": {
        "id": 18,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "SSA": {
        "id": 19,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "HA": {
        "id": 20,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    }
};
