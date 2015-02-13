(function(utils) {
  'use strict';

  // public methods
  utils.javascript = {
    objectContainsKey: objectContainsKey,
    mergeIntoObject: mergeIntoObject
  };

  ////////////////

  function objectContainsKey(attribute, id) {
    if (attribute[id] === null) {
      return false;
    }
    return true;
  }

  function mergeIntoObject(from, to) {
    var prop;
    for (prop in from) {
      if (from.hasOwnProperty(prop)) {
        try {
          if (from[prop].constructor === Object) {
            to[prop] = mergeIntoObject(from[prop], to[prop]);
          } else {
            to[prop] = from[prop];
          }
        } catch (e) {
          to[prop] = from[prop];
        }
      }
    }
    return to;
  }

})(window.mapClient.utils);
