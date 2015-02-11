(function(mapClient) {
  'use strict';

  /** URL of the mapservice **/
  //URL_VTS_AGS = 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Fire/Sheep/MapServer';

  /** Url of the printtask **/
  //URL_PRINT = "http://arcgis.eocng.org/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";

  /** Basemap VTS URLs **/
  //URL_VTS_BASEMAP_SCALE_0_13 = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
  //var URL_VTS_BASEMAP_SCALE_14_18 = 'http://arcgis.eocng.org/arcgis/rest/services/Basemaps/VTSBasemap/MapServer';

  /** Name of the parameter used to get application type 
   * supported appTypes listed in boot.js
   **/

  mapClient.config = {
    PARAM_APP_TYPE: "appType",
    PARAM_EXTENT: "extent",
    PARAM_MAPSERVICE: "mapservice",
    PARAM_QUERYLAYERS: "queryLayers",

    IS_ONLINE: true,

    PARAM_OPEN_LEFT_PANEL: "openLeftPanel",

    MAP_SCALE_CHANGE: 50000, // Between level 13 and 14 (72'224 - 36'112)
    BING_MAP_KEY: "AvYDY5yObQcXVw58nbPXt3ymraoGNf3lPjPR5b2KYht5zc_xQkJD07IwWyWVn3ok",

    /** Title of the App (also used in the print templates) **/
    APP_TITLE: "Vaccination Tracking System",

    /** Author (used in the print templates) **/
    APP_AUTHOR: "Powered by Novel-T",

    /** Theme color **/
    THEME_COLOR: "#4599CA",

    /** Determines if the left panel should be opened by default **/
    LEFT_PANEL_OPEN: false,

    /** URL of a proxy (used for crossdomain requests) **/
    URL_PROXY: "/Handlers/MapProxy/proxy.ashx",

    /** Map extent **/
    //MAP_EXTENT: {
    //    "xmin": -20,
    //    "ymin": -25,
    //    "xmax": 50,
    //    "ymax": 40
    //},
    //if it is null, then the default map extent of the map service will be used.
    MAP_EXTENT: null,

    /** Print layouts **/
    PRINT_LAYOUTS: [{
      "layout": "MAP_ONLY",
      "label": "Image",
      "format": "png32",
      "exportOptions": {
        "width": 1100,
        "height": 800,
        "dpi": 150
      }
    }, {
      "layout": "A4_Landscape",
      "label": "PDF",
      "format": "pdf",
      "options": {
        "legendOptions": [],
        "titleText": mapClient.config.APP_TITLE
      }
    }],

    /** Symbology used to highlight features **/
    AREA_BORDER_THICKNESS: 2,
    AREA_BORDER_COLOR: [255, 0, 255],
    AREA_FILL_COLOR: [0, 255, 255, 0.1],

    /** Default visibility of the layers **/
    LAYERS_VISIBLE: null,
    LAYERS_REFRESH_DELAY: 1000,

    //by default all the layers show up in the layer selector tab. But it is possible to exclude a few. (In that case the visibility will still apply, but it cannot be changed on the UI
    LAYERS_NOT_SHOWN_IN_LAYERS_LIST: [],

    /** Identify on Map click **/
    IDENTIFY_TOLERANCE: 3,
    IDENTIFY_QUERYABLE_LAYERS: [],

    //Specify infowindowContent
    IDENTIFY_INFOTEMPLATES: [],

    LAYERS_EXTENT_TYPE_CODE: {},
    //----------------------------------------------------------------------------------
    //------------------   MODULES CONFIGURATION  --------------------------------------
    //----------------------------------------------------------------------------------
    BASEMAP_MODULE: true,
    WATERSHED_MODULE: false,
    XY_MODULE: false,
    PRINT_MODULE: true,
    PANELINFO_MODULE: true,
    GOTO_MODULE: true,
    HIGHLIGHTSELECTION_MODULE: true,
    CAMPAIGNBROWSER_MODULE: false
  };


})(window.mapClient = window.mapClient || {});