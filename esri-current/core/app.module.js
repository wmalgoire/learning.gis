/**
 * Define namespaces. Should be loaded first.
 * @namespace novelt
 */
(function(namespace) {

  namespace.extend = extend;

  // parsing string and automatically generating nested namespaces
  function extend(ns, ns_string) {
    var parts = ns_string.split("."),
      parent = ns,
      pl;

    pl = parts.length;

    for (var i = 0; i < pl; i++) {
      if (typeof parent[parts[i]] === "undefined") {
        parent[parts[i]] = {};
      }
      parent = parent[parts[i]];
    }

    return parent;
  }

  extend(namespace, "mapClient.core");
  extend(namespace, "mapClient.core.config");
  extend(namespace, "mapClient.core.ui");
  extend(namespace, "mapClient.esri.map");
  extend(namespace, "utils");

})(window.novelt = window.novelt || {});

/*jshint unused:false*/

// define shorter alias
var mapClient = window.novelt.mapClient;
var utils = window.novelt.utils;
