/**
 * Class: Main VTS application.
 *
 * This module declares a singleton object, that is intended to be used
 * directly.
 */
Event = {

  /**
   * Event sent when the app was properly initialized and is ready to be
   * manipulated.
   */
  APP_INITIALIZED: "appInitialized",


  /**
   * Event sent when the map is loaded
   */
  MAP_LOADED: "mapLoaded",


  /**
   * Event sent when the dynamicLayer is loaded
   */
  DYNAMICLAYER_LOADED: "dynLayerLoaded",

  /**
   * Event sent when the user selects an entry from the goTo dropdown list
   **/
  GOTO_SELECTION: "goToSelection",

  /**
   * Event sent when the map zooms to a given geometry
   **/
  MAP_ZOOMGEOMETRY: "zoomToGeometry",

  /**
   * Event sent when the filters tab is selected or deselected
   **/
  TAB_SELECTED_CHANGE: "tabSelectionChanged",

  LAYER_LIST_LOADED: "layerListLoaded",

  /**
   * Event fired when the map extent is changed
   **/
  MAP_EXTENT_CHANGE: "mapExtentChanged",

  /**
   * Event sent when the token is ready
   **/
  TOKEN_READY: "tokenReady",

  /**
   * Event sent when the map is added to the DOM
   */
  MAP_INIT: "mapInit",

  trigger: function(key, data) {
    dojo.publish(key, data);
  },

  connect: function(key, callback) {
    dojo.subscribe(key, callback);
  }
};
