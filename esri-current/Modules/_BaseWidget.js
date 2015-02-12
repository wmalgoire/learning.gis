/**
 * Date: 03.12.2014
 * Author: YM
 * Class: _BaseWidget
 *
 * This class is used as a baseClass for the different module widgets
 */
define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/on"
  ],

  function(declare, domConstruct, on) {

    return declare(null, {
      map: null,
      dynamicLayer: null,

      /**
       * Constructor of the class
       * Params:
       *     - map: The map used by the application
       *     - dynamicLayer: The dynamicLayer used by the application
       **/
      constructor: function(map, dynamicLayer) {
        this.map = map;
        this.dynamicLayer = dynamicLayer;

        var _this = this;

        if (this.map) {
          if (this.map.loaded) {
            this.initialize();
          } else {
            this.map.on("load", function(map) {
              _this.initialize();
            });
          }
        } else {
          this.initialize();
        }

      },

      /**
       * Initialize the tool
       **/
      initialize: function() {

      },

      /**
       * Utility function used to retrieve a parameter from the QueryString
       * PARAMS:
       *     - name: the name of the parameter
       **/
      getParameterByName: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      },

    });
  }
);