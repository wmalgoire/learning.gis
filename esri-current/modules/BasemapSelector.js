define([
  "dojo/_base/declare",
  "modules/_BaseWidget",
  "dojo/dom",
  "dojo/dom-style",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/mouse",
  "dojo/on",
  "dojo/parser",
  "esri/dijit/BasemapGallery",
  "esri/dijit/Basemap",
  "esri/dijit/BasemapLayer",
  "agsjs/layers/GoogleMapsLayer"
], function(declare, BaseWidget, dom, domStyle, domClass, domConstruct, mouse, on, parser, BasemapGallery, Basemap, BasemapLayer) {

  var BasemapSelector = {
    initialize: initialize
  };

  return declare(BaseWidget, BasemapSelector);

  function initialize() {
    initBasemapPanel();
    /* jshint validthis: true */
    initBasemapGallery(this.map);
  }

  function initBasemapPanel() {
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
  }

  function initBasemapGallery(map) {
    var basemapGallery = new BasemapGallery({
      showArcGISBasemaps: false,
      toggleReference: true,
      map: map,
      bingMapsKey: window.BING_MAP_KEY
    }, "basemapGallery");

    dojo.connect(basemapGallery, "onError", function(msg) {
      if (console) console.log(msg);
    });

    addBasemaps();
    basemapGallery.select('googleSatellite');
    basemapGallery.startup();

    function addBasemaps() {

      basemapGallery.add(new Basemap({
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
      }));

      basemapGallery.add(new Basemap({
        layers: [new BasemapLayer({
          type: 'GoogleMapsSatellite'
        })],
        id: 'googleSatellite',
        title: "Google Satellite",
        thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/googlesatellite.png")
      }));

      basemapGallery.add(new Basemap({
        layers: [new BasemapLayer({
          type: "BingMapsAerial"
        })],
        id: "bmAerial",
        title: "Bing Aerial",
        thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/aerial.png")
      }));

      basemapGallery.add(new Basemap({
        layers: [new BasemapLayer({
          type: "BingMapsHybrid"
        })],
        id: "bmHybrid",
        title: "Bing Aerial with labels",
        thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/hybrid.png")
      }));

      basemapGallery.add(new Basemap({
        layers: [new BasemapLayer({
          url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
        }), new BasemapLayer({
          url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer",
          isReference: true
        })],
        title: "Light Gray",
        thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/8b3b470883a744aeb60e5fff0a319ce7/info/thumbnail/templight_gray_canvas_with_labels__ne_usa.png"
      }));

      basemapGallery.add(new Basemap({
        layers: [new BasemapLayer({
          url: "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer"
        })],
        title: "Dark Gray",
        thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/1970c1995b8f44749f4b9b6e81b5ba45/info/thumbnail/ago_downloaded.jpg"
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
          url: "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer"
        })],
        title: "National Geographic",
        thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/509e2d6b034246d692a461724ae2d62c/info/thumbnail/natgeo.jpg"
      }));

      basemapGallery.add(new Basemap({
        layers: [new BasemapLayer({
          url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
        })],
        title: "Topographic",
        thumbnailUrl: "http://www.arcgis.com/sharing/rest/content/items/6e03e8c26aad4b9c92a87c1063ddb0e3/info/thumbnail/topo_map_2.jpg"
      }));
    }
  }
});
