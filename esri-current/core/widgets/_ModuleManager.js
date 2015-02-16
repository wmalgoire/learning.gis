(function(mapClient, config, events) {
  'use strict';
  /* globals require */

  mapClient.moduleManager = {
    map: null,
    dynamicLayer: null,
    tokenHelper: null,

    constructor: function() {
      var _this = this;

      if (window.USE_SECURE_SERVICES) {
        this.loadTokenHelperModule();
      }

      events.connect(events.MAP.LOADED, function(map) {
        _this.map = map;
        _this.addModulesIfReady();
      });

      events.connect(events.MAP.DYNAMICLAYER_LOADED, function(dynamicLayer) {
        _this.dynamicLayer = dynamicLayer;
        _this.addModulesIfReady();
      });
    },

    addModulesIfReady: function() {
      if (this.map !== null && this.dynamicLayer !== null) {
        if (config.MODULES.WATERSHED) {
          this.loadWatershedModule();
        }

        if (config.MODULES.XY) {
          this.loadXYModule();
        }

        if (config.MODULES.BASEMAP) {
          this.loadBasemapModule();
        }

        if (config.MODULES.PRINT) {
          this.loadPrintModule();
        }

        if (config.MODULES.PANELINFO) {
          this.loadPanelInfoModule();
        }

        if (config.MODULES.GOTO) {
          this.loadGoToModule();
        }

        if (config.MODULES.HIGHLIGHTSELECTION) {
          this.loadHighlightSelectionModule();
        }

        if (config.MODULES.CAMPAIGNBROWSER) {
          this.loadCampaignBrowserModule();
        }

      }
    },

    /**
     * Loads the watershed Module
     **/
    loadWatershedModule: function() {
      var _this = this;
      require(["widgets/WatershedGeoprocessor"],
        function(WatershedGeoprocessor) {
          new WatershedGeoprocessor(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the XY Module
     **/
    loadXYModule: function() {
      var _this = this;
      require(["widgets/XYNavigator"],
        function(XYNavigator) {
          new XYNavigator(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the Basemap Module
     **/
    loadBasemapModule: function() {
      var _this = this;
      require(["widgets/BasemapSelector"],
        function(BasemapSelector) {
          new BasemapSelector(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the Print Module
     **/
    loadPrintModule: function() {
      var _this = this;
      require(["widgets/Print"],
        function(Print) {
          new Print(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the Print Module
     **/
    loadPanelInfoModule: function() {
      var _this = this;
      require(["widgets/PanelInfo"],
        function(PanelInfo) {
          new PanelInfo(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the GoTo Module
     **/
    loadGoToModule: function() {
      var _this = this;
      require(["widgets/GoTo"],
        function(GoTo) {
          new GoTo(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the GoTo Module
     **/
    loadHighlightSelectionModule: function() {
      var _this = this;
      require(["widgets/HighlightSelection"],
        function(HighlightSelection) {
          new HighlightSelection(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the CampaignBrowser Module
     **/
    loadCampaignBrowserModule: function() {
      var _this = this;
      require(["widgets/CampaignBrowser"],
        function(CampaignBrowser) {
          new CampaignBrowser(_this.map, _this.dynamicLayer);
        });
    },

    /**
     * Loads the CampaignBrowser Module
     **/
    loadTokenHelperModule: function() {
      var _this = this;
      require(["widgets/TokenHelper"],
        function(TokenHelper) {
          _this.tokenHelper = new TokenHelper(null, null);
        });
    }
  };

})(window.mapClient, window.mapClient.config, window.mapClient.events);
