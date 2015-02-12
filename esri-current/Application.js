/**
 * Class: Main VTS application.
 *
 * This module declares a singleton object, that is intended to be used
 * directly.
 */
// (function(mapClient) {
  'use strict';
  /* globals */

  window.Application = {

    dynamicLayer: null,

    moduleManager: null,

    visible: [],

    legend: null,

    mapServiceURL: null,

    ignoreAddMap: false,

    queryableLayers: null,



    /**
     * Method: initialize Initializes the module. Must be called once, before
     * interacting with the module.
     */
    initialize: function() {
      var self = Application;

      self.loadUI();

      var params = Application.extractUrlParams();
      if (params[PARAM_MAPSERVICE] != null && params[PARAM_MAPSERVICE].length > 0) {
        URL_VTS_AGS = decodeURIComponent(params[PARAM_MAPSERVICE]);
      }

      self.mapServiceURL = URL_VTS_AGS;

      if (!self.ignoreAddMap) {
        Map.addMap(null);
      }

      Event.trigger(Event.APP_INITIALIZED, null);

    },



    /**
     * Inits and loads the different UI components
     **/
    loadUI: function() {

      require([
        "dojo/_base/declare",
        "dojo/dom",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/mouse",
        "dojo/on",
        "dojo/parser",
        "dojo/domReady!"
      ], function(
        declare,
        dom,
        domStyle,
        domClass,
        domConstruct,
        mouse,
        on,
        parser
      ) {
        Application.updateThemeColor();

        mapClient.ui.loading.init();
        mapClient.ui.mainPanel.init(APP_TITLE);
        mapClient.ui.tabs.init();

        var shouldOpen = LEFT_PANEL_OPEN;
        var params = Application.extractUrlParams();
        var openParam = params[PARAM_OPEN_LEFT_PANEL];
        if (openParam !== null) {
          shouldOpen = (openParam.toLowerCase() === "true");
        }
        mapClient.ui.mainPanel.toggleState(shouldOpen);

      });
    },

    /**
     * Updates the colors of the theme programmatically
     **/
    updateThemeColor: function() {
      dojo.query(".bg").style("display", "block");
    },



    /**
     * tests whether a token is needed for the operational layer
     **/
    testTokenNeeded: function() {
      var self = Application;

      var tokenLayer = new esri.layers.ArcGISDynamicMapServiceLayer(
        self.mapServiceURL
      );

      dojo.connect(tokenLayer, "onLoad", function(layer) {
        if (console) console.info("$$$ layer: " + layer.url + " no token required");
      });

      dojo.connect(tokenLayer, "onError", function(error) {
        if (console) console.info("$$$ Error: " + error.code);
      });
    },

    /** Useful functions for the whole app **/
    componentToHex: function(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    },

    rgbToHex: function(r, g, b) {
      return "#" + Application.componentToHex(r) + Application.componentToHex(g) + Application.componentToHex(b);
    },

    /**
     * objectContainsKey
     **/
    objectContainsKey: function(attribute, id) {
      if (attribute[id] == null) {
        return false;
      }
      return true;
    },

    /**
     * Extract url parameters
     */
    extractUrlParams: function() {
      var self = Application;

      var kvp = location.search.substring(1).split("&");
      var params = [];

      for (var i = 0; i < kvp.length; i++) {
        var x = kvp[i].split("=");
        params[x[0]] = x[1];
      }

      self.setExtent(params);

      return params;
    },


    /**
     *setExtent
     **/
    setExtent: function(queryParameters) {
      if (queryParameters[PARAM_EXTENT]) {
        var values = queryParameters[PARAM_EXTENT].split(',');
        if (values.length !== 4)
          return;

        MAP_EXTENT = {
          "xmin": parseFloat(values[0]),
          "ymin": parseFloat(values[1]),
          "xmax": parseFloat(values[2]),
          "ymax": parseFloat(values[3]),
        };
      }
    },



    /**
     *zoomToExtent
     **/
    zoomToExtent: function(layerType, layerCode, highlightFeature, callback) {
      if (LAYERS_EXTENT_TYPE_CODE[layerType]) {
        var configLayersExtentTypeCode = LAYERS_EXTENT_TYPE_CODE[layerType];
        var layerId = configLayersExtentTypeCode.id;
        var queryField = configLayersExtentTypeCode.field;
        var outFields = configLayersExtentTypeCode.outFields;

        // Set the query
        var queryTask = new esri.tasks.QueryTask(Application.mapServiceURL + "/" + layerId);
        var query = new esri.tasks.Query();
        query.where = queryField + " = '" + layerCode + "'";
        query.outFields = [outFields];
        query.returnGeometry = true;

        // Send the query and add the map
        queryTask.execute(query, function(featureSet) {
          if (callback) {
            callback(featureSet);
          } else {
            Map.zoomTo(featureSet, highlightFeature);
          }
        });
      }
    },


    /**
     *zoomToExtent
     **/
    zoomToExtentUsingSearchField: function(layerType, layerCode, highlightFeature, callback) {
      if (LAYERS_EXTENT_TYPE_CODE[layerType]) {
        var configLayersExtentTypeCode = LAYERS_EXTENT_TYPE_CODE[layerType];
        var layerId = configLayersExtentTypeCode.id;
        var queryField = configLayersExtentTypeCode.searchField;
        var outFields = configLayersExtentTypeCode.outFields;
        // Set the query
        var queryTask = new esri.tasks.QueryTask(Application.mapServiceURL + "/" + layerId);
        var query = new esri.tasks.Query();
        query.where = queryField + " = '" + layerCode + "'";
        query.outFields = [outFields];
        query.returnGeometry = true;

        // Send the query and add the map
        queryTask.execute(query, function(featureSet) {
          if (callback) {
            callback(featureSet);
          } else {
            Map.zoomTo(featureSet, highlightFeature);
          }
        });
      }
    },

    /**
     * Retrieve the extent from a layer type and code and add the map
     */
    addMapWithExtent: function(layerType, layerCode, forceShowLayer) {
      if (forceShowLayer === undefined || forceShowLayer === null) {
        forceShowLayer = true;
      }
      // Get params from config
      if (LAYERS_EXTENT_TYPE_CODE[layerType]) {
        var configLayersExtentTypeCode = LAYERS_EXTENT_TYPE_CODE[layerType];

        var layerId = configLayersExtentTypeCode.id;
        var queryField = configLayersExtentTypeCode.field;
        var outFields = configLayersExtentTypeCode.outFields;

        // Set the current layer visible (if not already)
        if (forceShowLayer && dojo.indexOf(LAYERS_VISIBLE, layerId) == -1) {
          LAYERS_VISIBLE.push(layerId);
        }

        // Set the query
        var queryTask = new esri.tasks.QueryTask(Application.mapServiceURL + "/" + layerId);
        var query = new esri.tasks.Query();
        query.where = queryField + " = '" + layerCode + "'";
        query.outFields = [outFields];
        query.returnGeometry = true;

        // Send the query and add the map
        queryTask.execute(query, Map.addMap);

      } else {
        Map.addMap(null);
        alert("Layer type '" + layerType + "' doesn't exist.");
      }
    },
  };

// })(window.mapClient = window.mapClient || {});