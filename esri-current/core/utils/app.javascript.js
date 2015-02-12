(function(mapClient) {
  'use strict';

  // public methods
  mapClient.javascript = {
    objectContainsKey: objectContainsKey
  };

  ////////////////

  function objectContainsKey(attribute, id) {
    if (attribute[id] === null) {
      return false;
    }
    return true;
  }

})(window.mapClient = window.mapClient || {});
