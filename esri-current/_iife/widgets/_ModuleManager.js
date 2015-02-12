/**
 * Date: 03.12.2014
 * Author: YM
 * Class: _ModuleManager
 *
 * This class is used as a manager for the modules
 */
(function(mapClient) {
  'use strict';
  /*globals define, require */

  // private properties
  var config = mapClient.config;
  var events = mapClient.events;

  var manager = {
    map: null,
    dynamicLayer: null,
    tokenHelper: null,
    constructor: constructor,
    addModulesIfReady: addModulesIfReady,
    loadTokenHelperModule: loadTokenHelperModule,
    loadBasemapModule: loadModule("modules/BasemapSelector"),
    loadXYModule: loadModule("modules/XYNavigator"),
    loadPrintModule: loadModule("modules/Print"),
    loadPanelInfoModule: loadModule("modules/PanelInfo"),
    loadGoToModule: loadModule("modules/GoTo"),
    loadHighlightSelectionModule: loadModule("modules/HighlightSelection"),
    loadCampaignBrowserModule: loadModule("modules/CampaignBrowser"),
    loadWatershedModule: loadModule("modules/WatershedGeoprocessor")
  };

  define([
    "dojo/_base/declare"
  ], ModuleManager);

  function ModuleManager(declare) {
    return declare(null, manager);
  }

  /**
   * Constructor of the class
   **/
  function constructor() {
    if (config.USE_SECURE_SERVICES) {
      manager.loadTokenHelperModule();
    }

    events.connect(events.MAP_LOADED, function(map) {
      manager.map = map;
      manager.addModulesIfReady();
    });

    events.connect(events.DYNAMICLAYER_LOADED, function(dynamicLayer) {
      manager.dynamicLayer = dynamicLayer;
      manager.addModulesIfReady();
    });
  }

  /**
   * Adds the configured modules to the map if the needed parameters are ready
   **/
  function addModulesIfReady() {
    if (manager.map !== null && manager.dynamicLayer !== null) {
      if (config.WATERSHED_MODULE) {
        manager.loadWatershedModule();
      }

      if (config.XY_MODULE) {
        manager.loadXYModule();
      }

      if (config.BASEMAP_MODULE) {
        manager.loadBasemapModule();
      }

      if (config.PRINT_MODULE) {
        manager.loadPrintModule();
      }

      if (config.PANELINFO_MODULE) {
        manager.loadPanelInfoModule();
      }

      if (config.GOTO_MODULE) {
        manager.loadGoToModule();
      }

      if (config.HIGHLIGHTSELECTION_MODULE) {
        manager.loadHighlightSelectionModule();
      }

      if (config.CAMPAIGNBROWSER_MODULE) {
        manager.loadCampaignBrowserModule();
      }
    }
  }

  /**
   * Dojo load module with map and dynamiclayer
   **/
  function loadModule(modulePath) {
    require([modulePath], function(ModuleClass) {
      new ModuleClass(manager.map, manager.dynamicLayer);
    });
  }

  /**
   * Loads the TokenHelper Module
   **/
  function loadTokenHelperModule() {
    require(["modules/TokenHelper"],
      function(TokenHelper) {
        this.tokenHelper = new TokenHelper(null, null);
      });
  }


})(window.mapClient = window.mapClient || {});
