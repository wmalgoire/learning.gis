// ==========================================================================================
//==============                Override Generic Configuration                ==============//
// ==========================================================================================
APP_TITLE  = "Vaccination Tracking System";
THEME_COLOR = "#80AB00";
IS_ONLINE = false;

/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [3];
//Specify infowindowContent
IDENTIFY_INFOTEMPLATES[3] = {
    content: function (data) {
        var ret = "Team code : <strong>" + data.feature.attributes.TeamCode + "</strong><br/>";
        ret += "Campaign day : <strong>" + data.feature.attributes.CampaignDay + "</strong><br/>";
        ret += "Time : <strong>" + data.feature.attributes.TimeStamp + "</strong><br/><br/>";

        if (data.feature.attributes.IsSpeedValid == 0)
            ret += "<strong>Speed not valid</strong><br/>";

        if (data.feature.attributes.IsInWorkingPeriod == 0)
            ret += "<strong>Not in working period</strong><br/>";

        if (data.feature.attributes.IsWithinDates == 0)
            ret += "<strong>Not within campaign dates</strong><br/>";

        return ret;
    },
    title: "Team ID : ${TeamID}<br/>"
};


LAYERS_VISIBLE = [3,6,9,18];

// ==========================================================================================
//==============                 VTS Specific Configuration                  ==============//
// ==========================================================================================

/** URL parameters **/
var PARAM_LAYER_TYPE = "layerType";
var PARAM_LAYER_CODE = "layerCode";
var PARAM_DAY = "day";
var PARAM_TRACK_CUMULATIVE = "trackCumulative";
var PARAM_CAMPAIGN_ID = "campaignId";

/** Layers used to retreive extent according to the feature requested **/
LAYERS_EXTENT_TYPE_CODE = {
    "State": {
        "id": 18,
        "field": "StateCode",
        "searchField": "StateCode",
        "outFields": "OBJECTID"
    },
    "LGA": {
        "id": 17,
        "field": "LGACode",
        "searchField": "LGACode",
        "outFields": "OBJECTID"
    },
    "Ward": {
        "id": 9,
        "field": "WardCode",
        "searchField": "WardCode",
        "outFields": "OBJECTID"
    },
    "BUA": {
        "id": 8,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "HA": {
        "id": 6,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "SSA": {
        "id": 4,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "NIGERIA.DBO.VTS_GPRefLyrSSABuffers.OBJECTID"
    }
};

/** Layers used to represent BUAs 50x50 grid cells / SSA and/or Hamlets visited/not visited **/
var LAYERS_DENOMINATOR_TYPE_CODE = {
    "BUA50x50GridCells": {
        "id": 7,
        "dayField": "CampaignDay",
        "campaignField": "CampaignID",
        "SettlementTypeField": "SettlementType",
        "SettlementType": "BUA"
    },
    "Hamlets": {
        "id": 5,
        "dayField": "CampaignDay",
        "campaignField": "CampaignID",
        "SettlementTypeField": "SettlementType",
        "SettlementType": "HA"
    },
    "SmallSettlements": {
        "id": 4,
        "dayField": "CampaignDay",
        "campaignField": "CampaignID",
        "SettlementTypeField": "SettlementType",
        "SettlementType": "SSA"
    }
};

var LAYERS_ADDITIONAL_FILTERS = {    
  "ValidatedAsNotMissed" : {
    "id": 0,
    "campaignField": "CampaignID"
  }
};

var LAYERS_TRACKS_INFOS = {
    "layerIdTracksValid": 3,
    "layerIdTracksInvalid": 3,
    "dayField": "CampaignDay",
    "campaignField": "CampaignID"
};

var FILTERS_SCALE_LIMIT = 80000;

var PLAYTRACKS_CONFIG = {
    animationDelayInMilliSec: 100,
    defaultMarkerSymbol: {
        "type": "esriSMS",
        //"style" : "< esriSMSCircle | esriSMSCross | esriSMSDiamond | esriSMSSquare | esriSMSX >",
        "style": "esriSMSDiamond",
        "color": [255, 0, 0, 128],
        "size": 10,
        "angle": 0,
        "xoffset": 0,
        "yoffset": 0,
        "outline": { //if outline has been specified
            "type": "esriSLS",
            //"style" : "esriSLSDash" | "esriSLSDashDotDot" | "esriSLSDot" | "esriSLSNull" | "esriSLSSolid"
            "style": "esriSLSSolid",
            "color": [0, 0, 0, 255],
            "width": 1
        }
    },
    colors: [[255, 0, 0, 128], [255, 128, 0, 128], [0, 0, 255, 128], [128, 0, 255, 128], [0, 255, 255, 128], [255, 0, 255, 128], [0, 0, 0, 128], [120, 120, 120, 128]]
};

//----------------------------------------------------------------------------------
//------------------   MODULES CONFIGURATION  --------------------------------------
//----------------------------------------------------------------------------------
BASEMAP_MODULE = false;
PRINT_MODULE = false;
GOTO_MODULE = true;
HIGHLIGHTSELECTION_MODULE = true;