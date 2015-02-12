/**
* Class: Map.
* 
* This module declares a singleton object, that is intended to be used
* directly.
*/
Map = {

    map: null,

    imageParameters: null,

    initialFeatureSet: null,

    //variables extracted from tiling scheme
    _wkid: null,
    _rows: null,
    _cols: null,
    _dpi: null,
    _xorigin: null,
    _yorigin: null,
    _format: null,
    _compressQuality: null,
    _lods: [],
    _xmin: null,
    _xmax: null,
    _ymin: null,
    _ymax: null,



    /**
	* Add map component
	*/
    addMap: function (featureSet) {
        require(["modules/CustomArcGISDynamicLayer"],
			function (CustomArcGISDynamicLayer) {
			    var appli = Application;
			    var self = Map;

			    var extent = null;

			    // Set extent if specified by a layer type and code
			    if (featureSet) {

			        self.initialFeatureSet = featureSet;

			        // Query return something
			        if (featureSet.features.length > 0) {
			            extent = featureSet.features[0].geometry.getExtent();
			        }
			        else {
			            self.addMap(null);
			            alert("No features returned with query.");
			        }
			    }
			    else {
			        // Else use default center and zoom
			        if (MAP_EXTENT == null)
			            extent = null;
			        else
			            extent = new esri.geometry.Extent(
		                    MAP_EXTENT.xmin,
		                    MAP_EXTENT.ymin,
		                    MAP_EXTENT.xmax,
		                    MAP_EXTENT.ymax,
		                    new esri.SpatialReference({ wkid: 4326 })
		                );
			    }

			    // Create map
			    var basemapDefault = null;
			    if (IS_ONLINE) {
			        basemapDefault = "satellite";
			    }

			    self.map = new esri.Map(
			        "map",
			        {
			            extent: extent,
			            //fitExtent: true,
			            logo: false,
			            basemap: basemapDefault, //workaround to make the basemapGallery widget work (without this line, it fails to load the tiling scheme).
			        }
		        );


			    dojo.connect(self.map, "onLoad", function () {
			        Event.trigger(Event.MAP_LOADED, self.map);
			        Application.setHeavyLoading(false);
			    });


			    self.addListeners();

			    Event.trigger(Event.MAP_INIT, self.map);

			    if (self.imageParameters == null) {
			        self.imageParameters = new esri.layers.ImageParameters();
			        self.imageParameters.format = "PNG32";
			    }

			    appli.dynamicLayer = new CustomArcGISDynamicLayer(
			        appli.mapServiceURL,
			        {
			            imageParameters: self.imageParameters,
			        }
		        );

			    appli.dynamicLayer.tokenHelper = Application.moduleManager.tokenHelper;

			    if (extent == null) {
			        dojo.connect(appli.dynamicLayer, "onLoad", self.zoomToLayerExtent);
			    }

			    self.initDijits();


			    if (!IS_ONLINE) {

			        self.getTilingScheme();
			    }
			    else {
			        self.addOperationalLayers(featureSet);
			    }
			});
    },

    /**
	* Zoom to the extent of the given layer
	*/
    zoomToLayerExtent: function (layer) {
        var self = Map;
        self.map.setExtent(layer.fullExtent);

    },

    /**
	* Add operational Layers to the map
	*/
    addOperationalLayers: function (featureSet) {
        var appli = Application;
        var self = Map;

        // Layer list
        if (appli.dynamicLayer.loaded) {
            Event.trigger(Event.DYNAMICLAYER_LOADED, appli.dynamicLayer);
            LayerList.buildLayerList(appli.dynamicLayer);
        }
        else {
            dojo.connect(appli.dynamicLayer, "onLoad", function (layer) {
                Event.trigger(Event.DYNAMICLAYER_LOADED, appli.dynamicLayer);
                LayerList.buildLayerList(layer);
            });
        }

        // Add layers
        self.map.addLayers([
			appli.dynamicLayer
        ]);


        // Highlight feature
        if (self.initialFeatureSet && self.initialFeatureSet.features.length > 0) {
            self.highlightFeature(self.initialFeatureSet.features[0]);
        }
    },



    /**
	* Gets the tiling Scheme for the local TPK
	*/
    getTilingScheme: function () {
        require(["dojo/request", "dojo/json"],
			function (request, JSON) {
			    var self = Map;
			    request.get("Handlers/TPKServer/readTilingScheme.ashx", {
			        // Parse data from JSON to a JavaScript object
			        handleAs: "json"
			    }).then(function (data) {
			        if (data.error && data.error != "") {
			            //console.error("$$$ Erreur avec le TPK: "+data.error);
			        }
			        else {
			            self._wkid = data.spatialReference.wkid;
			            self._rows = data.tileInfo.rows;
			            self._cols = data.tileInfo.cols;
			            self._dpi = data.tileInfo.dpi;
			            self._xorigin = data.tileInfo.origin.x;
			            self._yorigin = data.tileInfo.origin.y;
			            self._format = data.tileInfo.format;
			            self._compressQuality = data.tileInfo.compressionQuality;
			            self._lods = data.tileInfo.lods;

			            self._xmin = data.initialExtent.xmin;
			            self._ymin = data.initialExtent.ymin;
			            self._xmax = data.initialExtent.xmax;
			            self._ymax = data.initialExtent.ymax;

			            self.map.addLayer(new my.LocalTiledMapServiceLayer(102100, self._xmin, self._ymin, self._xmax, self._ymax, 256, 256, 96, "JPEG", 75, -20037508.342787, 20037508.342787, [{ "level": 0, "resolution": 156543.033928, "scale": 591657527.591555 }, { "level": 1, "resolution": 78271.5169639999, "scale": 295828763.795777 }, { "level": 2, "resolution": 39135.7584820001, "scale": 147914381.897889 }, { "level": 3, "resolution": 19567.8792409999, "scale": 73957190.948944 }, { "level": 4, "resolution": 9783.93962049996, "scale": 36978595.474472 }, { "level": 5, "resolution": 4891.96981024998, "scale": 18489297.737236 }, { "level": 6, "resolution": 2445.98490512499, "scale": 9244648.868618 }, { "level": 7, "resolution": 1222.99245256249, "scale": 4622324.434309 }, { "level": 8, "resolution": 611.49622628138, "scale": 2311162.217155 }, { "level": 9, "resolution": 305.748113140558, "scale": 1155581.108577 }, { "level": 10, "resolution": 152.874056570411, "scale": 577790.554289 }, { "level": 11, "resolution": 76.4370282850732, "scale": 288895.277144 }, { "level": 12, "resolution": 38.2185141425366, "scale": 144447.638572 }, { "level": 13, "resolution": 19.1092570712683, "scale": 72223.819286 }, { "level": 14, "resolution": 9.55462853563415, "scale": 36111.909643 }, { "level": 15, "resolution": 4.77731426794937, "scale": 18055.954822 }, { "level": 16, "resolution": 2.38865713397468, "scale": 9027.977411 }, { "level": 17, "resolution": 1.19432856685505, "scale": 4513.988705 }, { "level": 18, "resolution": 0.597164283559817, "scale": 2256.994353 }, { "level": 19, "resolution": 0.298582141647617, "scale": 1128.497176 }]));

			        }
			        self.addOperationalLayers();
			    },
				function (error) {
				    console.error(error);
				});
			}
		);
    },


    mapClickHandle: null,
    /**
	* Adds the listeners needed by the map
	**/
    addListeners: function () {
        require(["dojo/on"],
			function (on) {


			    var self = Map;
			    var appli = Application;

			    // Add click listener for identify task
			    if (typeof (IDENTIFY_QUERYABLE_LAYERS) != "undefined" && IDENTIFY_QUERYABLE_LAYERS && IDENTIFY_QUERYABLE_LAYERS.length > 0) {
			        self.mapClickHandle = dojo.connect(self.map, "onClick", self.onMapClick);
			    }

			    self.map.on("update-start", mapClient.ui.loading.show);
			    self.map.on("update-end", mapClient.ui.loading.show);
			    self.map.on("extent-change", function (evt) {
			        Event.trigger(Event.MAP_EXTENT_CHANGE, evt.extent);
			    });
			});
    },


    /**
	* Inits the dijit to be displayed on the page
	*/
    initDijits: function () {
        var self = Map;
        var appli = Application;

        // Legend
        dojo.connect(self.map, "onLayersAddResult", function (results) {
            appli.legend = new esri.dijit.Legend(
				{
				    map: self.map,
				    layerInfos: [{ layer: appli.dynamicLayer }]
				},
				"legendDiv"
			);
            appli.legend.startup();
        });

        // Scale bar
        var scalebar = new esri.dijit.Scalebar({
            map: self.map,
            attachTo: "bottom-right",
            scalebarUnit: "metric"
        });
    },

    highlightLayer: null,
    /**
	* Highlight extent feature
	*/
    hideHighLightFeature: function () {
        var self = this;
        if (self.highlightLayer != null) {
            self.map.removeLayer(self.highlightLayer);
            self.highlightLayer = null;
        }
    },

    highlightFeature: function (feature) {
        var self = this;
        // Symbology
        var symbol = new esri.symbol.SimpleFillSymbol({
            "type": "esriSFS",
            "style": "esriSFSSolid",
            "color": new dojo.Color(AREA_FILL_COLOR),
            "outline": {
                "type": "esriSLS",
                "style": "esriSLSSolid",
                "color": new dojo.Color(AREA_BORDER_COLOR),
                "width": AREA_BORDER_THICKNESS
            }
        });

        self.hideHighLightFeature(feature);

        self.highlightLayer = new esri.layers.GraphicsLayer();
        self.map.addLayer(self.highlightLayer);

        // Add feature to layer
        self.highlightLayer.add(feature.setSymbol(symbol));
    },

    highlightPointFeature: function (feature) {
        var self = this;
        // Symbology
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 22,
			new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
				new dojo.Color([0, 255, 255]), 2),
			new dojo.Color([0, 255, 255, 0.25]));

        // Graphics layer
        self.highlightPointLayer = new esri.layers.GraphicsLayer();
        self.map.addLayer(self.highlightPointLayer);

        // Add feature to layer
        self.highlightPointLayer.add(feature.setSymbol(symbol));
    },

    /**
	* Event fired when the map is clicked. Event connected in function addMap(). 
	*/
    onMapClick: function (evt) {
        var app = Application;
        var self = Map;

        if (IDENTIFY_TOLERANCE && IDENTIFY_INFOTEMPLATES && IDENTIFY_INFOTEMPLATES.length > 0) {
            //create identify tasks and setup parameters
            var identifyTask = new esri.tasks.IdentifyTask(app.mapServiceURL);

            var queryTheseLayers = [];
            for (var i = 0; i < IDENTIFY_QUERYABLE_LAYERS.length; i++) {
                if (app.visible.indexOf(IDENTIFY_QUERYABLE_LAYERS[i].toString()) !== -1) {
                    queryTheseLayers.push(IDENTIFY_QUERYABLE_LAYERS[i]);
                }
            }


            var identifyParams = new esri.tasks.IdentifyParameters();
            identifyParams.tolerance = IDENTIFY_TOLERANCE;
            identifyParams.returnGeometry = true;
            identifyParams.layerIds = queryTheseLayers;
            identifyParams.layerDefinitions = [];

            if (app.dynamicLayer.layerDefinitions && app.dynamicLayer.layerDefinitions.length > 0) {
                var layerDefs = [];
                for (var i = 0; i < IDENTIFY_QUERYABLE_LAYERS.length; i++) {
                    var identifyableLayerId = IDENTIFY_QUERYABLE_LAYERS[i];
                    if (app.dynamicLayer.layerDefinitions[identifyableLayerId] && app.dynamicLayer.layerDefinitions[identifyableLayerId].length > 0) {
                        layerDefs[identifyableLayerId] = app.dynamicLayer.layerDefinitions[identifyableLayerId];
                    }
                }
                identifyParams.layerDefinitions = layerDefs;
            }

            identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
            identifyParams.width = self.map.width;
            identifyParams.height = self.map.height;
            identifyParams.geometry = evt.mapPoint;
            identifyParams.mapExtent = self.map.extent;

            var deferred = identifyTask.execute(identifyParams).addCallback(function (response) {
                // response is an array of identify result objects
                // Let's return an array of features.
                return dojo.map(response, function (result) {
                    var feature = result.feature;
                    var layerName = result.layerName;
                    var layerId = result.layerId;
                    feature.attributes.layerName = layerName;
                    if (IDENTIFY_INFOTEMPLATES[layerId]) {
                        var content = IDENTIFY_INFOTEMPLATES[layerId].content;
                        if (!!(content && content.constructor && content.call && content.apply)) {
                            //content is a function
                            content = content(result);
                        }

                        var infoTemplate = new esri.InfoTemplate(IDENTIFY_INFOTEMPLATES[layerId].title,
						   content);
                        feature.setInfoTemplate(infoTemplate);
                    }
                    else {
                        //Default title and content
                        var content = "";
                        var infoTemplate = new esri.InfoTemplate(layerName,
						   content);
                        feature.setInfoTemplate(infoTemplate);
                    }
                    return feature;
                });
            });

            // InfoWindow expects an array of features from each deferred
            // object that you pass. If the response from the task execution
            // above is not an array of features, then you need to add a callback
            // like the one above to post-process the response and return an
            // array of features.
            self.map.infoWindow.setFeatures([deferred]);
            self.map.infoWindow.show(evt.mapPoint);
        }
        else {
            var alertMsg = "Configuration Missing" +
				"\n" +
				"Expected: " +
				"\n" +
				"<IDENTIFY_TOLERANCE>" +
				"\n" +
				"<IDENTIFY_INFOTEMPLATES>" +
				"\n" +
				"<IDENTIFY_QUERYABLE_LAYERS>";
            alert(alertMsg);
        }

    },



    /**
	* Helper functions
	*/
    enableUserNavigation: function (enable) {
        var self = Map;
        if (enable) {
            self.map.enableMapNavigation();
            self.map.enablePan();
            // Map.map.showZoomSlider();
        } else {
            self.map.disableMapNavigation();
            self.map.disablePan();
            //  Map.map.hideZoomSlider();
        }
    },

    zoomTo: function (featureSet, highlightFeature) {
        var self = this;
        if (!featureSet)
            return;
        if (featureSet.features.length > 0) {

            if (featureSet.features[0].geometry.type === 'point') {
                var pt = featureSet.features[0].geometry;
                var factor = 0.000001;
                var extent = new esri.geometry.Extent(pt.x - factor, pt.y - factor, pt.x + factor, pt.y + factor, pt.spatialReference);
                Map.map.setExtent(extent);
            } else {
                Map.map.setExtent(featureSet.features[0].geometry.getExtent());

                if (highlightFeature) {
                    Map.highlightFeature(featureSet.features[0]);
                } else {
                    self.hideHighLightFeature(featureSet.features[0]);
                }
            }
        }

    }
};