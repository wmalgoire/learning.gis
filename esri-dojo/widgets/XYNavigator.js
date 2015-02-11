/**
* Date: 03.12.2014
* Author: YM
* Class: XYNavigator
*
* This class is used to navigate to a given X,Y
*/
define(
  ["dojo/_base/declare", "modules/_BaseWidget",
  "esri/geometry/webMercatorUtils",
  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/Color",
  "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol"],

  function (declare, BaseWidget,
      webMercatorUtils,
      SpatialReference,
      Point,
      Graphic,
      Color,
      SimpleMarkerSymbol, SimpleLineSymbol) {

      return declare(BaseWidget, {
          markerSymbol: null,
          
          SCALE_ZOOM: 20000,



          /**
          * Initialize the tool
          **/
          initialize: function () {

              //Symbol for point marker
              var outline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color([210, 0, 0]), 4);
              this.markerSymbol = new SimpleMarkerSymbol().setStyle(
                          SimpleMarkerSymbol.STYLE_X).setColor(
                          new Color([210, 0, 0])).setSize(20).setOutline(outline);

              $("#XYTool").show();
              var _this = this;

              $("#XYNavigateTool").click(function () {
                  _this.gotoXY();
              });

              $('#XYLongInput').keyup(function (e) {
                  if (e.keyCode == 13) {
                      _this.gotoXY();
                  }
              });
              $('#XYLatInput').keyup(function (e) {
                  if (e.keyCode == 13) {
                      _this.gotoXY();
                  }
              });

              $("#clearXYTool").click(function () {
                  _this.clearGraphics();
              });
          },



          /**
          * Navigates to XY entered by the user
          **/
          gotoXY: function () {

              var x = parseFloat($('#XYLongInput').val());
              var y = parseFloat($('#XYLatInput').val());
              var ptLatLong = new Point(x, y, new SpatialReference({ wkid: this.map.spatialReference.wkid }));
              var ptM = webMercatorUtils.geographicToWebMercator(ptLatLong);

              //Adds the marker point to the map
              var graphic = new Graphic(ptM, this.markerSymbol, null, null);
              this.map.graphics.add(graphic);
              this.map.setScale(this.SCALE_ZOOM);
              this.map.centerAt(ptM);
          },



          /**
          * Clear the marker added as graphics to the map
          **/
          clearGraphics: function () {
              this.map.graphics.clear();
          }

      });
  }
);