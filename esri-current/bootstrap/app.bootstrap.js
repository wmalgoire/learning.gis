/**
 * Main application's entry point.
 * @namespace novelt.mapClient.esri
 */
(function(mapClient, utils, events, config) {
  'use strict';
  /* globals dojo, require, esri */

  /**
   * The application starts when the DOM has finished loading an is ready to be manipulated.
   */
  dojo.ready(onDomReady());

  ////////////////

  function initializeDojo() {
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("dijit.layout.TabContainer");
    dojo.require("dijit.ProgressBar");
    dojo.require("dijit.form.HorizontalSlider");
    dojo.require("esri.dijit.Scalebar");
    dojo.require("esri.dijit.Legend");
    dojo.require("esri.map");
  }

  function onDomReady() {
    initializeDojo();

    require(['modules/_ModuleManager'],
      function(ModuleManager) {
        mapClient.moduleManager = new ModuleManager();
      });

    require(['esri/config'],
      function(esriConfig) {
        if (!config.IS_ONLINE) {
          esriConfig.defaults.io.proxyUrl = config.APIS.PROXY;
          esriConfig.defaults.io.alwaysUseProxy = true;
          createLocalTiledMapServiceLayer();
        }
      });

    mapClient.config.initialize();
    mapClient.ui.initialize();

    //todo: promise
    loadFiles(onApplicationReady);
  }

  function onApplicationReady() {

    // if (!mapClient.map.ignoreAddMap) {
    //   mapClient.map.addMap();
    // }

    mapClient.map.extent.setExtent();
    mapClient.map.addMap();
    events.trigger(events.APP.INITIALIZED);
  }

  function loadFiles(callback) {
    var appType = mapClient.urlParams[config.URL_PARAMS.APP_TYPE];

    var scripts = [];
    var styles = [];

    // Load app speficic scripts and css
    switch (appType.toLowerCase()) {
      case "basic":
        break;
      case "plain":
        scripts = window.path_to_Plain_js;
        styles = window.path_to_Plain_css;
        break;
      case "vts":
        scripts = window.path_to_VTS_js;
        break;
      case "vtsoffline":
        scripts = window.path_to_VTS_OFFLINE_js;
        styles = window.path_to_VTSOffline_css;
        break;
      case "cmsl":
        scripts = window.path_to_CMSL_js;
        styles = window.path_to_CMSL_css;
        break;
      case "vts_nonvaccination":
        scripts = window.path_to_VTS_NonVaccination_js;
        break;
      case "healthcamp":
        scripts = window.path_to_HealthCamp_js;
        styles = window.path_to_HealthCamp_css;
        break;
      case "supervisor":
        scripts = window.path_to_Supervisor_js;
        styles = window.path_to_HealthCamp_css;
        break;
      case "dashboard":
        scripts = window.path_to_Dashboard_js;
        styles = window.path_to_Dashboard_css;
        break;
      case "environmentalsites":
        scripts = window.path_to_EnvironmentalSites_js;
        break;
      default:
        console.log("appType: " + appType + " not supported!");
        break;
    }

    utils.loadFiles.load(scripts, styles, callback);
  }

  function createLocalTiledMapServiceLayer() {
    //YMI: Declare a custom TiledMapServiceLayer to read local TPK
    dojo.declare("my.LocalTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, {
      constructor: function(myWkid, xmin, ymin, xmax, ymax, rows, cols, dpi, format, compressQuality, xorigin, yorigin, lods) {
        this.spatialReference = new esri.SpatialReference({
          wkid: myWkid
        });

        this.initialExtent = (this.fullExtent = new esri.geometry.Extent(xmin, ymin, xmax, ymax, this.spatialReference));

        this.tileInfo = new esri.layers.TileInfo({
          "rows": rows,
          "cols": cols,
          "dpi": dpi,
          "format": format,
          "compressionQuality": compressQuality,
          "origin": {
            "x": xorigin,
            "y": yorigin
          },
          "spatialReference": {
            "wkid": myWkid
          },
          "lods": lods
        });

        this.loaded = true;
        this.onLoad(this);
      },

      getTileUrl: function(level, row, col) {
        return "Handlers/TPKServer/getTile.ashx?level=" + level + "&row=" + row + "&col=" + col;
      }

    });
  }

})(window.mapClient, window.mapClient.utils, window.mapClient.events, window.mapClient.config);
