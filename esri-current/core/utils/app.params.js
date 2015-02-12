(function(mapClient) {
  'use strict';

  mapClient.params = {
    extractUrlParams: extractUrlParams
  };

  mapClient.urlParams = [];

  ////////////////

  /**
   * Extract url parameters
   */
  function extractUrlParams() {
    var kvp = location.search.substring(1).split("&");
    var params = [];

    for (var i = 0; i < kvp.length; i++) {
      var x = kvp[i].split("=");
      params[x[0]] = x[1];
    }

    //todo send event
    mapClient.urlParams = params;
    Application.setExtent(params);
    return params;
  }

})(window.mapClient = window.mapClient || {});
