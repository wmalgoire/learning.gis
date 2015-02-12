(function(mapClient) {
  'use strict';
  /* globals dojo, require */

  require([
    "dojo/dom",
    "dojo/dom-class",
    "dojo/on",
  ], mainPanel);

  function mainPanel(dom, domClass, on) {

    mapClient.ui.mainPanel = {
      init: init,
      toggleState: toggleState,
      expand: expand,
      reduce: reduce
    };

    function init(title) {
      /** Reduce / Expand Buttons **/
      on(dom.byId("imgReduce"), "click", function() {
        mapClient.ui.mainPanel.reduce();
      });
      on(dom.byId("imgExpand"), "click", function() {
        mapClient.ui.mainPanel.expand();
      });

      /** Control Buttons **/
      on(dom.byId("imgLegend"), "click", function() {
        mapClient.ui.mainPanel.expand();
        mapClient.ui.tabs.select(0);
      });

      on(dom.byId("imgLayers"), "click", function() {
        mapClient.ui.mainPanel.expand();
        mapClient.ui.tabs.select(1);
      });

      //mapClient Title
      dojo.byId("panelMain").innerHTML = title;
    }

    ////////////////

    function toggleState(expandPanel) {
      if (!expandPanel) {
        reduce();
      } else {
        expand();
      }
    }

    function expand() {
      dojo.style(dojo.byId("imgReduce"), "display", "block");
      dojo.style(dojo.byId("imgExpand"), "display", "none");
      domClass.add("panelTitle", "panelTitleOn");
      domClass.add("panelContent", "panelContentVisible");
    }

    function reduce() {
      dojo.style(dojo.byId("imgReduce"), "display", "none");
      dojo.style(dojo.byId("imgExpand"), "display", "block");
      domClass.remove("panelTitle", "panelTitleOn");
      domClass.remove("panelContent", "panelContentVisible");
    }
  }

})(window.mapClient = window.mapClient || {});