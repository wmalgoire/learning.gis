/** URL of the mapservice **/
//var URL_VTS_AGS = 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Fire/Sheep/MapServer';

/** Url of the printtask **/
//var URL_PRINT = "http://arcgis.eocng.org/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";

/** Basemap VTS URLs **/
//var URL_VTS_BASEMAP_SCALE_0_13 = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
//var URL_VTS_BASEMAP_SCALE_14_18 = 'http://arcgis.eocng.org/arcgis/rest/services/Basemaps/VTSBasemap/MapServer';

/** Name of the parameter used to get application type 
* supported appTypes listed in boot.js
**/
var PARAM_APP_TYPE    = "appType";
var PARAM_EXTENT      = "extent";
var PARAM_MAPSERVICE  = "mapservice";
var PARAM_QUERYLAYERS = "queryLayers";

var IS_ONLINE = true;

var PARAM_OPEN_LEFT_PANEL = "openLeftPanel";

var MAP_SCALE_CHANGE = 50000; // Between level 13 and 14 (72'224 - 36'112)
var BING_MAP_KEY = "AvYDY5yObQcXVw58nbPXt3ymraoGNf3lPjPR5b2KYht5zc_xQkJD07IwWyWVn3ok";

/** Title of the App (also used in the print templates) **/
var APP_TITLE = "Vaccination Tracking System";

/** Author (used in the print templates) **/
var APP_AUTHOR = "Powered by Novel-T";

/** Theme color **/
var THEME_COLOR = "#4599CA";

/** Determines if the left panel should be opened by default **/
var LEFT_PANEL_OPEN = false;


/** URL of a proxy (used for crossdomain requests) **/
var URL_PROXY = "/Handlers/MapProxy/proxy.ashx";

/** Map extent **/
//var MAP_EXTENT = {
//    "xmin": -20,
//    "ymin": -25,
//    "xmax": 50,
//    "ymax": 40
//};
//if it is null, then the default map extent of the map service will be used.
var MAP_EXTENT = null;


/** Print layouts **/
var PRINT_LAYOUTS = [
    {
        "layout": "MAP_ONLY",
        "label": "Image",
        "format": "png32",
        "exportOptions": {
            "width": 1100,
            "height": 800,
            "dpi": 150
        }
    },
    {
        "layout": "A4_Landscape",
        "label": "PDF",
        "format": "pdf",
        "options": {
            "legendOptions": [],
            "titleText": APP_TITLE        
        }
    }
];


/** Symbology used to highlight features **/
var AREA_BORDER_THICKNESS = 2;
var AREA_BORDER_COLOR = [255, 0, 255];
var AREA_FILL_COLOR = [0, 255, 255, 0.1];

/** Default visibility of the layers **/
var LAYERS_VISIBLE = null;
var LAYERS_REFRESH_DELAY = 1000;

//by default all the layers show up in the layer selector tab. But it is possible to exclude a few. (In that case the visibility will still apply, but it cannot be changed on the UI
var LAYERS_NOT_SHOWN_IN_LAYERS_LIST = [];

/** Identify on Map click **/
var IDENTIFY_TOLERANCE = 3;
var IDENTIFY_QUERYABLE_LAYERS = [];

//Specify infowindowContent
var IDENTIFY_INFOTEMPLATES = [];

var LAYERS_EXTENT_TYPE_CODE = {};



//----------------------------------------------------------------------------------
//------------------   MODULES CONFIGURATION  --------------------------------------
//----------------------------------------------------------------------------------
var BASEMAP_MODULE   = true;
var WATERSHED_MODULE = false;
var XY_MODULE        = false;
var PRINT_MODULE = true;
var PANELINFO_MODULE = true;
var GOTO_MODULE = true;
var HIGHLIGHTSELECTION_MODULE = true;
var CAMPAIGNBROWSER_MODULE = false;
