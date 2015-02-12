/**
* Date: 03.12.2014
* Author: YM
* Class: Print
*
* This class is used to print the map
*/
define(
  ["dojo/_base/declare", "modules/_BaseWidget",
      "esri/dijit/Print", "esri/tasks/PrintTemplate",
  "esri/tasks/LegendLayer"],

  function (declare, BaseWidget,
      Print, PrintTemplate,
      LegendLayer) {

      return declare(BaseWidget, {



          /**
          * Initialize the tool
          **/
          initialize: function () {
              $("#printButton").show();
              this.initPrinter();
          },



          /**
	      * Inits the print dijit
	      */
          initPrinter: function () {
              var self = Map;
              // Print
              var templates = [];
              var _this = this;
              dojo.forEach(
                  PRINT_LAYOUTS,
                  function (lo) {
                      var t = new PrintTemplate();

                      t.layout = lo.layout;
                      t.label = lo.label;
                      t.format = lo.format;

                      if (lo.options) {
                          t.layoutOptions = lo.options;
                          t.layoutOptions.legendLayers = [];

                          for (var li = 0; li < _this.map.layerIds.length; li++) {
                              var legendLayer = new LegendLayer();
                              legendLayer.layerId = _this.map.layerIds[li];
                              t.layoutOptions.legendLayers.push(legendLayer);
                          }
                      }

                      if (lo.layout == "MAP_ONLY") {
                          t.exportOptions = lo.exportOptions;
                      }

                      t.showAttribution = false;

                      templates.push(t);
                  }
              );
              var printer = new Print(
                  {
                      url: URL_PRINT,
                      map: this.map,
                      templates: templates
                  },
                  dojo.byId("printButton")
              );

              printer.startup();
          }
      });
  }
);