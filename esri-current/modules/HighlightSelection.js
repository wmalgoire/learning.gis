/**
* Date: 03.12.2014
* Author: YM
* Class: HighlightSelectionModule
*
* This class is used to let the user chose if he wants to highlight the selection or not
*/
define(
  ["dojo/_base/declare", "modules/_BaseWidget",
  "esri/layers/GraphicsLayer",
  "esri/renderers/SimpleRenderer",
  "esri/graphic",
  "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"],

  function (declare, BaseWidget,
      GraphicsLayer,
      SimpleRenderer,
      Graphic,
      SimpleFillSymbol, SimpleLineSymbol, Color) {

      return declare(BaseWidget, {

          highlightFeature: true,
          lastSelectedFeature: {},
          lastGeometry: null,
          highlightLayer:null,


          /**
          * Initialize the tool
          **/
          initialize: function () {
              var _this = this;

              this.addHighlightLayer();

              //Event raised in HighlightSelection
              Event.connect(Event.GOTO_SELECTION, function (selectedFeature) {
                  _this.lastSelectedFeature = selectedFeature;
                  if (selectedFeature.type === null) return;
                  _this.hideHighlights();
                  $("#showSelection").show();
              });

              //Event raised in Map.zoomTo
              Event.connect(Event.MAP_ZOOMGEOMETRY, function (geometry) {
                  _this.lastGeometry = geometry;
                  if(_this.highlightFeature){
                      _this.highlightGeometry();
                  }
              });

              $("#chkShowSelection").unbind();
              $("#chkShowSelection").click(function () {
                  _this.highlightFeature = $("#chkShowSelection").prop("checked");
                  if (_this.highlightFeature) {
                      if (_this.lastGeometry) {
                          _this.highlightGeometry();
                          _this.map.setExtent(_this.lastGeometry.getExtent());
                      }

                  }
                  else {
                      _this.hideHighlights();
                  }
              });
          },



          /**
          * Adds a graphics layer to the map to support Highlight
          **/
          addHighlightLayer:function(){
              this.highlightLayer = new GraphicsLayer();
              var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color(AREA_BORDER_COLOR), AREA_BORDER_THICKNESS), new Color(AREA_FILL_COLOR)
              );
              var rend = new SimpleRenderer(sfs);
              this.highlightLayer.setRenderer(rend);
              this.map.addLayer(this.highlightLayer);
          },



          /**
          * Highlights a geometry
          **/
          highlightGeometry:function(){
              var graphic = new Graphic(this.lastGeometry);
              this.highlightLayer.add(graphic);
          },



          /**
          * Hides the highlights
          **/
          hideHighlights:function(){
              this.highlightLayer.clear();
          }



      });
  }
);
