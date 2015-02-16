/**
* Date: 13.11.2014
* Author: YM
* Class: WatershedGeoprocessor
*
* This class is used to generate watershed for given points
*/
define(
  ["dojo/_base/declare", "widgets/_BaseWidget",
  "esri/geometry/webMercatorUtils",
  "esri/graphic",
  "esri/graphicsUtils",
  "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/tasks/Geoprocessor",
  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/symbols/Font", "esri/symbols/TextSymbol",
  "esri/tasks/FeatureSet"],

  function (declare, BaseWidget,
      webMercatorUtils,
      Graphic,
      graphicsUtils,
      SimpleFillSymbol, SimpleLineSymbol, Color,
      SimpleMarkerSymbol,
      Geoprocessor,
      SpatialReference,
      Point,
      Font, TextSymbol,
      FeatureSet) {

      return declare(BaseWidget, {
          gp: null,
          watershedSymbol: null,
          markerSymbol: null,
          delineateToolActive: false,
          clickHandle: null,

          BUSY_CURSOR: "wait",
          WATERSHED_CURSOR: "url(Images/blue-pin-cur.png),auto",
          DEFAULT_CURSOR : "default",



          /**
          * Initialize the tool
          **/
          initialize: function () {
              this.gp = new Geoprocessor(WATERSHED_GP_URL);
              this.gp.outSpatialReference = new SpatialReference(102100);

              //Symbol for watershed Polygon
              this.watershedSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
              new Color([0, 255, 255]), 2), new Color([0, 100, 255, 0.25])
              );

              //Symbol for point marker
              this.markerSymbol = new SimpleMarkerSymbol().setStyle(
                          SimpleMarkerSymbol.STYLE_X).setColor(
                          new Color([0, 255, 255]));

              this.initWatershedTools();

              var idMap = this.getParameterByName("id");
              if (idMap == "") {
                  alert("Parameter id not found. Watershed may not work properly.")
              }

              if (this.getParameterByName("lat") != "" && this.getParameterByName("long") != "") {
                  var lat = parseFloat(this.getParameterByName("lat"));
                  var long = parseFloat(this.getParameterByName("long"));
                  var ptLatLong = new Point(long, lat, new SpatialReference({ wkid: this.map.spatialReference.wkid }));
                  var ptM = webMercatorUtils.geographicToWebMercator(ptLatLong);
                  this.executesForPoint(ptM);
              }
          },

          /**
          * Utility function used to retrieve a parameter from the QueryString
          * PARAMS:
          *     - name: the name of the parameter
          **/
          getParameterByName: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
              var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                  results = regex.exec(location.search);
              return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
          },



          /**
          * Inits the watershed Tool (adds click listeners)
          **/
          initWatershedTools : function() {
              $("#WatershedTool").show();
              var _this = this;

              $("#delineateTool").click(function () {
                  _this.toggleClick();
              });

              $("#clearTool").click(function () {
                  _this.map.graphics.clear();
              });

              $("#navigateTool").click(function () {
                  var xInput = $('#watershedXInput').val();
                  var yInput = $('#watershedYInput').val();
                  if (xInput != "" && yInput != "") {
                      var x = parseFloat(xInput);
                      var y = parseFloat(yInput);
                      var ptLatLong = new Point(x, y, new SpatialReference({ wkid: _this.map.spatialReference.wkid }));
                      var ptM = webMercatorUtils.geographicToWebMercator(ptLatLong);
                      _this.executesForPoint(ptM);
                  }

              });
          },



          /**
          * Toggles the click
          **/
          toggleClick:function(){
              var _this = this;
              $("#delineateTool").toggleClass("toolButtonActive");

              if ($("#delineateTool").hasClass("toolButtonActive")) {
                  _this.delineateToolActive = true;
                  _this.changeCursor(_this.WATERSHED_CURSOR);
                  _this.enableClick(true);
              }
              else {
                  _this.delineateToolActive = false;
                  _this.changeCursor(_this.DEFAULT_CURSOR);
                  _this.enableClick(false);
              }
          },



          /**
          * Changes the cursor used on the map
          **/
          changeCursor:function(cursorValue){
              this.map.setMapCursor(cursorValue);
          },



          /**
          * Enables or not the click to delineate the watershed
          * PARAMS:
          *     - clickEnabled: (Boolean) true if the click should be enabled, false otherwise
          **/
          enableClick: function (clickEnabled) {
              var _this = this;
              if (clickEnabled) {

                  //Disable default mapClick
                  if (Map.mapClickHandle != null) {
                      dojo.disconnect(Map.mapClickHandle);
                  }

                  this.clickHandle = this.map.on("click", function (event) {
                      _this.toggleClick();
                      _this.executesForPoint(event.mapPoint);
                  });
              }
              else {
                  //restore default MapClick
                  if (typeof (IDENTIFY_QUERYABLE_LAYERS) != "undefined" && IDENTIFY_QUERYABLE_LAYERS && IDENTIFY_QUERYABLE_LAYERS.length > 0) {
                      Map.mapClickHandle = dojo.connect(_this.map, "onClick", Map.onMapClick);
                  }

                  if (this.clickHandle != null) {
                      this.clickHandle.remove();
                  }
              }
          },



          /**
          * Executes the job to delineate the Watershed
          * PARAMS:
          *    - point: (Point)the mapPoint for which we want to delineate the watershed
          **/
          executesForPoint: function (point) {
              this.changeCursor(this.BUSY_CURSOR);
              $("#overlayLoading").show();

              //Adds the marker point to the map
             var graphic = new Graphic(point, this.markerSymbol, null, null);
             this.map.graphics.add(graphic);
             this.map.centerAt(point);

              //Creates a Featureset (input of the GP)
              var featureSet = new FeatureSet({
                      "displayFieldName": "",
                      "geometryType": "esriGeometryPoint",
                      "spatialReference": {
                          "wkid": point.spatialReference.wkid,
                          "latestWkid": point.spatialReference.wkid
                      },
                      "features": [{
                            "attributes": {
                                "Name": null,
                                "Descript": null,
                                "BatchDone": null,
                                "SnapOn": null
                            },
                            "geometry": {
                                "x": point.x,
                                "y": point.y
                            }
                        }]
                  });

              var params = {
                  "Feature_Set": featureSet,
                  "City": this.getParameterByName("id")
              };

              //Submits the job
              var _this = this;
              this.gp.submitJob(params,
                  function (jobInfo) {
                      _this.drawWatershed(jobInfo, point);
                  }, function (jobInfo) {
                      _this.statusCallback(jobInfo);
                  }, function (jobInfo) {
                      $("#overlayLoading").hide();
                      if ($("#delineateTool").hasClass("toolButtonActive")) {
                          _this.changeCursor(_this.WATERSHED_CURSOR);
                      }
                  });
          },



          /**
          * Called for each status update of the async tool
          * PARAMS:
          *    - jobInfo: the jobInfo object
          **/
          statusCallback: function (jobInfo) {
              //console.log(jobInfo.jobStatus);
          },



          /**
          * Called when the job is completed successfully
          * PARAMS:
          *    - jobInfo: the jobInfo object
          *    - point: the point where the user clicked
          **/
          drawWatershed: function (jobInfo, point) {
              var _this = this;

              //Get the result data (Polygon)
              this.gp.getResultData(jobInfo.jobId, "OutputWatershed", function (data) {
                  var features = data.value.features;

                  if (features && features.length > 0) {
                      var feature = features[0];

                      _this.gp.getResultData(jobInfo.jobId, "ZonalStats", function (dataZonal) {
                          var featuresZonal = dataZonal.value.features;

                          if (featuresZonal && featuresZonal.length > 0) {
                              var featureZonal = featuresZonal[0];

                              //Adds the population label
                              var displayText = parseFloat(featureZonal.attributes["SUM"]);
                              var fontbold = new Font(
                                "14pt",
                                Font.STYLE_NORMAL,
                                Font.VARIANT_NORMAL,
                                Font.WEIGHT_BOLDER,
                                "Helvetica"
                              );

                              var textSymbolbold = new TextSymbol(
                                Math.round(displayText)+"",
                                fontbold,
                                new Color("#DD0000")
                              );
                              textSymbolbold.setOffset(0, 8);
                              _this.map.graphics.add(new Graphic(point, textSymbolbold));

                          }


                      });


                      feature.setSymbol(_this.watershedSymbol);
                      _this.map.graphics.add(feature);
                  }

              });

              if (_this.delineateToolActive) {
                  _this.changeCursor(_this.WATERSHED_CURSOR);
              }
              else {
                  _this.changeCursor(_this.DEFAULT_CURSOR);
              }
              $("#overlayLoading").hide();
          },


      });
  }
);
