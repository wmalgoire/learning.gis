// ==========================================================================================
//==============                 Override core configuration                  ==============//
// ==========================================================================================
URL_SERVICE_BASE = 'HealthCamps/HealthCamps_';
APP_TITLE = "Health Camps";

// there are 11 layers for each day
//NUMBER_OF_LAYERS_PER_DAY = 11;

var LAYER_FOR_DAYS = 25;

//show only the boundaries (LGA, Ward) by default. The day dependent layers will be enabled later
LAYERS_VISIBLE = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
//do not display the root group layer
//do not display the root group layer
LAYERS_NOT_SHOWN_IN_LAYERS_LIST = [0];
LAYERS_REFRESH_DELAY = 1000;

/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [12,13,14,19,2,4];


//Specify infowindowContent

IDENTIFY_INFOTEMPLATES[12] =
    IDENTIFY_INFOTEMPLATES[13] =
    IDENTIFY_INFOTEMPLATES[14] = {
        content: function(data) {
            var ret = "";
            ret += "Settlement: <strong>" + data.feature.attributes.SettlementName + "</strong><br/><br/>";
            if (data.feature.attributes.CampaignDay) {
                ret += "Campaign day: <strong>" + data.feature.attributes.CampaignDay + "</strong> <br/>";
            }
            ret += "Approx. time spent there: <strong>" + Application_HealthCamp.formatTime(data.feature.attributes.ApproxHrsSpentAllTeams) + "</strong> <br/>";
            ret += "Number of teams considered: <strong>" + data.feature.attributes.NbTeams + "</strong><br/>";
            ret += "Team codes: <strong>" + data.feature.attributes.TeamCode + "</strong>";

            return ret;
        },
        title: "Health Camp Settlement Info<br/>"
    };
IDENTIFY_INFOTEMPLATES[19] = {
    content: function(data) {
        var ret = "";
        ret += "Ward: <strong>" + data.feature.attributes.WardName + "</strong><br/><br/>";
        if (data.feature.attributes.CampaignDay) {
            ret += "Campaign day: <strong>" + data.feature.attributes.CampaignDay + "</strong> <br/>";
        }
        ret += "Approx. time spent there: <strong>" + Application_HealthCamp.formatTime(data.feature.attributes.ApproxHrsSpentAllTeams) + "</strong> <br/>";
        ret += "Number of teams considered: <strong>" + data.feature.attributes.NbTeams + "</strong><br/>";
        ret += "Team codes: <strong>" + data.feature.attributes.TeamCode + "</strong>";

        return ret;
    },
    title: "Health Camp Ward Info<br/>"
};

IDENTIFY_INFOTEMPLATES[2] = {
    content: function (data) {
        var ret = "";
        //ret += "Ward: <strong>" + data.feature.attributes.WardName + "</strong><br/><br/>";
        if (data.feature.attributes.CampaignDay) {
            ret += "Campaign day: <strong>" + data.feature.attributes.CampaignDay + "</strong> <br/> <br/>";
        }
        ret += "Team <strong>" + data.feature.attributes.TeamCode + "</strong> spent approx. <strong>" + (data.feature.attributes.CountNearHealthFacility * 2 / 60).toFixed(2) + "</strong> hours at this health facility<br/>";

        return ret;
    },
    title: "Team at Health Facility<br/>"
};

IDENTIFY_INFOTEMPLATES[4] = {
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




var CAMPAIGN_DAY_LAYERS = [2,4,9,12,13,14,19];

var PARAM_CAMPAIGN_ID = "campaignId";
var PARAM_DAY = "day";

//the extent of Kano and a bit more
MAP_EXTENT = {
    "xmin": 7.6,
    "ymin": 10.5,
    "xmax": 9.4,
    "ymax": 12.6
};