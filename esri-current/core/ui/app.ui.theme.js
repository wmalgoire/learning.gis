(function(mapClient) {
  'use strict';
  /* globals dojo */

  mapClient.ui.theme = {
    init: init,
    updateColor: updateColor
  };

  ////////////////

  function init() {

  }

  function updateColor() {
    dojo.query(".bg").style("display", "block");
  }

})(window.mapClient = window.mapClient || {});
