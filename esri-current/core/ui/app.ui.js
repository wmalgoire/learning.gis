(function(mapClient) {
  'use strict';
  /* globals require */

  mapClient.ui = {
    load: load
  };

  ////////////////

  function load() {
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
    ], function() {
      mapClient.ui.theme.updateColor();
      mapClient.ui.loading.init();
      mapClient.ui.mainPanel.init(APP_TITLE);
      mapClient.ui.tabs.init();
      mapClient.ui.mainPanel.toggleState(shouldOpenMainPanel());
    });
  }

  // private methods
  function shouldOpenMainPanel() {
    var shouldOpen = LEFT_PANEL_OPEN;
    var params = mapClient.urlParams;
    var openParam = params[PARAM_OPEN_LEFT_PANEL];
    if (openParam !== null) {
      shouldOpen = (openParam.toLowerCase() === "true");
    }
    return shouldOpen;
  }

})(window.mapClient = window.mapClient || {});
