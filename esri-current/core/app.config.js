(function(mapClient, utils) {
  'use strict';

  mapClient.config = {
    initialize: initialize,

    IS_ONLINE: true,

    APP: {
      TITLE: "Vaccination Tracking System",
      AUTHOR: "Powered by Novel-T"
    },

    UI: {
      THEME_COLOR: "#4599CA",
      LEFT_PANEL_OPEN: false
    },

    URL_PARAMS: {
      APP_TYPE: "appType",
      EXTENT: "extent",
      MAPSERVICE: "mapservice",
      QUERYLAYERS: "queryLayers",
      OPEN_LEFT_PANEL: "openLeftPanel",
      LAYER_TYPE: "layerType",
      LAYER_CODE: "layerCode"
    },

    APIS: {
      PROXY: "/Handlers/MapProxy/proxy.ashx", // used for crossdomain requests
      MAPSERVICE: ""
    },

    MAP: {
      EXTENT: null,
      SCALE_CHANGE: 50000, // between level 13 and 14 (72'224 - 36'112)
      BING_KEY: "AvYDY5yObQcXVw58nbPXt3ymraoGNf3lPjPR5b2KYht5zc_xQkJD07IwWyWVn3ok",
    },

    /** Default visibility of the layers */
    LAYERS: {
      VISIBLE: null,
      REFRESH_DELAY: 1000,
      NOT_SHOWN_IN_LIST: [],
      EXTENT_TYPE_CODE: {}
    },

    /** Symbology used to highlight features */
    HIGHLIGHT_FEATURE: {
      AREA_BORDER_THICKNESS: 2,
      AREA_BORDER_COLOR: [255, 0, 255],
      AREA_FILL_COLOR: [0, 255, 255, 0.1]
    },

    PRINT: {
      LAYOUTS: [{
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
          "titleText": "Vaccination Tracking System"
        }
      }]
    },

    /** Identify on Map click **/
    IDENTIFY_CLICK: {
      TOLERANCE: 3,
      QUERYABLE_LAYERS: [],
      INFOTEMPLATES: []
    },

    MODULES: {
      BASEMAP: true,
      WATERSHED: false,
      XY: false,
      PRINT: true,
      PANELINFO: true,
      GOTO: true,
      HIGHLIGHTSELECTION: true,
      CAMPAIGNBROWSER: false
    }
  };

  ////////////////

  function initialize() {
    mapClient.urlParams = utils.params.extractUrlParams();
    mapClient.services.initialize();
  }

})(window.mapClient, window.mapClient.utils);
