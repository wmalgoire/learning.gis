// ==========================================================================================
//==============                 Override core configuration                  ==============//
// ==========================================================================================
URL_SERVICE_BASE = 'Supervisors/Supervisors_';
APP_TITLE = "Supervisors";

// there are 11 layers for each day
//NUMBER_OF_LAYERS_PER_DAY = 11;

//show only the boundaries (LGA, Ward) by default. The day dependent layers will be enabled later
LAYERS_VISIBLE = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
LAYERS_NOT_SHOWN_IN_LAYERS_LIST = null;
LAYERS_REFRESH_DELAY = 1000;

/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [0];

//Specify infowindowContent

// Deprecated: was enabled for the first version of supervisors
//IDENTIFY_INFOTEMPLATES[7] =
//    IDENTIFY_INFOTEMPLATES[8] =
//    IDENTIFY_INFOTEMPLATES[9] = {
//        content: function(data) {
//            var ret = "";
//            ret += "Settlement: <strong>" + data.feature.attributes.SettlementName + "</strong><br/><br/>";
//            if (data.feature.attributes.CampaignDay) {
//                ret += "Campaign day: <strong>" + data.feature.attributes.CampaignDay + "</strong> <br/>";
//            }
//            ret += "Approx. time spent there: <strong>" + Application_Supervisor.formatTime(data.feature.attributes.DurationHoursTotal) + "</strong> <br/>";
//            ret += "Number of teams considered: <strong>" + data.feature.attributes.NbTeams + "</strong><br/>";
//            ret += "Team codes: <br/><strong>" + data.feature.attributes.TeamCode.split("),").join(")<br/>") + "</strong>";

//            return ret;
//        },
//        title: "Supervisor Settlement Info<br/>"
//    };

IDENTIFY_INFOTEMPLATES[0] = {
    content: function (data) {
        var ret = "Team code : <strong>" + data.feature.attributes.TeamCode + "</strong><br/>";
        ret += "Campaign day : <strong>" + data.feature.attributes.CampaignDay + "</strong><br/>";
        ret += "Time : <strong>" + data.feature.attributes.TimeStamp + "</strong><br/><br/>";

        if (data.feature.attributes.IsSpeedValid == 0)
            ret += "<strong>Speed not valid</strong><br/>";
        
        if (data.feature.attributes.IsWithinDates == 0)
            ret += "<strong>Not within campaign dates</strong><br/>";

        return ret;
    },
    title: "Team ID : ${TeamID}<br/>"
};


var CAMPAIGN_DAY_LAYERS = [0];
var TEAM_CODE_LAYERS = [0];

var PARAM_CAMPAIGN_ID = "campaignId";
var PARAM_DAY = "day";
var PARAM_TEAM_CODE = "teamCode";
var PARAM_LAYER_TYPE = "layerType";
var PARAM_LAYER_CODE = "layerCode";

//the extent of Kano and a bit more
MAP_EXTENT = {
    "xmin": 7.6,
    "ymin": 10.5,
    "xmax": 9.4,
    "ymax": 12.6
};

LAYERS_EXTENT_TYPE_CODE = {
    "State": {
        "id": 11,
        "field": "StateCode",
        "searchField": "StateCode",
        "outFields": "OBJECTID"
    },
    "LGA": {
        "id": 12,
        "field": "LGACode",
        "searchField": "LGACode",
        "outFields": "OBJECTID"
    },
    "Ward": {
        "id": 13,
        "field": "WardCode",
        "searchField": "WardCode",
        "outFields": "OBJECTID"
    },
    "BUA": {
        "id": 7,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "HA": {
        "id": 9,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "SSA": {
        "id": 8,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "NIGERIA.DBO.VTS_GPRefLyrSSABuffers.OBJECTID"
    }	
};