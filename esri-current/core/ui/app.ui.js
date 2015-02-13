(function(mapClient, config) {
  'use strict';

  mapClient.ui = {
    initialize: initialize
  };

  ////////////////

  function initialize() {
    mapClient.ui.theme.updateColor();
    mapClient.ui.loading.init();
    mapClient.ui.mainPanel.init(config.APP.TITLE);
    mapClient.ui.tabs.init();
    mapClient.ui.mainPanel.toggleState(shouldOpenMainPanel());
  }

  // private methods
  function shouldOpenMainPanel() {
    var shouldOpen = config.UI.LEFT_PANEL_OPEN;
    var params = mapClient.urlParams;
    if (params) {
      var openParam = params[config.URL_PARAMS.OPEN_LEFT_PANEL];
      if (openParam) {
        shouldOpen = (openParam.toLowerCase() === "true");
      }
    }
    return shouldOpen;
  }

})(window.mapClient, window.mapClient.config);
