(function(mapClient, events) {
  'use strict';
  /* globals require */

  require([
    "dojo/dom-class"
  ], tabs);

  function tabs(domClass) {
    // private properties
    var selectedIndex;

    // public properties
    mapClient.ui.tabs = {
      init: init,
      selected: selectedIndex,
      select: select
    };

    ////////////////

    function init() {
      select(0);
    }

    function select(index) {
      domClass.remove("legendContent", "contentPaneVisible");
      domClass.remove("layersContent", "contentPaneVisible");
      domClass.remove("filtersContent", "contentPaneVisible");
      domClass.remove("imgLegend", "imgOver");
      domClass.remove("imgLayers", "imgOver");
      domClass.remove("imgFilters", "imgOver");

      if (index === null || index === undefined) {
        index = selectedIndex || 0;
      }

      if (index >= 0) {
        selectedIndex = index;
        if (index === 0) {
          domClass.add("legendContent", "contentPaneVisible");
          domClass.add("imgLegend", "imgOver");
        } else if (index === 1) {
          domClass.add("layersContent", "contentPaneVisible");
          domClass.add("imgLayers", "imgOver");
        } else if (index === 2) {
          domClass.add("filtersContent", "contentPaneVisible");
          domClass.add("imgFilters", "imgOver");
        }
      }

      events.trigger(events.UI.TAB_SELECTED_CHANGE, index);
    }
  }

})(window.mapClient, window.mapClient.events);
