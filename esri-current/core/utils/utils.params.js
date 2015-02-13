(function(utils) {
  'use strict';

  utils.params = {
    extractUrlParams: extractUrlParams
  };

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
    return params;
  }

})(window.mapClient.utils);
