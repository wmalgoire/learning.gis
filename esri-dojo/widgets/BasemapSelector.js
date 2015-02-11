(function(mapClient) {
  'use strict';

  // private properties
  var privateVar = value;

  // public properties
  mapClient.publicVar = value;

  var service = {
    publicMethod: publicMethod
  };
  return service;

  ////////////////

  define(
    ["dojo/_base/declare", "modules/_BaseWidget",
      "dojo/dom",
      "dojo/dom-style",
      "dojo/dom-class",
      "dojo/dom-construct",
      "dojo/mouse",
      "dojo/on",
      "dojo/parser",
      "esri/dijit/BasemapGallery",
      "esri/dijit/Basemap",
      "esri/dijit/BasemapLayer"
    ],

    function(declare, BaseWidget,
      dom,
      domStyle,
      domClass,
      domConstruct,
      mouse,
      on,
      parser,
      BasemapGallery, Basemap, BasemapLayer
    ) {

      return declare(BaseWidget, {



        /**
         * Initialize the tool
         **/
        initialize: function() {
          $("#panelBasemaps").show();

          var basemapTitle = dom.byId("basemapTitle");
          on(basemapTitle, "click", function() {
            domClass.toggle("panelBasemaps", "panelBasemapsOn");
          });
          on(basemapTitle, mouse.enter, function() {
            domClass.add("panelBasemaps", "panelBasemapsOn");
          });
          var panelBasemaps = dom.byId("panelBasemaps");
          on(panelBasemaps, mouse.leave, function() {
            domClass.remove("panelBasemaps", "panelBasemapsOn");
          });

          this.initBasemapSwitcher();

        },



        /**
         * Basemap switcher
         */
        initBasemapSwitcher: function() {

          var basemapGallery = new BasemapGallery({
            showArcGISBasemaps: false,
            toggleReference: true,
            map: this.map,
            bingMapsKey: BING_MAP_KEY
          }, "basemapGallery");

          var basemapVts = new Basemap({
            layers: [new BasemapLayer({
              url: window.URL_VTS_BASEMAP_SCALE_14_18,
              displayLevels: [14, 15, 16, 17, 18]
            }), new BasemapLayer({
              url: window.URL_VTS_BASEMAP_SCALE_0_13,
              displayLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
            })],
            id: "VTSBaseMap",
            title: "Esri/VTS Imagery",
            thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/esri_roads.png")
          });

          var basemapGoogle = new Basemap({
            layers: [new BasemapLayer({
              type: 'GoogleMapsSatellite'
            })],
            id: 'googleSatellite',
            title: "Google Satellite",
            thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/googlesatellite.png")
          });

          var basemapAerial = new Basemap({
            layers: [new BasemapLayer({
              type: "BingMapsAerial"
            })],
            id: "bmAerial",
            title: "Bing Aerial",
            thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/aerial.png")
          });

          var basemapHybrid = new Basemap({
            layers: [new BasemapLayer({
              type: "BingMapsHybrid"
            })],
            id: "bmHybrid",
            title: "Bing Aerial with labels",
            thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/hybrid.png")
          });

          basemapGallery.add(basemapVts);
          basemapGallery.add(basemapGoogle);
          basemapGallery.add(basemapAerial);
          basemapGallery.add(basemapHybrid);

          basemapGallery.add(new Basemap({
            layers: [new BasemapLayer({
              url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
            }), new BasemapLayer({
              url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer",
              isReference: true
            })],
            title: "Light gray",
            thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/8b3b470883a744aeb60e5fff0a319ce7/info/thumbnail/templight_gray_canvas_with_labels__ne_usa.png"
          }));

          basemapGallery.add(new Basemap({
            layers: [new BasemapLayer({
              url: "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer"
            })],
            title: "National Geographic",
            thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/509e2d6b034246d692a461724ae2d62c/info/thumbnail/natgeo.jpg"
          }));

          basemapGallery.add(new Basemap({
            layers: [new BasemapLayer({
              type: "OpenStreetMap"
            })],
            title: "OpenStreetMap",
            thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/5d2bfa736f8448b3a1708e1f6be23eed/info/thumbnail/temposm.jpg"
          }));

          basemapGallery.add(new Basemap({
            layers: [new BasemapLayer({
              url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
            })],
            title: "Topographic",
            thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/6e03e8c26aad4b9c92a87c1063ddb0e3/info/thumbnail/topo_map_2.jpg"
          }));

          basemapGallery.add(new Basemap({
            layers: [new BasemapLayer({
              url: "http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer"
            })],
            title: "Oceans",
            thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/48b8cec7ebf04b5fbdcaf70d09daff21/info/thumbnail/tempoceans.jpg"
          }));

          dojo.connect(basemapGallery, "onError", function(msg) {
            if (console) console.log(msg);
          });

          basemapGallery.select('googleSatellite');
          basemapGallery.startup();
        }



      });
    }
  );

})(window.mapClient = window.mapClient || {});

// Let's extend the namespace with new functionality
(function(namespace) {
  // public method
  namespace.publicMethod = function() {
    //code here...
  }
})(window.mapClient = window.mapClient || {});

/**
 * Date: 03.12.2014
 * Author: YM
 * Class: XYNavigator
 *
 * This class is used to navigate to a given X,Y
 */
