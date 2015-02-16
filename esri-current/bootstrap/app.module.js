/**
 * Define namespaces. Should be loaded first.
 * @namespace novelt
 */

(function(namespace) {
  'use strict';
  /* globals require */

  namespace.extend = extend;

  extend(namespace, "mapClient.core");
  extend(namespace, "mapClient.esri");
  extend(namespace, "mapClient.utils");

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

})(window.novelt = window.novelt || {});

/*jshint unused:false*/

// define shorter alias
var mapClient = window.novelt.mapClient;
