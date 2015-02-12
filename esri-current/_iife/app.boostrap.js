/**
 * Novel-T mapClient bootstrap script.
 */
(function(mapClient, dojo) {
  'use strict';
  /*globals dojo, require, esri */

  // dojo.require("dijit.layout.BorderContainer");
  // dojo.require("dijit.layout.ContentPane");
  // dojo.require("dijit.layout.TabContainer");
  // dojo.require("dijit.ProgressBar");
  // dojo.require("dijit.form.HorizontalSlider");
  // dojo.require("esri.map");
  // dojo.require("esri.dijit.Legend");
  // dojo.require("esri.dijit.Scalebar");

  //counts the number of scripts to load
  var scriptsToLoad = 0;

  /**
   * Main application's entry point.
   * The application starts when the DOM has finished loading an is ready to be manipulated.
   */
  dojo.ready(bootstrap);

  require([
    "modules/_ModuleManager"
  ], bootstrap);

  function bootstrap(ModuleManager) {

    mapClient.moduleManager = new ModuleManager();

    createLocalTilerMapServiceLayer();

    // Extract URL parameters
    var params = mapClient.extractUrlParams();
    var appType = params[PARAM_APP_TYPE];

    // Load app speficic scripts and css
    switch (appType) {
      case "basic":
        //do nothing, just init the mapClient
        onScriptLoaded();
        break;
      case "VTS":
        load(path_to_VTS_js, null);
        break;
      case "CMSL":
        load(path_to_CMSL_js, path_to_CMSL_css);
        break;
      case "HealthCamp":
        load(path_to_HealthCamp_js, path_to_HealthCamp_css);
        break;
      case "VTSOFFLINE":
        load(path_to_VTS_OFFLINE_js, path_to_VTSOffline_css);
        break;
      case "VTS_NonVaccination":
        load(path_to_VTS_NonVaccination_js, null);
        break;
      case "Supervisor":
        /* use the same css styles as health camps */
        load(path_to_Supervisor_js, path_to_HealthCamp_css);
        break;
      case "Dashboard":
        load(path_to_Dashboard_js, path_to_Dashboard_css);
        break;
      case "EnvironmentalSites":
        load(path_to_EnvironmentalSites_js, null);
        break;
      case "Plain":
        load(path_to_Plain_js, path_to_Plain_css);
        break;
      default:
        alert("appType: " + appType + " not supported!");
        break;
    }
  }

  require([
    'dojo/_base/declare'
  ], createLocalTilerMapServiceLayer);

  function createLocalTilerMapServiceLayer(declare) {
    //YMI: Declare a custom TiledMapServiceLayer to read local TPK
    declare("my.LocalTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, LocalTiledMapServiceLayer);

    var LocalTiledMapServiceLayer = {

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
    };
  }

  function load(script, style) {
    if (script !== null) {
      if (script instanceof Array) {
        if (style === null)
          style = [];

        scriptsToLoad = script.length + style.length;

        for (var i in script)
          loadScript(script[i], onScriptLoaded);

        for (var i in style)
          loadCSS(style[i], onScriptLoaded);

        return;
      }
    }

    if (style === null) {
      scriptsToLoad = 1;
      loadScript(script, onScriptLoaded);
    } else {
      scriptsToLoad = 2;
      loadScript(script, onScriptLoaded);
      loadCSS(style, onScriptLoaded);
    }
  }

  /**
   * Called when a script is correctly loaded
   **/
  function onScriptLoaded() {
    scriptsToLoad--;
    if (scriptsToLoad <= 0) {
      var mymapClient = mapClient;

      if (IS_ONLINE === false) {
        //Proxy
        esriConfig.defaults.io.proxyUrl = URL_PROXY;
        esriConfig.defaults.io.alwaysUseProxy = true;
      }

      mymapClient.initialize();
    }
  }

  /**
   * Loads a given script and calls the callback when loaded
   **/
  function loadScript(url, callback) {
    if (url === null) return;
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    //script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
  }

  /**
   * Loads a given script and calls the callback when loaded
   **/
  function loadCSS(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("href", url);

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    //css.onreadystatechange = callback;
    css.onload = callback;

    // Fire the loading
    head.appendChild(css);
  }

})(window.mapClient = window.mapClient || {}, dojo);
