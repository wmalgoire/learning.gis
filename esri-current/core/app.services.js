(function(mapClient, config) {
  'use strict';

  mapClient.services = {
    mapServiceURL: null,
    initialize: initialize
  };

  ////////////////

  function initialize() {
    var params = mapClient.urlParams;
    if (params[config.APIS.MAPSERVICE] != null && params[config.APIS.MAPSERVICE].length > 0) {
      URL_VTS_AGS = decodeURIComponent(params[config.APIS.MAPSERVICE]);
    }

    mapClient.services.mapServiceURL = URL_VTS_AGS;
 }

})(window.mapClient, window.mapClient.config);
