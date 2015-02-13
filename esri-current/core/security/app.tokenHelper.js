(function(mapClient) {
  'use strict';
  /* globals esri, dojo */

  mapClient.tokenHelper = {
    //testTokenNeeded: testTokenNeeded
  };

  ////////////////

  function testTokenNeeded() {
    var tokenLayer = new esri.layers.ArcGISDynamicMapServiceLayer(mapClient.services.mapServiceURL);

    dojo.connect(tokenLayer, "onLoad", function(layer) {
      console.info("$$$ layer: " + layer.url + " no token required");
    });

    dojo.connect(tokenLayer, "onError", function(error) {
      console.info("$$$ Error: " + error.code);
    });
  }

})(window.mapClient = window.mapClient || {});
