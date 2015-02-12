/**
 * Date: 03.12.2014
 * Author: YM
 * Class: _ModuleManager
 *
 * This class is used as a manager for the modules
 */
(function() {
  'use strict';
  /* globals define, require */

  define([
    "dojo/_base/declare"
  ], moduleManager);

  function moduleManager(declare) {

    return declare(null, {
      map: null,
      dynamicLayer: null,
      tokenHelper: null,

      /**
       * Constructor of the class
       **/
      constructor: function() {
        var _this = this;

        if (USE_SECURE_SERVICES) {
          this.loadTokenHelperModule();
        }

        Event.connect(Event.MAP_LOADED, function(map) {
          _this.map = map;
          _this.addModulesIfReady();
        });

        Event.connect(Event.DYNAMICLAYER_LOADED, function(dynamicLayer) {
          _this.dynamicLayer = dynamicLayer;
          _this.addModulesIfReady();
        });
      },

      /**
       * Adds the configured modules to the map if the needed parameters are ready
       **/
      addModulesIfReady: function() {
        if (this.map !== null && this.dynamicLayer !== null) {
          if (WATERSHED_MODULE) {
            this.loadWatershedModule();
          }

          if (XY_MODULE) {
            this.loadXYModule();
          }

          if (BASEMAP_MODULE) {
            this.loadBasemapModule();
          }

          if (PRINT_MODULE) {
            this.loadPrintModule();
          }

          if (PANELINFO_MODULE) {
            this.loadPanelInfoModule();
          }

          if (GOTO_MODULE) {
            this.loadGoToModule();
          }

          if (HIGHLIGHTSELECTION_MODULE) {
            this.loadHighlightSelectionModule();
          }

          if (CAMPAIGNBROWSER_MODULE) {
            this.loadCampaignBrowserModule();
          }

        }
      },

      /**
       * Loads the watershed Module
       **/
      loadWatershedModule: function() {
        var _this = this;
        require(["modules/WatershedGeoprocessor"],
          function(WatershedGeoprocessor) {
            new WatershedGeoprocessor(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the XY Module
       **/
      loadXYModule: function() {
        var _this = this;
        require(["modules/XYNavigator"],
          function(XYNavigator) {
            new XYNavigator(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the Basemap Module
       **/
      loadBasemapModule: function() {
        var _this = this;
        require(["modules/BasemapSelector"],
          function(BasemapSelector) {
            new BasemapSelector(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the Print Module
       **/
      loadPrintModule: function() {
        var _this = this;
        require(["modules/Print"],
          function(Print) {
            new Print(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the Print Module
       **/
      loadPanelInfoModule: function() {
        var _this = this;
        require(["modules/PanelInfo"],
          function(PanelInfo) {
            new PanelInfo(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the GoTo Module
       **/
      loadGoToModule: function() {
        var _this = this;
        require(["modules/GoTo"],
          function(GoTo) {
            new GoTo(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the GoTo Module
       **/
      loadHighlightSelectionModule: function() {
        var _this = this;
        require(["modules/HighlightSelection"],
          function(HighlightSelection) {
            new HighlightSelection(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the CampaignBrowser Module
       **/
      loadCampaignBrowserModule: function() {
        var _this = this;
        require(["modules/CampaignBrowser"],
          function(CampaignBrowser) {
            new CampaignBrowser(_this.map, _this.dynamicLayer);
          });
      },

      /**
       * Loads the CampaignBrowser Module
       **/
      loadTokenHelperModule: function() {
        var _this = this;
        require(["modules/TokenHelper"],
          function(TokenHelper) {
            _this.tokenHelper = new TokenHelper(null, null);
          });
      }

    });
  }
})();