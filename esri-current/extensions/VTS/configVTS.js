// ==========================================================================================
//==============                Override Generic Configuration                ==============//
// ==========================================================================================
APP_TITLE  = "Vaccination Tracking System";
THEME_COLOR = "#80AB00";
//URL_VTS_AGS = 'http://arcgis.eocng.org/arcgis/rest/services/';



/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [3,4];
//Specify infowindowContent
IDENTIFY_INFOTEMPLATES[3] = {
    content: "TeamCode : <strong>${TeamCode}</strong> <br/> Campaign Day : <strong>${CampaignDay}</strong> <br/> Time : <strong>${TimeStamp}</strong>",
    title: "Team ID : ${TeamID}<br/>"
};
IDENTIFY_INFOTEMPLATES[4] = {
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

IDENTIFY_INFOTEMPLATES[15] = {
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



// ==========================================================================================
//==============                 VTS Specific Configuration                  ==============//
// ==========================================================================================

/** URL parameters **/
PARAM_LAYER_TYPE = "layerType";
PARAM_LAYER_CODE = "layerCode";
PARAM_DAY = "day";
PARAM_TRACK_CUMULATIVE = "trackCumulative";
PARAM_CAMPAIGN_ID = "campaignId";


LAYERS_VISIBLE = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 15, 16, 17];

/** Layers used to retreive extent according to the feature requested **/
LAYERS_EXTENT_TYPE_CODE = {
    "State": {
        "id": 15,
        "field": "StateCode",
        "searchField": "StateCode",
        "outFields": "OBJECTID"
    },
    "LGA": {
        "id": 16,
        "field": "LGACode",
        "searchField": "LGACode",
        "outFields": "OBJECTID"
    },
    "Ward": {
        "id": 17,
        "field": "WardCode",
        "searchField": "WardCode",
        "outFields": "OBJECTID"
    },
    "BUA": {
        "id": 10,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "HA": {
        "id": 8,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "SSA": {
        "id": 6,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "NIGERIA.DBO.VTS_GPRefLyrSSABuffers.OBJECTID"
    }
};

/** Layers used to represent BUAs 50x50 grid cells / SSA and/or Hamlets visited/not visited **/
var LAYERS_DENOMINATOR_TYPE_CODE = {
    "BUA50x50GridCells": {
        "id": 9,
        "dayField": "CampaignDay",
        "campaignField": "CampaignID",
        "SettlementTypeField": "SettlementType",
        "SettlementType": "BUA"
    },
    "Hamlets": {
        "id": 7,
        "dayField": "CampaignDay",
        "campaignField": "CampaignID",
        "SettlementTypeField": "SettlementType",
        "SettlementType": "HA"
    },
    "SmallSettlements": {
        "id": 6,
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
    "layerIdTracksInvalid": 4,
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
