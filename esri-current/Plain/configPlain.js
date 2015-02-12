// ==========================================================================================
//==============                 Override core configuration                  ==============//
// ==========================================================================================
URL_VTS_AGS = URL_VTS_AGS + 'Shared/OperationalLayers/MapServer';
APP_TITLE = "VTS Map";

MAP_EXTENT = {
    "xmin": 0,
    "ymin": 4,
    "xmax": 15,
    "ymax": 14
};

LAYERS_VISIBLE = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14];
LAYERS_REFRESH_DELAY = 1000;

/** Identify on Map click **/
IDENTIFY_QUERYABLE_LAYERS = [];

// ==========================================================================================
//==============                 Plain Specific Configuration                  ==============//
// ==========================================================================================

/** URL parameters **/
var PARAM_LAYER_TYPE = "layerType";
var PARAM_LAYER_CODE = "layerCode";

/** Layers used to retreive extent according to the feature requested **/
LAYERS_EXTENT_TYPE_CODE = {
    "State": {
        "id": 12,
        "field": "StateCode",
        "searchField": "StateCode",
        "outFields": "OBJECTID"
    },
    "LGA": {
        "id": 13,
        "field": "LGACode",
        "searchField": "LGACode",
        "outFields": "OBJECTID"
    },
    "Ward": {
        "id": 14,
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
    "SSA": {
        "id": 3,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "HA": {
        "id": 5,
        "field": "SettlementObjectId",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "PrimarySettlementName": {
        "id": 0,
        "field": "SettlementGlobalID",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    },
    "AlternateSettlementName": {
        "id": 1,
        "field": "SettlementGlobalID",
        "searchField": "GlobalID",
        "outFields": "OBJECTID"
    }
};


//----------------------------------------------------------------------------------
//------------------   MODULES CONFIGURATION  --------------------------------------
//----------------------------------------------------------------------------------
XY_MODULE = true;
