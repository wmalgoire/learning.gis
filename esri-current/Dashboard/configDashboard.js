// ==========================================================================================
//==============                 Override core configuration                  ==============//
// ==========================================================================================
URL_SERVICE_BASE = 'Dashboard/Dashboard';


// LQAS and coverage data are exclusive, so we can set the title accordingly:
var TITLE_CONFIG = {
    20: 'LQAS',
    23: 'Geo-Coverage'
};

if (coverage) {
    APP_TITLE = TITLE_CONFIG[23];
    LAYERS_VISIBLE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, /*21,*/ 25, 30];
} else {
    APP_TITLE = TITLE_CONFIG[20];
    LAYERS_VISIBLE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, /*25,*/ 30];
}




LAYERS_REFRESH_DELAY = 1000;

LAYERS_NOT_SHOWN_IN_LAYERS_LIST = [3,4,5,7,8,9,11,12,13,14,16,17,18,19];

/** Identify on Map click **/
/*put the more specific to the front*/
IDENTIFY_QUERYABLE_LAYERS = [0,24, 28, 21, 25, 29, 22, 26, 30];


//Specify infowindowContent
IDENTIFY_INFOTEMPLATES[0] = {
    content: function (data) {
        var ret = "";
        ret += "<div>LGA: <b>" + data.feature.attributes.LGAName + "</b><br/><br/>";

        ret += "Date of onset: <b>" + data.feature.attributes.DateOfOnset + "</b><br/>";
        ret += "Type: <b>" + data.feature.attributes.Type + "</b><br/>";
        if (data.feature.attributes.Sex == 'Null') {
            ret += "Sex: -<br/>";
        } else if (data.feature.attributes.Sex == 0) {
            ret += "Sex: <b>Male</b><br/>";
        } else {
            ret += "Sex: <b>Female</b><br/>";
        }
        ret += "Age (in month): <b>" + data.feature.attributes.Age + "</b><br/>";
        ret += "Number of doses: <b>" + data.feature.attributes.Doses + "</b></div>";

        
        
        return ret;
    },
    title: "WPV Case Info"
};

var LAYER_LEVELS = {
    "State": [22, 26, 30],
    "LGA": [21, 25, 29],
    "Ward": [24, 28]
};

for (var i = 0; i < LAYER_LEVELS.State.length; i++) {
    IDENTIFY_INFOTEMPLATES[LAYER_LEVELS.State[i]] = {
        content: function (data) {
            var ret = "<div>State name: ${StateName}</div><br/>";

            ret += "<div><a href='javascript:void(0);' onclick='javascript:Application_Dashboard.viewDetails(\"State\", \"${StateCode}\");'>View state details</a></div>";

            return ret;
        },
        title: "State Level Info"
    };
}

for (var i = 0; i < LAYER_LEVELS.LGA.length; i++) {
    IDENTIFY_INFOTEMPLATES[LAYER_LEVELS.LGA[i]] = {
        content: function (data) {
            var ret = "<div>LGA name: ${LGAName}</div><br/>";

            ret += "<div><a href='javascript:void(0);' onclick='javascript:Application_Dashboard.viewDetails(\"LGA\", \"${LGACode}\");'>View LGA details</a></div>";

            return ret;
        },
        title: "LGA Level Info"
    };
}

for (var i = 0; i < LAYER_LEVELS.Ward.length; i++) {
    IDENTIFY_INFOTEMPLATES[LAYER_LEVELS.Ward[i]] = {
        content: function (data) {
            var ret = "<div>Ward name: ${WardName}</div><br/>";

            ret += "<div><a href='javascript:void(0);' onclick='javascript:Application_Dashboard.viewDetails(\"Ward\", \"${WardCode}\");'>View ward details</a></div>";

            return ret;
        },
        title: "Ward Level Info"
    };
}


//the extent of Kano and a bit more

MAP_EXTENT = {
    "xmin": 0,
    "ymin": 4,
    "xmax": 15,
    "ymax": 14
};



/** URL parameters **/
var PARAM_LAYER_TYPE = "layerType";
var PARAM_LAYER_CODE = "layerCode";


//layer config to indicate which is the group header, how many layers are in the group and where to get the dropdown filter options
var LAYER_CONFIG = {
    "case": {
        "group": 0,
        "number": 0,
        "categoriesUrl": "/api/Dashboard/GetCasesConfig"
    },
    "lqas": {
        "group": 20,
        "number": 2,
        "categoriesUrl": "/api/Dashboard/GetLqasConfig"
    },
    "coverage": {
        "group": 23,
        "number": 3,
        "categoriesUrl": "/api/Dashboard/GetCoverageConfig"
    }
};

LAYERS_EXTENT_TYPE_CODE = {
    "State": {
        "id": 30,
        "field": "StateCode",
        "outFields": "OBJECTID"
    },
    "LGA": {
        "id": 29,
        "field": "LGACode",
        "outFields": "OBJECTID"
    },
    "Ward": {
        "id": 28,
        "field": "WardCode",
        "outFields": "NIGERIA.DBO.Boundary_VaccWards.OBJECTID"
    },
};


//----------------------------------------------------------------------------------
//------------------   MODULES CONFIGURATION  --------------------------------------
//----------------------------------------------------------------------------------
BASEMAP_MODULE = false;