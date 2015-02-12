(function(mapClient) {
  'use strict';

  // public methods
  mapClient.colors = {
    rgbToHex: rgbToHex
  };

  ////////////////

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

})(window.mapClient = window.mapClient || {});
