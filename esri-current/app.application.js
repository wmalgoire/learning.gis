(function(mapClient) {
  'use strict';
  /* globals */

  mapClient.application = {
    moduleManager: null,
    visible: [],
    ignoreAddMap: false,
    initialize: initialize,
    createMap: createMap,
    setExtent: setExtent
  };

  mapClient.map = {
    esriMap: null,
    extent: {
      zoomToExtent: zoomToExtent,
      zoomToExtentUsingSearchField: zoomToExtentUsingSearchField
    }
  };

  mapClient.services = {
    mapServiceURL: null
  };

  mapClient.layers = {
    dynamicLayer: null,
    queryableLayers: null
  };

  mapClient.legend = {

  };

  ////////////////

  function initialize() {

    mapClient.ui.load();

    var params = mapClient.urlParams;
    if (params[PARAM_MAPSERVICE] != null && params[PARAM_MAPSERVICE].length > 0) {
      URL_VTS_AGS = decodeURIComponent(params[PARAM_MAPSERVICE]);
    }

    self.mapServiceURL = URL_VTS_AGS;

    if (!self.ignoreAddMap) {
      Map.addMap(null);
    }

    Event.trigger(Event.APP_INITIALIZED, null);
  }



  function setExtent(queryParameters) {
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
  }

  function zoomToExtent(layerType, layerCode, highlightFeature, callback) {
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
  }

  function zoomToExtentUsingSearchField(layerType, layerCode, highlightFeature, callback) {
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
  }

  /**
   * Retrieve the extent from a layer type and code and add the map
   */
  function createMap(layerType, layerCode, forceShowLayer) {
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
      console.log("Layer type '" + layerType + "' doesn't exist.");
    }
  }

})(window.mapClient = window.mapClient || {});
