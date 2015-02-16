/**
* Date: 03.12.2014
* Author: YM
* Class: PanelInfo
*
* This class is used to display footer information
*/
define(
  ["dojo/_base/declare", "widgets/_BaseWidget",
  "dojo/on",
  "esri/geometry/webMercatorUtils"],

  function (declare, BaseWidget,
      on,
      webMercatorUtils) {

      return declare(BaseWidget, {



          /**
          * Initialize the tool
          **/
          initialize: function () {
              $("#infoTool").show();

              // Mouse coordinates
              this.map.on("mouse-move", this.showCoordinates);
              this.map.on("mouse-drag", this.showCoordinates);
              this.map.on("mouse-out", this.hideCoordinates);
          },



          /**
	      * Show coordinates
	      */
          showCoordinates: function (evt) {
              var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
              dojo.byId("coordinates").innerHTML = "Coordinates (long/lat): " + mp.x.toFixed(3) + " " + mp.y.toFixed(3);
          },



          /**
          * Hide coordinates
          */
          hideCoordinates: function (evt) {
              dojo.byId("coordinates").innerHTML = "";
          },

      });
  }
);
