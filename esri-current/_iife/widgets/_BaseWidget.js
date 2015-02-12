/**
 * Date: 03.12.2014
 * Author: YM
 * Class: _BaseWidget
 *
 * This class is used as a baseClass for the different module widgets
 */
(function() {
  'use strict';
  /*globals define */

  define([
    "dojo/_base/declare"
  ], declareModule);

  function declareModule(declare) {

    var service = {
      map: null,
      dynamicLayer: null,
      constructor: constructor,
      initialize: initialize,
      getParameterByName: getParameterByName
    };
    return declare(null, service);

    /**
     * Constructor of the class
     * Params:
     *     - map: The map used by the application
     *     - dynamicLayer: The dynamicLayer used by the application
     **/
    function constructor(map, dynamicLayer) {
      service.map = map;
      service.dynamicLayer = dynamicLayer;

      var that = this;

      if (service.map) {
        if (service.map.loaded) {
          service.initialize();
        } else {
          service.map.on("load", function(map) {
            that.initialize();
          });
        }
      } else {
        service.initialize();
      }

    }

    /**
     * Initialize the tool
     **/
    function initialize() {

    }

    /**
     * Utility function used to retrieve a parameter from the QueryString
     * @param name: the name of the parameter
     **/
    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }

})();
