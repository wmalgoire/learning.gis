/**
 * Define namespaces. Should be loaded first.
 * @namespace novelt
 */
(function(namespace) {
  'use strict';
  /* globals require */

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
  extend(namespace, "mapClient.esri");
  extend(namespace, "mapClient.utils");

  //var locationPath = location.pathname.replace(new RegExp(/\/[^\/]+$/), '');

  // require({
  //   async: false,
  //   paths: {
  //     'widgets': '/Scripts/app/map/core/widgets'
  //   }
  //   // packages: [{
  //   //   name: 'widgets',
  //   //   location: '/Scripts/app/map/core/widgets'
  //   // }]
  // });

})(window.novelt = window.novelt || {});

/*jshint unused:false*/

// define shorter alias
var mapClient = window.novelt.mapClient;
