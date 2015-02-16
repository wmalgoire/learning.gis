(function(mapClient) {
  'use strict';
  /* globals  dojo*/

  // public methods
  mapClient.events = {
    trigger: trigger,
    connect: connect,

    APP: {
      /**
       * Event sent when the app was properly initialized and is ready to be manipulated.
       */
      INITIALIZED: "appInitialized",
      /**
       * Event sent when the app is ready
       */
      READY: "appReady",
      /**
       * Event sent when the token is ready
       **/
      TOKEN_READY: "tokenReady"
    },

    MAP: {
      /**
       * Event sent when the map is added to the DOM
       */
      INITIALIZED: "mapInit",
      /**
       * Event sent when the map is loaded
       */
      LOADED: "mapLoaded",
      /**
       * Event sent when the dynamicLayer is loaded
       */
      DYNAMICLAYER_LOADED: "dynLayerLoaded",
      /**
       * Event fired when the map extent is changed
       **/
      EXTENT_CHANGE: "mapExtentChanged",
      /**
       * Event sent when the map zooms to a given geometry
       **/
      ZOOMGEOMETRY: "zoomToGeometry"
    },


    UI: {
      /**
       * Event sent when the filters tab is selected or deselected
       **/
      TAB_SELECTED_CHANGE: "tabSelectionChanged",
      /**
       * Event sent when the user selects an entry from the goTo dropdown list
       **/
      GOTO_SELECTION: "goToSelection",

      LAYER_LIST_LOADED: "layerListLoaded"
    }
  };

  ////////////////

  function trigger(key, data) {
    dojo.publish(key, data);
  }

  function connect(key, callback) {
    dojo.subscribe(key, callback);
  }

})(window.mapClient = window.mapClient || {});
