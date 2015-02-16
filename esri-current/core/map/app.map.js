(function(mapClient, config, events) {
  'use strict';
  /* globals require, dojo, esri */
  mapClient.esriMap = null;

  // public properties
  mapClient.map = {
    map: mapClient.esriMap,
    imageParameters: null,
    initialFeatureSet: null,
    mapClickHandle: null,
    highlightLayer: null,
    legend: null,

    //variables extracted from tiling scheme
    _wkid: null,
    _rows: null,
    _cols: null,
    _dpi: null,
    _xorigin: null,
    _yorigin: null,
    _format: null,
    _compressQuality: null,
    _lods: [],
    _xmin: null,
    _xmax: null,
    _ymin: null,
    _ymax: null,

    ignoreAddMap: false,

    createMap: createMap,
    addMap: addMap,
    addMapWithExtent: addMapWithExtent,
    addOperationalLayers: addOperationalLayers,
    zoomTo: zoomTo,
    zoomToLayerExtent: zoomToLayerExtent,
    addListeners: addListeners,
    enableUserNavigation: enableUserNavigation,
    onMapClick: onMapClick,
    hideHighLightFeature: hideHighLightFeature,
    highlightFeature: highlightFeature,
    highlightPointFeature: highlightPointFeature,
    getTilingScheme: getTilingScheme,

    extent: {
      setExtent: setExtent,
      zoomToExtent: zoomToExtent,
      zoomToExtentUsingSearchField: zoomToExtentUsingSearchField
    }

  };

  startup();

  ////////////////

  function startup() {
    events.connect(events.APP.INITIALIZED, function() {});
  }

  /**
   * Retrieve the extent from a layer type and code and add the map
   */
  function createMap(layerType, layerCode, forceShowLayer) {
    console.log("createMap", layerType);
    if (forceShowLayer === undefined || forceShowLayer === null) {
      forceShowLayer = true;
    }
    // Get params from config
    if (config.LAYERS.EXTENT_TYPE_CODE[layerType]) {
      var layer = config.LAYERS.EXTENT_TYPE_CODE[layerType];

      var layerId = layer.id;
      var queryField = layers.field;
      var outFields = layer.outFields;

      // Set the current layer visible (if not already)
      if (forceShowLayer && dojo.indexOf(config.LAYERS.VISIBLE, layerId) === -1) {
        config.LAYERS.VISIBLE.push(layerId);
      }

      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + layerId);
      var query = new esri.tasks.Query();
      query.where = queryField + " = '" + layerCode + "'";
      query.outFields = [outFields];
      query.returnGeometry = true;

      // Send the query and add the map
      queryTask.execute(query, mapClient.map.addMap);

    } else {
      addMap(null);
      console.log("Layer type '" + layerType + "' doesn't exist.");
    }
  }

  function addMap(featureSet) {
    console.log("addmap", featureSet, config.MAP.EXTENT);
    var extent = null;

    if (featureSet) {
      mapClient.map.initialFeatureSet = featureSet;
      if (featureSet.features.length > 0) {
        extent = featureSet.features[0].geometry.getExtent();
      } else {
        console.log("No features returned with query.");
        addMap(null);
        return;
      }
    } else {
      // Else use default center and zoom
      if (!config.MAP.EXTENT)
        extent = null;
      else
        extent = new esri.geometry.Extent(
          config.MAP.EXTENT.xmin,
          config.MAP.EXTENT.ymin,
          config.MAP.EXTENT.xmax,
          config.MAP.EXTENT.ymax,
          new esri.SpatialReference({
            wkid: 4326
          })
        );
    }

    // Create map
    var basemapDefault = null;
    if (config.IS_ONLINE) {
      basemapDefault = "satellite";
    }

    mapClient.esriMap = new esri.Map(
      "map", {
        extent: extent,
        logo: false,
        basemap: basemapDefault
      }
    );

    dojo.connect(mapClient.esriMap, "onLoad", function() {
      events.trigger(events.MAP.LOADED, mapClient.esriMap);
    });

    mapClient.map.addListeners();

    events.trigger(events.MAP.INITIALIZED, mapClient.esriMap);

    if (mapClient.map.imageParameters === null) {
      mapClient.map.imageParameters = new esri.layers.ImageParameters();
      mapClient.map.imageParameters.format = "PNG32";
    }

    addDynamicLayer(extent);
    // initDijits();

    // if (!config.IS_ONLINE) {
    //   mapClient.map.getTilingScheme();
    // } else {
    //   mapClient.map.addOperationalLayers(featureSet);
    // }
  }

  function addDynamicLayer(extent) {
    console.log("addDynamicLayer", extent);
    require(["widgets/CustomArcGISDynamicLayer"],
      function(CustomArcGISDynamicLayer) {
        var dynamicLayer = new CustomArcGISDynamicLayer(
          mapClient.services.mapServiceURL, {
            imageParameters: mapClient.map.imageParameters,
          }
        );

        dynamicLayer.tokenHelper = mapClient.moduleManager.tokenHelper;

        if (extent === null) {
          dojo.connect(dynamicLayer, "onLoad", mapClient.map.zoomToLayerExtent);
        }

        mapClient.layers.dynamicLayer = dynamicLayer;
      });
  }

  function addMapWithExtent(layerType, layerCode, forceShowLayer) {
    console.log("addMapWithExtent", layerType);
    if (forceShowLayer === undefined || forceShowLayer === null) {
      forceShowLayer = true;
    }
    // Get params from config
    if (config.LAYERS.EXTENT_TYPE_CODE[layerType]) {
      var layer = config.LAYERS.EXTENT_TYPE_CODE[layerType];

      var layerId = layer.id;
      var queryField = layer.field;
      var outFields = layer.outFields;

      // Set the current layer visible (if not already)
      if (forceShowLayer && dojo.indexOf(config.LAYERS.VISIBLE, layerId) === -1) {
        config.config.LAYERS.VISIBLE.push(layerId);
      }

      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.mapServiceURL + "/" + layerId);
      var query = new esri.tasks.Query();
      query.where = queryField + " = '" + layerCode + "'";
      query.outFields = [outFields];
      query.returnGeometry = true;

      // Send the query and add the map
      queryTask.execute(query, mapClient.map.addMap);

    } else {
      addMap(null);
      alert("Layer type '" + layerType + "' doesn't exist.");
    }
  }

  function addOperationalLayers() {
    console.log("addOperationalLayers");
    var dynamicLayer = mapClient.layers.dynamicLayer;

    if (dynamicLayer.loaded) {
      events.trigger(events.MAP.DYNAMICLAYER_LOADED, dynamicLayer);
      mapClient.ui.layers.buildLayerList(dynamicLayer);
    } else {
      dojo.connect(dynamicLayer, "onLoad", function(layer) {
        events.trigger(events.MAP.DYNAMICLAYER_LOADED, dynamicLayer);
        mapClient.ui.layers.buildLayerList(layer);
      });
    }

    mapClient.esriMap.addLayers([
      dynamicLayer
    ]);

    // Highlight feature
    if (mapClient.map.initialFeatureSet && mapClient.map.initialFeatureSet.features.length > 0) {
      mapClient.map.highlightFeature(mapClient.map.initialFeatureSet.features[0]);
    }
  }

  function getTilingScheme() {
    require(["dojo/request"], function(request) {
      request.get("Handlers/TPKServer/readTilingScheme.ashx", {
        handleAs: "json"
      }).then(function(data) {
          if (data.error && data.error != "") {
            //console.error("$$$ Erreur avec le TPK: "+data.error);
          } else {
            mapClient.map._wkid = data.spatialReference.wkid;
            mapClient.map._rows = data.tileInfo.rows;
            mapClient.map._cols = data.tileInfo.cols;
            mapClient.map._dpi = data.tileInfo.dpi;
            mapClient.map._xorigin = data.tileInfo.origin.x;
            mapClient.map._yorigin = data.tileInfo.origin.y;
            mapClient.map._format = data.tileInfo.format;
            mapClient.map._compressQuality = data.tileInfo.compressionQuality;
            mapClient.map._lods = data.tileInfo.lods;

            mapClient.map._xmin = data.initialExtent.xmin;
            mapClient.map._ymin = data.initialExtent.ymin;
            mapClient.map._xmax = data.initialExtent.xmax;
            mapClient.map._ymax = data.initialExtent.ymax;

            mapClient.esriMap.addLayer(new my.LocalTiledMapServiceLayer(102100, mapClient.map._xmin, mapClient.map._ymin, mapClient.map._xmax, mapClient.map._ymax, 256, 256, 96, "JPEG", 75, -20037508.342787, 20037508.342787, [{
              "level": 0,
              "resolution": 156543.033928,
              "scale": 591657527.591555
            }, {
              "level": 1,
              "resolution": 78271.5169639999,
              "scale": 295828763.795777
            }, {
              "level": 2,
              "resolution": 39135.7584820001,
              "scale": 147914381.897889
            }, {
              "level": 3,
              "resolution": 19567.8792409999,
              "scale": 73957190.948944
            }, {
              "level": 4,
              "resolution": 9783.93962049996,
              "scale": 36978595.474472
            }, {
              "level": 5,
              "resolution": 4891.96981024998,
              "scale": 18489297.737236
            }, {
              "level": 6,
              "resolution": 2445.98490512499,
              "scale": 9244648.868618
            }, {
              "level": 7,
              "resolution": 1222.99245256249,
              "scale": 4622324.434309
            }, {
              "level": 8,
              "resolution": 611.49622628138,
              "scale": 2311162.217155
            }, {
              "level": 9,
              "resolution": 305.748113140558,
              "scale": 1155581.108577
            }, {
              "level": 10,
              "resolution": 152.874056570411,
              "scale": 577790.554289
            }, {
              "level": 11,
              "resolution": 76.4370282850732,
              "scale": 288895.277144
            }, {
              "level": 12,
              "resolution": 38.2185141425366,
              "scale": 144447.638572
            }, {
              "level": 13,
              "resolution": 19.1092570712683,
              "scale": 72223.819286
            }, {
              "level": 14,
              "resolution": 9.55462853563415,
              "scale": 36111.909643
            }, {
              "level": 15,
              "resolution": 4.77731426794937,
              "scale": 18055.954822
            }, {
              "level": 16,
              "resolution": 2.38865713397468,
              "scale": 9027.977411
            }, {
              "level": 17,
              "resolution": 1.19432856685505,
              "scale": 4513.988705
            }, {
              "level": 18,
              "resolution": 0.597164283559817,
              "scale": 2256.994353
            }, {
              "level": 19,
              "resolution": 0.298582141647617,
              "scale": 1128.497176
            }]));

          }
          mapClient.map.addOperationalLayers();
        },
        function(error) {
          console.error(error);
        });
    });
  }

  function addListeners() {
    require(["dojo/on"], function(on) {
      if (typeof(IDENTIFY_QUERYABLE_LAYERS) !== "undefined" && IDENTIFY_QUERYABLE_LAYERS && IDENTIFY_QUERYABLE_LAYERS.length > 0) {
        mapClient.map.mapClickHandle = dojo.connect(mapClient.map.map, "onClick", mapClient.map.onMapClick);
      }
      mapClient.esriMap.on("update-start", mapClient.ui.loading.show);
      mapClient.esriMap.on("update-end", mapClient.ui.loading.show);
      mapClient.esriMap.on("extent-change", function(evt) {
        events.trigger(events.MAP.EXTENT_CHANGE, evt.extent);
      });
    });
  }

  function initDijits() {
    console.log("initDijits");
    // Legend
    dojo.connect(mapClient.map.map, "onLayersAddResult", function() {
      mapClient.map.legend = new esri.dijit.Legend({
          map: mapClient.esriMap,
          layerInfos: [{
            layer: mapClient.layers.dynamicLayer
          }]
        },
        "legendDiv"
      );
      mapClient.map.legend.startup();
    });

    // Scale bar
    new esri.dijit.Scalebar({
      map: mapClient.esriMap,
      attachTo: "bottom-right",
      scalebarUnit: "metric"
    });
  }

  function hideHighLightFeature() {
    if (mapClient.map.highlightLayer !== null) {
      mapClient.esriMap.removeLayer(mapClient.map.highlightLayer);
      mapClient.map.highlightLayer = null;
    }
  }

  function highlightFeature(feature) {
    // Symbology
    var symbol = new esri.symbol.SimpleFillSymbol({
      "type": "esriSFS",
      "style": "esriSFSSolid",
      "color": new dojo.Color(AREA_FILL_COLOR),
      "outline": {
        "type": "esriSLS",
        "style": "esriSLSSolid",
        "color": new dojo.Color(AREA_BORDER_COLOR),
        "width": AREA_BORDER_THICKNESS
      }
    });

    mapClient.map.hideHighLightFeature(feature);

    mapClient.map.highlightLayer = new esri.layers.GraphicsLayer();
    mapClient.esriMap.addLayer(mapClient.map.highlightLayer);

    // Add feature to layer
    mapClient.map.highlightLayer.add(feature.setSymbol(symbol));
  }

  function highlightPointFeature(feature) {
    // Symbology
    var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 22,
      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        new dojo.Color([0, 255, 255]), 2),
      new dojo.Color([0, 255, 255, 0.25]));

    // Graphics layer
    mapClient.map.highlightPointLayer = new esri.layers.GraphicsLayer();
    mapClient.esriMap.addLayer(mapClient.map.highlightPointLayer);

    // Add feature to layer
    mapClient.map.highlightPointLayer.add(feature.setSymbol(symbol));
  }

  function onMapClick(evt) {
    if (IDENTIFY_TOLERANCE && IDENTIFY_INFOTEMPLATES && IDENTIFY_INFOTEMPLATES.length > 0) {
      //create identify tasks and setup parameters
      var identifyTask = new esri.tasks.IdentifyTask(mapClient.services.mapServiceURL);

      var queryTheseLayers = [];
      for (var i = 0; i < IDENTIFY_QUERYABLE_LAYERS.length; i++) {
        if (mapClient.layers.visible.indexOf(IDENTIFY_QUERYABLE_LAYERS[i].toString()) !== -1) {
          queryTheseLayers.push(IDENTIFY_QUERYABLE_LAYERS[i]);
        }
      }


      var identifyParams = new esri.tasks.IdentifyParameters();
      identifyParams.tolerance = IDENTIFY_TOLERANCE;
      identifyParams.returnGeometry = true;
      identifyParams.layerIds = queryTheseLayers;
      identifyParams.layerDefinitions = [];

      var dynamicLayer = mapClient.layers.dynamicLayer;

      if (dynamicLayer.layerDefinitions && dynamicLayer.layerDefinitions.length > 0) {
        var layerDefs = [];
        for (var i = 0; i < IDENTIFY_QUERYABLE_LAYERS.length; i++) {
          var identifyableLayerId = IDENTIFY_QUERYABLE_LAYERS[i];
          if (dynamicLayer.layerDefinitions[identifyableLayerId] && dynamicLayer.layerDefinitions[identifyableLayerId].length > 0) {
            layerDefs[identifyableLayerId] = dynamicLayer.layerDefinitions[identifyableLayerId];
          }
        }
        identifyParams.layerDefinitions = layerDefs;
      }

      identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
      identifyParams.width = mapClient.esriMap.width;
      identifyParams.height = mapClient.esriMap.height;
      identifyParams.geometry = evt.mapPoint;
      identifyParams.mapExtent = mapClient.esriMap.extent;

      var deferred = identifyTask.execute(identifyParams).addCallback(function(response) {
        // response is an array of identify result objects
        // Let's return an array of features.
        return dojo.map(response, function(result) {
          var feature = result.feature;
          var layerName = result.layerName;
          var layerId = result.layerId;
          feature.attributes.layerName = layerName;
          var content;
          var infoTemplate;
          if (IDENTIFY_INFOTEMPLATES[layerId]) {
            content = IDENTIFY_INFOTEMPLATES[layerId].content;
            if (!!(content && content.constructor && content.call && content.apply)) {
              //content is a function
              content = content(result);
            }
            infoTemplate = new esri.InfoTemplate(IDENTIFY_INFOTEMPLATES[layerId].title, content);
            feature.setInfoTemplate(infoTemplate);
          } else {
            //Default title and content
            content = "";
            infoTemplate = new esri.InfoTemplate(layerName, content);
            feature.setInfoTemplate(infoTemplate);
          }
          return feature;
        });
      });

      // InfoWindow expects an array of features from each deferred
      // object that you pass. If the response from the task execution
      // above is not an array of features, then you need to add a callback
      // like the one above to post-process the response and return an
      // array of features.
      mapClient.esriMap.infoWindow.setFeatures([deferred]);
      mapClient.esriMap.infoWindow.show(evt.mapPoint);
    } else {
      var alertMsg = "Configuration Missing" +
        "\n" +
        "Expected: " +
        "\n" +
        "<IDENTIFY_TOLERANCE>" +
        "\n" +
        "<IDENTIFY_INFOTEMPLATES>" +
        "\n" +
        "<IDENTIFY_QUERYABLE_LAYERS>";
      alert(alertMsg);
    }

  }

  function enableUserNavigation(enable) {
    if (enable) {
      mapClient.esriMap.enableMapNavigation();
      mapClient.esriMap.enablePan();
      // Map.map.showZoomSlider();
    } else {
      mapClient.esriMap.disableMapNavigation();
      mapClient.esriMap.disablePan();
      //  Map.map.hideZoomSlider();
    }
  }

  function zoomToLayerExtent(layer) {
    mapClient.esriMap.setExtent(layer.fullExtent);
  }

  function zoomTo(featureSet, highlightFeature) {
    if (!featureSet)
      return;
    if (featureSet.features.length > 0) {

      if (featureSet.features[0].geometry.type === 'point') {
        var pt = featureSet.features[0].geometry;
        var factor = 0.000001;
        var extent = new esri.geometry.Extent(pt.x - factor, pt.y - factor, pt.x + factor, pt.y + factor, pt.spatialReference);
        mapClient.esriMap.setExtent(extent);
      } else {
        mapClient.esriMap.setExtent(featureSet.features[0].geometry.getExtent());

        if (highlightFeature) {
          mapClient.map.highlightFeature(featureSet.features[0]);
        } else {
          mapClient.map.hideHighLightFeature(featureSet.features[0]);
        }
      }
    }
  }

  function setExtent() {
    if (mapClient.urlParams[config.URL_PARAMS.EXTENT]) {
      var values = mapClient.urlParams[config.URL_PARAMS.EXTENT].split(',');
      if (values.length !== 4)
        return;

      config.MAP.EXTENT = {
        "xmin": parseFloat(values[0]),
        "ymin": parseFloat(values[1]),
        "xmax": parseFloat(values[2]),
        "ymax": parseFloat(values[3]),
      };
    }
  }

  function zoomToExtent(layerType, layerCode, highlightFeature, callback) {
    console.log("zoomToExtent");
    if (config.LAYERS.EXTENT_TYPE_CODE[layerType]) {
      var layer = config.LAYERS.EXTENT_TYPE_CODE[layerType];
      var layerId = layer.id;
      var queryField = layer.field;
      var outFields = layer.outFields;

      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + layerId);
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
    console.log("zoomToExtentUsingSearchField");
    if (config.LAYERS.EXTENT_TYPE_CODE[layerType]) {
      var layer = config.LAYERS.EXTENT_TYPE_CODE[layerType];
      var layerId = layer.id;
      var queryField = layer.searchField;
      var outFields = layer.outFields;
      // Set the query
      var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + layerId);
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

})(window.mapClient, window.mapClient.config, window.mapClient.events);
