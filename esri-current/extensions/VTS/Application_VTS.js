(function(mapClient, utils) {
  'use strict';
  /* globals dojo */

  ////////////////

  // public methods implementation

  var mapExtension = {

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

    gl: null,

    /**
     *   Startup function, used to connect to Events
     **/
    startup: function() {
      mapClient.map.ignoreAddMap = true;

      Event.connect(Event.APP_INITIALIZED, function() {
        mapExtension.initialize();
      });

      Event.connect(Event.MAP_INIT, function(map) {
        dojo.connect(map, "onExtentChange", mapExtension.startTimeoutExtentChange);
        Map.imageParameters = mapExtension.imageParameters;
      });

      Event.connect(Event.MAP_LOADED, function(map) {
        mapExtension.currentMapExtent = map.extent;
        mapExtension.buildExtentFilters(false, false, true);
      });

      Event.connect(Event.TAB_SELECTED_CHANGE, function(data) {
        mapExtension.filterTabSelected = (data === 2);
        if (mapExtension.filterTabSelected == true) {
          mapExtension.currentMapExtent = Map.map.extent;
        } else {
          if (mapClient.layers.dynamicLayer != null && mapExtension.layerDefs != null) {
            var layerDefsFilters = mapExtension.layerDefs.slice();
            mapClient.layers.dynamicLayer.setLayerDefinitions(layerDefsFilters);
          }
        }
      });

      mapExtension.initLstAreaSearch();
    },

    processURLParams: function() {
      var params = mapClient.urlParams;
      params.layerType = params[window.PARAM_LAYER_TYPE];
      params.layerCode = params[window.PARAM_LAYER_CODE];
      params.day = params[window.PARAM_DAY];
      params.trackCumulative = params[window.PARAM_TRACK_CUMULATIVE];
      params.campaignId = params[window.PARAM_CAMPAIGN_ID];
    },

    /**
     * Method: initialize Initializes the module. Must be called once, before
     * interacting with the module.
     */
    initialize: function() {
      var self = mapExtension;
      var params = mapClient.urlParams;

      self.loadUI();
      self.processURLParams();
      self.imageParameters = new esri.layers.ImageParameters();

      // If all parameters are here
      if (params.layerType && params.layerCode && params.day && params.trackCumulative && params.campaignId) {

        // Handling tracks
        if (params.day && params.trackCumulative && params.campaignId) {

          // Get parameters from config
          var configLayersTracksInfos = LAYERS_TRACKS_INFOS;

          var layerIdTracksValid = configLayersTracksInfos.layerIdTracksValid;
          var layerIdTracksInvalid = configLayersTracksInfos.layerIdTracksInvalid;
          var dayField = configLayersTracksInfos.dayField;
          var campaignField = configLayersTracksInfos.campaignField;

          // Default values
          var operator = "=";

          // Specific values
          if (params.trackCumulative == 1) {
            operator = "<=";
          }

          // Building layer definition query
          // Valid and Invalid Tracks layers
          self.layerDefs[layerIdTracksValid] = dayField + operator + params.day;
          if (params.trackCumulative == 1)
            self.layerDefs[layerIdTracksInvalid] = dayField + ">= 1 AND " + dayField + operator + params.day;
          else
            self.layerDefs[layerIdTracksInvalid] = dayField + operator + params.day;

          //Filtering BUA 50x50 grid cells SSAs and Hamlet visited according to campaignId
          var configLayersDenominatorTypeCode;

          configLayersDenominatorTypeCode = LAYERS_DENOMINATOR_TYPE_CODE["BUA50x50GridCells"];
          self.layerDefs[configLayersDenominatorTypeCode.id] = configLayersDenominatorTypeCode.campaignField + "=" + params.campaignId + " AND " + configLayersDenominatorTypeCode.SettlementTypeField + " = '" + configLayersDenominatorTypeCode.SettlementType + "' and " + configLayersDenominatorTypeCode.dayField + " <= " + params.day;
          configLayersDenominatorTypeCode = LAYERS_DENOMINATOR_TYPE_CODE["Hamlets"];
          self.layerDefs[configLayersDenominatorTypeCode.id] = configLayersDenominatorTypeCode.campaignField + "=" + params.campaignId + " AND " + configLayersDenominatorTypeCode.SettlementTypeField + " = '" + configLayersDenominatorTypeCode.SettlementType + "' and " + configLayersDenominatorTypeCode.dayField + " <= " + params.day;
          configLayersDenominatorTypeCode = LAYERS_DENOMINATOR_TYPE_CODE["SmallSettlements"];
          self.layerDefs[configLayersDenominatorTypeCode.id] = configLayersDenominatorTypeCode.campaignField + "=" + params.campaignId + " AND " + configLayersDenominatorTypeCode.SettlementTypeField + " = '" + configLayersDenominatorTypeCode.SettlementType + "' and " + configLayersDenominatorTypeCode.dayField + " <= " + params.day;

          // Filtering additional layers
          var configLayersAdditionalFilters;

          configLayersAdditionalFilters = LAYERS_ADDITIONAL_FILTERS["ValidatedAsNotMissed"];
          self.layerDefs[configLayersAdditionalFilters.id] = configLayersAdditionalFilters.campaignField + "=" + params.campaignId;

          self.imageParameters.layerDefinitions = self.layerDefs;
          self.imageParameters.format = "PNG32";
        }

        // Set campaignDependent map service
        if (IS_ONLINE) {
          mapClient.services.mapServiceURL = URL_VTS_AGS + "OperationalLayers/OperationalLayers_" + params.campaignId + "/MapServer";

          LayerFilters.init();

          // Handling extent
          if (params.layerType && params.layerCode) {
            mapClient.map.addMapWithExtent(params.layerType, params.layerCode);
          }
        } else {
          self.initOfflineMapServer();
        }

      }

      // Missing parameters
      else {

        // Display default map
        mapClient.map.addMap(null);

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
    initOfflineMapServer: function() {
      require(["dojo/request"], function(request) {

        var self = mapExtension;
        request("Handlers/MapServer/InitMapServer.ashx?campaignId=" + mapClient.urlParams.campaignId).then(
          function(url) {
            mapClient.services.mapServiceURL = url.replace("127.0.0.1", "localhost");
            LayerFilters.init();

            // Handling extent
            if (mapClient.urlParams.layerType && mapClient.urlParams.layerCode) {
              mapClient.map.addMapWithExtent(mapClient.urlParams.layerType, mapClient.urlParams.layerCode);
            }
          },
          function(error) {
            console.log("An error occurred: " + error);
          }
        );
      });
    },

    /**
     * Inits and loads the different UI components
     **/
    loadUI: function() {

      require([
        "dojo/_base/declare",
        "dojo/dom",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/mouse",
        "dojo/on",
        "dojo/parser"
      ], function(
        declare,
        dom,
        domStyle,
        domClass,
        domConstruct,
        mouse,
        on,
        parser
      ) {

        dojo.style(dojo.byId("tdImgFilters"), "display", "block");

        /** Control Buttons **/
        on(dom.byId("imgFilters"), "click", function() {
          mapClient.ui.mainPanel.expand();
          mapClient.ui.tabs.select(2);
          mapExtension.buildExtentFilters(false, false, false);
        });
      });

    },

    /**
     * Start timeout to avoid sending to many queries
     */
    startTimeoutExtentChange: function(extent) {
      var self = mapExtension;

      clearTimeout(self.timeoutExtentChanged);

      self.timeoutExtentChanged = setTimeout(
        function() {
          mapClient.layers.dynamicLayer.resume();
          self.onExtentChanged(extent);
        },
        LAYERS_REFRESH_DELAY
      );

      mapClient.layers.dynamicLayer.suspend();
    },

    /**
     * onExtentChanged
     **/
    onExtentChanged: function(extent) {
      var self = mapExtension;
      self.currentMapExtent = extent;
      self.buildExtentFilters(false, false, true);
      LayerFilters.tracksAnimationStop();
    },

    /**
     * Build extent filters list
     */
    buildExtentFilters: function(filterByCampaignDays, filterByTeamCodes, forceUpdate) {
      var self = mapExtension;


      if (Map.map.getScale() <= FILTERS_SCALE_LIMIT) {
        dojo.style(dojo.byId("filtersContentEnabled"), "display", "block");
        dojo.style(dojo.byId("filtersContentDisabled"), "display", "none");

        if (self.filterTabSelected) {
          self.setLoading(true);
          self.filterByCampaignDays = typeof filterByCampaignDays !== 'undefined' ? filterByCampaignDays : false;
          self.filterByTeamCodes = typeof filterByTeamCodes !== 'undefined' ? filterByTeamCodes : false;

          var extent = self.getVisibleExtent();
          if (extent) {
            // Set the query
            var queryTask = new esri.tasks.QueryTask(mapClient.services.mapServiceURL + "/" + LAYERS_TRACKS_INFOS["layerIdTracksValid"]);
            var query = new esri.tasks.Query();

            query.where = "CampaignDay >=1 AND CampaignDay <= " + mapClient.urlParams.day;

            if (filterByCampaignDays) {
              var days = [];
              $("input[id^='campaignday_']:checked").each(function() {
                days.push($(this).attr('id').substring(12, $(this).attr('id').length));
              });

              if (days.length > 0)
                query.where = query.where + " AND CampaignDay IN (" + days.join(",") + ")";
            }

            var teamcodes = [];
            $("input[id^='teamcode_']:checked").each(function() {
              teamcodes.push($(this).attr('id').substring(9, $(this).attr('id').length));
            });

            if (!forceUpdate) {
              if (dojo.query(".list_teamcode").length > 0 && teamcodes.length == 0) {
                self.setLoading(false);
                $("#errorMessage").fadeOut();
                mapExtension.onFilterClick();
                return;
              }

              if (teamcodes.length > $("#playBtn").attr("teamMax")) {
                self.setLoading(false);
                $("#errorMessage").fadeIn();
                return;
              } else {
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
          } else {
            self.setLoading(false);
          }
        } else {
          if (mapClient.layers.dynamicLayer) {
            var layerDefsFilters = self.layerDefs.slice();
            mapClient.layers.dynamicLayer.setLayerDefinitions(layerDefsFilters);
          }
          self.setLoading(false);
        }
      } else {
        //If the map scale is beyond the max scale configured

        dojo.style(dojo.byId("filtersContentEnabled"), "display", "none");
        dojo.style(dojo.byId("filtersContentDisabled"), "display", "block");

        var layerDefsFilters = self.layerDefs.slice();
        mapClient.layers.dynamicLayer.setLayerDefinitions(layerDefsFilters);
        self.setLoading(false);
      }
    },

    /**
     * Returns the visible extent (map extent - left panel width)
     **/
    getVisibleExtent: function() {
      var self = mapExtension;
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
    buildExtentFiltersQueryError: function(error) {
      mapExtension.setLoading(false);
    },

    /**
     * buildExtentFiltersQueryResult
     **/
    buildExtentFiltersQueryResult: function(featureSet) {
      var self = mapExtension;
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
        } else {
          self.extentFilters = null;
        }
        self.buildFilterList();
      }
      self.setLoading(false);
    },

    /**
     * Build filters list
     */
    buildFilterList: function() {
      var self = mapExtension;
      var inputs;
      var inputsTotal;
      var inputsUnchecked;

      if (mapClient.ui.tabs.selected != 2)
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
            if (!utils.javascript.objectContainsKey(self.extentFilters.teamCodes, teamCode)) {
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
            if (key != null && !utils.javascript.objectContainsKey(self.selectedTeamCodes, key)) {
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
            if (!utils.javascript.objectContainsKey(self.extentFilters.campaignDays, day)) {
              campaignDaysToDelete.push(day);
            }
          }

          for (var deleteIndex = 0; deleteIndex < campaignDaysToDelete.length; deleteIndex++) {
            self.selectedCampaignDays[campaignDaysToDelete[deleteIndex]] = null;
          }

          for (key in self.extentFilters.campaignDays) {
            if (key != null && !utils.javascript.objectContainsKey(self.selectedCampaignDays, key)) {
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
        $("#chkAllCampaignDays").click(function() {
          $("input[id^='campaignday_']").each(function(index, element) {
            $(element).prop('checked', $("#chkAllCampaignDays").prop('checked'));
          });

          mapExtension.buildExtentFilters(true, false, false);
          // mapExtension.onFilterClick();
        });

        $("#chkAllTeamCodes").unbind();
        $("#chkAllTeamCodes").click(function() {
          $("input[id^='teamcode_']").each(function(index, element) {
            $(element).prop('checked', $("#chkAllTeamCodes").prop('checked'));
          });

          LayerFilters.refreshStartButton();
          mapExtension.buildExtentFilters(false, true, false);
          // mapExtension.onFilterClick();
        });

        $("input[id^='campaignday_']").each(function(index, element) {
          $(element).unbind();
          $(element).click(function() {

            mapExtension.buildExtentFilters(true, false, false);
          });
        });

        $("input[id^='teamcode_']").each(function(index, element) {
          $(element).unbind();
          $(element).click(function() {
            LayerFilters.refreshStartButton();
            mapExtension.buildExtentFilters(false, true, false);
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

      mapExtension.onFilterClick();
    },

    /**
     * Update filters
     */
    onFilterClick: function() {
      var self = mapExtension;
      clearTimeout(self.timeoutOnFilterClick);

      if ($(".list_teamcode:checked").length > $("#playBtn").attr("teamMax")) {
        $("#errorMessage").fadeIn();
      } else {
        $("#errorMessage").fadeOut();
        //dojo.style(dojo.byId("errorMessage"), "display", "none");
        LayerFilters.refreshStartButton();
        LayerFilters.tracksAnimationStop();

        self.timeoutOnFilterClick = setTimeout(
          function() {
            //var layerDefs = [];
            var layerDefsFilters = self.layerDefs.slice();

            var inputs = dojo.query(".list_teamcode");

            // if no campaign day or no team code is checked, query nothing
            if ($(".list_teamcode:checked").length == 0 || $(".list_campaignday:checked").length == 0) {
              layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] = "1=0";
            } else if ($(".list_teamcode:checked").length > $("#playBtn").attr("teamMax")) {
              //Do nothing

            } else {

              if (layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] != null && layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]].length > 0)
                layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += " AND ";
              else
                layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] = "";

              layerDefsFilters[LAYERS_TRACKS_INFOS["layerIdTracksValid"]] += "WardCode + TeamID + TeamCode IN (";

              var index = 0;

              dojo.forEach(inputs, function(input) {

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

              dojo.forEach(inputs, function(input) {

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
            mapClient.layers.dynamicLayer.setLayerDefinitions(layerDefsFilters);
          },
          LAYERS_REFRESH_DELAY
        );
      }
    },

    /**
     * initLstAreaSearch
     **/
    initLstAreaSearch: function() {
      $("#lstAreaSearch").chosen({
        allow_single_deselect: true,
        width: "200px"
      }).bind('change',
        function(e) {
          var areaCode = $("#lstAreaSearch").find(":selected").val();
          var geoLevelId = $("#lstAreaSearch").find(":selected").parent().attr('Id');

          if (areaCode.length != 0 && areaCode.toUpperCase() != "ALL")
            mapClient.map.zoomToExtent(geoLevelId, areaCode);
        }
      );

      $.ajax({
        url: 'Nav/GetAllStates',
        type: "GET"
      })
        .success(function(data) {
          fillGroup("State", data);
        });

      $.ajax({
        url: 'Nav/GetAllLgas',
        type: "GET"
      })
        .success(function(data) {
          fillGroup("LGA", data);
        });

      $.ajax({
        url: 'Nav/GetAllWards',
        type: "GET"
      })
        .success(function(data) {
          fillGroup("Ward", data);
        });

      function fillGroup(groupId, data) {
        $.each(data, function() {
          $("#lstAreaSearch > #" + groupId).append($("<option />").val(this.Code).text(this.Name));
        });
        $("#lstAreaSearch > #" + groupId).trigger("liszt:updated");
        $("#lstAreaSearch > #" + groupId).trigger("chosen:updated");
      }
    },

    /**
     * Sets the filter lab in a loading state or not
     **/
    setLoading: function(isLoading) {
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
      } else {
        $("#chkAllTeamCodes").prop('disabled', false);
        $("#inpTeamCode").prop('disabled', false);
        $("#chkAllCampaignDays").prop('disabled', false);
        $("#playBtn").prop('disabled', false);
        $("#slider").prop('disabled', false);
        $("#filter_list_teamcodes :input").prop('disabled', false);
        $("#loadTeamCodes").fadeOut();
      }
    }


  };

  mapClient.extension = mapExtension;
  mapExtension.startup();

})(window.mapClient, window.mapClient.utils);
