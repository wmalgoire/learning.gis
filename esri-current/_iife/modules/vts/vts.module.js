/**
* Class: Main VTS application.
* 
* This module declares a singleton object, that is intended to be used
* directly.
*/
Application_VTS = {

    urlParams: {
        params: [],
        layerType: false,
        layerCode: false,
        day: false,
        trackCumulative: false,
        campaignId: false
    },

    timeoutOnFilterClick: null,

    layerDefs: [],

    timeoutExtentChanged: null,
    timeoutExtentChangedListener: false,

    extentFilters: null,

    selectedTeamCodes: {},
    selectedCampaignDays: {},

    filterTabSelected: false,

    imageParameters: null,

    currentMapExtent: null,

    filterByCampaignDays: true,
    filterByTeamCodes: true,



    /**
    *   Startup function, used to connect to Events
    **/
    startup: function () {
        var self = Application_VTS;

        Application.ignoreAddMap = true;

        Event.connect(Event.APP_INITIALIZED, function (data) {
            self.initialize();
        });


        Event.connect(Event.MAP_INIT, function (map) {

            dojo.connect(map, "onExtentChange", self.startTimeoutExtentChange);

            Map.imageParameters = self.imageParameters;
        });

        Event.connect(Event.MAP_LOADED, function (map) {
            self.currentMapExtent = map.extent;
            self.buildExtentFilters(false,false,true);
        });

        Event.connect(Event.TAB_SELECTED_CHANGE, function (data) {
            self.filterTabSelected = (data == 2);
            if (self.filterTabSelected == true) {
                self.currentMapExtent = Map.map.extent;
            }
            else {
                if (Application.dynamicLayer != null && self.layerDefs != null) {
                    var layerDefsFilters = self.layerDefs.slice();
                    Application.dynamicLayer.setLayerDefinitions(layerDefsFilters);
                }
            }
        });

        self.initLstAreaSearch();
    },



    /**
    * Method: initialize Initializes the module. Must be called once, before
    * interacting with the module.
    */
    initialize: function () {
        var self = Application_VTS;

        self.loadUI();

        self.processURLParams();

        self.imageParameters = new esri.layers.ImageParameters();

        // If all parameters are here
        if (self.urlParams.layerType && self.urlParams.layerCode && self.urlParams.day && self.urlParams.trackCumulative && self.urlParams.campaignId) {

            // Handling tracks
            if (self.urlParams.day && self.urlParams.trackCumulative && self.urlParams.campaignId) {

                // Get parameters from config
                var configLayersTracksInfos = LAYERS_TRACKS_INFOS;

                var layerIdTracksValid = configLayersTracksInfos.layerIdTracksValid;
                var layerIdTracksInvalid = configLayersTracksInfos.layerIdTracksInvalid;
                var dayField = configLayersTracksInfos.dayField;
                var campaignField = configLayersTracksInfos.campaignField;

                // Default values
                var operator = "=";

                // Specific values
                if (self.urlParams.trackCumulative == 1) {
                    operator = "<=";
                }

                // Building layer definition query
                // Valid and Invalid Tracks layers
                self.layerDefs[layerIdTracksValid] = dayField + operator + self.urlParams.day;
                if (self.urlParams.trackCumulative == 1)
                    self.layerDefs[layerIdTracksInvalid] = dayField + ">= 1 AND " + dayField + operator + self.urlParams.day;
                else
                    self.layerDefs[layerIdTracksInvalid] = dayField + operator + self.urlParams.day;

                //Filtering BUA 50x50 grid cells SSAs and Hamlet visited according to campaignId
                var configLayersDenominatorTypeCode;

                configLayersDenominatorTypeCode = LAYERS_DENOMINATOR_TYPE_CODE["BUA50x50GridCells"];
                self.layerDefs[configLayersDenominatorTypeCode.id] = configLayersDenominatorTypeCode.campaignField + "=" + self.urlParams.campaignId + " AND " + configLayersDenominatorTypeCode.SettlementTypeField + " = '" + configLayersDenominatorTypeCode.SettlementType + "' and " + configLayersDenominatorTypeCode.dayField + " <= " + self.urlParams.day;
                configLayersDenominatorTypeCode = LAYERS_DENOMINATOR_TYPE_CODE["Hamlets"];
                self.layerDefs[configLayersDenominatorTypeCode.id] = configLayersDenominatorTypeCode.campaignField + "=" + self.urlParams.campaignId + " AND " + configLayersDenominatorTypeCode.SettlementTypeField + " = '" + configLayersDenominatorTypeCode.SettlementType + "' and " + configLayersDenominatorTypeCode.dayField + " <= " + self.urlParams.day;
                configLayersDenominatorTypeCode = LAYERS_DENOMINATOR_TYPE_CODE["SmallSettlements"];
                self.layerDefs[configLayersDenominatorTypeCode.id] = configLayersDenominatorTypeCode.campaignField + "=" + self.urlParams.campaignId + " AND " + configLayersDenominatorTypeCode.SettlementTypeField + " = '" + configLayersDenominatorTypeCode.SettlementType + "' and " + configLayersDenominatorTypeCode.dayField + " <= " + self.urlParams.day;

                // Filtering additional layers
                var configLayersAdditionalFilters;

                configLayersAdditionalFilters = LAYERS_ADDITIONAL_FILTERS["ValidatedAsNotMissed"];
                self.layerDefs[configLayersAdditionalFilters.id] = configLayersAdditionalFilters.campaignField + "=" + self.urlParams.campaignId;

                self.imageParameters.layerDefinitions = self.layerDefs;
                self.imageParameters.format = "PNG32";
            }

            // Set campaignDependent map service
            if (IS_ONLINE) {
                Application.mapServiceURL = URL_VTS_AGS + "OperationalLayers/OperationalLayers_" + self.urlParams.campaignId + "/MapServer";

                LayerFilters.init();

                // Handling extent
                if (self.urlParams.layerType && self.urlParams.layerCode) {
                    Application.addMapWithExtent(self.urlParams.layerType, self.urlParams.layerCode);
                }
            }
            else {
                self.initOfflineMapServer();
            }

        }

        // Missing parameters
        else {

            // Display default map
            Map.addMap(null);

            var alertMsg = "5 parameters expected!" +
                "\n" +
                "Expected: " +
                "\n" +
                "<layerType> (State, LGA, Ward, BUA, HA, SSA)" +
                "\n" +
                "<layerCode>" +
                "\n" +
                "<day> (1 to 10)" +
                "\n" +
                "<trackCumulative> (0 = one day, 1= all days)" +
                "\n" +
                "<campaignId>";
            alert(alertMsg);
        }
    },



    /**
    * Starts the local mapserver if needed
    */
    initOfflineMapServer: function () {
        require(["dojo/request"], function (request) {

            var self = Application_VTS;
            request("Handlers/MapServer/InitMapServer.ashx?campaignId=" + self.urlParams.campaignId).then(
                function (url) {
                    Application.mapServiceURL = url.replace("127.0.0.1", "localhost");
                    LayerFilters.init();

                    // Handling extent
                    if (self.urlParams.layerType && self.urlParams.layerCode) {
                        Application.addMapWithExtent(self.urlParams.layerType, self.urlParams.layerCode);
                    }
                },
                function (error) {
                    console.log("An error occurred: " + error);
                }
            );
        });
    },



    /**
    * Inits and loads the different UI components
    **/
    loadUI: function () {

        require([
	        "dojo/_base/declare",
            "dojo/dom",
            "dojo/dom-style",
            "dojo/dom-class",
            "dojo/dom-construct",
            "dojo/mouse",
            "dojo/on",
	        "dojo/parser",
	        "dojo/domReady!"
	    ], function (
	        declare,
            dom,
            domStyle,
            domClass,
            domConstruct,
            mouse,
            on,
            parser
	    ) {

	        var appli = Application;
	        var self = Application_VTS;

	        dojo.style(dojo.byId("tdImgFilters"), "display", "block");

	        /** Control Buttons **/
	        on(dom.byId("imgFilters"), "click", function () {
	            appli.setLeftPanelOpen(true);
	            appli.selectIndex(2);
	            self.buildExtentFilters(false,false,false);
	        });
	    });

    },

    /**
    * Start timeout to avoid sending to many queries
    */
    startTimeoutExtentChange: function (extent) {
        var self = Application_VTS;

        clearTimeout(self.timeoutExtentChanged);

        self.timeoutExtentChanged = setTimeout(
            function () {
                Application.dynamicLayer.resume();
                self.onExtentChanged(extent);
            },
            LAYERS_REFRESH_DELAY
        );

        Application.dynamicLayer.suspend();
    },



    /**
    * onExtentChanged
    **/
    onExtentChanged: function (extent) {
        var self = Application_VTS;
        self.currentMapExtent = extent;
        self.buildExtentFilters(false,false,true);
        LayerFilters.tracksAnimationStop();
    },



    /**
    * Build extent filters list
    */
    buildExtentFilters: function (filterByCampaignDays, filterByTeamCodes, forceUpdate) {
        var self = Application_VTS;


        if (Map.map.getScale() <= FILTERS_SCALE_LIMIT) {
            dojo.style(dojo.byId("filtersContentEnabled"), "display", "block");
            dojo.style(dojo.byId("filtersContentDisabled"), "display", "none");

            if (self.filterTabSelected) {
                // Application.setHeavyLoading(true);
                self.setLoading(true);
                self.filterByCampaignDays = typeof filterByCampaignDays !== 'undefined' ? filterByCampaignDays : false;
                self.filterByTeamCodes = typeof filterByTeamCodes !== 'undefined' ? filterByTeamCodes : false;

                var extent = self.getVisibleExtent();
                if (extent) {
                    // Set the query
                    var queryTask = new esri.tasks.QueryTask(Application.mapServiceURL + "/" + LAYERS_TRACKS_INFOS["layerIdTracksValid"]);
                    var query = new esri.tasks.Query();

                    query.where = "CampaignDay >=1 AND CampaignDay <= " + self.urlParams.day;

                    if (filterByCampaignDays) {
                        var days = [];
                        $("input[id^='campaignday_']:checked").each(function () {
                            days.push($(this).attr('id').substring(12, $(this).attr('id').length));
                        });

                        if (days.length > 0)
                            query.where = query.where + " AND CampaignDay IN (" + days.join(",") + ")";
                    }

                    var teamcodes = [];
                    $("input[id^='teamcode_']:checked").each(function () {
                        teamcodes.push($(this).attr('id').substring(9, $(this).attr('id').length));
                    });

                    if (!forceUpdate) {
                        if (dojo.query(".list_teamcode").length > 0 && teamcodes.length == 0) {
                            self.setLoading(false);
                            $("#errorMessage").fadeOut();
                            Application_VTS.onFilterClick();
                            return;
                        }

                        if (teamcodes.length > $("#playBtn").attr("teamMax")) {
                            self.setLoading(false);
                            $("#errorMessage").fadeIn();
                            return;
                        }
                        else {
                            $("#errorMessage").fadeOut();
                        }
                    }


                    if (filterByTeamCodes) {
                        if (teamcodes.length > 0)
                            query.where = query.where + " AND WardCode + TeamID + TeamCode IN ('" + teamcodes.join("','") + "')";
                    }

                    query.geometry = extent;
                    query.outFields = ["TeamCode", "TeamID", "WardCode", "CampaignDay"];
                    query.returnGeometry = false;

                    // Send the query and add the map
                    queryTask.execute(query, self.buildExtentFiltersQueryResult, self.buildExtentFiltersQueryError);
                }
                else {
                    Application.setHeavyLoading(false);
                    self.setLoading(false);
                }
            }
            else {
                if (Application.dynamicLayer) {
                    var layerDefsFilters = self.layerDefs.slice();
                    Application.dynamicLayer.setLayerDefinitions(layerDefsFilters);
                }
                self.setLoading(false);
            }
        }
        else {
            //If the map scale is beyond the max scale configured

            dojo.style(dojo.byId("filtersContentEnabled"), "display", "none");
            dojo.style(dojo.byId("filtersContentDisabled"), "display", "block");

            var layerDefsFilters = self.layerDefs.slice();
            Application.dynamicLayer.setLayerDefinitions(layerDefsFilters);
            self.setLoading(false);
        }
    },



    gl: null,

    /**
    * Returns the visible extent (map extent - left panel width)
    **/
    getVisibleExtent: function () {
        var self = Application_VTS;
        var screenpoint = new esri.geometry.ScreenPoint($("#panelTitle").position().left + $("#panelTitle").outerWidth(), 0);
        var mappoint = Map.map.toMap(screenpoint);

        var newExtent = new esri.geometry.Extent(mappoint.x, self.currentMapExtent.ymin, self.currentMapExtent.xmax, self.currentMapExtent.ymax, self.currentMapExtent.spatialReference);

        //*** FOR DEBUG PURPOSE ONLY ***//
        //        if (self.gl == null) {
        //            self.gl = new esri.layers.GraphicsLayer();
        //            Map.map.addLayer(self.gl);
        //        }
        //        else {
        //            self.gl.clear();
        //        }

        //        var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        //                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        //                        new dojo.Color([255, 0, 0]), 4), new dojo.Color([255, 255, 0, 0.25]));
        //        var gr = new esri.Graphic(newExtent, sfs);
        //        self.gl.add(gr);

        //        var sms = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10,
        //                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([255, 0, 0]), 1),
        //                    new esri.Color([0, 255, 0, 0.25]));

        //var gr2 = new esri.Graphic(mappoint, sms);
        //self.gl.add(gr2);
        //******************************//


        return newExtent;
    },



    /**
    * buildExtentFiltersQueryError
    **/
    buildExtentFiltersQueryError: function (error) {
        Application.setHeavyLoading(false);
        Application_VTS.setLoading(false);
    },

    /**
    * buildExtentFiltersQueryResult
    **/
    buildExtentFiltersQueryResult: function (featureSet) {
        var self = Application_VTS;
        if (featureSet) {
            // Query return something
            if (featureSet.features.length > 0) {

                self.extentFilters = {
                    teamCodes: {},
                    campaignDays: {}
                };

                for (var i = 0; i < featureSet.features.length; i++) {
                    var graphic = featureSet.features[i];
                    if (graphic.attributes.TeamCode != null) {
                        var teamCodeKey = graphic.attributes.WardCode + graphic.attributes.TeamID + graphic.attributes.TeamCode;
                        //self.extentFilters.teamCodes[teamCodeKey] = graphic.attributes.TeamCode + " (Ward: " + graphic.attributes.WardCode + ")";
                        self.extentFilters.teamCodes[teamCodeKey] = graphic.attributes.TeamCode;
                    }
                    self.extentFilters.campaignDays[graphic.attributes.CampaignDay] = true;
                }
            }
            else {
                self.extentFilters = null;
            }
            self.buildFilterList();
        }
        Application.setHeavyLoading(false);
        self.setLoading(false);
    },



    /**
    * Build filters list
    */
    buildFilterList: function () {
        var self = Application_VTS;
        var inputs;
        var inputsTotal;
        var inputsUnchecked;

        if (Application.lastSelectedIndex != 2)
            return;

        if (self.extentFilters) {
            var key;

            if (self.filterByCampaignDays || (!self.filterByCampaignDays && !self.filterByTeamCodes)) {
                // Get checked teamcodes
                inputs = dojo.query(".list_teamcode:checked");
                inputsTotal = dojo.query(".list_teamcode");
                inputsUnchecked = inputsTotal.length - inputs.length;
                checked = false;
                var innerHTMLTeamCodes = "<table class='tableFilter'><tbody>";
                var teamCodesToDelete = [];

                for (var teamCode in self.selectedTeamCodes) {
                    if (!Application.objectContainsKey(self.extentFilters.teamCodes, teamCode)) {
                        teamCodesToDelete.push(teamCode);
                    }
                }

                for (var deleteIndex = 0; deleteIndex < teamCodesToDelete.length; deleteIndex++) {
                    self.selectedTeamCodes[teamCodesToDelete[deleteIndex]] = null;
                }

                var count = 0;
                for (var keyTeamCode in self.selectedTeamCodes) {
                    if (self.selectedTeamCodes[keyTeamCode] != null && self.selectedTeamCodes[keyTeamCode].selected) {
                        count = 1;
                        break;
                    }
                }

                for (key in self.extentFilters.teamCodes) {
                    //var id ="teamcode_" + key;
                    if (key != null && !Application.objectContainsKey(self.selectedTeamCodes, key)) {
                        self.selectedTeamCodes[key] = {
                            selected: (count == 0),
                            label: self.extentFilters.teamCodes[key]
                        };
                        count++;
                    }
                }

                for (var keyTeamCode in self.selectedTeamCodes) {
                    if (self.selectedTeamCodes[keyTeamCode] != null) {
                        var id = "teamcode_" + keyTeamCode;
                        innerHTMLTeamCodes += LayerFilters.createFilterCheckboxHTML(id, self.selectedTeamCodes[keyTeamCode], "teamcode");
                    }
                }

                innerHTMLTeamCodes += "</tbody></table>";
                dojo.byId("filter_list_teamcodes").innerHTML = innerHTMLTeamCodes;
                $("#inpTeamCode").val("");
            }

            if (self.filterByTeamCodes || (!self.filterByCampaignDays && !self.filterByTeamCodes)) {
                var innerHTMLCampaignDays = "<table class='tableFilter'><tbody>";

                // Campaign days
                inputs = dojo.query(".list_campaignday:checked");
                inputsTotal = dojo.query(".list_campaignday");
                inputsUnchecked = inputsTotal.length - inputs.length;
                checked = (inputsUnchecked <= 0);
                checked = (inputsUnchecked <= 0);
                var campaignDaysToDelete = [];

                for (var day in self.selectedCampaignDays) {
                    if (!Application.objectContainsKey(self.extentFilters.campaignDays, day)) {
                        campaignDaysToDelete.push(day);
                    }
                }

                for (var deleteIndex = 0; deleteIndex < campaignDaysToDelete.length; deleteIndex++) {
                    self.selectedCampaignDays[campaignDaysToDelete[deleteIndex]] = null;
                }

                for (key in self.extentFilters.campaignDays) {
                    if (key != null && !Application.objectContainsKey(self.selectedCampaignDays, key)) {
                        self.selectedCampaignDays[key] = {
                            selected: checked,
                            label: key
                        };
                    }
                }

                for (var keyCampaignDay in self.selectedCampaignDays) {
                    if (self.selectedCampaignDays[keyCampaignDay] != null) {
                        var id = "campaignday_" + keyCampaignDay;
                        innerHTMLCampaignDays += LayerFilters.createFilterCheckboxHTML(id, self.selectedCampaignDays[keyCampaignDay], "campaignday");
                    }
                }
                innerHTMLCampaignDays += "</tbody></table>";
                dojo.byId("filter_list_campaigndays").innerHTML = innerHTMLCampaignDays;
            }

            // Init event on "check all" clicks
            $("#chkAllCampaignDays").unbind();
            $("#chkAllCampaignDays").click(function () {
                $("input[id^='campaignday_']").each(function (index, element) {
                    $(element).prop('checked', $("#chkAllCampaignDays").prop('checked'));
                });

                Application_VTS.buildExtentFilters(true, false,false);
                // Application_VTS.onFilterClick();
            });

            $("#chkAllTeamCodes").unbind();
            $("#chkAllTeamCodes").click(function () {
                $("input[id^='teamcode_']").each(function (index, element) {
                    $(element).prop('checked', $("#chkAllTeamCodes").prop('checked'));
                });

                LayerFilters.refreshStartButton();
                Application_VTS.buildExtentFilters(false, true,false);
                // Application_VTS.onFilterClick();
            });

            $("input[id^='campaignday_']").each(function (index, element) {
                $(element).unbind();
                $(element).click(function () {

                    Application_VTS.buildExtentFilters(true, false,false);
                });
            });

            $("input[id^='teamcode_']").each(function (index, element) {
                $(element).unbind();
                $(element).click(function () {
                    LayerFilters.refreshStartButton();
                    Application_VTS.buildExtentFilters(false, true,false);
                });
            });

            $("#tdAllTeamCodes").show();
            $("#tdAllCampaignDays").show();
        } else {
            dojo.byId("filter_list_campaigndays").innerHTML = "<table class='tableFilter'><tbody><tr><td style='text-align: center;'>N/A</td></tr></tbody></table>";
            dojo.byId("filter_list_teamcodes").innerHTML = "<table class='tableFilter'><tbody><tr><td style='text-align: center;'>N/A</td></tr></tbody></table>";
            $("#inpTeamCode").val("");
            $("#tdAllTeamCodes").hide();
            $("#tdAllCampaignDays").hide();
        }

        Application_VTS.onFilterClick();
    },



    /**
    * Update filters
    */
    onFilterClick: function () {
        var self = Application_VTS;
        clearTimeout(self.timeoutOnFilterClick);

        if ($(".list_teamcode:checked").length > $("#playBtn").attr("teamMax")) {
            $("#errorMessage").fadeIn();
        }
        else {
            $("#errorMessage").fadeOut();
            //dojo.style(dojo.byId("errorMessage"), "display", "none");
            LayerFilters.refreshStartButton();
            LayerFilters.tracksAnimationStop();

            self.timeoutOnFilterClick = setTimeout(
                function () {
                    //var layerDefs = [];
                    var layerDefsFilters = self.layerDefs.slice();

                    var inputs = dojo.query(".list_teamcode");

                    // if no campaign day or no team code is checked, query nothing
                    if ($(".list_teamcode:checked").length == 0 || $(".list_campaignday:checked").length == 0) {
                        layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] = "1=0";
                    }
                    else if ($(".list_teamcode:checked").length > $("#playBtn").attr("teamMax")) {
                        //Do nothing

                    }
                    else {

                        if (layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] != null && layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]].length > 0)
                            layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += " AND ";
                        else
                            layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] = "";

                        layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += "WardCode + TeamID + TeamCode IN (";

                        var index = 0;

                        dojo.forEach(inputs, function (input) {

                            var inputID = input.id.substring(9, input.id.length);
                            if (input.checked) {

                                if (index > 0)
                                    layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += ",";
                                layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += "'" + inputID + "'";

                                self.selectedTeamCodes[inputID].selected = true;

                                index++;
                            } else {
                                self.selectedTeamCodes[inputID].selected = false;
                            }

                        });


                        layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += ")";

                        // Campaign days
                        inputs = dojo.query(".list_campaignday");
                        layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += " AND CampaignDay IN (";

                        index = 0;

                        dojo.forEach(inputs, function (input) {

                            var inputID = input.id.substring(12, input.id.length);
                            if (input.checked) {

                                if (index > 0)
                                    layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += ",";
                                layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += "'" + inputID + "'";

                                self.selectedCampaignDays[inputID].selected = true;

                                index++;
                            } else {
                                self.selectedCampaignDays[inputID].selected = false;
                            }

                        });

                        layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += ")";
                    }
                    Application.dynamicLayer.setLayerDefinitions(layerDefsFilters);
                },
                LAYERS_REFRESH_DELAY
            );
        }
    },



    /**
    * initLstAreaSearch
    **/
    initLstAreaSearch: function () {
        $("#lstAreaSearch").chosen({
            allow_single_deselect: true,
            width: "200px"
        }).bind('change',
        function (e) {
            var areaCode = $("#lstAreaSearch").find(":selected").val();
            var geoLevelId = $("#lstAreaSearch").find(":selected").parent().attr('Id');

            if (areaCode.length != 0 && areaCode.toUpperCase() != "ALL")
                Application.zoomToExtent(geoLevelId, areaCode);
        }
        );

        $.ajax({
            url: 'Nav/GetAllStates', type: "GET"
        })
        .success(function (data) {
            fillGroup("State", data);
        });

        $.ajax({
            url: 'Nav/GetAllLgas', type: "GET"
        })
         .success(function (data) {
             fillGroup("LGA", data);
         });

        $.ajax({
            url: 'Nav/GetAllWards', type: "GET"
        })
        .success(function (data) {
            fillGroup("Ward", data);
        });

        function fillGroup(groupId, data) {
            $.each(data, function () {
                $("#lstAreaSearch > #" + groupId).append($("<option />").val(this.Code).text(this.Name));
            });
            $("#lstAreaSearch > #" + groupId).trigger("liszt:updated");
            $("#lstAreaSearch > #" + groupId).trigger("chosen:updated");
        }
    },



    /**
    * Sets the filter lab in a loading state or not
    **/
    setLoading: function (isLoading) {
        if (isLoading) {
            $("#chkAllTeamCodes").prop('disabled', true);
            $("#inpTeamCode").prop('disabled', true);
            $("#chkAllCampaignDays").prop('disabled', true);
            $("#playBtn").prop('disabled', true);
            $("#slider").prop('disabled', true);

            $("#filter_list_teamcodes :input").prop('disabled', true);

            if (dojo.query(".list_teamcode").length > 0) {
                $("#loadTeamCodes").fadeIn();
            }
            //dojo.byId("filter_list_teamcodes").innerHTML = "<img src=\"/Images/loading.gif\" width=\"20px\" height=\"20px\" />";
            //dojo.byId("filter_list_campaigndays").innerHTML = "<img src=\"/Images/loading.gif\" width=\"20px\" height=\"20px\" />";
        }
        else {
            $("#chkAllTeamCodes").prop('disabled', false);
            $("#inpTeamCode").prop('disabled', false);
            $("#chkAllCampaignDays").prop('disabled', false);
            $("#playBtn").prop('disabled', false);
            $("#slider").prop('disabled', false);
            $("#filter_list_teamcodes :input").prop('disabled', false);
            $("#loadTeamCodes").fadeOut();
        }
    },



    /**
    * Process URL Params if it is VTS Application
    **/
    processURLParams: function () {
        var self = Application_VTS;

        // Extract URL parameters
        self.urlParams.params = Application.extractUrlParams();
        self.urlParams.layerType = self.urlParams.params[PARAM_LAYER_TYPE];
        self.urlParams.layerCode = self.urlParams.params[PARAM_LAYER_CODE];
        self.urlParams.day = self.urlParams.params[PARAM_DAY];
        self.urlParams.trackCumulative = self.urlParams.params[PARAM_TRACK_CUMULATIVE];
        self.urlParams.campaignId = self.urlParams.params[PARAM_CAMPAIGN_ID];
    }
};

Application_VTS.startup();