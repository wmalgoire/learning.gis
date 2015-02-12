/**
 * Main VTS Map boot script.
 * This script bootstraps the VTS Map application.
 * This script should be the last loaded javascript file.
 */
(function(mapClient) {
  'use strict';
  /* globals require, dojo, esri */

  dojo.require("dijit.layout.BorderContainer");
  dojo.require("dijit.layout.ContentPane");
  dojo.require("dijit.layout.TabContainer");
  dojo.require("dijit.ProgressBar");
  dojo.require("esri.map");
  dojo.require("esri.dijit.Legend");
  dojo.require("esri.dijit.Scalebar");
  dojo.require("dijit.form.HorizontalSlider");

  /**
   * Called when dojo is fully loaded
   **/
  function bootstrap() {
    require([
      "modules/_ModuleManager",
      'dojo/_base/declare',
    ], function(ModuleManager) {

      mapClient.config.init();
      mapClient.moduleManager = new ModuleManager();

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


      // Extract URL parameters
      var params = Application.extractUrlParams();
      var appType = params[PARAM_APP_TYPE];

      var scripts = [];
      var styles = [];

      // Load app speficic scripts and css
      switch (appType) {
        case "basic":
          //do nothing, just init the application
          initApplication();
          break;
        case "VTS":
          scripts = path_to_VTS_js;
          break;
        case "CMSL":
          scripts = path_to_CMSL_js;
          styles = path_to_CMSL_css;
          break;
        case "HealthCamp":
          scripts = path_to_HealthCamp_js;
          styles = path_to_HealthCamp_css;
          break;
        case "VTSOFFLINE":
          scripts = path_to_VTS_OFFLINE_js;
          styles = path_to_VTSOffline_css;
          break;
        case "VTS_NonVaccination":
          scripts = path_to_VTS_NonVaccination_js;
          break;
        case "Supervisor":
          scripts = path_to_Supervisor_js;
          styles = path_to_HealthCamp_css;
          break;
        case "Dashboard":
          scripts = path_to_Dashboard_js;
          styles = path_to_Dashboard_css;
          break;
        case "EnvironmentalSites":
          scripts = path_to_EnvironmentalSites_js;
          break;
        case "Plain":
          scripts = path_to_Plain_js;
          styles = path_to_Plain_css;
          break;
        default:
          console.log("appType: " + appType + " not supported!");
          break;
      }

      mapClient.loadFiles.load(scripts, styles, initApplication);
    });
  }

  /**
   * Called when a script is correctly loaded
   **/
  function initApplication() {
    if (!IS_ONLINE) {
      esriConfig.defaults.io.proxyUrl = URL_PROXY;
      esriConfig.defaults.io.alwaysUseProxy = true;
    }

    Application.initialize();
  }

  /**
   * Main application's entry point.
   *
   * The application starts when the DOM has finished loading an is ready to be
   * manipulated.
   */
  dojo.ready(bootstrap);

})(window.mapClient = window.mapClient || {});