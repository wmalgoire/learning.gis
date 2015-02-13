(function(mapClient, events) {
  'use strict';
  /* globals esri */

  var mapExtension = {
    urlParams: {
      params: [],
      layerType: false,
      layerCode: false
    }
  };

  bindEvents();

  ////////////////

  function bindEvents() {
    events.connect(events.APP.INITIALIZED, function() {
      //mapExtension.initialize();
    });

    events.connect(events.MAP.INITIALIZED, function() {
      var imageParameters = new esri.layers.ImageParameters();
      imageParameters.format = "PNG32";
      mapClient.map.imageParameters = imageParameters;
    });
  }

})(window.mapClient, window.mapClient.events);
