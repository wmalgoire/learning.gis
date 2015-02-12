/**
 * Class: Main VTS application.
 *
 * This module declares a singleton object, that is intended to be used
 * directly.
 */
(function(mapClient) {
  'use strict';
  /*globals dojo, require, esri */

  // private properties
  var config = mapClient.config;
  var events = mapClient.events;

  // public properties
  mapClient.lastSelectedIndex = null;
  mapClient.loading = null;
  mapClient.dynamicLayer = null;
  mapClient.moduleManager = null;
  mapClient.visible = [];
  mapClient.legend = null;
  mapClient.mapServiceURL = null;
  mapClient.ignoreAddMap = false;
  mapClient.queryableLayers = null;

  // public methods
  mapClient.initialize = initialize;
  mapClient.loadUI = loadUI;
  mapClient.setHeavyLoading = setHeavyLoading;
  mapClient.updateThemeColor = updateThemeColor;
  mapClient.testTokenNeeded = testTokenNeeded;
  mapClient.setLeftPanelOpen = setLeftPanelOpen;
  mapClient.selectIndex = selectIndex;
  mapClient.componentToHex = componentToHex;
  mapClient.rgbToHex = rgbToHex;
  mapClient.showLoading = showLoading;
  mapClient.hideLoading = hideLoading;
  mapClient.objectContainsKey = objectContainsKey;
  mapClient.extractUrlParams = extractUrlParams;
  mapClient.setExtent = setExtent;
  mapClient.zoomToExtent = zoomToExtent;
  mapClient.zoomToExtentUsingSearchField = zoomToExtentUsingSearchField;
  mapClient.addMapWithExtent = addMapWithExtent;

  ////////////////

  // public methods implementation

  function initialize() {
    mapClient.loadUI();

    var params = mapClient.extractUrlParams();
    if (params[config.PARAM_MAPSERVICE] !== null && params[config.PARAM_MAPSERVICE].length > 0) {
      config.URL_VTS_AGS = decodeURIComponent(params[config.PARAM_MAPSERVICE]);
    }
    mapClient.mapServiceURL = config.URL_VTS_AGS;

    if (!mapClient.ignoreAddMap) {
      Map.addMap(null);
    }

    events.trigger(events.APP_INITIALIZED, null);
  }

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
  ], loadUI);

  function loadUI(declare, dom, domStyle, domClass, domConstruct, mouse, on) {
    mapClient.updateThemeColor();

    mapClient.loading = dojo.byId("loadingImg");

    /** Reduce / Expand Buttons **/
    on(dom.byId("imgReduce"), "click", function() {
      mapClient.setLeftPanelOpen(false);
    });

    on(dom.byId("imgExpand"), "click", function() {
      mapClient.setLeftPanelOpen(true);
      if (mapClient.lastSelectedIndex >= 0) {
        mapClient.selectIndex(mapClient.lastSelectedIndex);
      } else {
        mapClient.selectIndex(0);
      }
    });

    /** Control Buttons **/
    on(dom.byId("imgLegend"), "click", function() {
      //domClass.toggle("panelTitle", "panelTitleOn");
      // domClass.toggle("panelContent", "panelContentVisible");
      mapClient.setLeftPanelOpen(true);
      mapClient.selectIndex(0);
    });

    on(dom.byId("imgLayers"), "click", function() {
      mapClient.setLeftPanelOpen(true);
      mapClient.selectIndex(1);
    });

    //APP Title
    dojo.byId("panelMain").innerHTML = config.APP_TITLE;

    var shouldOpen = config.LEFT_PANEL_OPEN;
    var params = mapClient.extractUrlParams();
    var openParam = params[config.PARAM_OPEN_LEFT_PANEL];

    if (null !== openParam) {
      shouldOpen = (openParam.toLowerCase() === "true");
    }

    mapClient.setLeftPanelOpen(shouldOpen);
    if (shouldOpen) {
      if (mapClient.lastSelectedIndex >= 0) {
        mapClient.selectIndex(mapClient.lastSelectedIndex);
      } else {
        mapClient.selectIndex(0);
      }
    }
  }

  function setHeavyLoading(isLoading) {
    var display = isLoading ? 'block' : 'none';
    //dojo.style(dojo.byId("heavyLoadingDiv"), 'display', display);
  }

  /**
   * Updates the colors of the theme programmatically
   **/
  function updateThemeColor() {
    dojo.query(".bg").style("display", "block");
  }

  /**
   * tests whether a token is needed for the operational layer
   **/
  function testTokenNeeded() {
    var tokenLayer = new esri.layers.ArcGISDynamicMapServiceLayer(
      mapClient.mapServiceURL
    );

    dojo.connect(tokenLayer, "onLoad", function(layer) {
      if (console) console.info("$$$ layer: " + layer.url + " no token required");
    });

    dojo.connect(tokenLayer, "onError", function(error) {
      if (console) console.info("$$$ Error: " + error.code);
    });
  }

  /**
   * Opens or reduce the left panel
   **/
  function setLeftPanelOpen(shouldOpen) {
    if (!shouldOpen) {
      dojo.style(dojo.byId("imgReduce"), "display", "none");
      dojo.style(dojo.byId("imgExpand"), "display", "block");
      mapClient.selectIndex(-1);
    } else {
      dojo.style(dojo.byId("imgReduce"), "display", "block");
      dojo.style(dojo.byId("imgExpand"), "display", "none");
    }
  }

  /**
   * Select the given in the list of control buttons
   **/
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
  ], selectIndex);

  function selectIndex(declare, dom, domStyle, domClass, domConstruct, mouse, on, parser, index) {

    if (index === null) {
      index = 0;
    }

    domClass.remove("legendContent", "contentPaneVisible");
    domClass.remove("layersContent", "contentPaneVisible");
    domClass.remove("filtersContent", "contentPaneVisible");
    domClass.remove("imgLegend", "imgOver");
    domClass.remove("imgLayers", "imgOver");
    domClass.remove("imgFilters", "imgOver");

    if (index >= 0) {

      mapClient.lastSelectedIndex = index;
      domClass.add("panelTitle", "panelTitleOn");
      domClass.add("panelContent", "panelContentVisible");
      if (index === 0) {
        domClass.add("legendContent", "contentPaneVisible");
        domClass.add("imgLegend", "imgOver");
      } else if (index === 1) {
        domClass.add("layersContent", "contentPaneVisible");
        domClass.add("imgLayers", "imgOver");
      } else if (index === 2) {
        domClass.add("filtersContent", "contentPaneVisible");
        domClass.add("imgFilters", "imgOver");
      }
    } else {
      domClass.remove("panelTitle", "panelTitleOn");
      domClass.remove("panelContent", "panelContentVisible");
    }

    events.trigger(events.TAB_SELECTED_CHANGE, index);
  }

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + mapClient.componentToHex(r) + mapClient.componentToHex(g) + mapClient.componentToHex(b);
  }

  function showLoading() {
    esri.show(mapClient.loading);
  }

  function hideLoading() {
    var self = mapClient;

    if (!self.dynamicLayer.suspended) {
      esri.hide(self.loading);
    }
  }

  function objectContainsKey(attribute, id) {
    if (attribute[id] == null) {
      return false;
    }
    return true;
  }

  function extractUrlParams() {
    var self = mapClient;

    var kvp = location.search.substring(1).split("&");
    var params = [];

    for (var i = 0; i < kvp.length; i++) {
      var x = kvp[i].split("=");
      params[x[0]] = x[1];
    }

    self.setExtent(params);

    return params;
  }

  function setExtent(queryParameters) {
    if (queryParameters[config.PARAM_EXTENT]) {
      var values = queryParameters[config.PARAM_EXTENT].split(',');
      if (values.length !== 4)
        return;

      config.MAP_EXTENT = {
        "xmin": parseFloat(values[0]),
        "ymin": parseFloat(values[1]),
        "xmax": parseFloat(values[2]),
        "ymax": parseFloat(values[3]),
      };
    }
  }

  function zoomToExtent(layerType, layerCode, highlightFeature, callback) {
    if (config.LAYERS_EXTENT_TYPE_CODE[layerType]) {
      var configLayersExtentTypeCode = config.LAYERS_EXTENT_TYPE_CODE[layerType];
      var layerId = configLayersExtentTypeCode.id;
      var queryField = configLayersExtentTypeCode.field;
      var outFields = configLayersExtentTypeCode.outFields;

      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.mapServiceURL + "/" + layerId);
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
  }

  function zoomToExtentUsingSearchField(layerType, layerCode, highlightFeature, callback) {
    if (config.LAYERS_EXTENT_TYPE_CODE[layerType]) {
      var configLayersExtentTypeCode = config.LAYERS_EXTENT_TYPE_CODE[layerType];
      var layerId = configLayersExtentTypeCode.id;
      var queryField = configLayersExtentTypeCode.searchField;
      var outFields = configLayersExtentTypeCode.outFields;
      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.mapServiceURL + "/" + layerId);
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
  }

  function addMapWithExtent(layerType, layerCode, forceShowLayer) {
    if (forceShowLayer === undefined || forceShowLayer === null) {
      forceShowLayer = true;
    }
    // Get params from config
    if (config.LAYERS_EXTENT_TYPE_CODE[layerType]) {
      var configLayersExtentTypeCode = config.LAYERS_EXTENT_TYPE_CODE[layerType];

      var layerId = configLayersExtentTypeCode.id;
      var queryField = configLayersExtentTypeCode.field;
      var outFields = configLayersExtentTypeCode.outFields;

      // Set the current layer visible (if not already)
      if (forceShowLayer && dojo.indexOf(config.LAYERS_VISIBLE, layerId) === -1) {
        config.LAYERS_VISIBLE.push(layerId);
      }

      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.mapServiceURL + "/" + layerId);
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
  }

})(window.mapClient = window.mapClient || {});
