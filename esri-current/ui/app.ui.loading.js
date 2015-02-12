(function(mapClient) {
  'use strict';
  /* globals require, esri, dojo */

  require([], loading);

  function loading() {

    // private properties
    var loadingElement;

    // public properties
    mapClient.ui.loading = {
      init: init,
      show: show,
      hide: hide
    };

    ////////////////

    function init() {
      loadingElement = dojo.byId("loadingImg");
    }

    function show() {
      esri.show(loadingElement);
    }

    function hide() {
      esri.hide(loadingElement);
    }

  }

})(window.mapClient = window.mapClient || {});